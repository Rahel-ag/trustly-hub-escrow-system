exports.up = (pgm) => {
  // 1. Add contract workflow columns to jobs table safely
  pgm.addColumns('jobs', {
    freelancer_id: { type: 'uuid', references: '"users"', onDelete: 'SET NULL' },
    freelancer_name: { type: 'varchar(255)' },
    contract_budget: { type: 'numeric', default: 0 },
    work_submitted: { type: 'boolean', default: false },
    freelancer_notes: { type: 'text' },
    submitted_file_name: { type: 'varchar(255)' },
    submitted_file_size: { type: 'varchar(50)' },
    escrow_status: { type: 'varchar(50)', default: 'None' },
  }, { ifNotExists: true }); 

  // 2. Add structural tracking columns to proposals table safely
  pgm.addColumns('proposals', {
    bid_price: { type: 'numeric(12,2)' },
    bid_amount: { type: 'numeric(12,2)' },
    cover_letter: { type: 'text' },
  }, { ifNotExists: true }); //
};

exports.down = (pgm) => {
 
  pgm.dropColumns('jobs', [
    'freelancer_id', 'freelancer_name', 'contract_budget', 
    'work_submitted', 'freelancer_notes', 'submitted_file_name', 
    'submitted_file_size', 'escrow_status'
  ], { ifExists: true });
  
  pgm.dropColumns('proposals', ['bid_price', 'bid_amount', 'cover_letter'], { ifExists: true });
};
