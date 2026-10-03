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

-- Public demo account for the project evaluation. Use it only for demo data.
INSERT INTO app_users (email, password_hash, role)
VALUES (
  'demo@bolsilloclaro.example',
  '$2b$12$M05tGMBizepckkSe7a3VQeswhehve1Qo8mYkkDSCnrVjde1tLptBm',
  'user'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO transactions (user_id, description, amount, category, spent_on)
SELECT u.id, sample.description, sample.amount, sample.category, sample.spent_on
FROM app_users AS u
CROSS JOIN (
  VALUES
    ('Compra semanal', 18450.00::numeric, 'Comida', CURRENT_DATE),
    ('Viaje en transporte', 3200.00::numeric, 'Transporte', CURRENT_DATE),
    ('Salida con amigos', 5600.00::numeric, 'Ocio', CURRENT_DATE)
) AS sample(description, amount, category, spent_on)
WHERE u.email = 'demo@bolsilloclaro.example'
  AND NOT EXISTS (
    SELECT 1
    FROM transactions AS existing
    WHERE existing.user_id = u.id
      AND existing.description = sample.description
      AND existing.spent_on = sample.spent_on
  );

-- To grant admin to your own account, update the email below, then log in again:
-- UPDATE app_users SET role = 'admin' WHERE email = 'tu-correo@example.com';
