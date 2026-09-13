export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed (0: A, 1: B, 2: C, 3: D)
  explanation: string;
  topic?: string;
}

export interface ExamPackage {
  id: string;
  title: string;
  subject: string;
  paper: string;
  totalQuestions: number;
  durationMinutes: number; // e.g. 15, 20, 30
  totalMarks: number;
  negativeMarking: number; // e.g. 0.25
  passPercentage: number;
  questions: Question[];
}

export const EXAM_PACKAGES: ExamPackage[] = [
  {
    id: "hsc-physics-1st-motion",
    title: "HSC পদার্থবিজ্ঞান ১ম পত্র: গতিবিদ্যা ও বলবিদ্যা স্পেশাল মডেল টেস্ট",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    paper: "১ম পত্র",
    totalQuestions: 10,
    durationMinutes: 15,
    totalMarks: 10,
    negativeMarking: 0.25,
    passPercentage: 40,
    questions: [
      {
        id: 1,
        question: "একটি বস্তুকে আনুভূমিকের সাথে 45° কোণে 20 m/s বেগে নিক্ষেপ করা হলো। বস্তুটির সর্বাধিক আনুভূমিক পাল্লা (Range) কত হবে? [g = 9.8 m/s²]",
        options: ["20.41 m", "40.82 m", "10.20 m", "81.63 m"],
        correctAnswer: 1,
        explanation: "সর্বাধিক পাল্লা R = (v² · sin 2θ) / g। যেহেতু θ = 45°, sin(2×45°) = sin 90° = 1। সুতরাং R = (20)² / 9.8 = 400 / 9.8 ≈ 40.82 m।",
        topic: "প্রাস ও গতিবিদ্যা"
      },
      {
        id: 2,
        question: "একটি ঘড়ির মিনিটের কাঁটার কৌণিক বেগ (Angular Velocity) কত?",
        options: ["π/1800 rad/s", "π/3600 rad/s", "2π/60 rad/s", "π/30 rad/s"],
        correctAnswer: 0,
        explanation: "মিনিটের কাঁটা ১ বার ঘুরতে সময় নেয় ১ ঘণ্টা = ৩৬০০ সেকেন্ড। সুতরাং কৌণিক বেগ ω = 2π / T = 2π / 3600 = π / 1800 rad/s।",
        topic: "বৃত্তীয় গতি"
      },
      {
        id: 3,
        question: "কোনো বস্তুর ভরবেগ 50% বৃদ্ধি পেলে তার গতিশক্তি শতকরা কত বৃদ্ধি পাবে?",
        options: ["50%", "100%", "125%", "225%"],
        correctAnswer: 2,
        explanation: "গতিশক্তি E_k = p² / 2m। যদি p বৃদ্ধি পেয়ে 1.5p হয়, তবে নতুন গতিশক্তি E_k' = (1.5p)² / 2m = 2.25 · (p² / 2m) = 2.25 E_k। বৃদ্ধি = (2.25 - 1) × 100% = 125%।",
        topic: "কাজ, শক্তি ও ক্ষমতা"
      },
      {
        id: 4,
        question: "নিউটনের ৩য় সূত্রানুসারে ক্রিয়া ও প্রতিক্রিয়া বলের মধ্যবর্তী কোণ কত?",
        options: ["0°", "90°", "180°", "360°"],
        correctAnswer: 2,
        explanation: "ক্রিয়া ও প্রতিক্রিয়া বল দুটি বিপরীতমুখী ভেক্টর হিসেবে দুটি ভিন্ন বস্তুর ওপর কাজ করে। এদের মধ্যবর্তী কোণ ১৮০ ডিগ্রি।",
        topic: "নিউটোনীয় বলবিদ্যা"
      },
      {
        id: 5,
        question: "জড়তার ভ্রামক (Moment of Inertia) কোন বিষয়ের ওপর নির্ভর করে না?",
        options: ["বস্তুর মোট ভর", "ঘূর্ণন অক্ষের অবস্থান", "বস্তুর কৌণিক বেগ", "ভরের বণ্টন"],
        correctAnswer: 2,
        explanation: "জড়তার ভ্রামক I = ∑mr²। এটি বস্তুর ভর, ঘূর্ণন অক্ষের সাপেক্ষে ভরের বণ্টনের ওপর নির্ভর করে, কিন্তু কৌণিক বেগ (ω)-এর ওপর নির্ভর করে না।",
        topic: "ঘূর্ণন বলবিদ্যা"
      },
      {
        id: 6,
        question: "একটি রাইফেলের গুলির বেগ দ্বিগুণ করা হলে এটি কাঠের তক্তাকে কতগুণ বেশি গভীরতায় ভেদ করতে পারবে?",
        options: ["২ গুণ", "৪ গুণ", "৮ গুণ", "১৬ গুণ"],
        correctAnswer: 1,
        explanation: "ভেদ করার দূরত্ব s ∝ v² (কাজ-শক্তি উপপাদ্য: F·s = ½mv²)। বেগ দ্বিগুণ হলে দূরত্ব (২)² = ৪ গুণ হবে।",
        topic: "কাজ ও শক্তি"
      },
      {
        id: 7,
        question: "ঘর্ষণ বল একটি—",
        options: ["সংরক্ষণশীল বল", "অসংরক্ষণশীল বল", "কেন্দ্রমুখী বল", "মহাকর্ষ বল"],
        correctAnswer: 1,
        explanation: "ঘর্ষণ বলের বিরুদ্ধে কৃতকাজ পুনরুদ্ধার করা যায় না এবং এটি তাপশক্তিতে রূপান্তরিত হয়। তাই এটি একটি অসংরক্ষণশীল (Non-conservative) বল।",
        topic: "ঘর্ষণ"
      },
      {
        id: 8,
        question: "একটি লিফট 2 m/s² ত্বরণে নিচে নামার সময় ভেতরে থাকা 60 kg ভরের ব্যক্তির আপাত ওজন কত হবে? [g = 9.8 m/s²]",
        options: ["708 N", "588 N", "468 N", "0 N"],
        correctAnswer: 2,
        explanation: "লিফট নিচে নামার ক্ষেত্রে আপাত ওজন W = m(g - a) = 60 × (9.8 - 2) = 60 × 7.8 = 468 N।",
        topic: "নিউটোনীয় বলবিদ্যা"
      },
      {
        id: 9,
        question: "10 kg ভরের একটি বস্তু 5 m উঁচু থেকে নিচে পড়লে ভূমিতে আঘাতের পূর্বমুহূর্তে এর গতিশক্তি কত হবে? [g = 9.8 m/s²]",
        options: ["49 J", "98 J", "490 J", "980 J"],
        correctAnswer: 2,
        explanation: "শক্তির সংরক্ষণশীলতা নীতি অনুযায়ী, ভূমিতে পতনের মুহূর্তে গতিশক্তি = প্রারম্ভিক বিভবশক্তি = mgh = 10 × 9.8 × 5 = 490 J।",
        topic: "কাজ ও শক্তি"
      },
      {
        id: 10,
        question: "যদি দুটি ভেক্টরের স্কেলার গুণফল ও ভেক্টর গুণফলের মান সমান হয়, তবে ভেক্টরদ্বয়ের মধ্যবর্তী কোণ কত?",
        options: ["30°", "45°", "60°", "90°"],
        correctAnswer: 1,
        explanation: "|A × B| = A·B ⇒ AB sin θ = AB cos θ ⇒ tan θ = 1 ⇒ θ = 45°।",
        topic: "ভেক্টর"
      }
    ]
  },
  {
    id: "medical-biology-weekly",
    title: "মেডিকেল জীববিজ্ঞান স্পেশাল উইকলি এক্সাম: কোষ ও মানব শারীরতত্ত্ব",
    subject: "জীববিজ্ঞান ২য় পত্র",
    paper: "২য় পত্র",
    totalQuestions: 10,
    durationMinutes: 10,
    totalMarks: 10,
    negativeMarking: 0.25,
    passPercentage: 50,
    questions: [
      {
        id: 1,
        question: "মানবদেহের প্রাকৃতিক পেসমেকার (Natural Pacemaker) কোনটি?",
        options: ["AV Node", "SA Node", "Bundle of His", "Purkinje Fiber"],
        correctAnswer: 1,
        explanation: "SA Node (সাইনোট্রিয়াল নোড) হৃৎপিণ্ডের ছন্দময় সংকোচন উৎপন্ন করে, এজন্য একে প্রাকৃতিক পেসমেকার বলা হয়।",
        topic: "রক্ত সংবহন"
      },
      {
        id: 2,
        question: "রক্তরসে পানির পরিমাণ শতকরা কত ভাগ?",
        options: ["৫৫-৬০%", "৭০-৭৫%", "৯০-৯২%", "৮০-৮৫%"],
        correctAnswer: 2,
        explanation: "রক্তরসের (Plasma) প্রায় ৯০-৯২% পানি এবং ৮-১০% কঠিন পদার্থ থাকে।",
        topic: "রক্তের উপাদান"
      },
      {
        id: 3,
        question: "কোন রক্তকণিকাকে ফ্যাগোসাইটোসিস প্রক্রিয়ার জন্য সৈনিক বলা হয়?",
        options: ["লিম্ফোসাইট", "নিউট্রোফিল ও মনোসাইট", "বেসোফিল", "ইয়োসিনোফিল"],
        correctAnswer: 1,
        explanation: "নিউট্রোফিল ও মনোসাইট ফ্যাগোসাইটোসিস প্রক্রিয়ায় রোগজীবাণু ভক্ষণ করে ধ্বংস করে।",
        topic: "রোগ প্রতিরোধ"
      },
      {
        id: 4,
        question: "মানবদেহের বৃহত্তম লালাগ্রন্থি কোনটি?",
        options: ["প্যারোটিড গ্রন্থি", "সাবম্যান্ডিবুলার গ্রন্থি", "সাবলিঙ্গুয়াল গ্রন্থি", "অগ্ন্যাশয়"],
        correctAnswer: 0,
        explanation: "কানের নিচে অবস্থিত প্যারোটিড গ্রন্থি হলো মানবদেহের সবচেয়ে বড় লালাগ্রন্থি।",
        topic: "পরিপাক"
      },
      {
        id: 5,
        question: "অ্যান্টিবডি তৈরি করে কোন রক্তকণিকা?",
        options: ["T-লিম্ফোসাইট", "B-লিম্ফোসাইট", "মনোসাইট", "অণুচক্রিকা"],
        correctAnswer: 1,
        explanation: "B-লিম্ফোসাইট প্লাজমা কোষে রূপান্তরিত হয়ে সুনির্দিষ্ট অ্যান্টিবডি তৈরি করে।",
        topic: "ইমিউনোলজি"
      },
      {
        id: 6,
        question: "বৃক্কের গাঠনিক ও কার্যকরী একক কোনটি?",
        options: ["বোম্যান্স ক্যাপসুল", "নেফ্রন", "গ্লোমেরুলাস", "হেনলির লুপ"],
        correctAnswer: 1,
        explanation: "নেফ্রন (Nephron) হলো বৃক্কের প্রধান কার্যকরী ও গঠনগত একক। প্রতিটি বৃক্কে প্রায় ১০-১২ লক্ষ নেফ্রন থাকে।",
        topic: "রেচন"
      },
      {
        id: 7,
        question: "হিমোগ্লোবিনের প্রতিটি অণু কয়টি অক্সিজেন অণুকে পরিবহন করতে পারে?",
        options: ["১টি", "২টি", "৩টি", "৪টি"],
        correctAnswer: 3,
        explanation: "হিমোগ্লোবিনের প্রতিটি অণুর ৪টি হেম গ্রুপ থাকে যা সর্বোচ্চ ৪ অণু অক্সিজেনের সাথে যুক্ত হয়ে অক্সিহিমোগ্লোবিন গঠন করে।",
        topic: "শ্বসন"
      },
      {
        id: 8,
        question: "মাইটোকন্ড্রিয়ার অন্তর্গাত্রের ভাঁজগুলোকে কী বলে?",
        options: ["ম্যাট্রিক্স", "ক্রিস্টি", "সিস্টার্নি", "অক্সিজোম"],
        correctAnswer: 1,
        explanation: "মাইটোকন্ড্রিয়ার ভেতরের পর্দা ভেতরের দিকে আঙুলের মতো খাঁজ তৈরি করে, এদের ক্রিস্টি (Cristae) বলা হয়।",
        topic: "কোষ ও এর গঠন"
      },
      {
        id: 9,
        question: "DNA অণুর অ্যাডিনিনের সাথে থাইমিনের কয়টি হাইড্রোজেন বন্ধন থাকে?",
        options: ["১টি", "২টি", "৩টি", "৪টি"],
        correctAnswer: 1,
        explanation: "A এবং T-এর মাঝে দুটি (A=T) এবং G এবং C-এর মাঝে তিনটি (G≡C) হাইড্রোজেন বন্ড থাকে।",
        topic: "কোষীয় জৈবরসায়ন"
      },
      {
        id: 10,
        question: "সার্বজনীন রক্তদাতা (Universal Donor) বলা হয় কোন রক্ত গ্রুপকে?",
        options: ["A+", "AB+", "O-", "O+"],
        correctAnswer: 2,
        explanation: "O- গ্রুপের রক্তে কোনো A বা B অ্যান্টিজেন এবং Rh অ্যান্টিজেন থাকে না, তাই একে সর্বজনীন দাতা বলা হয়।",
        topic: "রক্তের গ্রুপ"
      }
    ]
  },
  {
    id: "buet-math-calculus",
    title: "বুয়েট স্ট্যান্ডার্ড অ্যাডভান্সড ম্যাথ টেস্ট: ক্যালকুলাস ও বীজগণিত",
    subject: "উচ্চতর গণিত ১ম ও ২য় পত্র",
    paper: "কম্বাইন্ড",
    totalQuestions: 8,
    durationMinutes: 20,
    totalMarks: 8,
    negativeMarking: 0.25,
    passPercentage: 50,
    questions: [
      {
        id: 1,
        question: "lim (x → 0) [(sin x - x) / x³] এর মান কত?",
        options: ["-1/6", "1/6", "0", "-1/3"],
        correctAnswer: 0,
        explanation: "ল'হসপিটালস নিয়ম প্রয়োগ করে বা ম্যাকলরিনের ধারা sin x = x - x³/6 + x⁵/120 - ... বসালে (sin x - x)/x³ = -1/6 + O(x²) ⇒ সীমার মান -1/6।",
        topic: "লিমিট"
      },
      {
        id: 2,
        question: "যদি y = ln(sec x + tan x) হয়, তবে dy/dx এর মান কত?",
        options: ["sec x", "tan x", "sec x · tan x", "cos x"],
        correctAnswer: 0,
        explanation: "dy/dx = [1 / (sec x + tan x)] · (sec x tan x + sec² x) = [sec x(tan x + sec x)] / (sec x + tan x) = sec x।",
        topic: "অন্তরীকরণ"
      },
      {
        id: 3,
        question: "∫ (dx / √(1 - x²)) এর ইন্টিগ্রেশন মান কোনটি?",
        options: ["sin⁻¹ x + C", "cos⁻¹ x + C", "tan⁻¹ x + C", "ln|x| + C"],
        correctAnswer: 0,
        explanation: "এটি স্ট্যান্ডার্ড ইন্টিগ্রাল সূত্র: d/dx(sin⁻¹ x) = 1/√(1-x²), সুতরাং বিপরীত প্রক্রিয়া হলো sin⁻¹ x + C।",
        topic: "যোগজীকরণ"
      },
      {
        id: 4,
        question: "x² + y² = 16 বৃত্তের ভেতর আবদ্ধ ক্ষেত্রের ক্ষেত্রফল কত?",
        options: ["8π", "16π", "32π", "64π"],
        correctAnswer: 1,
        explanation: "বৃত্তের সমীকরণ x² + y² = r² যেখানে r² = 16। বৃত্তের ক্ষেত্রফল = πr² = 16π বর্গএকক।",
        topic: "যোগজীকরণের প্রয়োগ"
      },
      {
        id: 5,
        question: "যদি z = 1 + i√3 একটি জটিল সংখ্যা হয়, তবে এর মডুলাস ও আর্গুমেন্ট কত?",
        options: ["2, π/3", "4, π/3", "2, π/6", "1, π/4"],
        correctAnswer: 0,
        explanation: "মডুলাস r = √(1² + (√3)²) = √(1+3) = 2। আর্গুমেন্ট θ = tan⁻¹(√3/1) = 60° = π/3।",
        topic: "জটিল সংখ্যা"
      },
      {
        id: 6,
        question: "y = x³ - 3x এর চরম মান (Extreme values) কোন কোন বিন্দুতে বিদ্যমান?",
        options: ["x = 0, 1", "x = 1, -1", "x = 2, -2", "x = 3, -3"],
        correctAnswer: 1,
        explanation: "dy/dx = 3x² - 3 = 0 ⇒ 3(x² - 1) = 0 ⇒ x = ±1।",
        topic: "সর্বোচ্চ ও সর্বনিম্ন মান"
      },
      {
        id: 7,
        question: "∫_0^(π/2) sin² x dx এর নির্দিষ্ট যোগজের মান কত?",
        options: ["π/2", "π/4", "1", "1/2"],
        correctAnswer: 1,
        explanation: "∫_0^(π/2) sin² x dx = ½ ∫_0^(π/2) (1 - cos 2x) dx = ½ [x - (sin 2x)/2]_0^(π/2) = ½ (π/2 - 0) = π/4।",
        topic: "নির্দিষ্ট যোগজ"
      },
      {
        id: 8,
        question: "3x² - 5x + 2 = 0 সমীকরণের মূলদ্বয়ের গুণফল কত?",
        options: ["5/3", "2/3", "-2/3", "-5/3"],
        correctAnswer: 1,
        explanation: "ax² + bx + c = 0 সমীকরণে মূলদ্বয়ের গুণফল = c/a। এখানে c = 2, a = 3, তাই গুণফল = 2/3।",
        topic: "বহুপদী"
      }
    ]
  }
];
