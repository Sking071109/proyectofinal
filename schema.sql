CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  description VARCHAR(120) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Comida', 'Transporte', 'Hogar', 'Salud', 'Ocio', 'Otros')),
  spent_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_date_idx
  ON transactions (user_id, spent_on DESC, id DESC);
CREATE INDEX IF NOT EXISTS transactions_user_category_idx
  ON transactions (user_id, category);

-- Create the first account through the app, then grant admin only if needed:
-- UPDATE app_users SET role = 'admin' WHERE email = 'tu-correo@example.com';
-- Optional sample records after creating that account:
-- INSERT INTO transactions (user_id, description, amount, category, spent_on)
-- SELECT id, 'Compra de prueba', 12500, 'Comida', CURRENT_DATE
-- FROM app_users WHERE email = 'tu-correo@example.com';
