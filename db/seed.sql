CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO dishes (name, description, price) VALUES
  ('Pollo asado con arroz', 'Pollo sazonado, arroz con vegetales y ensalada fresca.', 8.50),
  ('Pasta cremosa', 'Pasta en salsa blanca con pollo y queso parmesano.', 7.00),
  ('Hamburguesa artesanal', 'Pan brioche, carne sazonada, queso, vegetales y salsa especial.', 6.75),
  ('Tacos mixtos', 'Tres tacos con carne, pollo, pico de gallo y salsa de la casa.', 6.50),
  ('Ensalada fresca', 'Lechuga, tomate, maiz, zanahoria, pollo y aderezo ligero.', 5.25)
ON CONFLICT DO NOTHING;

INSERT INTO admins (username, password_hash) VALUES
  ('admin', crypt('admin123', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;
