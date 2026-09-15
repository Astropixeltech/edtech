import { Marquee } from "@/components/ui/marquee";
import instructorAtik from "@/assets/instructors/Atik.png.asset.json";
import instructorHH from "@/assets/instructors/hh.png.asset.json";
import instructorNayeem from "@/assets/instructors/nayeem.png.asset.json";
import instructorShafiul from "@/assets/instructors/shafiul.png.asset.json";

export interface TeamMember {
  image: string;
  name: string;
  role: string;
}

interface TeamSectionProps {
  members?: TeamMember[];
  title?: string;
  subtitle?: string;
  isBn?: boolean;
}

const defaultMembers: TeamMember[] = [
  {
    image: instructorAtik.url,
    name: "মেহাবুব হোসেন (HH Sir)",
    role: "ফিজিক্স মেন্টর · বুয়েট '১৮",
  },
  {
    image: instructorNayeem.url,
    name: "মেহেরাব হোসেন নাঈম",
    role: "উচ্চতর গণিত · বুয়েট '১৯",
  },
  {
    image: instructorHH.url,
    name: "আতিকুর রহমান আতিক",
    role: "রসায়ন বিশেষজ্ঞ · ঢাবি '২০",
  },
  {
    image: instructorShafiul.url,
    name: "শফিউল ইসলাম",
    role: "জীববিজ্ঞান মেন্টর · DMC '২১",
  },
];

export function TeamSection({
  members = defaultMembers,
  title,
  subtitle,
  isBn = true,
}: TeamSectionProps) {
  const displayMembers = members && members.length > 0 ? members : defaultMembers;

  return (
    <section className="relative w-full overflow-hidden bg-white py-10 md:py-14 dark:bg-background border-t border-slate-100 dark:border-slate-800">
      <div>
        <svg
          className="absolute right-0 bottom-0 text-slate-100 dark:text-slate-800/40 pointer-events-none"
          fill="none"
          height="154"
          viewBox="0 0 460 154"
          width="460"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_494_1104)">
            <path
              d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="40"
            />
          </g>
          <defs>
            <clipPath id="clip0_494_1104">
              <rect fill="white" height="154" width="460" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 sm:mb-10 flex max-w-3xl flex-col items-center text-center">
          <h2 className="relative mb-2 font-black text-2xl text-slate-900 tracking-tight sm:text-3xl md:text-4xl dark:text-slate-100">
            {title || (isBn ? "দেশসেরা প্রশিক্ষকদের প্যানেল" : "Our Expert Instructors")}
            <svg
              className="absolute -top-3 -right-8 -z-10 w-20 sm:w-24 text-emerald-100 dark:text-emerald-950/60"
              fill="currentColor"
              height="86"
              viewBox="0 0 108 86"
              width="108"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M38.8484 16.236L15 43.5793L78.2688 15L18.1218 71L93 34.1172L70.2047 65.2739"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="28"
              />
            </svg>
          </h2>
          <p className="max-w-xl text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm leading-relaxed">
            {subtitle || (isBn
              ? "বুয়েট, মেডিকেল ও শীর্ষ বিশ্ববিদ্যালয়ের অভিজ্ঞ মেন্টরদের সাথে সরাসরি কনসেপ্ট মাস্টারি ও প্রস্তুতি।"
              : "Learn directly from top engineering & medical mentors with conceptual clarity.")}
          </p>
        </div>

        {/* Balanced Marquee with Medium-Sized Cards and Soft Edge Gradient Fade */}
        <div className="relative w-full overflow-hidden">
          {/* Soft Natural Side Fade Overlays */}
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-background dark:via-background/70 dark:to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-10 sm:w-20 bg-gradient-to-l from-white via-white/70 to-transparent dark:from-background dark:via-background/70 dark:to-transparent" />

          <Marquee className="[--gap:1.25rem] sm:[--gap:1.5rem] py-1" pauseOnHover repeat={4}>
            {displayMembers.map((member, idx) => (
              <div
                className="group flex w-60 sm:w-68 md:w-72 shrink-0 flex-col cursor-pointer"
                key={`${member.name}-${idx}`}
              >
                <div className="relative h-80 sm:h-92 w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300">
                  {/* Full Color Image */}
                  <img
                    alt={member.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    src={member.image}
                  />

                  {/* Frosted Glass Blur Caption Box */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md p-3 border border-white/60 dark:border-slate-700/60 shadow-sm group-hover:bg-white/95 dark:group-hover:bg-slate-900/95 transition-all duration-300">
                    <h3 className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 leading-tight tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-slate-900 dark:text-slate-100 text-xs font-bold leading-snug mt-0.5 truncate">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
