import logo from "@/assets/haroun-logo.jpeg.asset.json";

export function Logo({ size = 44, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative overflow-hidden rounded-xl ring-1 ring-gold/30 shadow-gold"
        style={{ width: size, height: size }}
      >
        <img src={logo.url} alt="شعار صالون هارون" className="h-full w-full object-cover" loading="eager" />
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-lg font-black tracking-tight text-gold-gradient">صالون هارون</div>
          <div className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">HAROUN · BARBER</div>
        </div>
      )}
    </div>
  );
}
