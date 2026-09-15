import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2, Clock, Users, GraduationCap, Star,
  Sparkles, BookOpen, ArrowRight, AlertCircle, Target,
  ChevronRight, Calendar, Globe, Award, ShieldCheck, PlayCircle,
  Smartphone, HelpCircle, FileText, Check, Lock, Play, Share2,
  Video, CheckSquare, MessageCircle
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
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
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
    banner_url?: string | null;
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
  const slugParam = params.slug || 'course-hsc-chemistry-mastery';
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
              if (foundData && foundData.modules) {
                foundData.modules = foundData.modules.map((mod) => ({
                  ...mod,
                  lessons: (mod.lessons || []).map((les, lIdx) => ({
                    ...les,
                    video_url: les.video_url || (lIdx % 2 === 0 ? "https://www.youtube.com/watch?v=qz0aGYrrlhU" : "https://www.youtube.com/watch?v=1Rs2ND1ryYc"),
                  }))
                }));
              }
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
            // Also fetch lessons from Supabase videos table
            const { data: dbVideos } = await supabase
              .from('videos')
              .select('*')
              .eq('course_id', dbCourse.id)
              .order('order_index', { ascending: true });

            // Find matching seed course for rich default metadata/videos if needed
            const matchingSeed = INITIAL_REAL_YOUTUBE_COURSES.find(
              (c) => c.id === dbCourse.id ||
                     (c as any).landing_slug === dbCourse.landing_slug ||
                     c.category === (dbCourse as any).category ||
                     c.title.toLowerCase().includes(dbCourse.title.toLowerCase())
            ) || INITIAL_REAL_YOUTUBE_COURSES[0];

            // Resolve lesson videos: dbVideos or matchingSeed videos or educational fallback
            const resolvedVideos = (dbVideos && dbVideos.length > 0)
              ? dbVideos
              : (matchingSeed?.videos && matchingSeed.videos.length > 0)
                ? matchingSeed.videos
                : [
                    {
                      id: "vid-fallback-1",
                      title: "লেকচার ১: কোর্স ওভারভিউ ও ফাউন্ডেশন পরিচিতি",
                      duration_seconds: 1420,
                      video_url: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
                    },
                    {
                      id: "vid-fallback-2",
                      title: "লেকচার ২: এসেনশিয়াল সফটওয়্যার ও প্র্যাক্টিক্যাল সেটআপ",
                      duration_seconds: 1750,
                      video_url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
                    },
                    {
                      id: "vid-fallback-3",
                      title: "লেকচার ৩: বেসিক টু অ্যাডভান্সড মেথডলজি ও প্রজেক্ট শুরু",
                      duration_seconds: 2100,
                      video_url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                    },
                    {
                      id: "vid-fallback-4",
                      title: "লেকচার ৪: ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্র্যাকটিস ও পোর্টফোলিও",
                      duration_seconds: 1980,
                      video_url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
                    }
                  ];

            const chunkSize = Math.max(1, Math.ceil(resolvedVideos.length / 4));

            const resolvedModules: Module[] = [
              {
                id: "m1",
                title: "মডিউল ০১: কোর্সের প্রাথমিক পরিচিতি ও প্রয়োজনীয় টুলস",
                description: "টুলস সেটআপ ও মৌলিক ধারণাসমূহ হাতে-কলমে শেখা।",
                order_index: 1,
                duration: "২ ঘন্টা ৩০ মিনিট",
                lessons: resolvedVideos.slice(0, chunkSize).map((v, i) => ({
                  id: v.id || `l1-${i}`,
                  title: v.title || `লেকচার ১.${i + 1}`,
                  duration: `${Math.round((v.duration_seconds || 900) / 60)} মিনিট`,
                  is_free_preview: i < 2,
                  video_url: v.video_url || (i % 2 === 0 ? "https://www.youtube.com/watch?v=qz0aGYrrlhU" : "https://www.youtube.com/watch?v=1Rs2ND1ryYc"),
                }))
              },
              {
                id: "m2",
                title: "মডিউল ০২: মূল কনসেপ্ট ও রিয়েল-লাইফ প্রজেক্ট শুরু",
                description: "প্র্যাক্টিক্যাল প্রজেক্ট তৈরি ও ধাপে ধাপে জটিল সমস্যা সমাধান।",
                order_index: 2,
                duration: "৩ ঘন্টা ৪৫ মিনিট",
                lessons: resolvedVideos.slice(chunkSize, chunkSize * 2).map((v, i) => ({
                  id: v.id || `l2-${i}`,
                  title: v.title || `লেকচার ২.${i + 1}`,
                  duration: `${Math.round((v.duration_seconds || 1200) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url || "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                }))
              },
              {
                id: "m3",
                title: "মডিউল ০৩: অ্যাডভান্সড মেথডোলজি ও অপটিমাইজেশন",
                description: "প্রোডাকশন-গ্রেড টেকনিক এবং প্রো টিপস।",
                order_index: 3,
                duration: "৩ ঘন্টা ২০ মিনিট",
                lessons: resolvedVideos.slice(chunkSize * 2, chunkSize * 3).map((v, i) => ({
                  id: v.id || `l3-${i}`,
                  title: v.title || `লেকচার ৩.${i + 1}`,
                  duration: `${Math.round((v.duration_seconds || 1100) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url || "https://www.youtube.com/watch?v=bMknfKXIFA8",
                }))
              },
              {
                id: "m4",
                title: "মডিউল ০৪: ফাইনাল প্রজেক্ট, পোর্টফোলিও ও সার্টিফিকেট",
                description: "সম্পূর্ণ প্রজেক্ট রিভিশন, রিভিউ ও সার্টিফিকেট অর্জন।",
                order_index: 4,
                duration: "২ ঘন্টা ১৫ মিনিট",
                lessons: resolvedVideos.slice(chunkSize * 3).map((v, i) => ({
                  id: v.id || `l4-${i}`,
                  title: v.title || `লেকচার ৪.${i + 1}`,
                  duration: `${Math.round((v.duration_seconds || 950) / 60)} মিনিট`,
                  is_free_preview: false,
                  video_url: v.video_url || "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
                }))
              },
            ];

            foundData = {
              course: {
                id: dbCourse.id,
                title: dbCourse.title,
                title_en: dbCourse.title_en || undefined,
                description: dbCourse.description || undefined,
                description_en: dbCourse.description_en || undefined,
                short_description: dbCourse.description ? dbCourse.description.slice(0, 150) + "..." : undefined,
                thumbnail_url: dbCourse.thumbnail_url || undefined,
                banner_url: (dbCourse as any).banner_url || (dbCourse as any).hero_banner_url || undefined,
                price: dbCourse.price || 0,
                category: (dbCourse as any).category || matchingSeed?.category || "Professional Development",
                trainer_name: dbCourse.trainer_name || matchingSeed?.trainer_name || "Astropixel Expert Mentors",
                trainer_designation: dbCourse.trainer_designation || (matchingSeed as any)?.trainer_designation || "Lead Instructor",
                trainer_image: dbCourse.trainer_image || undefined,
                trainer_bio: "অভিজ্ঞ ইন্ডাস্ট্রি প্রফেশনাল ও প্রশিক্ষক। বাস্তব কাজের প্রজেক্টভিত্তিক নির্দেশনায় শিক্ষার্থীদের দক্ষ করে তোলার দীর্ঘ অভিজ্ঞতা।",
                learning_outcomes: (dbCourse as any).learning_outcomes || matchingSeed?.learning_outcomes || [
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
                total_classes: (dbCourse as any).total_classes || `${resolvedVideos.length}+ ক্লাস`,
                duration: (dbCourse as any).duration || "১০+ ঘন্টা",
                intro_video_url: (dbCourse as any).intro_video_url || resolvedVideos[0]?.video_url || "https://www.youtube.com/watch?v=qz0aGYrrlhU",
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
              modules: resolvedModules,
              lesson_count: resolvedVideos.length,
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
                banner_url: (seeded as any).banner_url || (seeded as any).hero_banner_url || undefined,
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

  const [activeTab, setActiveTab] = useState<string>("instructor");
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null);

  // Dynamic Scroll-Spy IntersectionObserver to highlight active tab on scroll
  useEffect(() => {
    if (loading || !data) return;

    const sectionIds = [
      "section-instructor",
      "section-structure",
      "section-learn",
      "section-details",
      "section-curriculum",
      "section-faqs"
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Sort by distance to top offset threshold
          intersecting.sort((a, b) => {
            return Math.abs(a.boundingClientRect.top - 130) - Math.abs(b.boundingClientRect.top - 130);
          });
          const activeId = intersecting[0].target.id.replace("section-", "");
          setActiveTab(activeId);
        }
      },
      {
        rootMargin: "-120px 0px -50% 0px",
        threshold: [0, 0.2, 0.5]
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, data]);

  const effectiveUserId = user?.id || 'demo-student-001';

  const c = data?.course;

  // Enrolled status check
  const isEnrolled = useMemo(() => {
    if (!c?.id) return false;
    const localEnrolled = getLocalEnrolledCourses(effectiveUserId);
    return localEnrolled.includes(c.id);
  }, [c?.id, effectiveUserId]);

  // Educational video fallbacks based on category (never Rick Astley)
  const defaultFallbackVideoId = useMemo(() => {
    const cat = (c?.category || '').toLowerCase();
    if (cat.includes('graphic') || cat.includes('design')) return 'R9_uLILm0qg';
    if (cat.includes('math') || cat.includes('গণিত')) return 'V7z7BAZdt2M';
    if (cat.includes('chem') || cat.includes('রসায়ন')) return '3z_2H63b6kE';
    if (cat.includes('physics') || cat.includes('পদার্থ')) return 'qz0aGYrrlhU';
    return 'qz0aGYrrlhU';
  }, [c?.category]);

  // Resolve authentic sample demo class video (lesson 2 or first free preview)
  const demoLesson = useMemo(() => {
    for (const mod of data?.modules || []) {
      for (const les of mod.lessons || []) {
        if (les.video_url && (les.is_free_preview || les.id !== data?.modules?.[0]?.lessons?.[0]?.id)) {
          return les;
        }
      }
    }
    return data?.modules?.[0]?.lessons?.[1] || data?.modules?.[0]?.lessons?.[0] || null;
  }, [data?.modules]);

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

  const title = isBn 
    ? ((c as any).title_bn || c.title || c.title_en || '')
    : (c.title_en || c.title || '');
  const desc = isBn ? (c?.description || c?.description_en) : (c?.description_en || c?.description);
  const shortDesc = isBn ? (c?.short_description || c?.short_description_en) : (c?.short_description_en || c?.short_description);

  const dummyChemistryBanner = "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=1600&auto=format&fit=crop";
  const localBanner = typeof window !== 'undefined' && c?.id ? localStorage.getItem("course_banner_" + c.id) : null;
  const activeBannerUrl = localBanner || c?.banner_url || (c as any)?.hero_banner_url || (
    c?.id === 'course-hsc-chemistry-mastery' || c?.landing_slug?.includes('chemistry') 
      ? dummyChemistryBanner 
      : (c?.thumbnail_url || dummyChemistryBanner)
  );
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

  const videoId = getYouTubeId(previewLesson?.video_url || c.intro_video_url) || (c as any).youtube_video_id || defaultFallbackVideoId;
  const demoVideoId = getYouTubeId(demoLesson?.video_url) || defaultFallbackVideoId;

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
    { id: "instructor", labelBn: "কোর্স ইন্সট্রাক্টর", labelEn: "Instructor" },
    { id: "structure", labelBn: "কোর্সটি যেভাবে সাজানো হয়েছে", labelEn: "Structure" },
    { id: "learn", labelBn: "কোর্সটি করে যা শিখবেন", labelEn: "What you'll learn" },
    { id: "details", labelBn: "কোর্স সম্পর্কে বিস্তারিত", labelEn: "Course Details" },
    { id: "curriculum", labelBn: "কোর্স কারিকুলাম", labelEn: "Curriculum" },
    { id: "faqs", labelBn: "সচরাচর জিজ্ঞাসা", labelEn: "FAQs" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      const offset = 130; // 64px main nav + 56px sticky tabs + 10px breathing room
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout flushTop={false}>
      <Helmet>
        <title>{title} — Astropixel Learn</title>
      </Helmet>

      {/* 1. FLOATING STICKY BAR (Appears on Scroll) */}
      <CourseStickyBar
        title={title || ""}
        price={c.price || 0}
        rating={4.9}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled}
        courseId={c.id}
      />

      {/* 2. 10 MINUTE SCHOOL FULL-WIDTH DARK NAVY HERO BANNER */}
      <div className="bg-[#0B1120] text-white border-b border-slate-800/80">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-12 pb-14 lg:pb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            {/* Left Hero Title Block */}
            <div className="w-full lg:w-[60%] space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white leading-tight tracking-tight">
                {title}
              </h1>

              {/* Rating block matching 10MS */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm pt-1">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-slate-300 font-bold">
                  {isBn ? "(৭১.১% শিক্ষার্থী কোর্স শেষে ৫ রেটিং দিয়েছেন)" : "(71.1% students gave 5-star rating)"}
                </span>
              </div>

              {/* Short Description */}
              {shortDesc && (
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-1 max-w-2xl">
                  {shortDesc}
                </p>
              )}

              {/* Mobile-only StickyEnrollCard placeholder */}
              <div className="w-full lg:hidden pt-2">
                <StickyEnrollCard
                  price={c.price || 0}
                  thumbnailUrl={c.thumbnail_url}
                  videoId={videoId}
                  demoVideoId={demoVideoId}
                  totalClasses={c.total_classes || `${data?.lesson_count || 39}টি`}
                  duration={c.duration || "১০ ঘণ্টা"}
                  onEnroll={handleEnroll}
                  title={title || ""}
                  isEnrolled={isEnrolled}
                  courseId={c.id}
                  learningOutcomes={outcomes}
                  videoCount={data?.lesson_count || 39}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 10MS MAIN BODY & DESKTOP STICKY RIGHT CARD */}
      <div className="relative -mt-6 sm:-mt-8 z-20 rounded-t-3xl sm:rounded-t-[32px] bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 pt-2">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">

            {/* ═══ LEFT CONTENT COLUMN (w-full lg:w-[60%]) ═══ */}
            <div className="w-full lg:w-[60%] space-y-8 pt-6 min-w-0">

              {/* Sub-Navigation Bar (Scoped to Left Column) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-xs px-3 py-2 mb-6">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("subnav-container");
                      if (el) el.scrollBy({ left: -150, behavior: "smooth" });
                    }}
                    className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-bold text-xs"
                    aria-label="Scroll left"
                  >
                    ‹
                  </button>
                  <div id="subnav-container" className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 flex-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-sm text-xs font-extrabold transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isBn ? tab.labelBn : tab.labelEn}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("subnav-container");
                      if (el) el.scrollBy({ left: 150, behavior: "smooth" });
                    }}
                    className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 hover:bg-slate-700 cursor-pointer font-bold text-xs"
                    aria-label="Scroll right"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Section 1: কোর্স ইন্সট্রাক্টর */}
              <div id="section-instructor" className="scroll-mt-28 space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "কোর্স ইন্সট্রাক্টর" : "Course Instructor"}
                </h3>
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40">
                      {instructors[0]?.image ? (
                        <img src={instructors[0].image} alt={instructors[0].name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {instructors[0]?.initials || "AS"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1 hover:text-emerald-600 transition-colors">
                        {instructors[0]?.name || (isBn ? "মুনজেরিন শহীদ" : "Munzereen Shahid")}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug font-medium">
                        {instructors[0]?.institution || instructors[0]?.designation || (isBn ? "এমএসসি (ইংলিশ), অক্সফোর্ড বিশ্ববিদ্যালয়; বিএ, এমএ (ইংরেজি), ঢাকা বিশ্ববিদ্যালয়; প্রধান শিক্ষক, ইংলিশ এডুকেশন, Astropixel Learn" : "Senior Lead Instructor, Astropixel Learn")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: কোর্সটি যেভাবে সাজানো হয়েছে (10MS Signature Dark Navy 2x2 Grid) */}
              <div id="section-structure" className="scroll-mt-28">
                <div className="rounded-sm border border-slate-800 bg-[#0B1120] text-white p-6 sm:p-7 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {isBn ? "কোর্সটি যেভাবে সাজানো হয়েছে" : "How The Course Is Structured"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {isBn ? "সব মিলিয়ে এই কোর্সে আপনি যা যা পাচ্ছেন" : "Everything included in this complete learning path"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Item 1 */}
                    <div className="flex items-start gap-3.5 p-4 rounded-sm bg-slate-900/80 border border-slate-800">
                      <span className="grid h-10 w-10 place-items-center rounded-sm bg-rose-500/20 text-rose-400 shrink-0">
                        <Video className="h-5 w-5" />
                      </span>
                      <div>
                        <h5 className="text-sm font-extrabold text-white">
                          {data?.lesson_count || 24} {isBn ? "টি ভিডিও লেকচার" : "Video Lectures"}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {isBn ? "কোর্সে রয়েছে প্রতিটি বিষয়ের জন্য সাজানো ও এডিটেড হাই ডেফিনিশন ভিডিও লেকচার।" : "Bite-sized high definition video lessons covering real scenarios."}
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-3.5 p-4 rounded-sm bg-slate-900/80 border border-slate-800">
                      <span className="grid h-10 w-10 place-items-center rounded-sm bg-blue-500/20 text-blue-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <h5 className="text-sm font-extrabold text-white">
                          {Math.max(6, Math.round((data?.lesson_count || 24) * 0.4))} {isBn ? "টি এক্সক্লুসিভ লেকচার শিট" : "Exclusive Lecture Sheets"}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {isBn ? "প্রতিটি ক্লাসের সামারি ও প্র্যাক্টিস এক্সারসাইজ সহ পিডিএফ লেকচার শিট।" : "Downloadable lecture notes and summary practice sheets."}
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start gap-3.5 p-4 rounded-sm bg-slate-900/80 border border-slate-800">
                      <span className="grid h-10 w-10 place-items-center rounded-sm bg-purple-500/20 text-purple-400 shrink-0">
                        <CheckSquare className="h-5 w-5" />
                      </span>
                      <div>
                        <h5 className="text-sm font-extrabold text-white">
                          {Math.max(4, data?.modules?.length || 4)} {isBn ? "টি চ্যাপ্টারভিত্তিক কুইজ ও এসেসমেন্ট" : "Chapter-wise Quiz Sets"}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {isBn ? "প্রতিটি চ্যাপ্টার শেষ করে নিজের অগ্রগতি যাচাই করতে কুইজ টেস্ট।" : "Interactive quizzes to evaluate understanding and retention."}
                        </p>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start gap-3.5 p-4 rounded-sm bg-slate-900/80 border border-slate-800">
                      <span className="grid h-10 w-10 place-items-center rounded-sm bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <h5 className="text-sm font-extrabold text-white">
                          {isBn ? "৬টি প্র্যাক্টিক্যাল টেমপ্লেট ও রিসোর্স" : "6 Practical Templates & Resources"}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {isBn ? "বাস্তব জীবনে ব্যবহারের জন্য রেডিমেড কনভারসেশন ও প্রজেক্ট টেমপ্লেট।" : "Practical templates for ready use in work and daily workflows."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: কোর্সটি করে যা শিখবেন (2 Columns of Blue Checkmarks) */}
              <div id="section-learn" className="scroll-mt-28 space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "কোর্সটি করে যা শিখবেন" : "What You Will Learn"}
                </h3>
                <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(outcomes.length > 0 ? outcomes : [
                      isBn ? "দৈনন্দিন জীবনের বিভিন্ন পরিস্থিতিতে ফ্লুয়েন্টলি কথা বলা" : "Speak fluently in everyday personal & professional situations",
                      isBn ? "সঠিক উচ্চারণ ও ব্যাকরণের সহজ প্রয়োগ আয়ত্ত করা" : "Master correct pronunciation and simplified grammar usage",
                      isBn ? "চাকরির ইন্টারভিউ ও প্রেজেন্টেশনে আত্মবিশ্বাসের সাথে অংশ নেওয়া" : "Deliver confident job interview answers and workplace presentations",
                      isBn ? "যেকোনো মানুষের সাথে কোনো জড়তা ছাড়া যোগাযোগ স্থাপন" : "Communicate without hesitation or fear of making mistakes",
                      isBn ? "স্পোকেন রুলস ও বহুল ব্যবহৃত ভোকাবুলারি আয়ত্ত করা" : "Build practical vocabulary and essential spoken patterns",
                      isBn ? "ইংরেজি শুনে দ্রুত বুঝতে পারা ও তৎক্ষণাৎ উত্তর দেওয়া" : "Improve listening comprehension and respond spontaneously",
                    ]).map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: কোর্স সম্পর্কে বিস্তারিত */}
              <div id="section-details" className="scroll-mt-28 space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "কোর্স সম্পর্কে বিস্তারিত" : "Course Details"}
                </h3>
                <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
                      {isBn ? `'${title}' কোর্সটি যাদের জন্য:` : `Who this course is designed for:`}
                    </h4>
                    <div className="space-y-2.5">
                      {(whoFor.length > 0 ? whoFor : [
                        isBn ? "শিক্ষার্থী যারা পড়াশোনার পাশাপাশি স্কিল বাড়িয়ে ক্যারিয়ারে এগিয়ে থাকতে চান" : "Students wishing to boost practical skills alongside studies",
                        isBn ? "চাকরিপ্রার্থী ও প্রফেশনাল যারা ক্যারিয়ারে প্রমোশন ও সাফল্য নিশ্চিত করতে চান" : "Job seekers and professionals looking for rapid career growth",
                        isBn ? "ফ্রিল্যান্সার ও রিমোট ওয়ার্কার যারা আন্তর্জাতিক ক্লায়েন্টদের সাথে কাজ করতে চান" : "Freelancers and remote workers working with global clients",
                        isBn ? "যেকোনো বয়সের শিক্ষার্থী যারা শূন্য থেকে সহজ ভাষায় শিখতে চান" : "Learners of any age wanting to start from scratch with simple lessons"
                      ]).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {desc && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-2">
                        {isBn ? "কোর্স বিবরণ:" : "Description:"}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium">
                        {desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: কোর্স কারিকুলাম */}
              <div id="section-curriculum" className="scroll-mt-28 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    {isBn ? "কোর্স কারিকুলাম" : "Course Curriculum"}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {(data?.modules?.length || 0)} {isBn ? "টি মডিউল" : "Modules"} • {data?.lesson_count || 39} {isBn ? "টি লেকচার" : "Lectures"}
                  </span>
                </div>

                <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <Accordion type="single" collapsible defaultValue="module-0" className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data?.modules || []).map((mod, mIdx) => (
                      <AccordionItem key={mod.id} value={`module-${mIdx}`} className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md shrink-0">
                              {isBn ? `মডিউল ${mIdx + 1}` : `Module ${mIdx + 1}`}
                            </span>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                                {mod.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {mod.lessons?.length || 0} {isBn ? "টি ক্লাস" : "Lessons"} {mod.duration ? `• ${mod.duration}` : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 pt-1 bg-slate-50/60 dark:bg-slate-950/40">
                          <div className="space-y-2">
                            {(mod.lessons || []).map((les, lIdx) => (
                              <div
                                key={les.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {les.is_free_preview || lIdx === 0 ? (
                                    <Play className="h-4 w-4 text-emerald-600 shrink-0 fill-current" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {les.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {les.duration && (
                                    <span className="text-xs text-slate-400 font-medium">{les.duration}</span>
                                  )}
                                  {(les.is_free_preview || lIdx === 0) && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewLesson(les)}
                                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 cursor-pointer"
                                    >
                                      {isBn ? "ফ্রি প্রিভিউ" : "Preview"}
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
                </div>
              </div>

              {/* Section 6: সচরাচর জিজ্ঞাসা (FAQ) */}
              <div id="section-faqs" className="scroll-mt-28 space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "সচরাচর জিজ্ঞাসা" : "Frequently Asked Questions"}
                </h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <Accordion type="single" collapsible className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(faqs.length > 0 ? faqs : [
                      {
                        question: isBn ? "কোর্সটি কীভাবে করব?" : "How will I take this course?",
                        answer: isBn ? "ভর্তি হওয়ার পর যেকোনো সময় আপনার মোবাইল বা কম্পিউটার থেকে লগইন করে ফুল HD ভিডিও লেকচার দেখতে পারবেন এবং লেকচার শিট ডাউনলোড করতে পারবেন।" : "After enrollment, log in anytime from phone or computer to access HD video lessons and lecture notes."
                      },
                      {
                        question: isBn ? "কোর্সের মেয়াদ কতদিন থাকবে?" : "What is the validity of the course?",
                        answer: isBn ? "কোর্সের মেয়াদ আজীবন (Lifetime Access)। একবার ভর্তি হলে যেকোনো সময় পুনরায় ক্লাসগুলো দেখতে পারবেন।" : "Lifetime access. Once enrolled, you can re-watch classes whenever you need."
                      },
                      {
                        question: isBn ? "কোর্স শেষে কি সার্টিফিকেট পাওয়া যাবে?" : "Will I receive a completion certificate?",
                        answer: isBn ? "হ্যাঁ, সম্পূর্ণ কোর্স এবং প্রয়োজনীয় কুইজ সফলভাবে সম্পন্ন করার পর আপনি একটি ভেরিফায়েড সার্টিফিকেট পাবেন যা সরাসরি ডাউনলোড ও শেয়ার করা যাবে।" : "Yes, finishing the course lessons and quizzes unlocks a verifiable digital certificate."
                      },
                      {
                        question: isBn ? "কোনো প্রশ্ন বা সমস্যায় মেন্টরদের সহায়তা পাব?" : "Is there student support available?",
                        answer: isBn ? "অবশ্যই! আমাদের ডেডিকেটেড ডিসকাশন ফোরাম ও ১৬৯১০ হেল্পলাইন সার্বক্ষণিক শিক্ষার্থীদের যেকোনো প্রশ্নের সমাধানে সহায়তা করে।" : "Yes, our community forum and 16910 helpline assist learners whenever needed."
                      }
                    ]).map((faq, fIdx) => (
                      <AccordionItem key={fIdx} value={`faq-${fIdx}`} className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 text-left text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>

              {/* Student Testimonials */}
              <div className="space-y-3 pt-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "শিক্ষার্থীদের অভিজ্ঞতা ও রিভিউ" : "Student Reviews"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((rev, rIdx) => (
                    <div key={rIdx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                        &quot;{rev.comment}&quot;
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{rev.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{rev.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile App Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0B1120] p-6 text-white border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {isBn ? "মোবাইল অ্যাপ" : "Mobile App"}
                  </span>
                  <h4 className="text-lg sm:text-xl font-black">
                    {isBn ? "যেকোনো সময়, যেকোনো স্থান থেকে শিখুন" : "Learn anytime, anywhere"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {isBn ? "ক্লাস, নোট ও কুইজ সহ সবকিছুই এক অ্যাপে।" : "Classes, lecture notes, and quizzes — all in one app."}
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://play.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-900 border border-slate-700/80 shadow-md transition-all group cursor-pointer"
                    >
                      <svg className="h-7 w-7 shrink-0" viewBox="0 0 512 512" fill="none">
                        <path d="M47.2 24.3C44.7 26.9 43.3 30.8 43.3 35.8V476.2C43.3 481.2 44.7 485.1 47.2 487.7L49.4 489.8L276.9 262.3V249.7L49.4 22.2L47.2 24.3Z" fill="#00D2FF"/>
                        <path d="M352.5 337.9L276.9 262.3V249.7L352.5 174.1L354.3 175.1L444 226.1C469.6 240.6 469.6 264.4 444 278.9L354.3 329.9L352.5 337.9Z" fill="#FFC800"/>
                        <path d="M354.3 329.9L276.9 256L47.2 485.7C55.6 494.6 69.5 495.7 85.1 486.9L354.3 329.9Z" fill="#FF3A44"/>
                        <path d="M354.3 182.1L85.1 25.1C69.5 16.3 55.6 17.4 47.2 26.3L276.9 256L354.3 182.1Z" fill="#00E676"/>
                      </svg>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-300 leading-none">
                          GET IT ON
                        </span>
                        <span className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
                          Google Play
                        </span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* ═══ RIGHT COLUMN DESKTOP STICKY ENROLL CARD ═══ */}
            <div className="hidden lg:block lg:w-[37%] xl:w-[380px] shrink-0 sticky top-20 z-30 lg:-mt-[215px] xl:-mt-[225px]">
              <StickyEnrollCard
                price={c.price || 0}
                thumbnailUrl={c.thumbnail_url}
                videoId={videoId}
                demoVideoId={demoVideoId}
                totalClasses={c.total_classes || `${data?.lesson_count || 39}টি`}
                duration={c.duration || "১০ ঘণ্টা"}
                onEnroll={handleEnroll}
                title={title || ""}
                isEnrolled={isEnrolled}
                courseId={c.id}
                learningOutcomes={outcomes}
                videoCount={data?.lesson_count || 39}
              />
            </div>

          </div>
        </div>
      </div>

      {/* 5. FLOATING WHATSAPP SUPPORT BUTTON */}
      <a
        href="https://wa.me/8801776965533?text=Hello%20Astropixel%20Learn%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group cursor-pointer"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
          {isBn ? "সহায়তা প্রয়োজন? WhatsApp-এ নক দিন" : "Need help? Chat on WhatsApp"}
        </span>
      </a>

      {/* 6. FREE LESSON PREVIEW VIDEO MODAL */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-black shrink-0">
                  {isBn ? "ফ্রি প্রিভিউ" : "Free Preview"}
                </span>
                <h4 className="text-sm font-bold text-white truncate">
                  {previewLesson.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-md cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black [&_.plyr]:h-full [&_.plyr]:w-full [&_.plyr__video-embed]:h-full">
              <Plyr
                source={{
                  type: "video",
                  sources: [
                    {
                      src: getYouTubeId(previewLesson.video_url || c.intro_video_url) || videoId,
                      provider: "youtube",
                    },
                  ],
                }}
                options={{
                  autoplay: true,
                  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'],
                }}
              />
            </div>
            {/* Quick-switch other free preview lessons */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                {(data?.modules || []).flatMap(m => m.lessons || []).filter(l => l.is_free_preview).map((les) => (
                  <button
                    key={les.id}
                    onClick={() => setPreviewLesson(les)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      previewLesson.id === les.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    ▶ {les.title.slice(0, 24)}...
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setPreviewLesson(null);
                  handleEnroll();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                {isBn ? "সম্পূর্ণ কোর্সে ভর্তি হন" : "Enroll Full Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DIRECT ENROLLMENT CHECKOUT MODAL */}
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
