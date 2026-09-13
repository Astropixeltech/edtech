import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, Award, PlayCircle, Sparkles, Target, Rocket, Globe, CheckCircle, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageContent } from "@/hooks/usePageContent";
import StatCard from "@/components/StatCard";

import instructorHH from "@/assets/instructors/hh.png.asset.json";
import instructorNayeem from "@/assets/instructors/nayeem.png.asset.json";
import instructorAtik from "@/assets/instructors/Atik.png.asset.json";
import instructorShafiul from "@/assets/instructors/shafiul.png.asset.json";
import instructorPapiya from "@/assets/instructors/papiya.png.asset.json";
import instructorPrantik from "@/assets/instructors/prantik.png.asset.json";

const STATIC_TRAINERS = [
  { name: "Sofiullah Ahammad", roleEn: "Graphics Designer, Senior ICT Mentor", roleBn: "গ্রাফিক্স ডিজাইনার, সিনিয়র আইসিটি মেন্টর", image: instructorAtik.url },
  { name: "Adib Sarkar", roleEn: "Lead Designer, Entrepreneur", roleBn: "লিড ডিজাইনার, উদ্যোক্তা", image: instructorHH.url },
  { name: "Md Nayeem Ahmed", roleEn: "Digital Marketer", roleBn: "ডিজিটাল মার্কেটার", image: instructorNayeem.url },
  { name: "Md. Shafiul Haque", roleEn: "Video Editor, Cinematographer", roleBn: "ভিডিও এডিটর, সিনেমাটোগ্রাফার", image: instructorShafiul.url },
  { name: "Prantik Saha", roleEn: "Microsoft Office Expert, IT Support", roleBn: "মাইক্রোসফট অফিস এক্সপার্ট, আইটি সাপোর্ট", image: instructorPrantik.url },
  { name: "Papia Rahman", roleEn: "Graphic Designer", roleBn: "গ্রাফিক ডিজাইনার", image: instructorPapiya.url },
  { name: "Rashadul Islam Naime", roleEn: "Digital Marketer, SEO Expert", roleBn: "ডিজিটাল মার্কেটার, এসইও এক্সপার্ট", image: "https://res.cloudinary.com/de348sqlb/image/upload/v1784827649/alphazero-assets/team/rashadul-islam-naime.png" },
];

const LearnAboutPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { getContent: getPageContent } = usePageContent("learn-about", "learn");

  const t = (bn: string, en: string) => (isBn ? bn : en);

  const features = [
    {
      icon: PlayCircle,
      title: t("প্রিমিয়াম ভিডিও লেসন", "Premium Video Lessons"),
      desc: t(
        "চ্যাপ্টার-ভিত্তিক পাঠ, বাস্তব প্রজেক্ট ফাইল এবং প্রগ্রেস ট্র্যাকিং সহ প্রফেশনাল কোর্স।",
        "Professional courses with chapter-based lessons, source files, and progress tracking."
      ),
    },
    {
      icon: BookOpen,
      title: t("প্র্যাকটিকাল কারিকুলাম", "Practical Curriculum"),
      desc: t(
        "রিয়েল-ওয়ার্ল্ড প্রজেক্ট, ডাউনলোডযোগ্য রিসোর্স এবং ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ওয়ার্কফ্লো।",
        "Real projects, downloadable resources, and industry-standard workflows."
      ),
    },
    {
      icon: Users,
      title: t("এক্সপার্ট ইনস্ট্রাক্টর", "Expert Instructors"),
      desc: t(
        "ইন্ডাস্ট্রির অভিজ্ঞ ক্রিয়েটর ও ডেভেলপারদের কাছ থেকে সরাসরি হাতে-কলমে শিখুন।",
        "Learn directly from experienced creators and developers."
      ),
    },
    {
      icon: Award,
      title: t("ভেরিফায়েড সার্টিফিকেট", "Verified Certificates"),
      desc: t(
        "কোর্স শেষে যাচাইযোগ্য ডিজিটাল সার্টিফিকেট, যা সরাসরি লিংকডইন ও সিভি-তে যোগ করা যায়।",
        "Verifiable certificates upon completion that you can showcase on your resume."
      ),
    },
    {
      icon: MessageCircle,
      title: t("লাইভ সাপোর্ট ও কমিউনিটি", "Live Support & Community"),
      desc: t(
        "যেকোনো সমস্যায় মেন্টর ও সহপাঠীদের সাথে সরাসরি প্রশ্নোত্তরের সুবিধা।",
        "Dedicated community and mentor support to clear any doubts promptly."
      ),
    },
    {
      icon: Globe,
      title: t("দ্বিভাষিক প্ল্যাটফর্ম", "Bilingual Experience"),
      desc: t(
        "সম্পূর্ণ প্ল্যাটফর্ম বাংলা ও ইংরেজিতে — আপনার ভাষায় স্বাচ্ছন্দ্যে শিখুন।",
        "The entire platform in Bangla and English — learn comfortably in your language."
      ),
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t("আমাদের সম্পর্কে — Astropixel Learn", "About Us — Astropixel Learn")}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        
        {/* 1. HERO HEADER */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent dark:from-brand-950/20 border-b border-border/40">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("আমাদের লক্ষ্য ও উদ্দেশ্য", "Our Story & Vision")}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              {t("আগামীর ডিজিটাল স্কিল গড়ার সেরা প্ল্যাটফর্ম", "Building Future-Ready Digital Skills")}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
              {t(
                "Astropixel Learn হলো বাংলাদেশের তরুণদের বাস্তবমুখী ডিজিটাল স্কিল, প্রোগ্রামিং, ডিজাইন ও ভর্তি পরীক্ষায় বিজয়ী করার একটি আধুনিক অনলাইন লার্নিং প্ল্যাটফর্ম।",
                "Astropixel Learn empowers learners with practical digital skills, programming, design, and admission prep."
              )}
            </p>
          </div>
        </section>

        {/* 2. STATS ROW */}
        <section className="bg-white dark:bg-background border-b border-gray-100 dark:border-border/40 py-8">
          <div className="container max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
            <StatCard
              icon={Users}
              value="১০,০০০+"
              label={t("সক্রিয় শিক্ষার্থী", "Active Students")}
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
              iconColor="text-brand-600 dark:text-brand-400"
            />
            <StatCard
              icon={BookOpen}
              value="২৫+"
              label={t("প্র্যাক্টিক্যাল কোর্স", "Hands-on Courses")}
              iconBgColor="bg-blue-50 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={GraduationCap}
              value="১৫+"
              label={t("অভিজ্ঞ মেন্টর", "Expert Mentors")}
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              icon={Award}
              value="৯৮%"
              label={t("সফলতার হার", "Success Rate")}
              iconBgColor="bg-purple-50 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
            />
          </div>
        </section>

        {/* 3. MISSION & VISION */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {t("আমাদের মিশন", "Our Mission")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(
                  "শিক্ষার্থীদের তাত্ত্বিক পড়াশোনার গণ্ডি পেরিয়ে সরাসরি প্র্যাক্টিক্যাল প্রজেক্ট ভিত্তিক স্কিল ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ারের জন্য প্রস্তুত করা। মানসম্মত শিক্ষা সবার জন্য সহজলভ্য করাই আমাদের প্রতিজ্ঞা।",
                  "To bridge the gap between academic theory and industry reality through practical, project-based learning accessible to every student."
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {t("আমাদের ভিশন", "Our Vision")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(
                  "বাংলাদেশের প্রতিটি ঘরে মানসম্মত ও প্রযুক্তিভিত্তিক শিক্ষার সুযোগ পৌঁছে দিয়ে একটি আত্মনির্ভরশীল, দক্ষ ও গ্লোবালি কম্পিটিটিভ তরুণ প্রজন্ম গড়ে তোলা।",
                  "To cultivate a self-reliant and globally competitive generation by democratizing high-quality technical education across Bangladesh."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 4. WHY ASTROPIXEL FEATURES */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("কেন Astropixel Learn বেছে নেবেন?", "Why Choose Astropixel Learn?")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {t("আধুনিক শিক্ষা ব্যবস্থার সব সেরা সুবিধা এক প্ল্যাটফর্মে", "Modern features designed for optimal learning outcomes")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">{f.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. MENTOR PANEL */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("আমাদের অভিজ্ঞ শিক্ষকবৃন্দ", "Our Expert Faculty")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {t("ইন্ডাস্ট্রি লিডারদের কাছ থেকে সরাসরি মেন্টরশিপ", "Direct mentorship from experienced practitioners")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {STATIC_TRAINERS.map((tItem, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-3 rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={tItem.image}
                  alt={tItem.name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-brand-500/30 p-1 bg-gray-50"
                  loading="lazy"
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{tItem.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {isBn ? tItem.roleBn : tItem.roleEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. DARK CTA BANNER */}
        <section className="bg-[#0b1d33] text-white py-12 px-4 sm:px-6 mt-8">
          <div className="container max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {t("আজই শুরু করুন আপনার একাডেমিক ও স্কিল যাত্রা", "Start Your Academic & Skill Journey Today")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              {t(
                "হাজারো শিক্ষার্থীর সাথে যুক্ত হয়ে নিজের পছন্দমতো কোর্স বেছে নিন এবং বোর্ড ও এডমিশনে নিশ্চিত সফলতা অর্জন করুন।",
                "Join thousands of students, choose your desired course, and achieve academic excellence."
              )}
            </p>
            <div className="pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-colors"
              >
                <span>{t("সকল কোর্স এক্সপ্লোর করুন", "Explore All Courses")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default LearnAboutPage;
