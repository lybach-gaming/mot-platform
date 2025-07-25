const TABLE_NAME = 'tbl_users_badges';
const INDEX_NAME = 'idx_user_id';
const COLUMN = 'user_id';

exports.up = async function (knex) {
  const hasIndex = await knex.raw(`
    SELECT COUNT(1) AS found
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND index_name = ?
  `, [TABLE_NAME, INDEX_NAME]);

  if (!hasIndex[0][0].found) {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.index([COLUMN], INDEX_NAME);
    });
  }
};

exports.down = async function (knex) {
  const hasIndex = await knex.raw(`
    SELECT COUNT(1) AS found
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND index_name = ?
  `, [TABLE_NAME, INDEX_NAME]);

  if (hasIndex[0][0].found) {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.dropIndex([COLUMN], INDEX_NAME);
    });
  }
};