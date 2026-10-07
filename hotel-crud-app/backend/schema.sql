-- Hotel Database Schema

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels(title);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels(price);
