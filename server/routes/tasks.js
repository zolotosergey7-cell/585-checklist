const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('./auth');

// Создать задачи по итогам проверки
router.post('/', authMiddleware, async (req, res) => {
  const { tasks, check_id, store } = req.body;

  try {
    for (const task of tasks) {
      await pool.query(
        `INSERT INTO tasks (check_id, store, text, deadline, auto, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'new', NOW())`,
        [check_id, store, task.text, task.deadline || null, task.auto || false]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка создания задач:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить задачи (ДМ — только свои, ДГМ — по филиалу, ТД/ДФРС — все)
router.get('/', authMiddleware, async (req, res) => {
  const { role, filial, store } = req.user;

  try {
    let result;
    if (role === 'dm') {
      result = await pool.query(
        'SELECT * FROM tasks WHERE store = $1 ORDER BY created_at DESC',
        [store]
      );
    } else if (role === 'dgm') {
      result = await pool.query(
        `SELECT t.* FROM tasks t
         JOIN checks c ON t.check_id = c.id
         WHERE c.filial = $1
         ORDER BY t.created_at DESC`,
        [filial]
      );
    } else {
      result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения задач:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ДМ отмечает задачу выполненной
router.patch('/:id/done', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      `UPDATE tasks SET status = 'pending_confirm', done_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка обновления задачи:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ДГМ подтверждает выполнение
router.patch('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      `UPDATE tasks SET status = 'closed', confirmed_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка подтверждения задачи:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ДГМ отклоняет выполнение
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  const { comment } = req.body;
  try {
    await pool.query(
      `UPDATE tasks SET status = 'in_work', reject_comment = $1 WHERE id = $2`,
      [comment || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка отклонения задачи:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;