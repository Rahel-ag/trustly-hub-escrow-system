exports.up = (pgm) => {
  pgm.createTable('payout_configs', {
    id:       { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id:  { type: 'uuid', notNull: true, unique: true, references: '"users"', onDelete: 'CASCADE' },
    method:   { type: 'text', notNull: true },
    account:  { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('payout_configs');
};
