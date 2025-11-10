import db from '../models/index.js';
const { Course, Material, Schedule } = db;

export const createCourse = async (req, res) => {
  try {
    const { title, description, schedule, materials } = req.body;
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
      teacher_id,
      schedule: schedule,
      materials: materials || [],
    }, {
      include: ['schedule', 'materials']
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

    const { title, description, teacher_id, schedule } = req.body;
    let dataToUpdate = { title, description };

    if (editorRole === 'pengajar') {
      if (course.teacher_id !== editorId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar hanya bisa meng-edit course miliknya sendiri." });
      }
      if (teacher_id && teacher_id !== editorId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar tidak bisa mengganti 'teacher_id'. Hanya Admin yang bisa." });
      }
      dataToUpdate.teacher_id = editorId;
    } else if (editorRole === 'admin') {
      if (teacher_id) {
        dataToUpdate.teacher_id = teacher_id;
      }
    }

    await Course.update(dataToUpdate, { where: { id: courseId } });

    if (schedule) {
      await Schedule.upsert({
        course_id: courseId,
        day: schedule.day,
        time: schedule.time
      });
    }

    const updatedCourse = await Course.findByPk(courseId, { include: ['materials', 'schedule'] });
    res.json(updatedCourse);

  } catch (err) {
    res.status(500).json({ message: "Gagal update course", error: err.message, errors: err.errors });
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

// [POST] /api/courses/:courseId/materials
export const addMaterial = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { title, type, url } = req.body;
    const { id: userId, role: userRole } = req.user; 

    if (userRole === 'pengajar') {
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      if (course.teacher_id !== userId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar hanya bisa menambah material ke course miliknya." });
      }
    }

    const material = await Material.create({
      title,
      type,
      url,
      course_id: courseId
    });

    res.status(201).json(material);

  } catch (err) {
    res.status(500).json({ message: "Gagal menambah material", error: err.message });
  }
};

// [DELETE] /api/courses/materials/:materialId
export const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.materialId;
    const { id: userId, role: userRole } = req.user;

    const material = await Material.findByPk(materialId, {
      include: {
        model: Course,
        as: 'course' 
      }
    });

    if (!material) return res.status(404).json({ message: "Material not found" });

    if (userRole === 'pengajar') {
      if (material.course.teacher_id !== userId) {
        return res.status(403).json({ message: "Akses ditolak: Pengajar hanya bisa menghapus material dari course miliknya." });
      }
    }

    await material.destroy();

    res.json({ message: 'Material deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus material", error: err.message });
  }
};