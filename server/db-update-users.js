const pool = require('./db');

async function run() {
  const client = await pool.connect();
  try {
    // Удаляем старых ТД и ДФРС пользователей
    await client.query(`DELETE FROM users WHERE role IN ('td', 'dfrs')`);
    console.log('✅ Старые пользователи ТД/ДФРС удалены');

    // Добавляем ДФРС
    await client.query(
      `INSERT INTO users (role, login, td) VALUES ($1, $2, $3)`,
      ['dfrs', 'osemlyak.ludmila', 'Все']
    );
    console.log('✅ ДФРС добавлен');

    // Добавляем ТД
    const tdUsers = [
      { login: 'i.kabaev',        td: 'Урал' },
      { login: 'orlova.valeriya', td: 'Москва' },
      { login: 'basalaeva.olga',  td: 'Поволжье-Юг' },
      { login: 'mustina.oksana',  td: 'СПб' },
      { login: 'karhunen_m',      td: 'СЕВЕРО-ЗАПАД' },
    ];

    for (const u of tdUsers) {
      await client.query(
        `INSERT INTO users (role, login, td) VALUES ($1, $2, $3)`,
        ['td', u.login, u.td]
      );
      console.log(`✅ ТД ${u.td} (${u.login}) добавлен`);
    }

    console.log('🎉 Все пользователи обновлены!');
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

run();