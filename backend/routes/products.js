const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateProduct(body, { partial = false } = {}) {
  const errors = [];
  const check = (field, label) => {
    if (!partial || body[field] !== undefined) {
      if (!isNonEmptyString(body[field])) errors.push(`${label} es obligatorio.`);
    }
  };
  check('slug', 'El slug');
  check('name', 'El nombre');
  check('description', 'La descripción');
  check('imageAlt', 'El texto alternativo de la imagen');

  if (!partial || body.category !== undefined) {
    if (!['baston', 'lentes'].includes(body.category)) errors.push('La categoría debe ser "baston" o "lentes".');
  }
  if (!partial || body.priceCents !== undefined) {
    if (!Number.isInteger(body.priceCents) || body.priceCents < 0) errors.push('El precio debe ser un entero en centavos, mayor o igual a 0.');
  }
  if (!partial || body.stock !== undefined) {
    if (!Number.isInteger(body.stock) || body.stock < 0) errors.push('El stock debe ser un entero mayor o igual a 0.');
  }
  if (body.imageUrl && body.imageUrl.length > 2_000_000) {
    errors.push('La imagen del producto es demasiado grande.');
  }
  return errors;
}

router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    const params = [];
    let query = 'SELECT * FROM products';
    if (category === 'baston' || category === 'lentes') {
      params.push(category);
      query += ' WHERE category = $1';
    }
    query += ' ORDER BY id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el catálogo.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el producto.' });
  }
});

router.post('/', authenticate, requireRole('administrador'), async (req, res) => {
  const body = req.body || {};
  const errors = validateProduct(body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const result = await pool.query(
      `INSERT INTO products (slug, name, category, description, image_alt, image_url, price_cents, stock, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        body.slug.trim(),
        body.name.trim(),
        body.category,
        body.description.trim(),
        body.imageAlt.trim(),
        body.imageUrl || null,
        body.priceCents,
        body.stock,
        Array.isArray(body.features) ? body.features : [],
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ errors: ['Ya existe un producto con ese slug.'] });
    }
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear el producto.' });
  }
});

router.put('/:id', authenticate, requireRole('administrador'), async (req, res) => {
  const body = req.body || {};
  const errors = validateProduct(body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ errors });

  const fieldMap = {
    slug: 'slug', name: 'name', category: 'category', description: 'description',
    imageAlt: 'image_alt', imageUrl: 'image_url', priceCents: 'price_cents',
    stock: 'stock', features: 'features',
  };

  const setClauses = [];
  const values = [];
  for (const [key, column] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) {
      values.push(body[key]);
      setClauses.push(`${column} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ errors: ['No enviaste ningún campo para actualizar.'] });
  }

  values.push(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ errors: ['Ya existe un producto con ese slug.'] });
    }
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar el producto.' });
  }
});

router.delete('/:id', authenticate, requireRole('administrador'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo borrar el producto. Puede que tenga pedidos asociados.' });
  }
});

module.exports = router;
