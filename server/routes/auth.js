const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Логин
router.post('/login', async (req, res) => {
  const { login, password, role } = req.body;

  if (password !== '585') {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE role = $1 AND LOWER(login) = LOWER($2)',
      [role, login]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        login: user.login,
        td: user.td,
        filial: user.filial,
        store: user.store
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        login: user.login,
        td: user.td,
        filial: user.filial,
        store: user.store
      }
    });

  } catch (err) {
    console.error('Ошибка авторизации:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Middleware проверки токена
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Токен недействителен' });
  }
}

module.exports = router;
module.exports.authMiddleware = authMiddleware;