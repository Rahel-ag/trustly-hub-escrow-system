exports.up = (pgm) => {
  pgm.addColumn('users', {
    name: { type: 'text' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'name');
};