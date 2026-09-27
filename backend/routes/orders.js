const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// POST /api/orders
// Body: { customer: { name, email, phone, address, city, postalCode, notes }, items: [{ productId, quantity }] }
// Requiere haber iniciado sesión (rol cliente o administrador); el pedido queda vinculado a esa cuenta.
router.post('/', authenticate, async (req, res) => {
  const { customer, items } = req.body || {};

  const errors = [];
  if (!customer || !isNonEmptyString(customer.name)) errors.push('El nombre es obligatorio.');
  if (!customer || !isNonEmptyString(customer.email)) errors.push('El correo electrónico es obligatorio.');
  if (!customer || !isNonEmptyString(customer.phone)) errors.push('El teléfono es obligatorio.');
  if (!customer || !isNonEmptyString(customer.address)) errors.push('La dirección es obligatoria.');
  if (!customer || !isNonEmptyString(customer.city)) errors.push('La ciudad es obligatoria.');
  if (!customer || !isNonEmptyString(customer.postalCode)) errors.push('El código postal es obligatorio.');
  if (!Array.isArray(items) || items.length === 0) errors.push('El carrito está vacío.');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Recalcular precios y existencias en el servidor: nunca confiar en el precio enviado por el cliente.
    let totalCents = 0;
    const resolvedItems = [];
    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [
        item.productId,
      ]);
      const product = productResult.rows[0];
      if (!product) {
        throw new Error(`El producto con id ${item.productId} ya no existe.`);
      }
      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) {
        throw new Error(`Cantidad inválida para ${product.name}.`);
      }
      if (product.stock < quantity) {
        throw new Error(`No hay suficiente inventario de "${product.name}".`);
      }
      totalCents += product.price_cents * quantity;
      resolvedItems.push({ product, quantity });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (customer_name, email, phone, address, city, postal_code, notes, total_cents, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmado', $9)
       RETURNING id, created_at`,
      [
        customer.name.trim(),
        customer.email.trim(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.postalCode.trim(),
        customer.notes ? customer.notes.trim() : null,
        totalCents,
        req.user.id,
      ]
    );
    const orderId = orderResult.rows[0].id;

    for (const { product, quantity } of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, product.id, product.name, product.price_cents, quantity]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, product.id]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      orderId,
      totalCents,
      createdAt: orderResult.rows[0].created_at,
      status: 'confirmado',
      message: 'Pedido registrado correctamente.',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ errors: [err.message || 'No se pudo registrar el pedido.'] });
  } finally {
    client.release();
  }
});

// GET /api/orders  (panel del equipo — lista todos los pedidos; solo administradores)
router.get('/', authenticate, requireRole('administrador'), async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    res.json({ orders: ordersResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los pedidos.' });
  }
});

// GET /api/orders/mine  (el cliente ve solo sus propios pedidos)
router.get('/mine', authenticate, async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: ordersResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener tus pedidos.' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }
    const order = orderResult.rows[0];
    const isOwner = order.user_id === req.user.id;
    if (!isOwner && req.user.role !== 'administrador') {
      return res.status(403).json({ error: 'No tienes permiso para ver este pedido.' });
    }
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    res.json({ order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el pedido.' });
  }
});

module.exports = router;
