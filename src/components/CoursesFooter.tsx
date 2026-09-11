import { ArrowUp, Facebook, Instagram, MessageCircle, Mail, Phone, Youtube, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;
import { useLanguage } from "@/contexts/LanguageContext";

const CoursesFooter = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const learningLinks = [
    { name: isBn ? "কোর্স ক্যাটাগরি" : "Course Categories", to: "/courses" },
    { name: isBn ? "ফ্রি রিসোর্স" : "Free Resources", to: "/free-resources" },
    { name: isBn ? "এডমিশন প্রস্তুতি" : "Admission Prep", to: "/courses" },
    { name: isBn ? "যোগ্যতা যাচাই" : "Eligibility Calculator", to: "/eligibility-calculator" },
    { name: isBn ? "সিলেবাস ট্র্যাকার" : "Syllabus Tracker", to: "/syllabus-calculator" },
  ];

  const companyLinks = [
    { name: isBn ? "আমাদের সম্পর্কে" : "About Us", to: "/about" },
    { name: isBn ? "যোগাযোগ" : "Contact", to: "/contact" },
    { name: isBn ? "শিক্ষক হতে চান?" : "Become an Instructor", to: "/login" },
  ];

  const policyLinks = [
    { name: isBn ? "রিফান্ড ও রিটার্ন পলিসি" : "Refund Policy", to: "/terms" },
    { name: isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy", to: "/privacy" },
    { name: isBn ? "ব্যবহারের শর্তাবলি" : "Terms & Conditions", to: "/terms" },
  ];

  const socials = [
    { icon: Facebook, url: "https://www.facebook.com/share/1Zm7yMhPtk/", label: "Facebook" },
    { icon: Instagram, url: "https://www.instagram.com/astropixel.tech", label: "Instagram" },
    { icon: Youtube, url: "https://youtube.com/@astropixel_tech", label: "YouTube" },
    { icon: MessageCircle, url: "https://wa.me/8801776965533", label: "WhatsApp" },
    { icon: Mail, url: "mailto:hello@astropixel.tech", label: "Email" },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-[#0C2417] text-white pt-14 pb-8 container-fluid-2k">
      {/* SVG Pattern Background */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full -z-10 text-[#EDEAE0] opacity-[0.035]"
      >
        <defs>
          <pattern id="footer-doodles" width="220" height="200" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="10" stroke="currentColor" fill="none" strokeWidth="2" />
            <rect x="80" y="80" width="20" height="20" rx="4" stroke="currentColor" fill="none" strokeWidth="2" />
            <polygon points="170,30 180,50 160,50" stroke="currentColor" fill="none" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-doodles)" />
      </svg>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* App Promo Banner Card */}
        <div className="mb-12 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                {isBn ? "নেট না থাকলেও ক্লাস চলবে" : "Learning continues even offline"}
              </h3>
              <p className="text-sm text-gray-300 mt-0.5">
                {isBn
                  ? "ক্লাস, নোট, এবং প্র্যাক্টিস — সব এক প্ল্যাটফর্মে তোমার হাতের মুঠোয়।"
                  : "Classes, notes, and practice — all in one accessible platform."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {isBn ? "কোর্সগুলো এক্সপ্লোর করুন" : "Explore Courses"}
            </Link>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={learnLogo}
                alt="Astropixel Learn"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
              {isBn
                ? "স্কুল, কলেজ, স্কিল ও ভর্তি পরীক্ষা — সেরা শিক্ষকদের নির্দেশনায় ১০০% ইন্টারঅ্যাক্টিভ ও প্র্যাক্টিক্যাল লার্নিং।"
                : "School, College, Skills, and Admission prep — 100% interactive and practical online education."}
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-400" />
                <span>+880 1776-965533</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-400" />
                <span>hello@astropixel.tech</span>
              </span>
            </div>
          </div>

          {/* পড়াশোনা (Learning) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">
              {isBn ? "পড়াশোনা" : "Learning"}
            </h4>
            <ul className="space-y-2.5">
              {learningLinks.map((l) => (
                <li key={l.name}>
                  <Link to={l.to} className="text-xs text-gray-300 hover:text-brand-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* কোম্পানি (Company) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">
              {isBn ? "কোম্পানি" : "Company"}
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((c) => (
                <li key={c.name}>
                  <Link to={c.to} className="text-xs text-gray-300 hover:text-brand-400 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* পলিসি ও সোশ্যাল (Policies & Social) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">
              {isBn ? "পলিসি" : "Policies"}
            </h4>
            <ul className="space-y-2.5 mb-6">
              {policyLinks.map((p) => (
                <li key={p.name}>
                  <Link to={p.to} className="text-xs text-gray-300 hover:text-brand-400 transition-colors">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center text-white transition-all"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 Astropixel Learn. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
          >
            <span>{isBn ? "উপরে যান" : "Back to Top"}</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default CoursesFooter;
