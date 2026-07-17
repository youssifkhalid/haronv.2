import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, MapPin, Clock } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/10 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size={52} />
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            صالون هارون — وجهتك الأولى للحلاقة الرجالية الفاخرة. نمزج بين فنون الحلاقة الكلاسيكية والذوق العصري لنمنحك تجربة راقية لا تُنسى.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="#" aria-label="انستغرام" className="rounded-full border border-gold/30 p-2.5 text-gold transition hover:bg-gold/10">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="فيسبوك" className="rounded-full border border-gold/30 p-2.5 text-gold transition hover:bg-gold/10">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-black tracking-widest text-gold">روابط سريعة</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-gold">الخدمات</Link></li>
            <li><Link to="/barbers" className="hover:text-gold">الحلاقين</Link></li>
            <li><Link to="/booking" className="hover:text-gold">احجز الآن</Link></li>
            <li><Link to="/contact" className="hover:text-gold">تواصل معنا</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-black tracking-widest text-gold">تواصل</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> ٠١٠٠٠٠٠٠٠٠٠</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> القاهرة، مصر</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> يومياً ١٠ ص - ١٢ م</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/10 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} صالون هارون — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
