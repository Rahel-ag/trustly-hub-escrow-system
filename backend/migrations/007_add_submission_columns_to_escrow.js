exports.up = (pgm) => {
  pgm.addColumns('escrow_transactions', {
    submission_message: { type: 'text' },
    submitted_file_name: { type: 'varchar(255)' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumns('escrow_transactions', ['submission_message', 'submitted_file_name'], { ifExists: true });
};
