exports.up = (pgm) => {
  pgm.createTable('saved_jobs', {
    id:       { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id:  { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    job_id:   { type: 'uuid', notNull: true, references: '"jobs"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('saved_jobs', 'unique_user_job', {
    unique: ['user_id', 'job_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('saved_jobs');
};
