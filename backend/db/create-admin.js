const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function run() {
  const [, , firstName, lastName, email, password] = process.argv;

  if (!firstName || !lastName || !email || !password) {
    console.log('Uso: node db/create-admin.js Nombre Apellido correo@ejemplo.com contraseñaSegura');
    process.exit(1);
  }
  if (password.length < 8) {
    console.log('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, accepted_terms_at)
       VALUES ($1, $2, $3, $4, 'administrador', now())
       ON CONFLICT (email) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         password_hash = EXCLUDED.password_hash,
         role = 'administrador'`,
      [firstName, lastName, email.trim().toLowerCase(), passwordHash]
    );
    console.log(`Cuenta administrador lista para: ${email}`);
  } catch (err) {
    console.error('No se pudo crear la cuenta administrador:', err.message);
  } finally {
    process.exit();
  }
}

run();
