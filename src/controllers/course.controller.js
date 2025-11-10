import db from '../models/index.js';
const { Course, Material, Schedule } = db;

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({ include: ['materials', 'schedule'] });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, { include: ['materials', 'schedule'] });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const [updated] = await Course.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Course not found' });

    const updatedCourse = await Course.findByPk(req.params.id, { include: ['materials', 'schedule'] });
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const assignTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.body;
    if (!teacher_id) {
      return res.status(422).json({ message: "teacher_id wajib diisi" });
    }

    const [updated] = await Course.update(
      { teacher_id: teacher_id }, 
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Course not found' });

    const updatedCourse = await Course.findByPk(req.params.id, { include: ['materials', 'schedule'] });
    res.json(updatedCourse);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};