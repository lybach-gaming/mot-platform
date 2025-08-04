const TABLE_NAME = 'tbl_question';

exports.up = async function (knex) {
  console.log(
    `[Migration UP] Allow NULL for level, note, is_public in ${TABLE_NAME}`
  );

  await knex.schema.raw(`
    ALTER TABLE ${TABLE_NAME}
      MODIFY COLUMN \`level\` INT NULL,
      MODIFY COLUMN \`note\` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
      MODIFY COLUMN \`is_public\` TINYINT NULL DEFAULT 1 COMMENT '0 - no , 1 - yes';
  `);
};

exports.down = async function (knex) {
  console.log(
    `[Migration DOWN] Revert level, note, is_public to NOT NULL in ${TABLE_NAME}`
  );

  await knex.schema.raw(`
    ALTER TABLE ${TABLE_NAME}
      MODIFY COLUMN \`level\` INT NOT NULL,
      MODIFY COLUMN \`note\` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      MODIFY COLUMN \`is_public\` TINYINT NOT NULL COMMENT '0 - no , 1 - yes';
  `);
};
