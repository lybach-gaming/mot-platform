const TABLE_NAME = 'tbl_users';

exports.up = async function (knex) {
  const hasLocaleColumn = await knex.schema.hasColumn(TABLE_NAME, 'locale');
  const hasTimezoneColumn = await knex.schema.hasColumn(TABLE_NAME, 'timezone');

  await knex.schema.alterTable(TABLE_NAME, (table) => {
    if (!hasLocaleColumn) {
      table.string('locale', 10).defaultTo('en').comment('User preferred locale/language');
    }
    if (!hasTimezoneColumn) {
      table.string('timezone', 50).nullable().comment('User preferred timezone');
    }
  });
};

exports.down = async function (knex) {
  const hasLocaleColumn = await knex.schema.hasColumn(TABLE_NAME, 'locale');
  const hasTimezoneColumn = await knex.schema.hasColumn(TABLE_NAME, 'timezone');

  await knex.schema.alterTable(TABLE_NAME, (table) => {
    if (hasTimezoneColumn) {
      table.dropColumn('timezone');
    }
    if (hasLocaleColumn) {
      table.dropColumn('locale');
    }
  });
};

