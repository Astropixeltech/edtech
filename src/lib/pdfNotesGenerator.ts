import { jsPDF } from 'jspdf';

export interface FormulaNote {
  title: string;
  chapter: string;
  subject: string;
  instructor: string;
  size: string;
  keyPoints: string[];
  formulas: { name: string; formula: string; note?: string }[];
}

export const ACADEMIC_NOTES: FormulaNote[] = [
  {
    title: "পদার্থবিজ্ঞান ১ম পত্র: গতিবিদ্যা ও প্রাসের গতি পূর্ণাঙ্গ ফর্মুলা শিট",
    chapter: "অধ্যায় ৩ • গতিবিদ্যা",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    instructor: "Engr. Tanvir Ahmed (BUET)",
    size: "PDF • Formula Booklet",
    keyPoints: [
      "প্রাসের গতি দ্বিমাত্রিক গতি, আনুভূমিক বেগ ধ্রুবক থাকে।",
      "সর্বোচ্চ উচ্চতায় উল্লম্ব বেগ শূন্য হয়।",
      "সর্বাধিক পাল্লার জন্য নিক্ষেপণ কোণ ৪৫ ডিগ্রি হতে হয়।"
    ],
    formulas: [
      { name: "সর্বোচ্চ উচ্চতা (H)", formula: "H = (v₀² · sin²θ) / (2g)", note: "θ আনুভূমিকের সাথে কোণ" },
      { name: "উড্ডয়ন কাল (T)", formula: "T = (2v₀ · sinθ) / g", note: "মোট বায়ুতে থাকার সময়" },
      { name: "আনুভূমিক পাল্লা (R)", formula: "R = (v₀² · sin2θ) / g", note: "৪৫ ডিগ্রিতে সর্বোচ্চ" },
      { name: "কৌণিক বেগ (ω)", formula: "ω = 2π / T = 2πf", note: "ঘূর্ণন গতির সমীকরণ" },
      { name: "কেন্দ্রমুখী ত্বরণ (a_c)", formula: "a_c = v² / r = ω²r", note: "কেন্দ্রের দিকে ক্রিয়াশীল" }
    ]
  },
  {
    title: "রসায়ন ১ম পত্র: রাসায়নিক পরিবর্তন ও গাণিতিক সমস্যা সমাধান",
    chapter: "অধ্যায় ৪ • রাসায়নিক পরিবর্তন",
    subject: "রসায়ন ১ম পত্র",
    instructor: "Dr. Sumaiya Farhana (DU)",
    size: "PDF • Formula Booklet",
    keyPoints: [
      "লা-শাতেলিয়ার নীতি সাম্যাবস্থায় তাপ, চাপ ও ঘনমাত্রার প্রভাব ব্যাখ্যা করে।",
      "Kp ও Kc কেবল তাপমাত্রার ওপর নির্ভর করে।",
      "বাফার দ্রবণের pH হেন্ডারসন-হ্যাসেলবালখ সমীকরণ দিয়ে বের করা হয়।"
    ],
    formulas: [
      { name: "Kp ও Kc এর সম্পর্ক", formula: "Kp = Kc(RT)^(Δn)", note: "Δn = গ্যাসীয় উৎপাদ - গ্যাসীয় বিক্রিয়ক মোল" },
      { name: "অসওয়াল্ডের লঘুকরণ সূত্র", formula: "Ka = α²C / (1 - α) ≈ α²C", note: "মৃদু এসিডের ক্ষেত্রে" },
      { name: "pH হিসাব", formula: "pH = -log[H⁺], pOH = -log[OH⁻]", note: "pH + pOH = 14" },
      { name: "হেন্ডারসন সমীকরণ", formula: "pH = pKa + log([লবণ] / [এসিড])", note: "অম্লীয় বাফার" }
    ]
  },
  {
    title: "উচ্চতর গণিত ১ম পত্র: ত্রিকোণমিতি ও ক্যালকুলাস শর্টকাট হ্যাকস",
    chapter: "অধ্যায় ৭ ও ৯ • ক্যালকুলাস",
    subject: "উচ্চতর গণিত",
    instructor: "Fahim Shahriar (DU Math)",
    size: "PDF • Formula Booklet",
    keyPoints: [
      "ল'হসপিটালস নিয়ম 0/0 বা ∞/∞ অনির্ণেয় আকারে প্রযোজ্য।",
      "চরম মানের জন্য প্রথম অন্তরজ শূন্য হবে।",
      "নির্দিষ্ট যোগজ বক্ররেখার আবদ্ধ ক্ষেত্রফল নির্দেশ করে।"
    ],
    formulas: [
      { name: "যোগজীকরণ মূল সূত্র", formula: "∫ x^n dx = (x^(n+1))/(n+1) + C", note: "n ≠ -1" },
      { name: "ত্রিকোণমিতিক যোগজ", formula: "∫ sec²x dx = tan x + C, ∫ csc²x dx = -cot x + C", note: "মৌলিক অন্তরজের বিপরীত" },
      { name: "অন্তরীকরণ", formula: "d/dx(ln sec x) = tan x", note: "চেইন রুল" },
      { name: "বৃত্তের ক্ষেত্রফল", formula: "A = πr²", note: "∫ y dx প্রয়োগ করে প্রমাণিত" }
    ]
  },
  {
    title: "মেডিকেল স্পেশাল জীববিজ্ঞান সামারি: রক্ত সংবহন ও হৃদপিণ্ড",
    chapter: "প্রাণিবিজ্ঞান অধ্যায় ৪",
    subject: "জীববিজ্ঞান ২য় পত্র",
    instructor: "Dr. Sajid Hasan (DMC)",
    size: "PDF • Formula Booklet",
    keyPoints: [
      "হৃৎপিণ্ড পেরিকার্ডিয়াম পর্দা দিয়ে আবৃত।",
      "ডান অলিন্দে ট্রাইকাস্পিড ও বাম অলিন্দে বাইকাস্পিড কপাটিকা থাকে।",
      "রক্তচাপ পরিমাপক যন্ত্রের নাম স্ফিগমোম্যানোমিটার।"
    ],
    formulas: [
      { name: "কার্ডিয়াক আউটপুট (CO)", formula: "CO = Stroke Volume × Heart Rate", note: "সাধারণত ~৫ লিটার/মিনিট" },
      { name: "রক্তচাপ আদর্শ মান", formula: "120 / 80 mmHg", note: "সিস্টোলিক / ডায়াস্টোলিক" }
    ]
  }
];

