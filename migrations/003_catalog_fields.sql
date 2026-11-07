ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE products SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_available_idx ON products(available);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS promos_product_title_idx ON promos(product_id, title);
