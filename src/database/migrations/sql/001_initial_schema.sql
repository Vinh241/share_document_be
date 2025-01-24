-- Drop existing tables in correct order
DROP TABLE IF EXISTS file_images;
DROP TABLE IF EXISTS referral_history;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS universities;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Drop existing ENUM types
DROP TYPE IF EXISTS referral_status;
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS user_status;

-- Create ENUM types
CREATE TYPE user_status AS ENUM ('active', 'draft', 'pending');
CREATE TYPE order_status AS ENUM ('active', 'draft', 'pending', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'referral');
CREATE TYPE transaction_status AS ENUM ('active', 'draft', 'pending', 'completed', 'failed');
CREATE TYPE referral_status AS ENUM ('active', 'draft', 'pending', 'paid', 'cancelled');

-- Create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 0,
  referral_code VARCHAR(255) UNIQUE,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create categories table
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE subjects (
  subject_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create universities table
CREATE TABLE universities (
  university_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE documents (
  document_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  instruct_path VARCHAR(255),
  user_id INTEGER REFERENCES users(user_id),
  category_id INTEGER REFERENCES categories(category_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  university_id INTEGER REFERENCES universities(university_id),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  total_amount DECIMAL(15,2) NOT NULL,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  document_id INTEGER REFERENCES documents(document_id),
  price DECIMAL(15,2) NOT NULL,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
  transaction_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  amount DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  reference_id INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create referral_history table
CREATE TABLE referral_history (
  referral_id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(user_id),
  referred_id INTEGER REFERENCES users(user_id),
  order_id INTEGER REFERENCES orders(order_id),
  commission_amount DECIMAL(15,2) NOT NULL,
  status referral_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create file_images table
CREATE TABLE file_images (
  image_id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(document_id),
  image_path VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 