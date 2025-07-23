// ts-ignore disables type check just for this line
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import knexConfig from './knexfile';
import knex from 'knex';

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

(async () => {
  try {
    const result = await db.raw('SELECT 1 + 1 AS result');
    console.log('✅ DB Connection Successful:', result[0]);
  } catch (error) {
    console.error('❌ DB Connection Failed:', error);
  } finally {
    await db.destroy();
  }
})();
