import { useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil, Plus, Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FieldType = "text" | "number" | "textarea" | "url" | "boolean" | "email" | "tel" | "image";

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
};

export function EntityDialog<T extends Record<string, any>>({
  open, onOpenChange, title, fields, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: Field[];
  initial?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = {};
    for (const f of fields) base[f.name] = initial?.[f.name] ?? (f.type === "boolean" ? false : f.type === "number" ? 0 : "");
    return base;
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values as T);
      onOpenChange(false);
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} placeholder={f.placeholder} rows={3} />
              ) : f.type === "boolean" ? (
                <div className="flex items-center gap-2">
                  <Switch checked={!!values[f.name]} onCheckedChange={(v) => setValues({ ...values, [f.name]: v })} />
                  <span className="text-xs text-muted-foreground">{values[f.name] ? "مفعّل" : "معطّل"}</span>
                </div>
              ) : f.type === "image" ? (
                <ImageUploadField
                  value={values[f.name] ?? ""}
                  onChange={(url) => setValues({ ...values, [f.name]: url })}
                  required={f.required}
                />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.name]: f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                  step={f.type === "number" ? "any" : undefined}
                />
              )}

            </div>
          ))}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={saving} className="bg-gold-gradient text-gold-foreground hover:brightness-110">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmButton({ onConfirm, children, message = "هل أنت متأكد من الحذف؟" }: { onConfirm: () => void; children: ReactNode; message?: string }) {
  return (
    <button onClick={() => { if (confirm(message)) onConfirm(); }}
      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition">
      {children}
    </button>
  );
}

export function AddButton({ onClick, label = "إضافة جديد" }: { onClick: () => void; label?: string }) {
  return (
    <Button onClick={onClick} className="bg-gold-gradient text-gold-foreground shadow-gold hover:brightness-110">
      <Plus className="h-4 w-4 ml-1" /> {label}
    </Button>
  );
}

export function IconEdit() { return <Pencil className="h-3.5 w-3.5" />; }
export function IconDelete() { return <Trash2 className="h-3.5 w-3.5" />; }

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export function ImageUploadField({
  value, onChange, required,
}: { value: string; onChange: (url: string) => void; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("الملف يجب أن يكون صورة"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("حجم الصورة أكبر من 5 ميجا"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000", contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      const { data, error } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
      if (error) throw error;
      onChange(data.signedUrl);
      toast.success("تم رفع الصورة");
    } catch (e: any) {
      toast.error("تعذّر رفع الصورة: " + (e?.message ?? "خطأ"));
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-2 left-2 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-gold hover:bg-gold/5 transition"
        >
          {uploading ? <><Loader2 className="h-5 w-5 animate-spin text-gold" /> <span className="text-sm font-bold">جارٍ الرفع...</span></> :
            <><Upload className="h-5 w-5 text-gold" /> <span className="text-sm font-bold">اختر صورة من جهازك</span></>}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        required={required && !value}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
      {value && (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="text-xs font-bold text-gold hover:underline inline-flex items-center gap-1">
          <Upload className="h-3 w-3" /> {uploading ? "جارٍ الرفع..." : "استبدال الصورة"}
        </button>
      )}
    </div>
  );
}

