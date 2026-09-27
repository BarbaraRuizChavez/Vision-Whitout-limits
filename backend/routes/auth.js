const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function toPublicUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    role: row.role,
    photoUrl: row.photo_url,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, photoUrl, acceptedTerms } = req.body || {};
  const errors = [];

  if (!isNonEmptyString(firstName)) errors.push('El nombre es obligatorio.');
  if (!isNonEmptyString(lastName)) errors.push('El apellido es obligatorio.');
  if (!isNonEmptyString(email) || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Escribe un correo válido.');
  if (!isNonEmptyString(password) || password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres.');
  if (!acceptedTerms) errors.push('Debes aceptar los Términos y Condiciones para crear tu cuenta.');
  if (photoUrl && photoUrl.length > 2_000_000) errors.push('La foto de perfil es demasiado grande.');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ errors: ['Ya existe una cuenta con ese correo.'] });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, photo_url, accepted_terms_at)
       VALUES ($1, $2, $3, $4, 'cliente', $5, now())
       RETURNING *`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), passwordHash, photoUrl || null]
    );

    const user = toPublicUser(result.rows[0]);
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ errors: ['Escribe tu correo y tu contraseña.'] });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const row = result.rows[0];

    if (!row || !row.password_hash || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ errors: ['Correo o contraseña incorrectos.'] });
    }

    const user = toPublicUser(row);
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
});

router.post('/google', async (req, res) => {
  const { credential } = req.body || {};
  if (!isNonEmptyString(credential)) {
    return res.status(400).json({ errors: ['Falta el token de Google.'] });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'El inicio de sesión con Google no está configurado en el servidor.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const existing = await pool.query('SELECT * FROM users WHERE email = $1 OR google_id = $2', [
      payload.email.toLowerCase(),
      payload.sub,
    ]);

    let row;
    if (existing.rows.length > 0) {
      const update = await pool.query(
        'UPDATE users SET google_id = $1, photo_url = COALESCE(photo_url, $2) WHERE id = $3 RETURNING *',
        [payload.sub, payload.picture || null, existing.rows[0].id]
      );
      row = update.rows[0];
    } else {
      const insert = await pool.query(
        `INSERT INTO users (first_name, last_name, email, google_id, role, photo_url, accepted_terms_at)
         VALUES ($1, $2, $3, $4, 'cliente', $5, now())
         RETURNING *`,
        [payload.given_name || 'Usuario', payload.family_name || '', payload.email.toLowerCase(), payload.sub, payload.picture || null]
      );
      row = insert.rows[0];
    }

    const user = toPublicUser(row);
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'No se pudo verificar tu cuenta de Google.' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  const { firstName, lastName, photoUrl } = req.body || {};
  const errors = [];

  if (!isNonEmptyString(firstName)) errors.push('El nombre es obligatorio.');
  if (!isNonEmptyString(lastName)) errors.push('El apellido es obligatorio.');
  if (photoUrl && photoUrl.length > 2_000_000) errors.push('La foto de perfil es demasiado grande.');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, photo_url = $3 WHERE id = $4 RETURNING *`,
      [firstName.trim(), lastName.trim(), photoUrl || null, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const user = toPublicUser(result.rows[0]);
    // Se reemite el token porque lleva el nombre incrustado (lo usa el resto del sitio).
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar tu perfil.' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
