-- Drop existing tables in correct order
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;

-- Drop existing ENUM types
DROP TYPE IF EXISTS referral_status;
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method;

-- Create ENUM types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery','momo');
CREATE TYPE referral_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'withdrawal', 'deposit');

-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create addresses table
-- CREATE TABLE addresses (
--   id BIGSERIAL PRIMARY KEY,
--   user_id BIGINT REFERENCES users(id),
--   address_line1 VARCHAR(255) NOT NULL,
--   address_line2 VARCHAR(255),
--   city VARCHAR(100) NOT NULL,
--   state VARCHAR(100) NOT NULL,
--   postal_code VARCHAR(20) NOT NULL,
--   is_default BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Create categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id BIGINT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create publishers table
CREATE TABLE publishers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create authors table
CREATE TABLE authors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  biography TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  stock_quantity INT NOT NULL DEFAULT 0,
  quantity_sold INT NOT NULL DEFAULT 0,
  category_id BIGINT REFERENCES categories(id),
  publisher_id BIGINT REFERENCES publishers(id),
  author_id BIGINT REFERENCES authors(id),
  isbn VARCHAR(13),
  publication_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_images table
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address VARCHAR(255),
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

