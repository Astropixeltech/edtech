import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { BadgeCheck, Calculator, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TargetTrack {
  id: string;
  nameBn: string;
  nameEn: string;
  minSscGpa: number;
  minHscGpa: number;
  minTotalGpa: number;
  notesBn: string;
}

const tracks: TargetTrack[] = [
  {
    id: "eng",
    nameBn: "বুয়েট ও ইঞ্জিনিয়ারিং গুচ্ছ",
    nameEn: "BUET & Engineering Cluster",
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 9.0,
    notesBn: "পদার্থবিজ্ঞান, রসায়ন, ও উচ্চতর গণিতে ন্যূনতম জিপিএ থাকতে হবে।",
  },
  {
    id: "med",
    nameBn: "মেডিকেল ও ডেন্টাল কলেজ",
    nameEn: "Medical & Dental Colleges",
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 9.0,
    notesBn: "জীববিজ্ঞানে এইচএসসিতে ন্যূনতম জিপিএ ৪.০ বা তদূর্ধ্ব আবশ্যক।",
  },
  {
    id: "du_a",
    nameBn: "ঢাকা বিশ্ববিদ্যালয় (বিজ্ঞান / 'ক' ইউনিট)",
    nameEn: "Dhaka University (A Unit - Science)",
    minSscGpa: 3.5,
    minHscGpa: 3.5,
    minTotalGpa: 8.0,
    notesBn: "এসএসসি ও এইচএসসি উভয় পরীক্ষায় বিজ্ঞান বিভাগ আবশ্যক।",
  },
  {
    id: "du_b",
    nameBn: "ঢাকা বিশ্ববিদ্যালয় (মানবিক / 'খ' ইউনিট)",
    nameEn: "Dhaka University (B Unit - Arts)",
    minSscGpa: 3.0,
    minHscGpa: 3.0,
    minTotalGpa: 7.5,
    notesBn: "নূন্যতম মোট জিপিএ ৭.৫ আবশ্যক।",
  },
  {
    id: "du_c",
    nameBn: "ঢাকা বিশ্ববিদ্যালয় (ব্যবসা শিক্ষা / 'গ' ইউনিট)",
    nameEn: "Dhaka University (C Unit - Business)",
    minSscGpa: 3.0,
    minHscGpa: 3.0,
    minTotalGpa: 7.5,
    notesBn: "ব্যবসায় শিক্ষা বিভাগ থেকে উত্তীর্ণ হতে হবে।",
  },
];

export const EligibilityCalculatorPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [selectedTrack, setSelectedTrack] = useState<string>("eng");
  const [sscGpa, setSscGpa] = useState<string>("5.00");
  const [hscGpa, setHscGpa] = useState<string>("5.00");
  const [result, setResult] = useState<{ eligible: boolean; track: TargetTrack } | null>(null);

  const calculateEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    const track = tracks.find((t) => t.id === selectedTrack) || tracks[0];
    const ssc = parseFloat(sscGpa) || 0;
    const hsc = parseFloat(hscGpa) || 0;
    const total = ssc + hsc;

    const isEligible =
      ssc >= track.minSscGpa &&
      hsc >= track.minHscGpa &&
      total >= track.minTotalGpa;

    setResult({ eligible: isEligible, track });
  };

  return (
    <Layout>
      <Helmet>
        <title>{isBn ? "ভর্তি পরীক্ষার যোগ্যতা যাচাই — Astropixel Learn" : "Admission Eligibility Calculator — Astropixel Learn"}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-950/20 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>{isBn ? "ইনস্ট্যান্ট এলিজিবিলিটি টেস্ট" : "Instant Eligibility Check"}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              {isBn ? "ভর্তি পরীক্ষার যোগ্যতা যাচাই" : "Admission Eligibility Calculator"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isBn
                ? "তোমার এসএসসি ও এইচএসসি জিপিএ দিয়ে সহজেই জেনে নাও কোন কোন বিশ্ববিদ্যালয়ে পরীক্ষা দিতে পারবে।"
                : "Check university admission eligibility criteria instantly based on your GPA scores."}
            </p>
          </div>
        </section>

        {/* Form & Calculator Card */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-xl">
          <form
            onSubmit={calculateEligibility}
            className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 sm:p-8 shadow-sm space-y-5"
          >
            {/* Target University Track */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">
                {isBn ? "কাঙ্ক্ষিত ইউনিট বা লক্ষ্য বেছে নাও:" : "Select Target Admission Track:"}
              </label>
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value);
                  setResult(null);
                }}
                className="w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground focus:outline-none focus:border-brand-500"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isBn ? t.nameBn : t.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* GPA Inputs Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isBn ? "SSC GPA (৪র্থ বিষয় সহ):" : "SSC GPA:"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="5.0"
                  value={sscGpa}
                  onChange={(e) => setSscGpa(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-border text-sm font-semibold text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isBn ? "HSC GPA (৪র্থ বিষয় সহ):" : "HSC GPA:"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="5.0"
                  value={hscGpa}
                  onChange={(e) => setHscGpa(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-border text-sm font-semibold text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              <span>{isBn ? "যোগ্যতা হিসাব করুন" : "Calculate Eligibility"}</span>
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div
              className={`mt-6 rounded-2xl p-6 border transition-all ${
                result.eligible
                  ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                  : "bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-800/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.eligible ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h3
                    className={`text-base font-extrabold ${
                      result.eligible ? "text-emerald-900 dark:text-emerald-300" : "text-red-900 dark:text-red-300"
                    }`}
                  >
                    {result.eligible
                      ? isBn
                        ? "অভিনন্দন! তুমি আবেদন করার যোগ্য।"
                        : "Congratulations! You meet the general eligibility criteria."
                      : isBn
                      ? "দুঃখিত, প্রাথমিক জিপিএ শর্ত পূরণ হয়নি।"
                      : "Sorry, you do not meet the minimum GPA criteria."}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {result.track.notesBn} (নূন্যতম মোট জিপিএ: {result.track.minTotalGpa})
                  </p>
                  {result.eligible && (
                    <div className="pt-2">
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline"
                      >
                        <span>{isBn ? "এডমিশন প্রস্তুতি কোর্সসমূহ দেখুন" : "View Admission Preparation Courses"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default EligibilityCalculatorPage;
