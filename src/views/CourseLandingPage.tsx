import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2, Clock, Users, GraduationCap, Star,
  Sparkles, BookOpen, ArrowRight, AlertCircle, Target,
  ChevronRight, Calendar, Globe, Award, ShieldCheck, PlayCircle,
  Smartphone, HelpCircle, FileText, Check, Lock, Play, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import CourseEnrollmentModal from '@/components/student/CourseEnrollmentModal';
import { CourseRoadmap } from '@/components/course/CourseRoadmap';
import { StickyEnrollCard } from '@/components/course/StickyEnrollCard';
import { CourseStickyBar } from '@/components/course/CourseStickyBar';
import { supabase } from '@/integrations/supabase/client';
import { INITIAL_REAL_YOUTUBE_COURSES } from '@/lib/seedCourses';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY as SUPABASE_ANON } from '@/lib/env';
import { getLocalEnrolledCourses } from '@/lib/localStorageData';

// Extract YouTube video ID from various YouTube URL formats
function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

type LessonItem = {
  id: string;
  title: string;
  duration?: string;
  is_free_preview?: boolean;
  video_url?: string;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration?: string;
  lessons?: LessonItem[];
};

type FAQ = {
  question: string;
  answer: string;
};

type Instructor = {
  name: string;
  designation?: string | null;
  institution?: string | null;
  image?: string | null;
  bio?: string | null;
  initials?: string;
};

type CourseData = {
  course: {
    id: string;
    title: string;
    title_bn?: string;
    title_en?: string;
    description?: string;
    description_en?: string;
    short_description?: string;
    short_description_en?: string;
    thumbnail_url?: string;
    price: number;
    course_type?: string;
    category?: string;
    landing_slug?: string;
    slug?: string;
    trainer_name?: string;
    trainer_image?: string;
    trainer_designation?: string;
    trainer_bio?: string;
    trainer_bio_en?: string;
    start_date?: string;
    class_time?: string;
    total_classes?: string;
    duration?: string;
    learning_outcomes?: string[];
    why_learn?: string[];
    requirements?: string[];
    who_for?: string[];
    intro_video_url?: string | null;
    faqs?: FAQ[];
    instructors?: Instructor[];
  };
  modules: Module[];
  lesson_count: number;
};

