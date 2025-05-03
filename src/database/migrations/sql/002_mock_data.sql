-- Insert users
INSERT INTO users (email, phone_number, password_hash, full_name, is_admin) 
VALUES 
  ('admin@bookstore.com', '+11234567890', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'Quản trị viên', TRUE),  -- password: admin123
  ('nguyen@example.com', '+12345678901', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'Nguyễn Văn An', FALSE),  -- password: admin123
  ('tran@example.com', '+13456789012', '$2a$10$szCg/g0AVvDYhiGufUGYN.LOLWLPeH05jWZ3kVHCNAoDThXOaSXQC', 'Trần Thị Bình', FALSE);  -- password: admin123


-- Insert categories
INSERT INTO categories (name, slug, parent_id)
VALUES
  ('Tiểu thuyết', 'tieu-thuyet', NULL),
  ('Phi hư cấu', 'phi-hu-cau', NULL),
  ('Khoa học viễn tưởng', 'khoa-hoc-vien-tuong', 1),
  ('Giả tưởng', 'gia-tuong', 1),
  ('Trinh thám', 'trinh-tham', 1),
  ('Tiểu sử', 'tieu-su', 2),
  ('Lịch sử', 'lich-su', 2),
  ('Phát triển bản thân', 'phat-trien-ban-than', 2);

-- Insert publishers
INSERT INTO publishers (name, description)
VALUES
  ('NXB Kim Đồng', 'Nhà xuất bản sách nổi tiếng tại Việt Nam.'),
  ('NXB Trẻ', 'Nhà xuất bản dành cho sách trẻ em và thanh thiếu niên.'),
  ('NXB Tổng hợp TP.HCM', 'Nhà xuất bản lớn tại TP. Hồ Chí Minh.'),
  ('NXB Hội Nhà Văn', 'Nhà xuất bản của Hội Nhà văn Việt Nam.');

-- Insert authors
INSERT INTO authors (name, biography)
VALUES
  ('J.K. Rowling', 'Tác giả người Anh nổi tiếng với bộ truyện Harry Potter.'),
  ('Stephen King', 'Nhà văn người Mỹ chuyên về các tác phẩm kinh dị, siêu nhiên.'),
  ('Jane Austen', 'Nữ nhà văn người Anh nổi tiếng với các tiểu thuyết lãng mạn.'),
  ('George Orwell', 'Nhà văn, nhà báo người Anh với các tác phẩm chính trị-xã hội.'),
  ('Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm dành cho thanh thiếu niên.');

-- Insert products
INSERT INTO products (name, slug, description, price, sale_price, stock_quantity, quantity_sold, category_id, publisher_id, author_id, isbn, publication_date)
VALUES
  ('Harry Potter và Hòn đá Phù thủy', 'harry-potter-hon-da-phu-thuy', 'Cuốn sách đầu tiên trong bộ truyện Harry Potter.', 450000, 350000, 50, 120, 4, 1, 1, '9780747532743', '1997-06-26'),
  ('Ngôi nhà ma ám', 'ngoi-nha-ma-am', 'Tiểu thuyết kinh dị của Stephen King.', 380000, 320000, 30, 85, 5, 2, 2, '9780307743657', '1977-01-28'),
  ('Kiêu hãnh và Định kiến', 'kieu-hanh-va-dinh-kien', 'Tiểu thuyết lãng mạn của Jane Austen.', 300000, 250000, 45, 67, 1, 3, 3, '9780141439518', '1813-01-28'),
  ('1984', '1984', 'Tiểu thuyết viễn tưởng chính trị-xã hội của George Orwell.', 350000, 290000, 60, 93, 3, 4, 4, '9780451524935', '1949-06-08'),
  ('Mắt biếc', 'mat-biec', 'Tiểu thuyết thanh xuân của Nguyễn Nhật Ánh.', 280000, 230000, 75, 145, 1, 2, 5, '9781524763138', '2018-11-13'),
  ('Tôi thấy hoa vàng trên cỏ xanh', 'toi-thay-hoa-vang-tren-co-xanh', 'Tiểu thuyết thanh xuân nổi tiếng của Nguyễn Nhật Ánh.', 320000, 280000, 0, 200, 1, 1, 5, '9781234567890', '2022-05-15');

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
  (1, '/images/products/harry-potter-1.jpg', true),
  (1, '/images/products/harry-potter-2.jpg', false),
  (2, '/images/products/the-shining-1.jpg', true),
  (3, '/images/products/pride-prejudice-1.jpg', true),
  (4, '/images/products/1984-1.jpg', true),
  (5, '/images/products/becoming-1.jpg', true),
  (6, '/images/products/out-of-stock-book.jpg', true);

-- Insert orders
INSERT INTO orders (user_id, status, total_amount, shipping_address, payment_method, payment_status)
VALUES
  (2, 'delivered', 600000, 'Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'credit_card', 'completed'),
  (3, 'processing', 230000, 'Số 456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', 'paypal', 'completed'),
  (2, 'pending', 290000, '789 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 'credit_card', 'pending');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
  (1, 1, 1, 350000),
  (1, 3, 1, 250000),
  (2, 5, 1, 230000),
  (3, 4, 1, 290000);

-- Insert reviews
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES
  (2, 1, 5, 'Sách rất hay! Là một tác phẩm không thể bỏ qua cho người yêu thích thể loại giả tưởng.'),
  (3, 1, 4, 'Rất thú vị, mặc dù hơi chậm ở phần đầu.'),
  (2, 3, 5, 'Một tác phẩm kinh điển không bao giờ lỗi thời!'),
  (3, 5, 5, 'Câu chuyện thanh xuân đầy cảm xúc và sâu lắng.');

-- Insert cart items
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES
  (2, 2, 1),
  (2, 4, 1),
  (3, 1, 2); 

-- Insert payment_details
INSERT INTO payment_details (order_id, provider, transaction_id, amount, payment_data)
VALUES
  (1, 'credit_card', 'TXN123456789', 600000, '{"card_type": "Visa", "last_four": "4242", "customer_name": "Nguyễn Văn An"}'),
  (2, 'paypal', 'PAYPAL87654321', 230000, '{"paypal_email": "tran@example.com", "payment_id": "PAY-87654321"}'),
  (3, 'momo', 'MOMO345678912', 290000, '{"phone_number": "+12345678901", "wallet_id": "WALLET-3456789"}'); 