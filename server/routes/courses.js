import express from 'express';
import { db } from '../db/store.js';
import { verifyToken, requireTeacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', (req, res) => {
  try {
    const courses = db.getCourses();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course by ID
router.get('/:id', (req, res) => {
  try {
    const course = db.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Create new course (Protected: Instructor / Admin)
router.post('/', verifyToken, requireTeacherOrAdmin, (req, res) => {
  try {
    const { title, description, category, price, thumbnail_url, videos } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      description: description || '',
      category: category || 'General',
      price: price ? Number(price) : 0,
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1200&auto=format&fit=crop',
      is_published: true,
      trainer_name: req.user.fullName || 'Astropixel Instructor',
      videos: videos || [],
    };

    db.saveCourse(newCourse);
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (Protected: Instructor / Admin)
router.put('/:id', verifyToken, requireTeacherOrAdmin, (req, res) => {
  try {
    const existing = db.getCourseById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updated = db.saveCourse({
      ...existing,
      ...req.body,
      id: req.params.id
    });

    res.json({ message: 'Course updated successfully', course: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (Protected: Instructor / Admin)
router.delete('/:id', verifyToken, requireTeacherOrAdmin, (req, res) => {
  try {
    db.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
