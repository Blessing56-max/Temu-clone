-- V12: 30 more products for a fuller catalog.

INSERT INTO products (seller_id, category_id, name, description, price, discount_price, stock, active)
SELECT u.id, c.id, p.name, p.description, p.price, p.discount_price, p.stock, true
FROM (VALUES
    ('techhub@kora.test', 'electronics', 'Bluetooth Earbuds Pro', 'True wireless earbuds with ANC and wireless charging case.', 42000, 35000, 40),
    ('techhub@kora.test', 'electronics', 'Wireless Keyboard Mouse Combo', 'Slim wireless set with ergonomic mouse. USB receiver.', 28000, NULL, 30),
    ('techhub@kora.test', 'electronics', 'Phone Gimbal Stabilizer', '3-axis gimbal for smooth video. Fits most phones.', 78000, 65000, 12),
    ('techhub@kora.test', 'electronics', 'Webcam 1080p HD', 'Full HD webcam with built-in microphone and autofocus.', 32000, 26000, 25),
    ('blessing@kora.test', 'electronics', 'Portable SSD 1TB', 'USB-C external SSD. 1050 MB/s read speed.', 95000, 82000, 18),
    ('blessing@kora.test', 'electronics', 'HDMI Cable 4K 2m', 'Braided HDMI 2.0 cable. Supports 4K at 60Hz.', 8500, NULL, 60),
    ('blessing@kora.test', 'electronics', 'Laptop Stand Aluminium', 'Adjustable aluminium laptop riser. Fits 11-17 inch.', 22000, 18000, 35),
    ('blessing@kora.test', 'electronics', 'Tripod Phone Mount', 'Flexible phone tripod with Bluetooth remote.', 15000, 12000, 45),
    ('techhub@kora.test', 'electronics', 'Noise Cancelling Earbuds', 'Hybrid ANC earbuds. 30h battery with case.', 55000, 48000, 20),
    ('techhub@kora.test', 'electronics', 'Gaming Headset 7.1', 'Surround sound headset with noise-cancelling mic.', 48000, 40000, 22),
    ('nathan@kora.test', 'fashion', 'Oversized Blazer Women', 'Relaxed fit blazer. Fully lined. Available in 3 colours.', 55000, 45000, 18),
    ('fashionhub@kora.test', 'fashion', 'Silk Head Scarf', 'Pure silk scarf, 90cm square. Hand-rolled edges.', 18000, 14000, 40),
    ('nathan@kora.test', 'fashion', 'Linen Shirt Summer', 'Breathable linen shirt. Relaxed collar. Sand colour.', 25000, NULL, 35),
    ('fashionhub@kora.test', 'fashion', 'Pleated Midi Skirt', 'Flowing pleated skirt with elastic waist.', 32000, 26000, 25),
    ('nathan@kora.test', 'fashion', 'Chunky Knit Sweater', 'Oversized chunky knit. Wool blend. Cream.', 45000, 38000, 20),
    ('fashionhub@kora.test', 'fashion', 'Gold Plated Necklace', '18k gold-plated stainless steel chain. 45cm.', 22000, 17000, 50),
    ('nathan@kora.test', 'fashion', 'Crossbody Bag Leather', 'Full-grain leather crossbody with adjustable strap.', 48000, 40000, 15),
    ('nathan@kora.test', 'fashion', 'Chunky Platform Sneakers', 'Retro platform sneakers. Suede + mesh upper.', 62000, 52000, 12),
    ('blessing@kora.test', 'home-kitchen', 'Wall Art Framed Print', 'Minimalist print in wooden frame. 40x50cm.', 28000, 23000, 22),
    ('techhub@kora.test', 'home-kitchen', 'Bamboo Cutting Board Set', 'Set of 3 bamboo boards. Antimicrobial, dishwasher safe.', 18000, 15000, 40),
    ('blessing@kora.test', 'home-kitchen', 'Aroma Diffuser 300ml', 'Ultrasonic diffuser with 7 colour LED. Auto-off.', 22000, 18000, 30),
    ('techhub@kora.test', 'home-kitchen', 'Cotton Bed Sheets Queen', '400 thread-count Egyptian cotton. 4-piece set.', 68000, 55000, 14),
    ('blessing@kora.test', 'home-kitchen', 'Cast Iron Skillet 10in', 'Pre-seasoned cast iron. Oven safe to 260C.', 32000, 27000, 20),
    ('fashionhub@kora.test', 'beauty-health', 'Facial Sheet Mask Pack', 'Set of 10 hydrating sheet masks. Hyaluronic + aloe.', 12000, 9500, 55),
    ('fashionhub@kora.test', 'beauty-health', 'Retinol Night Cream', '0.5% retinol night cream for smoother skin.', 28000, 22000, 30),
    ('fashionhub@kora.test', 'beauty-health', 'Jade Face Roller', 'Natural jade roller for de-puffing and lymphatic massage.', 8500, NULL, 60),
    ('techhub@kora.test', 'beauty-health', 'Beard Trimmer Rechargeable', 'Cordless trimmer with 20 length settings. USB-C.', 35000, 29000, 25),
    ('fashionhub@kora.test', 'sports-outdoors', 'Yoga Mat Thick 8mm', 'Extra-thick non-slip mat with alignment lines.', 24000, 19000, 35),
    ('nathan@kora.test', 'sports-outdoors', 'Trekking Poles Pair', 'Collapsible aluminium poles with cork grips.', 28000, 23000, 22),
    ('nathan@kora.test', 'sports-outdoors', 'Hydro Flask 32oz', 'Insulated stainless bottle. Keeps cold 24h, hot 12h.', 22000, 18000, 40)
) AS p(seller_email, category_slug, name, description, price, discount_price, stock)
JOIN users u ON u.email = p.seller_email
JOIN categories c ON c.slug = p.category_slug
WHERE NOT EXISTS (SELECT 1 FROM products existing WHERE existing.name = p.name);

