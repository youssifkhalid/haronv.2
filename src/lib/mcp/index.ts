import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listServices from "./tools/list-services";
import listBarbers from "./tools/list-barbers";
import myBookings from "./tools/my-bookings";
import createBooking from "./tools/create-booking";
import cancelBooking from "./tools/cancel-booking";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "haroun-salon-mcp",
  title: "صالون هارون - Haroun Barber",
  version: "0.1.0",
  instructions:
    "أدوات صالون هارون للحلاقة. تتيح للمستخدم استعراض الخدمات والحلاقين، وإنشاء وإدارة حجوزاته الشخصية. جميع العمليات تتم باسم المستخدم المسجّل الدخول عبر OAuth.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listServices, listBarbers, myBookings, createBooking, cancelBooking],
});
