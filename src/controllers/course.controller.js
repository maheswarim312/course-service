import db from "../models/index.js";
import axios from "axios";
const { Course, Material, Schedule } = db;

export const createCourse = async (req, res) => {
  try {
    const { title, description, schedule, materials, thumbnail, category } =
      req.body;
    const creatorRole = req.user.role;
    const creatorId = req.user.id;

    let teacher_id = null; // Default

    if (creatorRole === "pengajar") {
      teacher_id = creatorId;
    } else if (creatorRole === "admin") {
      teacher_id = req.body.teacher_id || null;
    }

    const course = await Course.create(
      {
        title,
        description,
        teacher_id,
        schedule: schedule,
        materials: materials || [],
        thumbnail: thumbnail,
        category: category,
      },
      {
        include: ["schedule", "materials"],
      }
    );

    const newCourse = await Course.findByPk(course.id, {
      include: ["materials", "schedule"],
    });
    res.status(201).json({
      status: "success",
      message: "Kursus berhasil dibuat",
      data: newCourse,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal membuat course: " + err.message,
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { teacher_id } = req.query;
    const whereClause = {};
    if (teacher_id) {
      whereClause.teacher_id = teacher_id;
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: ["materials", "schedule"],
    });
    res.json({
      status: "success",
      message: "Semua kursus berhasil diambil",
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil kursus",
      error: err.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: ["materials", "schedule"],
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const AUTH_SERVICE_URL = process.env.USER_SERVICE_URL;
    let instructorName = "N/A";

    if (course.teacher_id && AUTH_SERVICE_URL) {
      try {
        const token = req.headers["authorization"];

        const userRes = await axios.get(
          `${AUTH_SERVICE_URL}/api/users/${course.teacher_id}`,
          {
            headers: { Authorization: token, Accept: "application/json" },
          }
        );

        if (userRes.data.status === "success" && userRes.data.data.name) {
          instructorName = userRes.data.data.name;
        }
      } catch (err) {
        console.error("Gagal fetch instructor name:", err.message);
        instructorName = "Teacher Not Found";
      }
    }
    const courseJSON = course.toJSON();
    courseJSON.instructor = instructorName;

    res.json({
      status: "success",
      message: "Detail kursus berhasil diambil",
      data: courseJSON,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail kursus",
      error: err.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const editorRole = req.user.role;
    const editorId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    const { title, description, teacher_id, schedule, thumbnail, category } =
      req.body;
    let dataToUpdate = { title, description, thumbnail, category };

    if (editorRole === "pengajar") {
      if (course.teacher_id !== editorId) {
        return res.status(403).json({
          status: "error",
          message:
            "Akses ditolak: Pengajar hanya bisa meng-edit course miliknya sendiri.",
        });
      }
      if (teacher_id && teacher_id !== editorId) {
        return res.status(403).json({
          status: "error",
          message:
            "Akses ditolak: Pengajar tidak bisa mengganti 'teacher_id'. Hanya Admin yang bisa.",
        });
      }
      dataToUpdate.teacher_id = editorId;
    } else if (editorRole === "admin") {
      if (teacher_id) {
        dataToUpdate.teacher_id = teacher_id;
      }
    }

    await Course.update(dataToUpdate, { where: { id: courseId } });

    if (schedule) {
      await Schedule.upsert({
        course_id: courseId,
        day: schedule.day,
        time: schedule.time,
      });
    }

    const updatedCourse = await Course.findByPk(courseId, {
      include: ["materials", "schedule"],
    });
    res.json({
      status: "success",
      message: "Kursus berhasil diupdate",
      data: updatedCourse,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal update course",
      error: err.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    if (req.user.role === "pengajar" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message:
          "Akses ditolak: Pengajar hanya bisa menghapus course miliknya.",
      });
    }

    await course.destroy(); // Hapus yg sudah ditemukan
    res.json({ status: "success", message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const assignTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.body;
    if (!teacher_id) {
      return res
        .status(422)
        .json({ status: "error", message: "teacher_id wajib diisi" });
    }

    const [updated] = await Course.update(
      { teacher_id: teacher_id },
      { where: { id: req.params.id } }
    );

    if (!updated)
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });

    const updatedCourse = await Course.findByPk(req.params.id, {
      include: ["materials", "schedule"],
    });
    res.json({
      status: "success",
      message: "Kursus berhasil diupdate",
      data: updatedCourse,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// [POST] /api/courses/:courseId/materials
export const addMaterial = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { title, type, url } = req.body;
    const { id: userId, role: userRole } = req.user;

    if (userRole === "pengajar") {
      const course = await Course.findByPk(courseId);
      if (!course)
        return res
          .status(404)
          .json({ status: "error", message: "Course not found" });

      if (course.teacher_id !== userId) {
        return res.status(403).json({
          status: "error",
          message:
            "Akses ditolak: Pengajar hanya bisa menambah material ke course miliknya.",
        });
      }
    }

    const material = await Material.create({
      title,
      type,
      url,
      course_id: courseId,
    });

    res.status(201).json({
      status: "success",
      message: "Material berhasil ditambahkan",
      data: material,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan material",
      error: err.message,
    });
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
        as: "course",
      },
    });

    if (!material)
      return res
        .status(404)
        .json({ status: "error", message: "Material not found" });

    if (userRole === "pengajar") {
      if (material.course.teacher_id !== userId) {
        return res.status(403).json({
          status: "error",
          message:
            "Akses ditolak: Pengajar hanya bisa menghapus material dari course miliknya.",
        });
      }
    }

    await material.destroy();

    res.json({
      status: "success",
      message: "Material berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus material",
      error: err.message,
    });
  }
};
