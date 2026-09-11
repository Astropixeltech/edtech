import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, ListChecks, RotateCcw, Sparkles } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  subject: string;
  done: boolean;
}

const initialChapters: Chapter[] = [
  // Physics
  { id: "p1", name: "ভেক্টর (Vector)", subject: "Physics", done: true },
  { id: "p2", name: "গতিবিদ্যা (Dynamics)", subject: "Physics", done: true },
  { id: "p3", name: "নিউটনিয়ান বলবিদ্যা (Newtonian Mechanics)", subject: "Physics", done: false },
  { id: "p4", name: "কাজ, শক্তি ও ক্ষমতা (Work, Energy & Power)", subject: "Physics", done: false },
  { id: "p5", name: "মহাকর্ষ ও অভিকর্ষ (Gravitation)", subject: "Physics", done: false },
  // Chemistry
  { id: "c1", name: "গুণগত রসায়ন (Qualitative Chemistry)", subject: "Chemistry", done: true },
  { id: "c2", name: "পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", subject: "Chemistry", done: false },
  { id: "c3", name: "রাসায়নিক পরিবর্তন (Chemical Change)", subject: "Chemistry", done: false },
  // Higher Math
  { id: "m1", name: "ম্যাট্রিক্স ও নির্ণায়ক (Matrix & Determinants)", subject: "Math", done: true },
  { id: "m2", name: "সরলরেখা (Straight Line)", subject: "Math", done: false },
  { id: "m3", name: "বৃত্ত (Circle)", subject: "Math", done: false },
  { id: "m4", name: "অন্তরীকরণ (Differentiation)", subject: "Math", done: false },
  // Biology / ICT
  { id: "b1", name: "কোষ ও এর গঠন (Cell & Structure)", subject: "Biology", done: true },
  { id: "i1", name: "ওয়েব ডিজাইন ও HTML (Web Design & HTML)", subject: "ICT", done: true },
  { id: "i2", name: "প্রোগ্রামিং ভাষা - সি (C Programming)", subject: "ICT", done: false },
];

const STORAGE_KEY = "ap_syllabus_progress";

const loadSavedProgress = (): Chapter[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const completedIds: string[] = JSON.parse(saved);
      return initialChapters.map((c) => ({
        ...c,
        done: completedIds.includes(c.id),
      }));
    }
  } catch {}
  return initialChapters;
};

const saveProgress = (chapters: Chapter[]) => {
  try {
    const completedIds = chapters.filter((c) => c.done).map((c) => c.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  } catch {}
};

export const SyllabusCalculatorPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [chapters, setChapters] = useState<Chapter[]>(loadSavedProgress);
  const [activeSubject, setActiveSubject] = useState<string>("All");

  const toggleChapter = (id: string) => {
    setChapters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
      saveProgress(updated);
      return updated;
    });
  };

  const resetAll = () => {
    setChapters((prev) => {
      const updated = prev.map((c) => ({ ...c, done: false }));
      saveProgress(updated);
      return updated;
    });
  };

  const completedCount = chapters.filter((c) => c.done).length;
  const totalCount = chapters.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const subjects = ["All", "Physics", "Chemistry", "Math", "Biology", "ICT"];

  const filtered = activeSubject === "All" 
    ? chapters 
    : chapters.filter((c) => c.subject === activeSubject);

  return (
    <Layout>
      <Helmet>
        <title>{isBn ? "সিলেবাস শেষ হইসে ট্র্যাকার — Astropixel Learn" : "Syllabus Tracker — Astropixel Learn"}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header Banner */}
        <section className="py-12 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-950/20 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <ListChecks className="h-3.5 w-3.5" />
              <span>{isBn ? "স্মার্ট স্টাডি টুল" : "Smart Study Tool"}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              {isBn ? "তোর সিলেবাস শেষ হইসে ট্র্যাকার" : "Syllabus Completion Tracker"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isBn
                ? "চ্যাপ্টারগুলো টিক দাও, এক মিনিটেই দেখো তোমার সিলেবাসের কতটুকু শেষ।"
                : "Tick off completed chapters and track your real-time syllabus completion rate."}
            </p>

            {/* Live Progress Card */}
            <div className="mt-8 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border/50 p-6 shadow-sm max-w-lg mx-auto">
              <div className="flex items-center justify-between text-sm font-bold mb-2">
                <span className="text-foreground">{isBn ? "সিলেবাস অগ্রগতি" : "Overall Progress"}</span>
                <span className="text-brand-600 dark:text-brand-400 text-lg font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
                <span>{completedCount} / {totalCount} {isBn ? "চ্যাপ্টার সমাপ্ত" : "Chapters Completed"}</span>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 hover:text-brand-600 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isBn ? "রিসেট করুন" : "Reset"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Chapters Checklist */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-3xl">
          {/* Subject Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeSubject === s
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-white dark:bg-card text-foreground border border-gray-200 dark:border-border hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Chapters List */}
          <div className="mt-4 space-y-2.5">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleChapter(c.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  c.done
                    ? "bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800/40"
                    : "bg-white dark:bg-card border-gray-100 dark:border-border hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      c.done
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "border-gray-300 dark:border-muted bg-white dark:bg-card"
                    }`}
                  >
                    {c.done && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <span className={`text-sm font-semibold ${c.done ? "line-through text-gray-400" : "text-foreground"}`}>
                    {c.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-muted text-gray-500">
                  {c.subject}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SyllabusCalculatorPage;