export default function CourseLandingPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ slug: string }>();
  const slugParam = params.slug || 'vibe-coding';
  const isBn = language === 'bn';

  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Robust universal course data resolver
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Try public-course-info edge function by slug
        let foundData: CourseData | null = null;
        try {
          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/public-course-info?slug=${encodeURIComponent(slugParam)}`,
            { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
          );
          if (res.ok) {
            const j = await res.json();
            if (j.success && j.course) {
              foundData = j;
            }
          }
        } catch (err) {
          // Fallback to database
        }

        // 2. If not found via edge function, query Supabase database by ID or landing_slug
        if (!foundData) {
          const { data: dbCourse } = await supabase
            .from('courses')
            .select('*')
            .or(`id.eq.${slugParam},landing_slug.eq.${slugParam}`)
            .maybeSingle();

          if (dbCourse) {
            foundData = {
              course: {
                id: dbCourse.id,
                title: dbCourse.title,
                title_en: dbCourse.title_en || undefined,
                description: dbCourse.description || undefined,
                description_en: dbCourse.description_en || undefined,
                short_description: dbCourse.description ? dbCourse.description.slice(0, 150) + "..." : undefined,
                thumbnail_url: dbCourse.thumbnail_url || undefined,
                price: dbCourse.price || 0,
                category: dbCourse.category || "Professional Development",
                trainer_name: dbCourse.trainer_name || "Astropixel Expert Mentors",
                trainer_designation: dbCourse.trainer_designation || "Lead Instructor",
                trainer_image: dbCourse.trainer_image || undefined,
                trainer_bio: "অভিজ্ঞ ইন্ডাস্ট্রি প্রফেশনাল ও প্রশিক্ষক। বাস্তব কাজের প্রজেক্টভিত্তিক নির্দেশনায় শিক্ষার্থীদের দক্ষ করে তোলার দীর্ঘ অভিজ্ঞতা।",
                learning_outcomes: [
                  "বাস্তব প্রজেক্ট তৈরির মাধ্যমে প্রতিটি ধারণার হাতে-কলমে প্রয়োগ",
                  "ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কাজের নিয়মাবলী ও কোডিং/ডিজাইন বেস্ট প্র্যাকটিস",
                  "ক্যারিয়ার ও ফ্রিল্যান্সিংয়ে দ্রুত এগিয়ে যাওয়ার প্রয়োজনীয় দিকনির্দেশনা",
                  "পোর্টফোলিও তৈরি এবং ক্লায়েন্ট ওয়ার্কফ্লো সম্পর্কে পরিপূর্ণ ধারণা",
                ],
                why_learn: [
                  "বর্তমান বাজারে সবচেয়ে ইন-ডিমান্ড ও লাভজনক ডিজিটাল স্কিল",
                  "হাতে-কলমে কাজ শিখে সরাসরি আর্নিং বা জবে প্রবেশের সুযোগ",
                  "লাইফটাইম রিসোর্স অ্যাক্সেস ও ডেডিকেটেড সাপোর্ট কমিউনিটি",
                ],
                requirements: [
                  "একটি কম্পিউটার / ল্যাপটপ অথবা স্মার্টফোন",
                  "বেসিক ইন্টারনেট সংযোগ",
                  "নতুন কিছু শেখার অদম্য আগ্রহ ও নিয়মিত অনুশীলন করার মানসিকতা",
                ],
                who_for: [
                  "যাঁরা একদম শুরু থেকে প্রফেশনাল লেভেলে স্কিল ডেভেলপ করতে চান",
                  "কলেজ ও বিশ্ববিদ্যালয়ের শিক্ষার্থী এবং ফ্রেশ গ্র্যাজুয়েট",
                  "যাঁরা ফ্রিল্যান্সিং ও রিমোট জবের জন্য নিজেকে প্রস্তুত করতে চান",
                ],
                total_classes: "২০+ ক্লাস",
                duration: "১০+ ঘন্টা",
                faqs: [
                  {
                    question: "কোর্সটি কিনলে কতদিন দেখতে পারব?",
                    answer: "এই কোর্সে লাইফটাইম অ্যাক্সেস পাবেন। যেকোনো সময় যেকোনো ডিভাইস থেকে নিজের সুবিধামতো ক্লাস দেখতে পারবেন।"
                  },
                  {
                    question: "কোর্স চলাকালীন কোনো সমস্যা হলে সাহায্য কোথায় পাব?",
                    answer: "আমাদের ডেডিকেটেড সাপোর্ট কমিউনিটি এবং ইন্সট্রাক্টর প্যানেলে সরাসরি প্রশ্ন করে যেকোনো ডাউট সমাধান করে নিতে পারবেন।"
                  },
                  {
                    question: "কোর্স শেষ করার পর সার্টিফিকেট কীভাবে পাব?",
                    answer: "সকল ভিডিও লেকচার ও এক্সাম সম্পন্ন করার পর অটোমেটিক আপনার প্রোফাইলে ভেরিফাইড সার্টিফিকেট জেনারেট হবে, যা লিংকডইন বা সিভিতে যুক্ত করতে পারবেন।"
                  },
                  {
                    question: "মোবাইল দিয়ে কি সম্পূর্ণ কোর্সটি করা যাবে?",
                    answer: "হ্যাঁ, সম্পূর্ণ প্ল্যাটফর্ম মোবাইল ফ্রেন্ডলি। আপনি যেকোনো স্মার্টফোন থেকে ভিডিও দেখা, নোট পড়া ও এক্সাম দেওয়া সম্পূর্ণ করতে পারবেন।"
                  }
                ]
              },
              modules: [
                {
                  id: "m1",
                  title: "মডিউল ০১: কোর্সের প্রাথমিক পরিচিতি ও প্রয়োজনীয় টুলস",
                  description: "টুলস সেটআপ ও মৌলিক ধারণাসমূহ হাতে-কলমে শেখা।",
                  order_index: 1,
                  duration: "২ ঘন্টা ৩০ মিনিট",
                  lessons: [
                    { id: "l1", title: "লেকচার ১.১: কোর্স ওভারভিউ ও ক্যারিয়ার স্কোপ", duration: "১৫ মিনিট", is_free_preview: true },
                    { id: "l2", title: "লেকচার ১.২: এসেনশিয়াল সফটওয়্যার ও এনভায়রনমেন্ট সেটআপ", duration: "২৫ মিনিট", is_free_preview: true },
                    { id: "l3", title: "লেকচার ১.৩: বেসিক ফাউন্ডেশন ও ফান্ডামেন্টাল কনসেপ্ট", duration: "৩৫ মিনিট", is_free_preview: false },
                    { id: "l4", title: "লেকচার ১.৪: কুইজ ও সেলফ এসেসমেন্ট টেস্ট", duration: "১৫ মিনিট", is_free_preview: false }
                  ]
                },
                {
                  id: "m2",
                  title: "মডিউল ০২: মূল কনসেপ্ট ও রিয়েল-লাইফ প্রজেক্ট শুরু",
                  description: "প্র্যাক্টিক্যাল প্রজেক্ট তৈরি ও ধাপে ধাপে জটিল সমস্যা সমাধান।",
                  order_index: 2,
                  duration: "৩ ঘন্টা ৪৫ মিনিট",
                  lessons: [
                    { id: "l5", title: "লেকচার ২.১: কোর আর্কিটেকচার ও ওয়ার্কফ্লো", duration: "৪০ মিনিট", is_free_preview: false },
                    { id: "l6", title: "লেকচার ২.২: রিয়েল-টাইম হ্যান্ডস-অন প্রজেক্ট ডেভেলপমেন্ট", duration: "৫৫ মিনিট", is_free_preview: false },
                    { id: "l7", title: "লেকচার ২.৩: এরর হ্যান্ডলিং ও ডিবাগিং টেকনিকস", duration: "৩০ মিনিট", is_free_preview: false }
                  ]
                },
                {
                  id: "m3",
                  title: "মডিউল ০৩: অ্যাডভান্সড মেথডোলজি ও অপটিমাইজেশন",
                  description: "প্রোডাকশন-গ্রেড টেকনিক এবং প্রো টিপস।",
                  order_index: 3,
                  duration: "৩ ঘন্টা ২০ মিনিট",
                  lessons: [
                    { id: "l8", title: "লেকচার ৩.১: হাই-পারফরম্যান্স অপটিমাইজেশন", duration: "৪৫ মিনিট", is_free_preview: false },
                    { id: "l9", title: "লেকচার ৩.২: ইন্ডাস্ট্রি বেস্ট প্র্যাকটিস ও সিকিউরিটি", duration: "৪০ মিনিট", is_free_preview: false },
                    { id: "l10", title: "লেকচার ৩.৩: লাইভ কেস স্টাডি অ্যানালাইসিস", duration: "৩৫ মিনিট", is_free_preview: false }
                  ]
                },
                {
                  id: "m4",
                  title: "মডিউল ০৪: ফাইনাল প্রজেক্ট, পোর্টফোলিও ও সার্টিফিকেট",
                  description: "সম্পূর্ণ প্রজেক্ট রিভিশন, রিভিউ ও সার্টিফিকেট অর্জন।",
                  order_index: 4,
                  duration: "২ ঘন্টা ১৫ মিনিট",
                  lessons: [
                    { id: "l11", title: "লেকচার ৪.১: প্রজেক্ট ফাইনাল পলিশিং ও ডেপ্লয়মেন্ট", duration: "৩৫ মিনিট", is_free_preview: false },
                    { id: "l12", title: "লেকচার ৪.২: আন্তর্জাতিক ক্লায়েন্ট ও মার্কেটপ্লেস গাইডলাইন", duration: "৪০ মিনিট", is_free_preview: false },
                    { id: "l13", title: "লেকচার ৪.৩: ফাইনাল এক্সাম ও সার্টিফিকেট জেনারেশন", duration: "২০ মিনিট", is_free_preview: false }
                  ]
                },
              ],
              lesson_count: 24,
            };
          }
        }

        // 3. Fallback to INITIAL_REAL_YOUTUBE_COURSES
        if (!foundData) {
          const seeded = INITIAL_REAL_YOUTUBE_COURSES.find(
            (c) => c.id === slugParam || 
                   (c as any).landing_slug === slugParam ||
                   c.title.toLowerCase().includes(slugParam.toLowerCase())
          );
          if (seeded) {
            const seededVideos = seeded.videos || [];
            const moduleCount = 4;
            const chunkSize = Math.max(1, Math.ceil(seededVideos.length / moduleCount));

            const seedModules: Module[] = [
              {
                id: "sm1",
                title: "মডিউল ০১: প্রাথমিক পরিচিতি ও ফান্ডামেন্টাল কনসেপ্ট",
                description: "কোর্সের ভূমিকা, প্রয়োজনীয় টুলস সেটআপ ও মৌলিক ধারণাসমূহ।",
                order_index: 1,
                duration: "২ ঘন্টা ৩০ মিনিট",
                lessons: seededVideos.slice(0, chunkSize).map((v, i) => ({
                  id: v.id,
                  title: v.title,
                  duration: `${Math.round((v.duration_seconds || 600) / 60)} মিনিট`,
                  is_free_preview: i === 0,
                  video_url: v.video_url,
                }))
              },
              {
                id: "sm2",
                title: "মডিউল ০২: মূল টেকনিক ও প্র্যাক্টিক্যাল প্রজেক্ট ডেভেলপমেন্ট",
                description: "হাতে-কলমে প্র্যাক্টিক্যাল প্রজেক্ট তৈরি ও সমস্যার বাস্তব সমাধান।",
                order_index: 2,
                duration: "৩ ঘন্টা ১৫ মিনিট",
                lessons: seededVideos.slice(chunkSize, chunkSize * 2).map((v) => ({
                  id: v.id,
                  title: v.title,
                  duration: `${Math.round((v.duration_seconds || 720) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url,
                }))
              },
              {
                id: "sm3",
                title: "মডিউল ০৩: অ্যাডভান্সড মেথডোলজি ও ইন্ডাস্ট্রি ওয়ার্কফ্লো",
                description: "প্রোডাকশন-গ্রেড টেকনিক, অপটিমাইজেশন ও প্রো লেভেল টিপস।",
                order_index: 3,
                duration: "২ ঘন্টা ৪৫ মিনিট",
                lessons: seededVideos.slice(chunkSize * 2, chunkSize * 3).map((v) => ({
                  id: v.id,
                  title: v.title,
                  duration: `${Math.round((v.duration_seconds || 800) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url,
                }))
              },
              {
                id: "sm4",
                title: "মডিউল ০৪: ফাইনাল প্রজেক্ট, পোর্টফোলিও ও ক্যারিয়ার গাইডলাইন",
                description: "সম্পূর্ণ প্রজেক্ট রিভিশন, পোর্টফোলিও রিভিউ ও সার্টিফিকেট অর্জন।",
                order_index: 4,
                duration: "২ ঘন্টা",
                lessons: seededVideos.slice(chunkSize * 3).map((v) => ({
                  id: v.id,
                  title: v.title,
                  duration: `${Math.round((v.duration_seconds || 650) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url,
                }))
              }
            ];

            foundData = {
              course: {
                id: seeded.id,
                title: seeded.title,
                title_en: seeded.title_en || undefined,
                description: seeded.description || undefined,
                description_en: seeded.description_en || undefined,
                short_description: seeded.description?.slice(0, 140) + "...",
                thumbnail_url: seeded.thumbnail_url || undefined,
                price: seeded.price || 0,
                category: (seeded as any).category || "Digital Skills & Programming",
                trainer_name: seeded.trainer_name || "Astropixel Lead Mentor",
                trainer_designation: (seeded as any).trainer_designation || "Senior Industry Mentor & Educator",
                trainer_bio: (seeded as any).trainer_bio || "অভিজ্ঞ ইন্ডাস্ট্রি প্রফেশনাল ও প্রশিক্ষক। বাস্তব কাজের প্রজেক্টভিত্তিক নির্দেশনায় শিক্ষার্থীদের দক্ষ করে তোলার দীর্ঘ অভিজ্ঞতা।",
                total_classes: (seeded as any).total_classes || `${seeded.videos?.length || 24}+ ক্লাস`,
                duration: (seeded as any).duration || "১২+ ঘন্টা",
                intro_video_url: seeded.videos?.[0]?.video_url || null,
                learning_outcomes: (seeded as any).learning_outcomes || [
                  "সম্পূর্ণ হাতে-কলমে প্র্যাক্টিক্যাল প্রজেক্ট ভিত্তিক শিক্ষা",
                  "ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কাজের নিয়মাবলী ও কোডিং/ডিজাইন বেস্ট প্র্যাকটিস",
                  "পোর্টফোলিও তৈরি এবং ক্লায়েন্ট ওয়ার্কফ্লো সম্পর্কে পরিপূর্ণ ধারণা",
                  "মার্কেটপ্লেস ও ক্যারিয়ার তৈরির নিশ্চিত গাইডলাইন",
                ],
                why_learn: [
                  "বর্তমান বাজারে সবচেয়ে ইন-ডিমান্ড ও লাভজনক ডিজিটাল স্কিল",
                  "হাতে-কলমে কাজ শিখে সরাসরি আর্নিং বা জবে প্রবেশের সুযোগ",
                  "লাইফটাইম রিসোর্স অ্যাক্সেস ও ডেডিকেটেড সাপোর্ট কমিউনিটি",
                ],
                requirements: [
                  "কম্পিউটার বা স্মার্টফোন",
                  "ইন্টারনেট সংযোগ",
                  "নতুন কিছু শেখার আগ্রহ ও নিয়মিত প্র্যাকটিস",
                ],
                who_for: [
                  "শিক্ষার্থী ও নতুন স্কিল শিখতে আগ্রহীরা",
                  "যাঁরা ফ্রিল্যান্সিং করতে চান",
                  "জব সিকার ও প্রফেশনালরা",
                ],
                faqs: [
                  {
                    question: "কোর্সটি কিনলে কতদিন দেখতে পারব?",
                    answer: "এই কোর্সে লাইফটাইম অ্যাক্সেস পাবেন। যেকোনো সময় যেকোনো ডিভাইস থেকে নিজের সুবিধামতো ক্লাস দেখতে পারবেন।"
                  },
                  {
                    question: "কোর্স চলাকালীন কোনো সমস্যা হলে সাহায্য কোথায় পাব?",
                    answer: "আমাদের ডেডিকেটেড সাপোর্ট কমিউনিটি এবং ইন্সট্রাক্টর প্যানেলে সরাসরি প্রশ্ন করে যেকোনো ডাউট সমাধান করে নিতে পারবেন।"
                  },
                  {
                    question: "কোর্স শেষ করার পর সার্টিফিকেট কীভাবে পাব?",
                    answer: "সকল ভিডিও লেকচার ও এক্সাম সম্পন্ন করার পর অটোমেটিক আপনার প্রোফাইলে ভেরিফাইড সার্টিফিকেট জেনারেট হবে।"
                  },
                  {
                    question: "মোবাইল দিয়ে কি সম্পূর্ণ কোর্সটি করা যাবে?",
                    answer: "হ্যাঁ, সম্পূর্ণ প্ল্যাটফর্ম মোবাইল ফ্রেন্ডলি। আপনি যেকোনো স্মার্টফোন থেকে ক্লাস ও এক্সাম দিতে পারবেন।"
                  }
                ]
              },
              modules: seedModules,
              lesson_count: seeded.videos?.length || 24,
            };
          }
        }

        if (!alive) return;
        if (!foundData) throw new Error("কোর্সটি খুঁজে পাওয়া যায়নি।");
        setData(foundData);
      } catch (err: any) {
        if (alive) setError(err.message || "Failed to load course");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [slugParam]);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null);

  const effectiveUserId = user?.id || 'demo-student-001';

  const c = data?.course;

  // Enrolled status check
  const isEnrolled = useMemo(() => {
    if (!c?.id) return false;
    const localEnrolled = getLocalEnrolledCourses(effectiveUserId);
    return localEnrolled.includes(c.id);
  }, [c?.id, effectiveUserId]);

  if (loading) {
    return (
      <Layout flushTop={false}>
        <div className="bg-white dark:bg-background">
          <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col-reverse gap-8 lg:flex-row items-start">
              <div className="flex-1 lg:flex-[2] space-y-6">
                <Skeleton className="h-10 w-3/4 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-28 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="w-full lg:w-[380px] shrink-0 space-y-4">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !c) {
    return (
      <Layout flushTop={false}>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center p-8 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">
              {isBn ? 'কোর্সটি খুঁজে পাওয়া যায়নি' : 'Course Not Found'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {error || (isBn ? 'অনুগ্রহ করে অন্য কোনো কোর্স বেছে নিন।' : 'Please browse our other available courses.')}
            </p>
            <Button onClick={() => navigate('/courses')} className="rounded-full bg-brand-500 hover:bg-brand-600 text-white">
              {isBn ? 'সব কোর্স দেখুন' : 'Browse Courses'}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const title = (isBn && (c as any).title_bn) ? (c as any).title_bn : (c.title_en || c.title || '');
  const desc = isBn ? c?.description : (c?.description_en || c?.description);
  const shortDesc = isBn ? c?.short_description : (c?.short_description_en || c?.short_description);
  const outcomes = c?.learning_outcomes ?? [];
  const whyLearn = c?.why_learn ?? [];
  const requirements = c?.requirements ?? [
    isBn ? "স্মার্টফোন বা কম্পিউটার" : "Smartphone or Computer",
    isBn ? "ইন্টারনেট সংযোগ" : "Internet Connection",
    isBn ? "শেখার আন্তরিক আগ্রহ" : "Willingness to learn"
  ];
  const whoFor = c?.who_for ?? [
    isBn ? "নতুন স্কিল শিখতে আগ্রহী যে কেউ" : "Anyone interested in learning new skills",
    isBn ? "কলেজ ও ভার্সিটির শিক্ষার্থী" : "College and university students",
    isBn ? "ফ্রিল্যান্সার ও জব প্রত্যাশীরা" : "Job seekers and freelancers"
  ];
  const faqs = c?.faqs ?? [];
  const videoId = getYouTubeId(previewLesson?.video_url || c.intro_video_url) || (c as any).youtube_video_id || 'dQw4w9WgXcQ';

  const handleEnroll = () => {
    if (isEnrolled) {
      navigate(`/student/course/${c.id}`);
    } else {
      setIsEnrollModalOpen(true);
    }
  };

  const instructors: Instructor[] = c.instructors || [
    { name: c.trainer_name || "Asikul Islam Khan", designation: c.trainer_designation || "Course Lead & Specialist", institution: "DU / Astropixel Lead", image: c.trainer_image, initials: "AS" },
    { name: "Mahbubur Rahman", designation: "Senior Curriculum Specialist", institution: "BUET / Lead Instructor", initials: "MA" },
    { name: "Tanjim Waseet", designation: "Senior Problem Solver & Mentor", institution: "SSMC / Senior Mentor", initials: "TA" },
    { name: "Shafiqur Rahman", designation: "Technical Project Mentor", institution: "BUET / Course Mentor", initials: "SH" },
    { name: "Salim Sadman", designation: "Practical Workflow Mentor", institution: "BUTEX / Tech Mentor", initials: "SA" },
    { name: "Miftu Miftu", designation: "Assessment & Doubt Solver", institution: "BUET / Core Mentor", initials: "MI" },
  ];

  const outlineItems = [
    { title: isBn ? "কোর্স সম্পন্ন করার পূর্ণাঙ্গ রুটিন ও গাইডলাইন" : "Routine To Complete Course", count: 1 },
    { title: isBn ? "লাইভ ডাউট সলভার ও ডেডিকেটেড সাপোর্ট কমিউনিটি" : "Doubt Solver & Support Group", count: 1 },
    { title: isBn ? "উইকলি লাইভ প্র্যাকটিস সেশন ও ডিসকাশন" : "Weekly Live Practice Sessions", count: 4 },
    { title: isBn ? "ইন্ডাস্ট্রি মেন্টরদের সাথে সরাসরি ক্যারিয়ার কনসাল্টেশন" : "Career Consultation with Mentors", count: 2 },
  ];

  const examItems = [
    { title: isBn ? "টপিক ভিত্তিক উইকলি ও মান্থলি লাইভ এক্সাম" : "Topic Based Weekly & Monthly Live Exams", count: 8 },
    { title: isBn ? "মডেল টেস্ট ও সেলফ এসেসমেন্ট কুইজ" : "Model Tests & Self Assessment Quizzes", count: 12 },
    { title: isBn ? "নেগেটিভ মার্কিং ও অল-বাংলাদেশ লাইভ লিডারবোর্ড" : "All-Bangladesh Live Leaderboard Ranking", count: 5 },
  ];

  const materialItems = [
    { title: isBn ? "অ্যাডমিশন ও ক্যারিয়ার অ্যানালাইসিস রোডম্যাপ ই-বুক" : "Admission & Career Analysis Roadmap (Books)", count: 5 },
    { title: isBn ? "দাগানো একাডেমিক ও প্র্যাক্টিক্যাল হ্যান্ডনোটস" : "Academic & Practical Highlighted Notes", count: 1 },
    { title: isBn ? "ক্লাস লেকচার স্লাইডস ও রিসোর্স ফাইলস" : "Class Lecture Slides & Resource Materials", count: 1 },
    { title: isBn ? "ফর্মুলা ও শর্টকাট টেকনিকস শিট" : "Formula & Shortcut Cheat Sheet", count: 1 },
  ];

  const xFactorItems = [
    { title: isBn ? "হ্যান্ড ক্যালকুলেশন সিরিজ ও অপশন টেস্ট স্ট্র্যাটেজি" : "Hand Calculation Series + Option Test", count: 4 },
    { title: isBn ? "রিটেন স্পেশাল ট্রিকস ও কোশ্চেন ব্যাংক সলভিং" : "Written Special Classes & Question Bank Solving", count: 6 },
    { title: isBn ? "কমন আসবেই ১০ ডেইজ ফাইনাল বুস্টার প্রোগ্রাম" : "Common Topics 10 Days Final Booster Program", count: 10 },
  ];

  const reviews = [
    {
      name: "তানভীর আহমেদ",
      batch: "ব্যাচ ২২",
      role: "শিক্ষার্থী, ঢাকা বিশ্ববিদ্যালয়",
      comment: "কোর্সের প্রতিটি টপিক এত সহজ ও প্র্যাক্টিক্যালভাবে বোঝানো হয়েছে যা কল্পনাও করিনি। বিশেষ করে হ্যান্ডস-অন প্রজেক্টগুলো অনেক কনফিডেন্স বাড়িয়েছে।",
      rating: 5,
    },
    {
      name: "নাফিসা বিনতে কামাল",
      batch: "ব্যাচ ২৪",
      role: "শিক্ষার্থী, বুয়েট",
      comment: "লেকচার শিট আর ডাউট সলভিং কমিউনিটি অসাধারণ! যখনই আটকে গেছি সাথে সাথে মেন্টরদের গাইডলাইন পেয়েছি।",
      rating: 5,
    },
    {
      name: "সাকিবুল হাসান",
      batch: "ব্যাচ ২১",
      role: "জুনিয়র ডেভেলপার",
      comment: "এই কোর্স শেষ করার পর আমি আমার প্রথম রিমোট ক্লায়েন্ট প্রজেক্ট সম্পূর্ণ করতে পেরেছি। ধন্যবাদ Astropixel টিমকে!",
      rating: 5,
    },
  ];

  const tabs = [
    { id: "all", labelBn: "সবকিছু", labelEn: "Overview" },
    { id: "content", labelBn: "কোর্স কারিকুলাম", labelEn: "Curriculum" },
    { id: "outline", labelBn: "কোর্স আউটলাইন", labelEn: "Outline" },
    { id: "instructors", labelBn: "ইনস্ট্রাক্টরবৃন্দ", labelEn: "Instructors" },
    { id: "exam", labelBn: "এক্সাম", labelEn: "Exam" },
    { id: "materials", labelBn: "মেটেরিয়ালস", labelEn: "Materials" },
    { id: "xfactor", labelBn: "স্পেশাল ফ্যাক্টরস", labelEn: "X Factors" },
    { id: "faqs", labelBn: "সাধারণ জিজ্ঞাসা", labelEn: "FAQs" },
    { id: "roadmap", labelBn: "রোডম্যাপ", labelEn: "Roadmap" },
  ];

  return (
    <Layout flushTop={false}>
      <Helmet>
        <title>{title} — Astropixel Learn</title>
      </Helmet>

      {/* 1. FLOATING STICKY HEADER (Appears on Scroll) */}
      <CourseStickyBar
        title={title || ""}
        price={c.price || 0}
        rating={4.9}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled}
        courseId={c.id}
      />

      {/* 2. EDGECOURSEBD MAIN CONTAINER */}
      <div className="bg-white dark:bg-background">
        <div className="container max-w-7xl mx-auto py-4 md:py-8 px-4 sm:px-6">

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              {isBn ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/courses" className="hover:text-brand-600 transition-colors">
              {isBn ? "সকল কোর্স" : "All Courses"}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] sm:max-w-none">
              {title}
            </span>
          </nav>

          <div className="flex flex-col-reverse gap-8 lg:flex-row items-start">

            {/* ═══ LEFT CONTENT AREA (flex-[2]) ═══ */}
            <div className="min-w-0 flex-1 lg:flex-[2] space-y-6">
              
              {/* Title & Stats Row */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-[11px] font-bold text-brand-600 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-800/40">
                    {c.category || (isBn ? "প্রফেশনাল কোর্স" : "Professional Course")}
                  </span>
                  {isEnrolled && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[11px] font-bold text-white shadow-xs">
                      {isBn ? "✓ আপনি এনরোল্ড আছেন" : "✓ Enrolled"}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                  {title}
                </h1>

                {shortDesc && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {shortDesc}
                  </p>
                )}

                {/* Pill Stats Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 ring-1 ring-brand-100 dark:ring-brand-900/40">
                    <Users className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span>১,৪৫০+ {isBn ? "এনরোল্ড শিক্ষার্থী" : "Enrolled Students"}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 ring-1 ring-brand-100 dark:ring-brand-900/40">
                    <Clock className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span>{c.duration || "১২+ ঘন্টা"}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 ring-1 ring-emerald-100 dark:ring-emerald-900/40">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-500 shrink-0" />
                    <span>৪.৯ (১২০+ রিভিউ)</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Award className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span>{isBn ? "ভেরিফায়েড সার্টিফিকেট" : "Verified Certificate"}</span>
                  </span>
                </div>
              </div>

              {/* Course Features / About Box (EdgeCourseBD "যা যা থাকছে") */}
              {outcomes.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card p-5 shadow-xs">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "কোর্সে যা যা থাকছে:" : "What's Included in This Course:"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {outcomes.map((out, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EdgeCourseBD "Course Instructor" Grid Box */}
              <div className="relative my-6 space-y-4 rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card px-4 pb-6 pt-5 shadow-xs">
                <h2 className="absolute -top-3 left-4 bg-white dark:bg-card px-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? "কোর্স ইনস্ট্রাক্টরবৃন্দ" : "Course Instructors"}
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                  {instructors.map((inst, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-cus-gray-200 dark:border-border/40 bg-white dark:bg-slate-900/40 px-3 py-2.5 transition-colors hover:border-brand-300"
                    >
                      <div className="relative flex overflow-hidden rounded-full h-10 w-10 shrink-0 ring-1 ring-cus-gray-200 dark:ring-border">
                        {inst.image ? (
                          <img src={inst.image} alt={inst.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                            {inst.initials || "AS"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {inst.name}
                        </p>
                        <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                          {inst.institution || inst.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EdgeCourseBD Sticky Filter Tab Bar */}
              <div className="sticky top-20 z-10 flex w-full items-center gap-1 rounded-xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card px-1.5 py-1.5 shadow-sm">
                <div className="inline-flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-brand-500 text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600"
                      }`}
                    >
                      {isBn ? tab.labelBn : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* EdgeCourseBD Tab Content Sections */}
              <div className="flex flex-col gap-6">

                {/* 1. Course Overview & About (when tab is 'all') */}
                {activeTab === "all" && desc && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {isBn ? "কোর্স পরিচিতি ও বিস্তারিত" : "About This Course"}
                      </h2>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
                      {desc}
                    </div>

                    {/* Why Learn this skill */}
                    {whyLearn.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 dark:border-border/40 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Target className="h-4 w-4 text-brand-500" />
                          <span>{isBn ? "এই কোর্সটি আপনার জন্য কেন জরুরি?" : "Why should you take this course?"}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          {whyLearn.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements & Target Audience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-border/40">
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          {isBn ? "প্রয়োজনীয় যোগ্যতা ও প্রস্তুতি" : "Requirements"}
                        </h5>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          {isBn ? "কাদের জন্য এই কোর্স?" : "Who is this course for?"}
                        </h5>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {whoFor.map((target, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{target}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                )}
                
                {/* 2. Course Content (Modules & Lessons) Section */}
                {(activeTab === "content" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "কোর্স কারিকুলাম ও মডিউলসমূহ" : "Course Curriculum & Lessons"}
                      </h2>
                      <span className="ml-auto shrink-0 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-900/40">
                        {data?.modules?.length || 4} {isBn ? "টি মডিউল" : "modules"}
                      </span>
                    </div>

                    <Accordion type="multiple" defaultValue={["module-0"]} className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {(data?.modules || []).map((m, idx) => (
                        <AccordionItem key={m.id || idx} value={`module-${idx}`} className="px-4 border-0">
                          <AccordionTrigger className="hover:no-underline py-3.5 text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30 text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block truncate">
                                  {m.title}
                                </span>
                                {m.duration && (
                                  <span className="text-[11px] text-gray-500 font-normal">
                                    {m.duration} • {m.lessons?.length || 4} {isBn ? "টি লেকচার" : "lessons"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3.5 pt-0 text-xs text-gray-600 dark:text-gray-300">
                            {m.description && (
                              <p className="leading-relaxed mb-3 text-slate-600 dark:text-slate-400">{m.description}</p>
                            )}

                            {/* Detailed lesson list */}
                            <div className="space-y-1.5 pl-2 sm:pl-4 border-l-2 border-brand-100 dark:border-brand-900/40">
                              {(m.lessons || [
                                { id: `${m.id}-l1`, title: isBn ? "লেকচার ১: ফান্ডামেন্টাল কনসেপ্ট ও রুলস" : "Lesson 1: Fundamental Concepts", duration: "২৫ মিনিট", is_free_preview: idx === 0 },
                                { id: `${m.id}-l2`, title: isBn ? "লেকচার ২: হ্যান্ডস-অন প্র্যাকটিকাল সেশন" : "Lesson 2: Practical Implementation", duration: "৩৫ মিনিট", is_free_preview: false },
                                { id: `${m.id}-l3`, title: isBn ? "লেকচার ৩: ইন্ডাস্ট্রি কেস স্টাডি ও কুইজ" : "Lesson 3: Case Study & Quiz", duration: "২০ মিনিট", is_free_preview: false },
                              ]).map((lesson, lIdx) => (
                                <div
                                  key={lesson.id || lIdx}
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {lesson.is_free_preview ? (
                                      <Play className="h-3.5 w-3.5 text-brand-500 fill-current shrink-0" />
                                    ) : (
                                      <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    )}
                                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                      {lesson.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {lesson.duration && (
                                      <span className="text-[11px] text-gray-500">
                                        {lesson.duration}
                                      </span>
                                    )}
                                    {lesson.is_free_preview && (
                                      <button
                                        onClick={() => {
                                          setPreviewLesson(lesson);
                                          window.scrollTo({ top: 120, behavior: 'smooth' });
                                        }}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 hover:bg-brand-100 transition-colors cursor-pointer"
                                      >
                                        {isBn ? "প্রিভিউ" : "Preview"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                )}

                {/* 3. Course Outline Accordion Section */}
                {(activeTab === "outline" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "কোর্স আউটলাইন ও গাইডলাইন" : "Course Outline & Roadmap"}
                      </h2>
                      <span className="ml-auto shrink-0 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-900/40">
                        {outlineItems.length}
                      </span>
                    </div>

                    <div className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {outlineItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-7 w-7 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {item.count} {isBn ? "টি রুটিন লেকচার" : "item"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Instructors Detail Section */}
                {(activeTab === "instructors" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {isBn ? "অভিজ্ঞ ইনস্ট্রাক্টর ও মেন্টর প্যানেল" : "Our Expert Instructors & Mentors"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {instructors.map((inst, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 dark:border-border/60 bg-slate-50/40 dark:bg-slate-900/30"
                        >
                          <div className="relative flex overflow-hidden rounded-full h-12 w-12 shrink-0 ring-2 ring-brand-500/20">
                            {inst.image ? (
                              <img src={inst.image} alt={inst.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                                {inst.initials || "AS"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{inst.name}</h4>
                            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{inst.institution || inst.designation}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                              {inst.bio || (isBn ? "বাস্তব কাজের অভিজ্ঞতা ও বহু শিক্ষার্থীকে গাইড করার দক্ষতাসম্পন্ন প্রশিক্ষক।" : "Experienced mentor dedicated to hands-on practical skills.")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Exam Section */}
                {(activeTab === "exam" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "মক টেস্ট ও লাইভ এক্সাম (Exam)" : "Exam & Assessment"}
                      </h2>
                      <span className="ml-auto shrink-0 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-900/40">
                        {examItems.length}
                      </span>
                    </div>

                    <div className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {examItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {item.count} {isBn ? "টি টেস্ট" : "tests"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 6. Materials Section */}
                {(activeTab === "materials" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "বই ও স্টাডি মেটেরিয়ালস (Materials)" : "Study Materials & Books"}
                      </h2>
                      <span className="ml-auto shrink-0 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-900/40">
                        {materialItems.length}
                      </span>
                    </div>

                    <div className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {materialItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <BookOpen className="h-5 w-5 text-brand-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {item.count} {isBn ? "টি ই-বুক / শিট" : "PDFs"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 7. Special X Factors Section */}
                {(activeTab === "xfactor" || activeTab === "all") && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "স্পেশাল ফ্যাক্টরস ও ফাইনাল প্রজেক্ট (X Factors)" : "X Factors & Special Topics"}
                      </h2>
                      <span className="ml-auto shrink-0 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 ring-1 ring-brand-100 dark:ring-brand-900/40">
                        {xFactorItems.length}
                      </span>
                    </div>

                    <div className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {xFactorItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {item.count} {isBn ? "টি ক্লাস" : "classes"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 8. FAQs Section */}
                {(activeTab === "faqs" || activeTab === "all") && faqs.length > 0 && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card">
                    <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                      <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                        {isBn ? "সাধারণ জিজ্ঞাসা (Frequently Asked Questions)" : "Frequently Asked Questions"}
                      </h2>
                    </div>

                    <Accordion type="single" collapsible className="divide-y divide-cus-gray-200 dark:divide-border/40">
                      {faqs.map((faq, idx) => (
                        <AccordionItem key={idx} value={`faq-${idx}`} className="px-4 border-0">
                          <AccordionTrigger className="hover:no-underline py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <HelpCircle className="h-4 w-4 text-brand-500 shrink-0" />
                              <span>{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3.5 pt-0 text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                )}

                {/* 9. Roadmap Tab */}
                {(activeTab === "roadmap" || activeTab === "all") && (
                  <div className="pt-2">
                    <CourseRoadmap />
                  </div>
                )}

                {/* 10. Student Reviews & Testimonials Section */}
                {activeTab === "all" && (
                  <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {isBn ? "শিক্ষার্থীদের প্রতিক্রিয়া ও মতামত" : "Student Reviews & Feedback"}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span>৪.৯ / ৫.০ (১২০+ রিভিউ)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {reviews.map((rev, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between p-3.5 rounded-xl border border-gray-100 dark:border-border/60 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(rev.rating)].map((_, rIdx) => (
                                <Star key={rIdx} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                              &ldquo;{rev.comment}&rdquo;
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 dark:border-border/40">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{rev.name}</p>
                            <p className="text-[10px] text-gray-500">{rev.role} • {rev.batch}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

              {/* EdgeCourseBD External Links Box: Books & Exam */}
              <section className="overflow-hidden rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card shadow-xs">
                <div className="flex items-center gap-3 border-b border-cus-gray-200 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30 px-4 py-3">
                  <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-brand-500"></span>
                  <h2 className="min-w-0 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                    {isBn ? "বই ও এক্সাম কোর্সের জন্য ভিজিট করো" : "Visit for Books & Exam Batches"}
                  </h2>
                </div>
                <div className="divide-y divide-cus-gray-200 dark:divide-border/40">
                  <a
                    href="https://qnapublication.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                        QNA
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {isBn ? "QNA Publication — বই কিনতে ভিজিট করো" : "QNA Publication — Buy Hardcopy Books"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {isBn ? "সকল অধ্যায়ভিত্তিক অ্যানালাইসিস ও প্রিন্টেড বুক" : "Chapter-wise analysis books"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-600" />
                  </a>

                  <a
                    href="https://www.qztestexam.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        QZ
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {isBn ? "QZ Test Exam — অনলাইন টেস্ট ও এক্সাম ব্যাচ" : "QZ Test Exam — Online Exam Batches"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {isBn ? "হাজারো শিক্ষার্থীর সাথে রিয়েল-টাইম মেধা যাচাই" : "Real-time national ranking exams"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-600" />
                  </a>
                </div>
              </section>

              {/* EdgeCourseBD Mobile App Banner Box */}
              <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-[#020507] via-[#0C2417] to-[#04150D] p-6 sm:p-8 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-lg sm:text-2xl font-black leading-tight">
                      <span className="text-[#22C55E]">বাংলাদেশের </span>
                      <span className="text-[#F5B800]">১ নম্বর লার্নিং App</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-md">
                      {isBn ? "অফলাইন মোড : নেট না থাকলেও চলবে ক্লাস! ক্লাস, বুক ও এক্সাম সহ সবকিছুই এক অ্যাপে।" : "Learn offline without internet on the Astropixel Mobile App."}
                    </p>
                    <div className="pt-2">
                      <a
                        href="https://play.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
                      >
                        <Smartphone className="h-4 w-4 text-[#22C55E]" />
                        <span>{isBn ? "Google Play থেকে ডাউনলোড করুন" : "Download on Google Play"}</span>
                      </a>
                    </div>
                  </div>

                  <div className="w-32 sm:w-40 shrink-0">
                    <img
                      src="/images/mobileApp.png"
                      alt="Astropixel Learning App"
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      onError={(e) => {
                        // fallback if image not found
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ═══ RIGHT COLUMN: STICKY MEDIA & BUY CARD (lg:sticky lg:top-28) ═══ */}
            <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-28">
              <StickyEnrollCard
                price={c.price || 0}
                thumbnailUrl={c.thumbnail_url}
                videoId={videoId}
                totalClasses={c.total_classes}
                duration={c.duration}
                onEnroll={handleEnroll}
                title={title || ""}
                isEnrolled={isEnrolled}
                courseId={c.id}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Direct Enrollment Modal */}
      {c && (
        <CourseEnrollmentModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          course={c as any}
          onSuccess={() => {
            setIsEnrollModalOpen(false);
            navigate(`/student/course/${c.id}`);
          }}
        />
      )}
    </Layout>
  );
}
