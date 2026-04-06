const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Роуты
const authRoutes = require('./routes/auth');
const checksRoutes = require('./routes/checks');
const tasksRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/checks', checksRoutes);
app.use('/api/tasks', tasksRoutes);

// Все остальные запросы — отдаём index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});