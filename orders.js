// Decision #4: no PII in orders. The orders table stores user_id only.
// Names, email addresses, phone numbers, and delivery addresses belong in user-owned tables.
const ORDER_COLUMNS = Object.freeze([
  'id',
  'user_id',
  'status',
  'total_cents',
  'currency',
  'created_at'
]);

const CREATE_ORDERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function createOrder(pool, order) {
  const result = await pool.query(
    `INSERT INTO orders (user_id, status, total_cents, currency)
     VALUES ($1, $2, $3, $4)
     RETURNING ${ORDER_COLUMNS.join(', ')}`,
    [
      order.userId,
      order.status || 'pending',
      order.totalCents,
      order.currency || 'USD'
    ]
  );

  return result.rows[0];
}

async function listOrdersForUser(pool, userId) {
  const result = await pool.query(
    `SELECT ${ORDER_COLUMNS.join(', ')}
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

module.exports = {
  ORDER_COLUMNS,
  CREATE_ORDERS_TABLE_SQL,
  createOrder,
  listOrdersForUser
};
