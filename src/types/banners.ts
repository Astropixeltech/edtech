export interface HeroSlide {
  id: string;
  image: string;
  eyebrowBn: string;
  eyebrowEn: string;
  title1Bn: string;
  title1En: string;
  title2Bn: string;
  title2En: string;
  title3Bn: string;
  title3En: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaBn: string;
  ctaEn: string;
  ctaHref: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-slide-1",
    image: "https://res.cloudinary.com/de348sqlb/image/upload/v1784725007/alphazero-assets/courses-hero-bg.png",
    eyebrowBn: "স্মার্ট এডুকেশন একাডেমি",
    eyebrowEn: "Smart Education Academy",
    title1Bn: "ভবিষ্যতের জন্য",
    title1En: "Empower Your Career",
    title2Bn: "দক্ষতা অর্জন করুন",
    title2En: "With Digital Skills",
    title3Bn: "",
    title3En: "",
    subtitleBn: "অভিজ্ঞ মেন্টরদের সাথে প্র্যাক্টিক্যাল প্রজেক্টভিত্তিক লাইভ ও রেকর্ডেড ক্লাসে দক্ষতা বাড়ান।",
    subtitleEn: "Master cutting-edge industry skills with expert mentors through interactive live & recorded classes.",
    ctaBn: "কোর্সগুলো দেখুন",
    ctaEn: "Explore Courses",
    ctaHref: "#courses"
  },
  {
    id: "hero-slide-2",
    image: "https://res.cloudinary.com/de348sqlb/image/upload/v1784725011/alphazero-assets/hero-bg.jpg",
    eyebrowBn: "অ্যাডমিশন ও স্কিল প্রিপারেশন",
    eyebrowEn: "Admission & Skill Prep",
    title1Bn: "সেরা মেন্টরদের সাথে",
    title1En: "Prepare For Success",
    title2Bn: "স্বপ্নের বিশ্ববিদ্যালয়ে ভর্তি",
    title2En: "With Top Mentors",
    title3Bn: "",
    title3En: "",
    subtitleBn: "বুয়েট, মেডিকেল ও শীর্ষ বিশ্ববিদ্যালয়ের অভিজ্ঞ ইনস্ট্রাক্টরদের গাইডলাইনে পূর্ণাঙ্গ প্রস্তুতি।",
    subtitleEn: "Comprehensive test prep and guidance from top varsity graduates and industry leaders.",
    ctaBn: "এখনই শুরু করুন",
    ctaEn: "Get Started",
    ctaHref: "#courses"
  }
];
