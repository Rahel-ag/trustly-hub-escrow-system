const { primaryKey } = require("drizzle-orm/gel-core");

exports.up = (pgm) => {
    pgm.createType('escrow_status', [
    'pending_deposit',
    'locked',
    'work_submitted',
    'disputed',
    'approved',
    'rejected',
    ]);

    pgm.createTable('users', {
    id:  {type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    email:  {type: 'text', notNull: true, unique: true },
    password_hash:  {type: 'text', notNull: true },
    role:  {type: 'text', notNull: true },
    created_at:  {type: 'timestamptz', notNull: true, default: pgm.func('now()') },
});
   pgm.createTable('jobs', {
    id:  {type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    client_id:  {type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE'},
    title:  {type: 'text', notNull: true },
    description:  {type: 'text' },
    budget:  {type: 'numeric', notNull: true },
    status: {type: 'text', notNull: true, default:'open' }
});
   
 pgm.createTable('proposals', {
    id:  {type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    job_id:  {type: 'uuid', notNull: true, references: '"jobs"', onDelete: 'CASCADE'},
    freelancer_id: {type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE'},
    message:  {type: 'text' },
    status: {type: 'text', notNull: true, default:'pending' }
});
 pgm.createTable('escrow_transactions', {
     id:  {type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
     job_id:  {type: 'uuid', notNull: true, references: '"jobs"', onDelete: 'RESTRICT'},
     freelancer_id: {type: 'uuid', notNull: true, references: '"users"', onDelete: 'RESTRICT'},
     client_id:  {type: 'uuid', notNull: true, references: '"users"', onDelete: 'RESTRICT'},
     amount: {type: 'numeric', notNull: true},
     status: {type: 'escrow_status', notNull: true, default: 'pending_deposit' },
     created_at:  {type: 'timestamptz', notNull: true, default: pgm.func('now()') },
     
 });

   pgm.createTable('disputes', {
    id:  {type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    escrow_id:  {type: 'uuid', notNull: true, references: '"escrow_transactions"', onDelete: 'CASCADE'},
    decision:  {type: 'text' },
    reason: {type: 'text', notNull: true},
    flagged_by: {type: 'uuid', notNull: true, references: '"users"', onDelete: 'RESTRICT' }
});

exports.down = (pgm) => {
  pgm.dropTable('disputes');
  pgm.dropTable('escrow_transactions');
  pgm.dropTable('proposals');
  pgm.dropTable('jobs');
  pgm.dropTable('users');
  pgm.dropType('escrow_status');
};

}