import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { INITIAL_REAL_YOUTUBE_COURSES } from '../../src/lib/seedCourses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultAdminHash = bcrypt.hashSync('admin123', 10);
const defaultTeacherHash = bcrypt.hashSync('teacher123', 10);
const defaultStudentHash = bcrypt.hashSync('student123', 10);

const DEFAULT_DB = {
  users: [
    {
      id: 'usr-admin-001',
      email: 'admin@astropixel.online',
      passwordHash: defaultAdminHash,
      fullName: 'Astropixel Chief Admin',
      role: 'admin',
      phoneNumber: '01700000000',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      bio: 'Platform System Administrator',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-teacher-001',
      email: 'teacher@astropixel.online',
      passwordHash: defaultTeacherHash,
      fullName: 'Engr. Tanvir Ahmed',
      role: 'teacher',
      phoneNumber: '01800000000',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      bio: 'Lead Physics & Engineering Instructor (BUET)',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-student-001',
      email: 'student@astropixel.online',
      passwordHash: defaultStudentHash,
      fullName: 'Demo Student',
      role: 'student',
      phoneNumber: '01900000000',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      bio: 'HSC Science Student',
      createdAt: new Date().toISOString()
    }
  ],
  courses: INITIAL_REAL_YOUTUBE_COURSES || [],
  enrollments: [
    { id: 'enr-1', userId: 'usr-student-001', courseId: 'course-hsc-physics-mastery', enrolledAt: new Date().toISOString() }
  ],
  progress: {},
  certificates: [],
  settings: {
    siteName: 'Astropixel Learn',
    contactEmail: 'support@astropixel.online',
    contactPhone: '+880 1700 000000'
  }
};

class DBStore {
  private data: typeof DEFAULT_DB;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): typeof DEFAULT_DB {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn('Failed to read db.json, using default DB:', e);
    }
    this.saveData(DEFAULT_DB);
    return DEFAULT_DB;
  }

  private saveData(data: typeof DEFAULT_DB) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  getUsers() { return this.data.users; }
  getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  
  addUser(user: any) {
    this.data.users.push(user);
    this.saveData(this.data);
    return user;
  }

  updateUser(id: string, updates: any) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData(this.data);
      return this.data.users[idx];
    }
    return null;
  }

  getCourses() { return this.data.courses; }
  getCourseById(id: string) { return this.data.courses.find(c => c.id === id); }
  
  saveCourse(course: any) {
    const idx = this.data.courses.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      this.data.courses[idx] = { ...this.data.courses[idx], ...course, updated_at: new Date().toISOString() };
    } else {
      this.data.courses.unshift({ ...course, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    this.saveData(this.data);
    return course;
  }

  deleteCourse(id: string) {
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    this.saveData(this.data);
    return true;
  }

  getEnrollments(userId: string) {
    return this.data.enrollments.filter(e => e.userId === userId);
  }

  enrollStudent(userId: string, courseId: string) {
    const exists = this.data.enrollments.some(e => e.userId === userId && e.courseId === courseId);
    if (!exists) {
      const enr = { id: `enr-${Date.now()}`, userId, courseId, enrolledAt: new Date().toISOString() };
      this.data.enrollments.push(enr);
      this.saveData(this.data);
      return enr;
    }
    return null;
  }

  getProgress(userId: string) {
    return this.data.progress[userId] || {};
  }

  saveProgress(userId: string, videoId: string, progressObj: any) {
    if (!this.data.progress[userId]) {
      this.data.progress[userId] = {};
    }
    const existing = this.data.progress[userId][videoId] || {};
    this.data.progress[userId][videoId] = {
      ...existing,
      ...progressObj,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return this.data.progress[userId][videoId];
  }

  getCertificates(userId: string) {
    return this.data.certificates.filter(c => c.userId === userId);
  }

  saveCertificate(cert: any) {
    this.data.certificates.push({ ...cert, issuedAt: new Date().toISOString() });
    this.saveData(this.data);
    return cert;
  }
}

export const db = new DBStore();
