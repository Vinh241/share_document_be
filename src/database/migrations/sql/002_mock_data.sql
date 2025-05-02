-- Insert users
INSERT INTO users (email, phone_number, password_hash, full_name, is_admin) 
VALUES 
  ('admin@bookstore.com', '+11234567890', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'Admin User', TRUE),  -- password: admin123
  ('john@example.com', '+12345678901', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'John Doe', FALSE),  -- password: admin123
  ('jane@example.com', '+13456789012', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'Jane Smith', FALSE);  -- password: admin123


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
  (1, '/uploads/products/harry-potter-1.jpg', true),
  (1, '/uploads/products/harry-potter-2.jpg', false),
  (2, '/uploads/products/the-shining-1.jpg', true),
  (3, '/uploads/products/pride-prejudice-1.jpg', true),
  (4, '/uploads/products/1984-1.jpg', true),
  (5, '/uploads/products/becoming-1.jpg', true);

-- Insert orders
INSERT INTO orders (user_id, status, total_amount, shipping_address, payment_method, payment_status)
VALUES
  (2, 'delivered', 28.98, 'hanoi', 'credit_card', 'completed'),
  (3, 'processing', 24.99, 'hanoi', 'paypal', 'completed'),
  (2, 'pending', 14.99, 'hanoi', 'credit_card', 'pending');

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

-- Insert payment_details
INSERT INTO payment_details (order_id, provider, transaction_id, amount, payment_data)
VALUES
  (1, 'credit_card', 'TXN123456789', 28.98, '{"card_type": "Visa", "last_four": "4242", "customer_name": "John Doe"}'),
  (2, 'paypal', 'PAYPAL87654321', 24.99, '{"paypal_email": "jane@example.com", "payment_id": "PAY-87654321"}'),
  (3, 'momo', 'MOMO345678912', 14.99, '{"phone_number": "+12345678901", "wallet_id": "WALLET-3456789"}'); 