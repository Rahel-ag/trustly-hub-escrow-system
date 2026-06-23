exports.up = (pgm) => {
  pgm.addColumn('escrow_transactions', {
    tx_ref: { type: 'text' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('escrow_transactions', 'tx_ref');
};