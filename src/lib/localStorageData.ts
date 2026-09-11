// Local device storage utility for Astropixel Learn
// Ensures course progress, enrollment, and certificates persist on device even without Supabase auth

export interface LocalVideoProgress {
  videoId: string;
  watched_seconds: number;
  last_position: number;
  is_completed: boolean;
  progress_percent: number;
  last_watched_at: string;
}

const STORAGE_KEYS = {
  VIDEO_PROGRESS: 'ap_local_video_progress',
  ENROLLED_COURSES: 'ap_local_enrolled_courses',
  COURSE_COMPLETIONS: 'ap_local_course_completions',
};

function safeGetJSON<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save to localStorage for key ${key}:`, err);
  }
}

// ── Video Progress ─────────────────────────────────────────────────────────

export function getLocalVideoProgress(userId: string = 'default', videoId: string): LocalVideoProgress | null {
  if (!videoId) return null;
  const all = safeGetJSON<Record<string, Record<string, LocalVideoProgress>>>(STORAGE_KEYS.VIDEO_PROGRESS, {});
  return all[userId]?.[videoId] || null;
}

export function getAllLocalProgressForUser(userId: string = 'default'): Record<string, LocalVideoProgress> {
  const all = safeGetJSON<Record<string, Record<string, LocalVideoProgress>>>(STORAGE_KEYS.VIDEO_PROGRESS, {});
  return all[userId] || {};
}

export function saveLocalVideoProgress(
  userId: string = 'default',
  videoId: string,
  progress: Partial<LocalVideoProgress>
): LocalVideoProgress {
  const all = safeGetJSON<Record<string, Record<string, LocalVideoProgress>>>(STORAGE_KEYS.VIDEO_PROGRESS, {});
  if (!all[userId]) {
    all[userId] = {};
  }

  const existing = all[userId][videoId] || {
    videoId,
    watched_seconds: 0,
    last_position: 0,
    is_completed: false,
    progress_percent: 0,
    last_watched_at: new Date().toISOString(),
  };

  const updated: LocalVideoProgress = {
    ...existing,
    ...progress,
    last_watched_at: new Date().toISOString(),
    // ensure completion is permanent once true
    is_completed: progress.is_completed !== undefined ? progress.is_completed : existing.is_completed,
    watched_seconds: Math.max(existing.watched_seconds, progress.watched_seconds || 0),
  };

  all[userId][videoId] = updated;
  safeSetJSON(STORAGE_KEYS.VIDEO_PROGRESS, all);
  return updated;
}

// ── Enrolled Courses ───────────────────────────────────────────────────────

export function getLocalEnrolledCourses(userId: string = 'default'): string[] {
  const all = safeGetJSON<Record<string, string[]>>(STORAGE_KEYS.ENROLLED_COURSES, {});
  return all[userId] || [];
}

export function enrollLocalCourse(userId: string = 'default', courseId: string): void {
  if (!courseId) return;
  const all = safeGetJSON<Record<string, string[]>>(STORAGE_KEYS.ENROLLED_COURSES, {});
  if (!all[userId]) all[userId] = [];
  if (!all[userId].includes(courseId)) {
    all[userId].push(courseId);
    safeSetJSON(STORAGE_KEYS.ENROLLED_COURSES, all);
  }
}

// ── Course Completions & Certificates ──────────────────────────────────────

export interface LocalCourseCompletion {
  courseId: string;
  certificateId: string;
  completedAt: string;
  studentName?: string;
}

export function getLocalCourseCompletions(userId: string = 'default'): Record<string, LocalCourseCompletion> {
  const all = safeGetJSON<Record<string, Record<string, LocalCourseCompletion>>>(STORAGE_KEYS.COURSE_COMPLETIONS, {});
  return all[userId] || {};
}

export function saveLocalCourseCompletion(
  userId: string = 'default',
  courseId: string,
  certificateId: string,
  studentName?: string
): void {
  if (!courseId) return;
  const all = safeGetJSON<Record<string, Record<string, LocalCourseCompletion>>>(STORAGE_KEYS.COURSE_COMPLETIONS, {});
  if (!all[userId]) all[userId] = {};
  all[userId][courseId] = {
    courseId,
    certificateId,
    completedAt: new Date().toISOString(),
    studentName,
  };
  safeSetJSON(STORAGE_KEYS.COURSE_COMPLETIONS, all);
}
