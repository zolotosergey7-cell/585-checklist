const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('./auth');

// Создать новый чек-лист
router.post('/', authMiddleware, async (req, res) => {
  const { store, dgm_name, df_name, sp_name, tovar_name, sellers_name, answers, comments, score_percent } = req.body;
  const { td, filial } = req.user;

  try {
    const result = await pool.query(
      `INSERT INTO checks 
        (store, td, filial, dgm_name, df_name, sp_name, tovar_name, sellers_name, answers, comments, score_percent, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       RETURNING id`,
      [store, td, filial, dgm_name, df_name, sp_name, tovar_name, sellers_name,
       JSON.stringify(answers), JSON.stringify(comments), score_percent, req.user.id]
    );
    res.json({ success: true, check_id: result.rows[0].id });
  } catch (err) {
    console.error('Ошибка создания чек-листа:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все чек-листы (для ДГМ — только свои, для ТД — по дирекции, для ДФРС — все)
router.get('/', authMiddleware, async (req, res) => {
  const { role, td, filial } = req.user;

  try {
    let result;
    if (role === 'dfrs') {
      result = await pool.query('SELECT * FROM checks ORDER BY created_at DESC');
    } else if (role === 'td') {
      result = await pool.query('SELECT * FROM checks WHERE td = $1 ORDER BY created_at DESC', [td]);
    } else if (role === 'dgm') {
      result = await pool.query('SELECT * FROM checks WHERE filial = $1 ORDER BY created_at DESC', [filial]);
    } else if (role === 'dm') {
      result = await pool.query('SELECT * FROM checks WHERE store = $1 ORDER BY created_at DESC', [req.user.store]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения чек-листов:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить один чек-лист по ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM checks WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения чек-листа:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
