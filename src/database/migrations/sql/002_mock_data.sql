-- Insert users
INSERT INTO users (username, email, password_hash, full_name, phone, balance, referral_code, status)
VALUES 
  ('john_doe', 'john@example.com', '$2a$10$xxxxxxxxxxx', 'John Doe', '+1234567890', 100.00, 'JD2024', 'active'),
  ('jane_smith', 'jane@example.com', '$2a$10$xxxxxxxxxxx', 'Jane Smith', '+1234567891', 50.00, 'JS2024', 'active'),
  ('bob_wilson', 'bob@example.com', '$2a$10$xxxxxxxxxxx', 'Bob Wilson', '+1234567892', 0.00, 'BW2024', 'pending');

-- Insert categories
INSERT INTO categories (name, description, status)
VALUES 
  ('Mathematics', 'Mathematics study materials and resources', 'active'),
  ('Physics', 'Physics study materials and resources', 'active'),
  ('Programming', 'Programming tutorials and guides', 'active');

-- Insert subjects
INSERT INTO subjects (name, description, status)
VALUES 
  ('Calculus', 'Advanced mathematics calculus', 'active'),
  ('Mechanics', 'Classical mechanics and dynamics', 'active'),
  ('Web Development', 'Web development fundamentals', 'active');

-- Insert universities
INSERT INTO universities (name, description, status)
VALUES 
  ('MIT', 'Massachusetts Institute of Technology', 'active'),
  ('Stanford', 'Stanford University', 'active'),
  ('Harvard', 'Harvard University', 'active');

-- Insert documents
INSERT INTO documents (
  title, description, price, file_path, instruct_path, 
  user_id, category_id, subject_id, university_id, 
  view_count, download_count, status
)
VALUES 
  (
    'Calculus Fundamentals', 
    'Basic calculus concepts and formulas', 
    29.99,
    '/files/calculus-fundamentals.pdf',
    '/instructions/calc-guide.pdf',
    (SELECT user_id FROM users WHERE username = 'john_doe'),
    (SELECT category_id FROM categories WHERE name = 'Mathematics'),
    (SELECT subject_id FROM subjects WHERE name = 'Calculus'),
    (SELECT university_id FROM universities WHERE name = 'MIT'),
    100,
    50,
    'active'
  ),
  (
    'Physics 101', 
    'Introduction to physics', 
    19.99,
    '/files/physics-101.pdf',
    '/instructions/physics-guide.pdf',
    (SELECT user_id FROM users WHERE username = 'jane_smith'),
    (SELECT category_id FROM categories WHERE name = 'Physics'),
    (SELECT subject_id FROM subjects WHERE name = 'Mechanics'),
    (SELECT university_id FROM universities WHERE name = 'Stanford'),
    75,
    30,
    'active'
  );

-- Insert orders
INSERT INTO orders (user_id, total_amount, status)
VALUES 
  (
    (SELECT user_id FROM users WHERE username = 'bob_wilson'),
    49.98,
    'completed'
  );

-- Insert order items
INSERT INTO order_items (order_id, document_id, price, status)
VALUES 
  (
    (SELECT order_id FROM orders LIMIT 1),
    (SELECT document_id FROM documents WHERE title = 'Calculus Fundamentals'),
    29.99,
    'active'
  ),
  (
    (SELECT order_id FROM orders LIMIT 1),
    (SELECT document_id FROM documents WHERE title = 'Physics 101'),
    19.99,
    'active'
  );

-- Insert transactions
INSERT INTO transactions (user_id, amount, type, status, reference_id, description)
VALUES 
  (
    (SELECT user_id FROM users WHERE username = 'bob_wilson'),
    49.98,
    'purchase',
    'completed',
    (SELECT order_id FROM orders LIMIT 1),
    'Purchase of educational materials'
  );

-- Insert referral history
INSERT INTO referral_history (referrer_id, referred_id, order_id, commission_amount, status)
VALUES 
  (
    (SELECT user_id FROM users WHERE username = 'john_doe'),
    (SELECT user_id FROM users WHERE username = 'bob_wilson'),
    (SELECT order_id FROM orders LIMIT 1),
    5.00,
    'pending'
  );

-- Insert file images
INSERT INTO file_images (document_id, image_path, name, status)
VALUES 
  (
    (SELECT document_id FROM documents WHERE title = 'Calculus Fundamentals'),
    '/images/calculus-preview.jpg',
    'Calculus Preview',
    'active'
  ),
  (
    (SELECT document_id FROM documents WHERE title = 'Physics 101'),
    '/images/physics-preview.jpg',
    'Physics Preview',
    'active'
  ); 