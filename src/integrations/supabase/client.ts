// 100% Local Autonomous Database & Auth Client for Astropixel Learn EdTech Platform
// Completely independent of external Supabase servers.
import type { Database } from './types';
import { DEMO_COURSE_IDS } from '@/lib/seedCourses';

function safeGetStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function safeSetStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

const authListeners = new Set<(event: string, session: any) => void>();

// Clean up any historical demo courses from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('ap_courses_seeded');
    localStorage.removeItem('ap_courses_seeded');
    const coursesRaw = localStorage.getItem('ap_table_courses');
    if (coursesRaw) {
      const courses = JSON.parse(coursesRaw);
      if (Array.isArray(courses)) {
        const clean = courses.filter((c: any) => !DEMO_COURSE_IDS.includes(c.id));
        if (clean.length !== courses.length) {
          localStorage.setItem('ap_table_courses', JSON.stringify(clean));
        }
      }
    }
    const videosRaw = localStorage.getItem('ap_table_videos');
    if (videosRaw) {
      const videos = JSON.parse(videosRaw);
      if (Array.isArray(videos)) {
        const clean = videos.filter((v: any) => !DEMO_COURSE_IDS.includes(v.course_id));
        if (clean.length !== videos.length) {
          localStorage.setItem('ap_table_videos', JSON.stringify(clean));
        }
      }
    }
  } catch {}
}

// Local Database tables in LocalStorage
const getTableData = (tableName: string): any[] => {
  const customKey = `ap_table_${tableName}`;
  const existing = safeGetStorage<any[]>(customKey, []);

  // Filter out any leftover demo items
  if (tableName === 'courses' && existing.length > 0) {
    const cleaned = existing.filter((c: any) => !DEMO_COURSE_IDS.includes(c.id));
    if (cleaned.length !== existing.length) {
      safeSetStorage(customKey, cleaned);
    }
    return cleaned;
  }

  if (tableName === 'videos' && existing.length > 0) {
    const cleaned = existing.filter((v: any) => !DEMO_COURSE_IDS.includes(v.course_id));
    if (cleaned.length !== existing.length) {
      safeSetStorage(customKey, cleaned);
    }
    return cleaned;
  }

  return existing;
};

const setTableData = (tableName: string, data: any[]) => {
  safeSetStorage(`ap_table_${tableName}`, data);
};

class MockQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private tableName: string;
  private filters: Array<{ col: string; op: string; val: any }> = [];
  private isSingle = false;
  private isMaybeSingle = false;
  private limitCount?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string) { return this; }
  eq(col: string, val: any) { this.filters.push({ col, op: 'eq', val }); return this; }
  neq(col: string, val: any) { this.filters.push({ col, op: 'neq', val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ col, op: 'in', val: vals }); return this; }
  order(col: string, opts?: any) { return this; }
  limit(n: number) { this.limitCount = n; return this; }
  range(from: number, to: number) { return this; }
  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybeSingle = true; return this; }

  async insert(values: any) {
    const list = getTableData(this.tableName);
    const newItems = Array.isArray(values) ? values : [values];
    const prepared = newItems.map(item => ({
      id: item.id || `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      ...item
    }));
    const updated = [...prepared, ...list];
    setTableData(this.tableName, updated);
    return { data: Array.isArray(values) ? prepared : prepared[0], error: null };
  }

  async update(values: any) {
    let list = getTableData(this.tableName);
    list = list.map(item => {
      let matches = true;
      for (const f of this.filters) {
        if (f.op === 'eq' && item[f.col] !== f.val) matches = false;
      }
      return matches ? { ...item, ...values } : item;
    });
    setTableData(this.tableName, list);
    return { data: values, error: null };
  }

  async upsert(values: any, options?: any) {
    return this.insert(values);
  }

  async delete() {
    let list = getTableData(this.tableName);
    list = list.filter(item => {
      let matches = true;
      for (const f of this.filters) {
        if (f.op === 'eq' && item[f.col] === f.val) matches = false;
      }
      return matches;
    });
    setTableData(this.tableName, list);
    return { data: true, error: null };
  }

  private execute() {
    let list = getTableData(this.tableName);

    for (const f of this.filters) {
      if (f.op === 'eq') {
        list = list.filter(item => item[f.col] === f.val);
      } else if (f.op === 'neq') {
        list = list.filter(item => item[f.col] !== f.val);
      } else if (f.op === 'in') {
        const setVals = new Set(Array.isArray(f.val) ? f.val : [f.val]);
        list = list.filter(item => setVals.has(item[f.col]));
      }
    }

    if (this.limitCount !== undefined) {
      list = list.slice(0, this.limitCount);
    }

    if (this.isSingle || this.isMaybeSingle) {
      return { data: list[0] || null, error: null };
    }

    return { data: list, error: null };
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected);
  }
}

export const supabase: any = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },

  auth: {
    async getSession() {
      const user = safeGetStorage<any>('ap_user', null);
      if (!user) return { data: { session: null }, error: null };
      const session = {
        access_token: 'local-access-token',
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: 'local-refresh-token',
        user,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };
      return { data: { session }, error: null };
    },

    async getUser() {
      const user = safeGetStorage<any>('ap_user', null);
      return { data: { user }, error: null };
    },

    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const isDomainAdmin = email.includes('admin');
      const isDomainTeacher = email.includes('teacher');
      const role = isDomainAdmin ? 'admin' : isDomainTeacher ? 'teacher' : 'student';

      const user = {
        id: `user-${role}-001`,
        email,
        user_metadata: { full_name: email.split('@')[0] },
        app_metadata: { role },
      };

      const session = {
        access_token: 'local-token',
        token_type: 'bearer',
        user,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };

      safeSetStorage('ap_user', user);
      safeSetStorage('ap_role', role);

      authListeners.forEach(cb => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },

    async signUp({ email, password, options }: any) {
      const user = {
        id: `user-student-${Date.now()}`,
        email,
        user_metadata: { full_name: options?.data?.full_name || email.split('@')[0] },
        app_metadata: { role: 'student' },
      };

      const session = {
        access_token: 'local-token',
        token_type: 'bearer',
        user,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };

      safeSetStorage('ap_user', user);
      safeSetStorage('ap_role', 'student');

      authListeners.forEach(cb => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },

    async signOut() {
      safeSetStorage('ap_user', null);
      safeSetStorage('ap_role', null);
      safeSetStorage('ap_profile', null);
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(callback),
          },
        },
      };
    },

    async resetPasswordForEmail() {
      return { data: {}, error: null };
    },

    async updateUser(attributes: any) {
      const current = safeGetStorage<any>('ap_user', {});
      const updated = { ...current, ...attributes };
      safeSetStorage('ap_user', updated);
      return { data: { user: updated }, error: null };
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: any) {
          return { data: { path: `local-uploads/${path}` }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: path } };
        },
      };
    },
  },

  functions: {
    async invoke(fnName: string) {
      return {
        data: {
          cloudName: 'u1tmgtke',
          apiKey: '794196418432486',
          timestamp: Math.floor(Date.now() / 1000),
          signature: 'local-signature',
          folder: 'courses',
        },
        error: null,
      };
    },
  },

  async rpc() {
    return { data: null, error: null };
  },

  channel(name: string) {
    const mockChannel = {
      on: (event: string, opts: any, callback: any) => mockChannel,
      subscribe: (callback?: any) => {
        if (typeof callback === 'function') callback('SUBSCRIBED');
        return mockChannel;
      },
      unsubscribe: () => {},
    };
    return mockChannel;
  },

  removeChannel(ch: any) {
    if (ch && typeof ch.unsubscribe === 'function') {
      ch.unsubscribe();
    }
  },
};
