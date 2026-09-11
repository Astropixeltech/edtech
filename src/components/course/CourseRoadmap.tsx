import React, { useState } from "react";
import { CheckCircle2, ChevronDown, Flag, Award, Sparkles, BookOpen, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Milestone {
  step: number;
  titleBn: string;
  titleEn: string;
  duration: string;
  descriptionBn: string;
  descriptionEn: string;
  topics: string[];
}

const defaultMilestones: Milestone[] = [
  {
    step: 1,
    titleBn: "ফাউন্ডেশন ও টুলস সেটআপ",
    titleEn: "Foundations & Environment Setup",
    duration: "সপ্তাহ ১ - ২",
    descriptionBn: "কোর্সের মূল বিষয়বস্তু, প্রয়োজনীয় সফটওয়্যার ও প্রাথমিক ধারণার স্পষ্ট রূপরেখা।",
    descriptionEn: "Mastering fundamental concepts, interface navigation, and required software setups.",
    topics: ["ইন্টারফেস পরিচিতি ও বেসিক ধারণা", "টুলস ও এক্সটেনশন ইনস্টলেশন", "প্রথম প্র্যাক্টিক্যাল মিনি প্রজেক্ট"],
  },
  {
    step: 2,
    titleBn: "কোর কনসেপ্ট ও রিয়েল প্রজেক্ট",
    titleEn: "Core Concepts & Real Projects",
    duration: "সপ্তাহ ৩ - ৫",
    descriptionBn: "হাতে-কলমে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কাজের নিয়মাবলী ও কার্যকরী প্রজেক্ট তৈরি।",
    descriptionEn: "Hands-on implementation of core industry skills through guided practical tasks.",
    topics: ["রিয়েল-ওয়ার্ল্ড কেস স্টাডি", "প্রোডাকশন-গ্রেড টেকনিক", "সাধারণ ভুল ও তার সমাধান"],
  },
  {
    step: 3,
    titleBn: "অ্যাডভান্সড টেকনিক ও অটোমেশন",
    titleEn: "Advanced Techniques & Workflows",
    duration: "সপ্তাহ ৬ - ৮",
    descriptionBn: "কাজের গতি বাড়ানো, AI টুলস ইন্টিগ্রেশন এবং প্রফেশনাল পোর্টফোলিও প্রস্তুতি।",
    descriptionEn: "Leveraging modern workflows, AI assistance, and high-efficiency production pipelines.",
    topics: ["অ্যাডভান্সড টিপস ও ট্রিক্স", "ওয়ার্কফ্লো অপটিমাইজেশন", "ক্লায়েন্ট কমিউনিকেশন গাইডলাইন"],
  },
  {
    step: 4,
    titleBn: "ক্যাপস্টোন প্রজেক্ট ও সার্টিফিকেট",
    titleEn: "Capstone Project & Verified Certificate",
    duration: "সপ্তাহ ৯ - ১০",
    descriptionBn: "সম্পূর্ণ স্বতন্ত্র একটি প্রজেক্ট সাবমিশন, রিভিউ এবং ভেরিফাইড সার্টিফিকেট অর্জন।",
    descriptionEn: "Building a standalone showcase project, mentor evaluation, and earning your certificate.",
    topics: ["ফাইনাল ক্যাপস্টোন প্রজেক্ট", "মেন্টর রিভিউ ও ফিডব্যাক", "যাচাইযোগ্য ডিজিটাল সার্টিফিকেট"],
  },
];

interface CourseRoadmapProps {
  milestones?: Milestone[];
}

export const CourseRoadmap: React.FC<CourseRoadmapProps> = ({
  milestones = defaultMilestones,
}) => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isBn ? "কোর্স রোডম্যাপ ও লার্নিং পাথ" : "Course Learning Roadmap"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isBn ? "জিরো থেকে প্রো হওয়ার ধাপে ধাপে গাইডলাইন" : "Step-by-step milestone path to mastery"}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <Sparkles className="h-3 w-3" />
          <span>{milestones.length} {isBn ? "টি মাইলস্টোন" : "Milestones"}</span>
        </span>
      </div>

      {/* Roadmap Step Timeline */}
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-brand-100 dark:before:bg-brand-900/40 space-y-6 pt-2">
        {milestones.map((m) => {
          const isOpen = expandedStep === m.step;
          return (
            <div key={m.step} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                onClick={() => setExpandedStep(isOpen ? null : m.step)}
                className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-7 sm:w-7 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                  isOpen
                    ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                    : "border-gray-300 dark:border-border bg-white dark:bg-card text-gray-500 hover:border-brand-500"
                }`}
              >
                <span className="text-xs font-bold">{m.step}</span>
              </div>

              {/* Step Content Card */}
              <div
                onClick={() => setExpandedStep(isOpen ? null : m.step)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isOpen
                    ? "border-brand-200 dark:border-brand-800/40 bg-brand-50/20 dark:bg-brand-950/10 shadow-sm"
                    : "border-gray-100 dark:border-border/40 bg-white dark:bg-card hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {isBn ? `মাইলস্টোন ${m.step}` : `Milestone ${m.step}`} • {m.duration}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {isBn ? m.titleBn : m.titleEn}
                    </h4>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-600" : ""
                    }`}
                  />
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-2.5 pt-3 border-t border-gray-100 dark:border-border/30">
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {isBn ? m.descriptionBn : m.descriptionEn}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {m.topics.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseRoadmap;
