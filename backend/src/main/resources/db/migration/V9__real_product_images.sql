-- Replace placeholder images with real Unsplash photos matched to product names.

DELETE FROM product_images;

INSERT INTO product_images (product_id, url, position)
SELECT p.id, u.url, 0
FROM products p
JOIN (VALUES
    ('Wireless Bluetooth Headphones',      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'),
    ('Smart Watch Pro',                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
    ('USB-C Fast Charger 65W',             'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'),
    ('Portable Power Bank 20000mAh',       'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'),
    ('Men''s Casual Sneakers',              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),
    ('Leather Wallet Premium',             'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'),
    ('Cotton T-Shirt Pack (3)',            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'),
    ('Sunglasses UV400',                   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'),
    ('Non-Stick Frying Pan Set',           'https://images.unsplash.com/photo-1584990347449-a8be3de1b9a0?w=800&q=80'),
    ('Electric Kettle 1.7L',               'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'),
    ('Stainless Steel Cookware Set',       'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80'),
    ('Blender 1000W',                      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80'),
    ('Vitamin C Serum',                    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'),
    ('Hair Dryer 2200W',                   'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80'),
    ('Yoga Mat Premium',                   'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'),
    ('Dumbbell Set 20kg',                  'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80'),
    ('Water Bottle 1L Insulated',          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'),
    ('Notebook Bundle (5)',                'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80'),
    ('Building Blocks 500pcs',             'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80'),
    ('Organic Coffee Beans 1kg',           'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80')
) AS u(name, url) ON p.name = u.name;

-- Add a second image per product for the gallery
INSERT INTO product_images (product_id, url, position)
SELECT product_id, url, 1
FROM product_images
WHERE position = 0;