const pool = require('./pool');

const products = [
  {
    slug: 'baston-plegable-inteligente',
    name: 'Bastón Plegable Inteligente',
    category: 'baston', // Cambiado a 'baston'
    description: 'Bastón plegable ligero con detección de obstáculos hasta 50 cm y alertas.',
    image_alt: 'Bastón plegable inteligente para asistencia visual',
    price_cents: 350000,
    stock: 50,
    features: ['Plegable y portátil', 'Sensor de proximidad', 'Batería recargable']
  },
  {
    slug: 'lentes-inteligentes',
    name: 'Lentes Inteligentes',
    category: 'lentes', // Cambiado a 'lentes'
    description: 'Lentes de alta tecnología para el reconocimiento de entorno.',
    image_alt: 'Lentes inteligentes con sensores de entorno',
    price_cents: 250000,
    stock: 30,
    features: ['Lectura de texto', 'Alertas auditivas', 'Diseño ergonómico']
  },
  {
    slug: 'kit-accesibilidad-completo',
    name: 'Kit Completo (Bastón + Lentes)',
    category: 'baston', // O 'lentes', según lo que permita tu restricción CHECK
    description: 'Paquete integral de movilidad y asistencia visual con precio preferencial.',
    image_alt: 'Kit de bastón plegable y lentes inteligentes',
    price_cents: 470000,
    stock: 20,
    features: ['Bastón Plegable incluido', 'Lentes Inteligentes incluidos', 'Ahorro especial de $1,300']
  }
];

async function runSeed() {
  // 1. Intentar limpiar productos viejos que ya no pertenezcan al nuevo catálogo
  try {
    const currentSlugs = products.map((p) => p.slug);
    await pool.query('DELETE FROM products WHERE slug <> ALL($1::text[])', [currentSlugs]);
  } catch (err) {
    console.warn('Aviso: no se pudieron borrar productos antiguos (probablemente ya tienen pedidos). Se conservan.');
  }

  // 2. Insertar o actualizar los 3 productos actuales
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of products) {
      await client.query(
        `INSERT INTO products (slug, name, category, description, image_alt, price_cents, stock, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           image_alt = EXCLUDED.image_alt,
           price_cents = EXCLUDED.price_cents,
           stock = EXCLUDED.stock,
           features = EXCLUDED.features`,
        [p.slug, p.name, p.category, p.description, p.image_alt, p.price_cents, p.stock, p.features]
      );
    }
    await client.query('COMMIT');
    console.log('¡Base de datos poblada con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al poblar la base de datos:', error);
  } finally {
    client.release();
    process.exit();
  }
}

runSeed();