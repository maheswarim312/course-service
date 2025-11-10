import db from '../models/index.js';
const { Course, Material, Schedule } = db;

export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const creatorRole = req.user.role;
    const creatorId = req.user.id;

    let teacher_id = null; // Default

    if (creatorRole === 'pengajar') {
      teacher_id = creatorId;
    } else if (creatorRole === 'admin') {
      teacher_id = req.body.teacher_id || null;
    }

    const course = await Course.create({
      title,
      description,
      teacher_id
    });

    const newCourse = await Course.findByPk(course.id, { include: ['materials', 'schedule'] });
    res.status(201).json(newCourse);

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
    const courseId = req.params.id;
    const editorRole = req.user.role;
    const editorId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const dataToUpdate = req.body;

    if (editorRole === 'pengajar') {
      if (course.teacher_id !== editorId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar hanya bisa meng-edit course miliknya sendiri." });
      }

      if (dataToUpdate.teacher_id && dataToUpdate.teacher_id !== editorId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar tidak bisa mengganti 'teacher_id'. Hanya Admin yang bisa." });
      }

      dataToUpdate.teacher_id = editorId; 
    }

    const [updated] = await Course.update(dataToUpdate, { where: { id: courseId } });

    const updatedCourse = await Course.findByPk(courseId, { include: ['materials', 'schedule'] });
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