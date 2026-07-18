import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_booking",
  title: "إنشاء حجز جديد",
  description: "يحجز موعد جديد في صالون هارون للمستخدم الحالي. يتطلب معرّف الخدمة والحلاق والتاريخ والوقت.",
  inputSchema: {
    service_id: z.string().uuid().describe("معرّف الخدمة (من list_services)"),
    barber_id: z.string().uuid().describe("معرّف الحلاق (من list_barbers)"),
    booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("تاريخ الحجز YYYY-MM-DD"),
    booking_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).describe("وقت الحجز HH:MM"),
    notes: z.string().optional().describe("ملاحظات إضافية"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("bookings")
      .insert({
        customer_id: ctx.getUserId(),
        service_id: input.service_id,
        barber_id: input.barber_id,
        booking_date: input.booking_date,
        booking_time: input.booking_time,
        notes: input.notes ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `تم إنشاء الحجز بنجاح (${data.id}). الحالة: قيد الانتظار.` }],
      structuredContent: { booking: data },
    };
  },
});
