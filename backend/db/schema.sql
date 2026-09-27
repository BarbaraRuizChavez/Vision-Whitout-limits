

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(120) UNIQUE NOT NULL,
  name          VARCHAR(160) NOT NULL,
  category      VARCHAR(40) NOT NULL CHECK (category IN ('baston', 'lentes')),
  description   TEXT NOT NULL,
  image_alt     TEXT NOT NULL, -- texto alternativo obligatorio y descriptivo para lectores de pantalla
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  features      TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  customer_name   VARCHAR(160) NOT NULL,
  email           VARCHAR(160) NOT NULL,
  phone           VARCHAR(40) NOT NULL,
  address         TEXT NOT NULL,
  city            VARCHAR(120) NOT NULL,
  postal_code     VARCHAR(20) NOT NULL,
  notes           TEXT,
  total_cents     INTEGER NOT NULL CHECK (total_cents >= 0),
  status          VARCHAR(20) NOT NULL DEFAULT 'demo_confirmado',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  product_name    VARCHAR(160) NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Cuentas de usuario con rol: 'cliente' o 'administrador'.
-- El registro público (POST /api/auth/register) siempre crea cuentas 'cliente';
-- una cuenta 'administrador' solo se crea a mano en la base de datos (ver README).
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'administrador')),
  photo_url     TEXT,
  google_id     VARCHAR(60) UNIQUE,
  accepted_terms_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_login_method CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

-- Vincula (opcionalmente) un pedido con la cuenta de cliente que lo hizo.
-- Nullable: los pedidos ya existentes, hechos antes de tener cuentas, se quedan sin dueño.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