export const generateAndDownloadNotePdf = (note: FormulaNote, studentName: string = "Student") => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Background Theme
  doc.setFillColor(10, 56, 36); // #0A3824 Deep Forest Green
  doc.rect(0, 0, 210, 32, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text("ASTROPIXEL LEARN", 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Academic Excellence Platform | HSC & Admission Engineering Preparation", 14, 22);
  doc.text(`Verified Student Copy: ${studentName}`, 14, 27);

  // Note Title Area
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(note.subject, 14, 42);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${note.chapter} | Instructor: ${note.instructor}`, 14, 48);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 52, 196, 52);

  // Key Revision Points
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(10, 56, 36);
  doc.text("Key Revision Points / Important Concepts:", 14, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  let yPos = 67;
  note.keyPoints.forEach((point, i) => {
    doc.text(`• ${point}`, 16, yPos);
    yPos += 7;
  });

  // Formula Table
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(10, 56, 36);
  doc.text("Essential Formulas & Shortcuts:", 14, yPos);
  yPos += 8;

  note.formulas.forEach((item, idx) => {
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, yPos, 182, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${item.name}:`, 18, yPos + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(10, 56, 36);
    doc.text(item.formula, 18, yPos + 12);

    if (item.note) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${item.note}]`, 120, yPos + 12);
    }

    yPos += 19;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Downloaded on: ${new Date().toLocaleString()} • Astropixel Learn LMS`, 14, 285);
  doc.text("Confidential Academic Resource — For Enrolled Students Only", 110, 285);

  // Save File
  const filename = `${note.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Formula_Booklet.pdf`;
  doc.save(filename);
};
