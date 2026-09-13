import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Download, FileText, Sparkles, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const mockResources = [
  {
    id: "1",
    catId: "ict",
    titleBn: "এইচএসসি আইসিটি ও সি-প্রোগ্রামিং হ্যান্ডনোট ও চিটশীট",
    titleEn: "Complete HSC ICT & C-Programming Cheatsheet",
    category: "ICT & Coding",
    fileType: "PDF",
    size: "2.4 MB",
    downloads: 1420,
    downloadContent: "# Complete HSC ICT & C-Programming Cheatsheet\n\nAstropixel Learn Academic Study Material.\n\n- Number Systems, Boolean Algebra & Logic Gates.\n- C Programming Syntax, Loops, Arrays, Pointers, Functions.\n- HTML & Web Design Fundamentals for Board Exam CQ/MCQ.\n\nWebsite: https://astropixel.tech/catalog",
  },
  {
    id: "2",
    catId: "design",
    titleBn: "গ্রাফিক ডিজাইনারদের জন্য প্রফেশনাল শর্টকাট গাইড ২০২৬",
    titleEn: "Professional Graphic Design Shortcuts Guide 2026",
    category: "Design",
    fileType: "PDF",
    size: "4.1 MB",
    downloads: 2150,
    downloadContent: "# Professional Graphic Design Shortcuts Guide 2026\n\nFigma, Photoshop & Illustrator Essential Cheat Sheet.\n\n- 100+ keyboard shortcuts\n- Typography scale guidelines\n- Color harmonies cheatsheet\n\nAstropixel Learn Design Academy.",
  },
  {
    id: "3",
    catId: "web",
    titleBn: "ফুল-স্ট্যাক ওয়েব রোডম্যাপ ও টপ রিসোর্স লিস্ট",
    titleEn: "Full-Stack Web Development Roadmap & Resources",
    category: "Web Dev",
    fileType: "PDF",
    size: "1.8 MB",
    downloads: 3890,
    downloadContent: "# Full-Stack Web Development Roadmap & Resources\n\n- HTML5, Modern CSS & Tailwind\n- React, Next.js, Vite & TypeScript\n- Node, Express & Supabase Backend\n\nPrepared by Astropixel Learn Instructors.",
  },
  {
    id: "4",
    catId: "marketing",
    titleBn: "ডিজিটাল মার্কেটিং ও এসইও চেকলিস্ট",
    titleEn: "Digital Marketing & SEO Action Checklist",
    category: "Marketing",
    fileType: "PDF",
    size: "3.2 MB",
    downloads: 1650,
    downloadContent: "# Digital Marketing & SEO Action Checklist\n\n- On-page SEO Audit checklist\n- Social media engagement tactics\n- Meta ad campaign blueprint\n\nAstropixel Learn Marketing Team.",
  },
  {
    id: "5",
    catId: "freelancing",
    titleBn: "ফ্রিল্যান্সিং মার্কেটপ্লেস গিগ অপটিমাইজেশন ই-বুক",
    titleEn: "Freelancing Marketplace Gig Optimization E-Book",
    category: "Freelancing",
    fileType: "PDF",
    size: "5.5 MB",
    downloads: 4120,
    downloadContent: "# Freelancing Marketplace Gig Optimization Guide\n\n- Upwork Profile & Proposal formula\n- Fiverr SEO & Keyword optimization\n- Client retention strategies\n\nAstropixel Learn Freelancers Club.",
  },
  {
    id: "6",
    catId: "video",
    titleBn: "ভিডিও এডিটিং ও কালার গ্রেডিং প্রিসেট গাইড",
    titleEn: "Video Editing & Color Grading Preset Guide",
    category: "Video",
    fileType: "PDF",
    size: "2.9 MB",
    downloads: 1980,
    downloadContent: "# Video Editing & Color Grading Preset Guide\n\n- Premiere Pro & DaVinci Resolve Workflow\n- Cinematic Color Grading formula\n- Audio mastering presets\n\nAstropixel Learn Creative Studio.",
  },
];

export const FreeResourcesPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const categories = [
    { id: "all", label: isBn ? "সব রিসোর্স" : "All Resources" },
    { id: "ict", label: isBn ? "আইসিটি ও কোডিং" : "ICT & Coding" },
    { id: "design", label: isBn ? "ডিজাইন" : "Design" },
    { id: "web", label: isBn ? "ওয়েব" : "Web Dev" },
    { id: "marketing", label: isBn ? "মার্কেটিং" : "Marketing" },
    { id: "freelancing", label: isBn ? "ফ্রিল্যান্সিং" : "Freelancing" },
    { id: "video", label: isBn ? "ভিডিও" : "Video Editing" },
  ];

  const handleDownload = (item: typeof mockResources[0]) => {
    const title = isBn ? item.titleBn : item.titleEn;
    toast.success(isBn ? `"${title}" ডাউনলোড শুরু হয়েছে!` : `Download started for "${title}"!`);
    
    // Trigger real download of study guide document
    const blob = new Blob([item.downloadContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = mockResources.filter((r) => {
    const title = isBn ? r.titleBn : r.titleEn;
    const matchesSearch = !search || title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "all" || r.catId === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <Layout>
      <Helmet>
        <title>{isBn ? "ফ্রি রিসোর্স — Astropixel Learn" : "Free Resources — Astropixel Learn"}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent dark:from-brand-950/20 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isBn ? "১০০% ফ্রি ডাউনলোড" : "100% Free Downloads"}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              {isBn ? "শেখার ফ্রি রিসোর্স ও গাইডলাইন" : "Free Study Materials & Guidelines"}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              {isBn
                ? "আমাদের এক্সপার্ট টিচারদের তৈরি এক্সক্লুসিভ নোটস, চিটশীট এবং গাইড বই ফ্রিতে ডাউনলোড করে প্রস্তুতি এগিয়ে রাখুন।"
                : "Download curated cheat sheets, roadmaps, and guides prepared by expert mentors."}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? "রিসোর্স খুঁজুন..." : "Search resources..."}
                className="w-full h-11 pl-11 pr-10 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-sm focus:outline-none focus:border-brand-500 shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-6xl">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCat === cat.id
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-white dark:bg-card text-foreground border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Resources Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">
                {isBn ? "কোনো রিসোর্স পাওয়া যায়নি" : "No resources found"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isBn
                  ? "অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা ফিল্টার রিসেট করুন।"
                  : "Try a different search term or clear the filter."}
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCat("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
              >
                {isBn ? "সব রিসোর্স দেখুন" : "View All Resources"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filtered.map((item) => {
                const displayTitle = isBn ? item.titleBn : item.titleEn;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">{item.fileType} • {item.size}</span>
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {displayTitle}
                      </h3>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-border/40 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {item.downloads.toLocaleString()} {isBn ? "ডাউনলোড" : "downloads"}
                      </span>

                      <button
                        onClick={() => handleDownload(item)}
                        className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isBn ? "ডাউনলোড" : "Download"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default FreeResourcesPage;
