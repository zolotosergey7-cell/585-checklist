const pool = require('./db');

async function init() {
  try {
    // Таблица пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        role VARCHAR(10) NOT NULL,
        login VARCHAR(255) NOT NULL UNIQUE,
        td VARCHAR(100),
        filial VARCHAR(100),
        store VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица users создана');

    // Таблица чек-листов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checks (
        id SERIAL PRIMARY KEY,
        store VARCHAR(255),
        td VARCHAR(100),
        filial VARCHAR(100),
        dgm_name VARCHAR(255),
        df_name VARCHAR(255),
        sp_name VARCHAR(255),
        tovar_name VARCHAR(255),
        sellers_name VARCHAR(255),
        answers JSONB,
        comments JSONB,
        score_percent INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица checks создана');

    // Таблица задач
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        check_id INTEGER REFERENCES checks(id),
        store VARCHAR(255),
        text TEXT,
        deadline DATE,
        auto BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'new',
        reject_comment TEXT,
        done_at TIMESTAMP,
        confirmed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица tasks создана');

    // Заполняем пользователей ДГМ
    const dgmUsers = [
      // Поволжье-Юг
      { td: 'Поволжье-Юг', filial: 'Самара' },
      { td: 'Поволжье-Юг', filial: 'Пенза' },
      { td: 'Поволжье-Юг', filial: 'Уфа' },
      { td: 'Поволжье-Юг', filial: 'Казань' },
      { td: 'Поволжье-Юг', filial: 'Чебоксары' },
      { td: 'Поволжье-Юг', filial: 'Краснодар' },
      { td: 'Поволжье-Юг', filial: 'Ставрополь' },
      { td: 'Поволжье-Юг', filial: 'Сочи' },
      { td: 'Поволжье-Юг', filial: 'Северный Кавказ' },
      { td: 'Поволжье-Юг', filial: 'Волгоград' },
      // Урал
      { td: 'Урал', filial: 'Пермь' },
      { td: 'Урал', filial: 'Екатеринбург 1' },
      { td: 'Урал', filial: 'Екатеринбург 2' },
      { td: 'Урал', filial: 'Челябинск' },
      { td: 'Урал', filial: 'Тюмень' },
      { td: 'Урал', filial: 'Новосибирск' },
      { td: 'Урал', filial: 'Кемерово' },
      // Москва
      { td: 'Москва', filial: 'Москва 1' },
      { td: 'Москва', filial: 'Москва 2' },
      { td: 'Москва', filial: 'Москва 3' },
      { td: 'Москва', filial: 'Москва 4' },
      { td: 'Москва', filial: 'Москва 5' },
      // СЕВЕРО-ЗАПАД
      { td: 'СЕВЕРО-ЗАПАД', filial: 'Архангельск-Мурманск' },
      { td: 'СЕВЕРО-ЗАПАД', filial: 'Великий Новгород' },
      { td: 'СЕВЕРО-ЗАПАД', filial: 'Вологда' },
      { td: 'СЕВЕРО-ЗАПАД', filial: 'Петрозаводск' },
      { td: 'СЕВЕРО-ЗАПАД', filial: 'Сыктывкар' },
      // СПб
      { td: 'СПб', filial: 'СПб 1' },
      { td: 'СПб', filial: 'СПб 2' },
      { td: 'СПб', filial: 'СПб 3' },
      { td: 'СПб', filial: 'СПб 4' },
      { td: 'СПб', filial: 'СПб 5' },
    ];

    for (const u of dgmUsers) {
      await pool.query(
        `INSERT INTO users (role, login, td, filial)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (login) DO NOTHING`,
        ['dgm', u.filial, u.td, u.filial]
      );
    }
    console.log('✅ Пользователи ДГМ добавлены');

    // ТД пользователи
    const tdUsers = [
      { td: 'Поволжье-Юг', login: 'тд-поволжье-юг' },
      { td: 'Урал', login: 'тд-урал' },
      { td: 'Москва', login: 'тд-москва' },
      { td: 'СЕВЕРО-ЗАПАД', login: 'тд-северо-запад' },
      { td: 'СПб', login: 'тд-спб' },
    ];

    for (const u of tdUsers) {
      await pool.query(
        `INSERT INTO users (role, login, td)
         VALUES ($1, $2, $3)
         ON CONFLICT (login) DO NOTHING`,
        ['td', u.login, u.td]
      );
    }
    console.log('✅ Пользователи ТД добавлены');

    // ДФРС
    await pool.query(
      `INSERT INTO users (role, login)
       VALUES ($1, $2)
       ON CONFLICT (login) DO NOTHING`,
      ['dfrs', 'дфрс']
    );
    console.log('✅ Пользователь ДФРС добавлен');

    console.log('🎉 База данных инициализирована успешно!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Ошибка инициализации БД:', err.message);
    process.exit(1);
  }
}

init();