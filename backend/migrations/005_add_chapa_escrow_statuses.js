exports.up = (pgm) => {
  pgm.sql("ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'funded'");
  pgm.sql("ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'submitted'");
  pgm.sql("ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'released'");
};

exports.down = (pgm) => {
  pgm.sql("ALTER TYPE escrow_status RENAME TO escrow_status_old");
  pgm.sql("CREATE TYPE escrow_status AS ENUM ('pending_deposit', 'locked', 'work_submitted', 'disputed', 'approved', 'rejected')");
  pgm.sql("ALTER TABLE escrow_transactions ALTER COLUMN status TYPE escrow_status USING status::text::escrow_status");
  pgm.sql("DROP TYPE escrow_status_old");
};