INSERT INTO product_images (product_id, url, position)
SELECT p.id, m.url, 0
FROM products p
JOIN (VALUES
    ('Bluetooth Earbuds Pro',       'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'),
    ('Wireless Keyboard Mouse Combo','https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'),
    ('Phone Gimbal Stabilizer',     'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=800&q=80'),
    ('Webcam 1080p HD',             'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'),
    ('Portable SSD 1TB',            'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80'),
    ('HDMI Cable 4K 2m',            'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80'),
    ('Laptop Stand Aluminium',      'https://images.unsplash.com/photo-1616353071855-2c045c4458ae?w=800&q=80'),
    ('Tripod Phone Mount',          'https://images.unsplash.com/photo-1610229589830-6b5b1e47c020?w=800&q=80'),
    ('Noise Cancelling Earbuds',    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80'),
    ('Gaming Headset 7.1',          'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'),
    ('Oversized Blazer Women',      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'),
    ('Silk Head Scarf',             'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80'),
    ('Linen Shirt Summer',          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'),
    ('Pleated Midi Skirt',          'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80'),
    ('Chunky Knit Sweater',         'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80'),
    ('Gold Plated Necklace',        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'),
    ('Crossbody Bag Leather',       'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'),
    ('Chunky Platform Sneakers',    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'),
    ('Wall Art Framed Print',       'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'),
    ('Bamboo Cutting Board Set',    'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&q=80'),
    ('Aroma Diffuser 300ml',        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'),
    ('Cotton Bed Sheets Queen',     'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'),
    ('Cast Iron Skillet 10in',      'https://images.unsplash.com/photo-1585674404026-1b5e7d6c9c1c?w=800&q=80'),
    ('Facial Sheet Mask Pack',      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'),
    ('Retinol Night Cream',         'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'),
    ('Jade Face Roller',            'https://images.unsplash.com/photo-1614108840935-6a4be6d6c6b4?w=800&q=80'),
    ('Beard Trimmer Rechargeable',  'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80'),
    ('Yoga Mat Thick 8mm',          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'),
    ('Trekking Poles Pair',         'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'),
    ('Hydro Flask 32oz',            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80')
) AS m(name, url) ON p.name = m.name
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.position = 0
);

INSERT INTO product_images (product_id, url, position)
SELECT product_id, url, 1
FROM product_images
WHERE position = 0 AND product_id NOT IN (
    SELECT DISTINCT product_id FROM product_images WHERE position = 1
);