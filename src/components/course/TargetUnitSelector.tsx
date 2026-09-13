import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, Compass, Stethoscope, BookOpen, TrendingUp, 
  CheckCircle2, Sparkles, X, ChevronRight 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface TargetUnit {
  id: string;
  enTitle: string;
  bnTitle: string;
  enUnitName: string;
  bnUnitName: string;
  subtitleBn: string;
  subtitleEn: string;
  targetInstBn: string;
  targetInstEn: string;
  subjectsBn: string[];
  subjectsEn: string[];
  searchTerm: string;
  icon: React.ElementType;
  themeColor: string;
  badgeBg: string;
  badgeBorder: string;
  accentBg: string;
  activeBorder: string;
  activeGlow: string;
}

export const TARGET_UNITS: TargetUnit[] = [
  {
    id: "eng",
    enTitle: "Engineering",
    bnTitle: "ইঞ্জিনিয়ারিং",
    enUnitName: "Engineering (ইঞ্জিনিয়ারিং)",
    bnUnitName: "Engineering (ইঞ্জিনিয়ারিং)",
    subtitleBn: "বুয়েট, রুয়েট, কুয়েট, চুয়েট ও বুটেক্স ভর্তি প্রস্তুতি",
    subtitleEn: "BUET, RUET, KUET, CUET, BUTEX Admission",
    targetInstBn: "BUET + CKRUET",
    targetInstEn: "BUET + CKRUET",
    subjectsBn: ["উচ্চতর গণিত", "পদার্থবিজ্ঞান", "রসায়ন"],
    subjectsEn: ["Higher Math", "Physics", "Chemistry"],
    searchTerm: "ইঞ্জিনিয়ারিং",
    icon: Building2,
    themeColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badgeBorder: "border-blue-200 dark:border-blue-800",
    accentBg: "from-blue-500/10 via-indigo-500/5 to-transparent",
    activeBorder: "border-blue-500 dark:border-blue-400",
    activeGlow: "shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/50",
  },
  {
    id: "varsity_a",
    enTitle: "Varsity A Unit",
    bnTitle: "বিজ্ঞান",
    enUnitName: "Varsity A Unit (বিজ্ঞান)",
    bnUnitName: "Varsity A Unit (বিজ্ঞান)",
    subtitleBn: "ঢাকা বিশ্ববিদ্যালয় ও সমন্বিত সাধারণ বিশ্ববিদ্যালয় বিজ্ঞান",
    subtitleEn: "DU 'Ka' & General University Science Unit",
    targetInstBn: "DU 'Ka' + GST A",
    targetInstEn: "DU 'Ka' + GST A",
    subjectsBn: ["পদার্থ", "রসায়ন", "গণিত / জীববিজ্ঞান"],
    subjectsEn: ["Physics", "Chemistry", "Math / Biology"],
    searchTerm: "বিজ্ঞান",
    icon: Compass,
    themeColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badgeBorder: "border-emerald-200 dark:border-emerald-800",
    accentBg: "from-emerald-500/10 via-teal-500/5 to-transparent",
    activeBorder: "border-emerald-500 dark:border-emerald-400",
    activeGlow: "shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/50",
  },
  {
    id: "medical",
    enTitle: "Medical",
    bnTitle: "মেডিকেল",
    enUnitName: "Medical (মেডিকেল)",
    bnUnitName: "Medical (মেডিকেল)",
    subtitleBn: "সরকারি মেডিকেল ও ডেন্টাল কলেজ ভর্তি প্রস্তুতি",
    subtitleEn: "Govt Medical & Dental College Admission",
    targetInstBn: "DMC + Dental",
    targetInstEn: "DMC + Dental",
    subjectsBn: ["জীববিজ্ঞান", "রসায়ন", "সাধারণ জ্ঞান ও ইংরেজি"],
    subjectsEn: ["Biology", "Chemistry", "GK & English"],
    searchTerm: "মেডিকেল",
    icon: Stethoscope,
    themeColor: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badgeBorder: "border-rose-200 dark:border-rose-800",
    accentBg: "from-rose-500/10 via-red-500/5 to-transparent",
    activeBorder: "border-rose-500 dark:border-rose-400",
    activeGlow: "shadow-lg shadow-rose-500/15 ring-2 ring-rose-500/50",
  },
  {
    id: "varsity_b",
    enTitle: "Varsity B & D Unit",
    bnTitle: "মানবিক",
    enUnitName: "Varsity B & D Unit (মানবিক)",
    bnUnitName: "Varsity B & D Unit (মানবিক)",
    subtitleBn: "মানবিক বিভাগ ও বিভাগ পরিবর্তন ইউনিট ভর্তি প্রস্তুতি",
    subtitleEn: "Humanities & Faculty Change Unit Admission",
    targetInstBn: "DU 'Kha' + GST B",
    targetInstEn: "DU 'Kha' + GST B",
    subjectsBn: ["বাংলা", "ইংরেজি", "বাংলাদেশ ও আন্তর্জাতিক জিকে"],
    subjectsEn: ["Bangla", "English", "General Knowledge"],
    searchTerm: "মানবিক",
    icon: BookOpen,
    themeColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badgeBorder: "border-amber-200 dark:border-amber-800",
    accentBg: "from-amber-500/10 via-yellow-500/5 to-transparent",
    activeBorder: "border-amber-500 dark:border-amber-400",
    activeGlow: "shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/50",
  },
  {
    id: "varsity_c",
    enTitle: "Varsity C Unit",
    bnTitle: "ব্যবসায়",
    enUnitName: "Varsity C Unit (ব্যবসায়)",
    bnUnitName: "Varsity C Unit (ব্যবসায়)",
    subtitleBn: "ব্যবসায় শিক্ষা অনুষদ ও আইবিএ ভর্তি প্রস্তুতি",
    subtitleEn: "Business Faculty & IBA Admission Preparation",
    targetInstBn: "DU 'Ga' + IBA",
    targetInstEn: "DU 'Ga' + IBA",
    subjectsBn: ["হিসাববিজ্ঞান", "ব্যবসায় সংগঠন", "ফিন্যান্স / মার্কেটিং"],
    subjectsEn: ["Accounting", "Management", "Finance / Marketing"],
    searchTerm: "ব্যবসায়",
    icon: TrendingUp,
    themeColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badgeBorder: "border-purple-200 dark:border-purple-800",
    accentBg: "from-purple-500/10 via-fuchsia-500/5 to-transparent",
    activeBorder: "border-purple-500 dark:border-purple-400",
    activeGlow: "shadow-lg shadow-purple-500/15 ring-2 ring-purple-500/50",
  },
];

