-- Insert users
INSERT INTO users (email, phone_number, password_hash, full_name) 
VALUES 
  ('admin@bookstore.com', '+11234567890', '$2a$10$N.UYwfj2/nVuP1ZsxMv8jOj9vmQ7LuZJAYwO0CeNUWCBq4dW5DP7i', 'Admin User'),  -- password: admin123
  ('john@example.com', '+12345678901', '$2a$10$N.UYwfj2/nVuP1ZsxMv8jOj9vmQ7LuZJAYwO0CeNUWCBq4dW5DP7i', 'John Doe'),  -- password: admin123
  ('jane@example.com', '+13456789012', '$2a$10$N.UYwfj2/nVuP1ZsxMv8jOj9vmQ7LuZJAYwO0CeNUWCBq4dW5DP7i', 'Jane Smith');  -- password: admin123

-- Insert addresses
INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, is_default)
VALUES
  (1, '123 Admin St', 'Suite 100', 'Admin City', 'AC', '12345', true),
  (2, '456 Main St', 'Apt 201', 'New York', 'NY', '10001', true),
  (2, '789 Work Ave', NULL, 'New York', 'NY', '10002', false),
  (3, '987 First St', NULL, 'Los Angeles', 'CA', '90001', true);
-- 
-- Insert categories
INSERT INTO categories (name, slug, parent_id)
VALUES
  ('Fiction', 'fiction', NULL),
  ('Non-Fiction', 'non-fiction', NULL),
  ('Science Fiction', 'science-fiction', 1),
  ('Fantasy', 'fantasy', 1),
  ('Mystery', 'mystery', 1),
  ('Biography', 'biography', 2),
  ('History', 'history', 2),
  ('Self-Help', 'self-help', 2);

-- Insert publishers
INSERT INTO publishers (name, description)
VALUES
  ('Penguin Random House', 'One of the largest book publishers in the world.'),
  ('HarperCollins', 'A major global book publishing company.'),
  ('Simon & Schuster', 'An American publishing company and subsidiary of Paramount Global.'),
  ('Macmillan Publishers', 'A global trade publishing company.');

-- Insert authors
INSERT INTO authors (name, biography)
VALUES
  ('J.K. Rowling', 'British author best known for creating the Harry Potter series.'),
  ('Stephen King', 'American author of horror, supernatural fiction, suspense, crime, and fantasy novels.'),
  ('Jane Austen', 'English novelist known primarily for her six major novels.'),
  ('George Orwell', 'English novelist, essayist, journalist, and critic.'),
  ('Michelle Obama', 'American attorney and author who served as the First Lady of the United States.');

-- Insert products
INSERT INTO products (name, slug, description, price, sale_price, stock_quantity, quantity_sold, category_id, publisher_id, author_id, isbn, publication_date)
VALUES
  ('Harry Potter and the Philosopher''s Stone', 'harry-potter-philosophers-stone', 'The first novel in the Harry Potter series.', 19.99, 15.99, 50, 120, 4, 1, 1, '9780747532743', '1997-06-26'),
  ('The Shining', 'the-shining', 'A horror novel by Stephen King.', 15.99, 12.99, 30, 85, 5, 2, 2, '9780307743657', '1977-01-28'),
  ('Pride and Prejudice', 'pride-and-prejudice', 'A romantic novel by Jane Austen.', 12.99, 9.99, 45, 67, 1, 3, 3, '9780141439518', '1813-01-28'),
  ('1984', '1984', 'A dystopian social science fiction novel by George Orwell.', 14.99, 11.99, 60, 93, 3, 4, 4, '9780451524935', '1949-06-08'),
  ('Becoming', 'becoming', 'A memoir by Michelle Obama.', 24.99, 19.99, 75, 145, 6, 1, 5, '9781524763138', '2018-11-13');

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
  (1, 'https://example.com/images/harry-potter-1.jpg', true),
  (1, 'https://example.com/images/harry-potter-2.jpg', false),
  (2, 'https://example.com/images/the-shining-1.jpg', true),
  (3, 'https://example.com/images/pride-prejudice-1.jpg', true),
  (4, 'https://example.com/images/1984-1.jpg', true),
  (5, 'https://example.com/images/becoming-1.jpg', true);

-- Insert orders
INSERT INTO orders (user_id, status, total_amount, shipping_address_id, payment_method, payment_status)
VALUES
  (2, 'delivered', 28.98, 2, 'credit_card', 'completed'),
  (3, 'processing', 24.99, 4, 'paypal', 'completed'),
  (2, 'pending', 14.99, 2, 'credit_card', 'pending');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
  (1, 1, 1, 15.99),
  (1, 3, 1, 12.99),
  (2, 5, 1, 24.99),
  (3, 4, 1, 14.99);

-- Insert reviews
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES
  (2, 1, 5, 'Excellent book! A must-read for fantasy fans.'),
  (3, 1, 4, 'Very enjoyable, though a bit slow at the beginning.'),
  (2, 3, 5, 'A classic that never gets old!'),
  (3, 5, 5, 'Inspiring and well-written memoir.');

-- Insert cart items
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES
  (2, 2, 1),
  (2, 4, 1),
  (3, 1, 2); 