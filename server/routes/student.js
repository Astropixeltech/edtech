import express from 'express';
import { db } from '../db/store.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get enrolled courses for student
router.get('/courses', verifyToken, (req, res) => {
  try {
    const enrollments = db.getEnrollments(req.user.id);
    const enrolledIds = enrollments.map(e => e.courseId);
    const allCourses = db.getCourses();
    
    // Return enrolled courses or all published courses for student
    const studentCourses = allCourses.filter(c => enrolledIds.includes(c.id) || c.is_published);
    const userProgress = db.getProgress(req.user.id);

    const withProgress = studentCourses.map(course => {
      const videos = course.videos || [];
      const totalVideos = videos.length;
      let completedCount = 0;

      const videosWithProg = videos.map(video => {
        const prog = userProgress[video.id] || null;
        if (prog && prog.is_completed) completedCount++;
        return { ...video, progress: prog };
      });

      const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

      return {
        ...course,
        videos: videosWithProg,
        total_videos: totalVideos,
        completed_videos: completedCount,
        progress_percent: progressPercent,
        is_completed: totalVideos > 0 && completedCount === totalVideos
      };
    });

    res.json({ courses: withProgress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student courses' });
  }
});

// Enroll in a course
router.post('/enroll', verifyToken, (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const enr = db.enrollStudent(req.user.id, courseId);
    res.json({ message: 'Enrolled successfully', enrollment: enr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Save video watching progress
router.post('/progress', verifyToken, (req, res) => {
  try {
    const { videoId, watched_seconds, progress_percent, is_completed } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const saved = db.saveProgress(req.user.id, videoId, {
      watched_seconds: Number(watched_seconds || 0),
      progress_percent: Math.min(Number(progress_percent || 0), 100),
      is_completed: Boolean(is_completed)
    });

    res.json({ message: 'Progress saved', progress: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get student certificates
router.get('/certificates', verifyToken, (req, res) => {
  try {
    const certs = db.getCertificates(req.user.id);
    res.json({ certificates: certs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Issue certificate
router.post('/certificates', verifyToken, (req, res) => {
  try {
    const { courseId, certificateId } = req.body;
    const cert = db.saveCertificate({
      userId: req.user.id,
      courseId,
      certificateId: certificateId || `CERT-${Date.now()}`,
      studentName: req.user.fullName
    });
    res.json({ message: 'Certificate issued successfully', certificate: cert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

export default router;
