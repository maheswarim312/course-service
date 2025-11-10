import express from 'express';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse,
  assignTeacher,
  addMaterial,
  deleteMaterial
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

router.post('/:courseId/materials', checkAuth, isTeacherOrAdmin, addMaterial);
router.delete('/materials/:materialId', checkAuth, isTeacherOrAdmin, deleteMaterial);

export default router;