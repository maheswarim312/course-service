import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AUTH_SERVICE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000/api';

export const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).json({ message: "Akses ditolak: Token tidak ada." });
    }

    const authResponse = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (authResponse.status === 200 && authResponse.data.status === 'success') {
      req.user = authResponse.data.data;
      next();
    } else {
      // Kirim pesan error dari API (jika ada)
      res.status(401).json({ message: authResponse.data.message || "Token tidak valid." });
    }

  } catch (error) {
    if (error.response && error.response.status === 401) {
         return res.status(401).json({ message: "Token tidak valid atau kadaluwarsa." });
    }
    console.error("Auth Middleware Error:", error.message);
    res.status(500).json({ message: "Gagal menghubungi service otentikasi." });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak: Hanya untuk Admin." });
  }
};

export const isTeacherOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'pengajar')) {
    next(); // Lolos, dia admin ATAU pengajar
  } else {
    res.status(403).json({ message: "Akses ditolak: Hanya untuk Admin atau Pengajar." });
  }
};