interface TargetUnitSelectorProps {
  selectedUnitId: string | null;
  onSelectUnit: (unit: TargetUnit | null) => void;
  className?: string;
}

export const TargetUnitSelector: React.FC<TargetUnitSelectorProps> = ({
  selectedUnitId,
  onSelectUnit,
  className = "",
}) => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const handleUnitClick = (unit: TargetUnit) => {
    if (selectedUnitId === unit.id) {
      // Toggle off
      onSelectUnit(null);
    } else {
      onSelectUnit(unit);
    }
  };

  return (
    <div className={`w-full rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 sm:p-6 shadow-sm ${className}`}>
      {/* Header with Title and Clear Filter action */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {isBn ? "তোমার টার্গেট ইউনিট বেছে নাও:" : "Select your target unit:"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isBn 
                ? "স্বপ্নের ক্যাম্পাসে পৌঁছানোর জন্য সঠিক ইউনিট নির্বাচন করো" 
                : "Choose your desired academic track for focused preparation"}
            </p>
          </div>
        </div>

        {selectedUnitId && (
          <button
            type="button"
            onClick={() => onSelectUnit(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
            {isBn ? "ফিল্টার মুছুন" : "Clear unit filter"}
          </button>
        )}
      </div>

      {/* 5 Dynamic Animated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {TARGET_UNITS.map((unit, index) => {
          const Icon = unit.icon;
          const isSelected = selectedUnitId === unit.id;

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUnitClick(unit)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleUnitClick(unit);
                }
              }}
              className={`
                group relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer select-none outline-none
                ${isSelected 
                  ? `${unit.activeBorder} ${unit.activeGlow} bg-card` 
                  : "border-border/70 hover:border-border bg-card/80 hover:shadow-md"}
              `}
            >
              {/* Gradient Accent Background Glow */}
              <div 
                className={`absolute inset-0 rounded-xl bg-gradient-to-b ${unit.accentBg} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} 
              />

              {/* Top Row: Icon & Target Tag */}
              <div className="relative flex items-start justify-between gap-2 mb-3">
                <div 
                  className={`
                    h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isSelected ? "bg-card shadow-sm ring-1 ring-border" : "bg-muted/60 group-hover:scale-105"}
                  `}
                >
                  <Icon className={`h-5 w-5 ${unit.themeColor}`} />
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${unit.badgeBg}`}>
                  {isBn ? unit.targetInstBn : unit.targetInstEn}
                </span>
              </div>

              {/* Middle Section: Titles */}
              <div className="relative mb-3">
                <h4 className="text-sm font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight mb-1">
                  {isBn ? unit.bnUnitName : unit.enUnitName}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                  {isBn ? unit.subtitleBn : unit.subtitleEn}
                </p>
              </div>

              {/* Bottom Section: Subjects and Selection Status */}
              <div className="relative pt-2.5 border-t border-border/50 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {(isBn ? unit.subjectsBn : unit.subjectsEn).slice(0, 2).map((sub, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-1">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isBn ? "নির্বাচিত" : "Selected"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground inline-flex items-center gap-0.5 transition-colors">
                      {isBn ? "কোর্স দেখুন" : "Explore"}
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetUnitSelector;
