import { CourseWithVideos } from '@/types/lms';

// Demo courses completely removed as requested.
// Only real courses created by administrators in Admin Panel will exist.
export const INITIAL_REAL_YOUTUBE_COURSES: CourseWithVideos[] = [];

// Known demo course IDs to purge from storage
export const DEMO_COURSE_IDS = [
  'course-hsc-physics-mastery',
  'course-hsc-chemistry-mastery',
  'course-admission-engineering',
  'course-admission-medical',
  'course-admission-varsity-a',
  'course-ict-programming',
  'course-digital-marketing-seo',
  'course-math-physics-olympiad'
];

/**
 * Purges any leftover demo courses or demo videos from localStorage tables.
 */
export function purgeDemoCoursesAndVideos(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem('ap_courses_seeded');
    localStorage.removeItem('ap_courses_seeded');

    // Clean courses table
    const coursesRaw = localStorage.getItem('ap_table_courses');
    if (coursesRaw) {
      try {
        const courses = JSON.parse(coursesRaw);
        if (Array.isArray(courses)) {
          const filtered = courses.filter((c: any) => !DEMO_COURSE_IDS.includes(c.id));
          localStorage.setItem('ap_table_courses', JSON.stringify(filtered));
        }
      } catch {}
    }

    // Clean videos table
    const videosRaw = localStorage.getItem('ap_table_videos');
    if (videosRaw) {
      try {
        const videos = JSON.parse(videosRaw);
        if (Array.isArray(videos)) {
          const filtered = videos.filter((v: any) => !DEMO_COURSE_IDS.includes(v.course_id));
          localStorage.setItem('ap_table_videos', JSON.stringify(filtered));
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Purge error:', err);
  }
}

/**
 * No-op to prevent re-seeding demo courses into the database.
 */
export async function seedRealCoursesToDatabase(): Promise<void> {
  purgeDemoCoursesAndVideos();
}
