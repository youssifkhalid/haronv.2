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
  name: "cancel_booking",
  title: "إلغاء حجز",
  description: "يلغي حجزًا موجودًا للمستخدم الحالي.",
  inputSchema: {
    booking_id: z.string().uuid().describe("معرّف الحجز المراد إلغاؤه"),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", input.booking_id)
      .eq("customer_id", ctx.getUserId())
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "الحجز غير موجود أو لا يخصك." }], isError: true };
    return {
      content: [{ type: "text", text: `تم إلغاء الحجز ${data.id}.` }],
      structuredContent: { booking: data },
    };
  },
});
