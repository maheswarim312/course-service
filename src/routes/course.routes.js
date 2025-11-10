import express from 'express';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse,
  assignTeacher
} from '../controllers/course.controller.js';

import { checkAuth, isAdmin, isTeacherOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', checkAuth, getAllCourses);
router.get('/:id', checkAuth, getCourseById);

// --- Rute Pengajar & Admin ---
router.post('/', checkAuth, isTeacherOrAdmin, createCourse);
router.put('/:id', checkAuth, isTeacherOrAdmin, updateCourse);
router.delete('/:id', checkAuth, isTeacherOrAdmin, deleteCourse);

// --- Rute Admin Only ---
router.post('/:id/assign-teacher', checkAuth, isAdmin, assignTeacher);
export default router;