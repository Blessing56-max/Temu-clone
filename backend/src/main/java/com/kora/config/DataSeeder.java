package com.kora.config;

import com.kora.entity.*;
import com.kora.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("DataSeeder: users already exist, skipping seed.");
            return;
        }

        log.info("DataSeeder: seeding database...");

        // ---- Categories ----
        Map<String, Category> cats = new HashMap<>();
        String[][] catData = {
            {"Electronics", "electronics"},
            {"Fashion", "fashion"},
            {"Home & Kitchen", "home-kitchen"},
            {"Beauty & Health", "beauty-health"},
            {"Sports & Outdoors", "sports-outdoors"},
            {"Books & Stationery", "books-stationery"},
            {"Toys & Games", "toys-games"},
            {"Groceries", "groceries"}
        };
        for (String[] c : catData) {
            Category cat = categoryRepository.save(Category.builder()
                    .name(c[0]).slug(c[1]).build());
            cats.put(c[1], cat);
        }

        // ---- Users (password: Password123!) ----
        String pw = passwordEncoder.encode("Password123!");

        User customer = userRepository.save(User.builder()
                .email("customer@kora.test").passwordHash(pw).fullName("Demo Customer")
                .phone("+2348025555555").role(Role.CUSTOMER)
                .emailVerified(true).enabled(true).build());

        userRepository.save(User.builder()
                .email("admin@kora.test").passwordHash(pw).fullName("Kora Admin")
                .phone("+2348026666666").role(Role.ADMIN)
                .emailVerified(true).enabled(true).build());

        User blessing = userRepository.save(User.builder()
                .email("blessing@kora.test").passwordHash(pw).fullName("Adedayo Blessing")
                .phone("+2348021111111").role(Role.SELLER)
                .emailVerified(true).enabled(true).build());

        User nathan = userRepository.save(User.builder()
                .email("nathan@kora.test").passwordHash(pw).fullName("Adedayo Nathan")
                .phone("+2348022222222").role(Role.SELLER)
                .emailVerified(true).enabled(true).build());

        User techhub = userRepository.save(User.builder()
                .email("techhub@kora.test").passwordHash(pw).fullName("TechHub Store")
                .phone("+2348023333333").role(Role.SELLER)
                .emailVerified(true).enabled(true).build());

        User fashionhub = userRepository.save(User.builder()
                .email("fashionhub@kora.test").passwordHash(pw).fullName("Fashion Hub")
                .phone("+2348024444444").role(Role.SELLER)
                .emailVerified(true).enabled(true).build());

        // ---- Products (50) ----
        // [seller, category_slug, name, description, price, discount, stock, imageUrl]
        Object[][] products = {
            // Electronics (10)
            {blessing, "electronics", "Wireless Bluetooth Headphones", "Premium noise-cancelling headphones with 40-hour battery life.", 45000, 38000, 25, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"},
            {blessing, "electronics", "Smart Watch Pro", "Fitness tracking, heart rate monitor, and 7-day battery life.", 85000, 72000, 15, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"},
            {blessing, "electronics", "USB-C Fast Charger 65W", "Universal fast charger for laptops, phones, and tablets.", 15000, null, 50, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80"},
            {blessing, "electronics", "Portable Power Bank 20000mAh", "Charge devices 4-5 times on a single charge.", 22000, 19000, 30, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80"},
            {techhub, "electronics", "Bluetooth Speaker 20W", "Portable waterproof speaker with deep bass.", 32000, 27000, 30, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"},
            {techhub, "electronics", "Gaming Mouse RGB", "7-button gaming mouse with adjustable DPI.", 18000, 14500, 42, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"},
            {techhub, "electronics", "Mechanical Keyboard TKL", "Tenkeyless mechanical keyboard with blue switches.", 48000, null, 18, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"},
            {techhub, "electronics", "USB-C Hub 7-in-1", "HDMI, USB 3.0, SD card reader, pass-through charging.", 25000, 21000, 35, "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80"},
            {blessing, "electronics", "Wireless Charging Pad", "Fast Qi wireless charger, 15W output.", 15000, 12000, 60, "https://images.unsplash.com/photo-1591290619762-c1f7a50d1d5c?w=800&q=80"},
            {blessing, "electronics", "Ring Light 10-inch", "Adjustable LED ring light with tripod.", 22000, 18000, 25, "https://images.unsplash.com/photo-1610229589830-6b5b1e47c020?w=800&q=80"},

            // Fashion (10)
            {nathan, "fashion", "Men's Casual Sneakers", "Comfortable everyday sneakers.", 35000, 28000, 20, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"},
            {nathan, "fashion", "Leather Wallet Premium", "Genuine leather wallet with RFID protection.", 12000, null, 40, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"},
            {nathan, "fashion", "Cotton T-Shirt Pack (3)", "Premium cotton t-shirts, breathable.", 18000, 15000, 60, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"},
            {nathan, "fashion", "Sunglasses UV400", "Polarized lenses with UV400 protection.", 25000, 20000, 18, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"},
            {nathan, "fashion", "Denim Jacket Classic", "Washed denim jacket with button front.", 42000, 35000, 22, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"},
            {nathan, "fashion", "Leather Belt Handmade", "Genuine leather belt, brushed metal buckle.", 15000, null, 55, "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80"},
            {fashionhub, "fashion", "Wool Scarf Winter", "Soft merino wool scarf, 180cm.", 18000, 14000, 40, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80"},
            {fashionhub, "fashion", "Canvas Tote Bag", "Heavy canvas tote with leather handles.", 12000, null, 70, "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"},
            {fashionhub, "fashion", "Ankle Boots Suede", "Suede ankle boots with stacked heel.", 65000, 52000, 15, "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80"},
            {nathan, "fashion", "Baseball Cap Embroidered", "Structured cotton cap, adjustable strap.", 8500, 6500, 80, "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80"},

            // Home & Kitchen (8)
            {techhub, "home-kitchen", "Non-Stick Frying Pan Set", "Set of 3 non-stick pans. Dishwasher safe.", 28000, 23000, 12, "https://images.unsplash.com/photo-1584990347449-a8be3de1b9a0?w=800&q=80"},
            {techhub, "home-kitchen", "Electric Kettle 1.7L", "Fast boiling with auto shut-off.", 18000, null, 35, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80"},
            {techhub, "home-kitchen", "Stainless Steel Cookware Set", "10-piece cookware set. Induction compatible.", 95000, 82000, 8, "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80"},
            {techhub, "home-kitchen", "Blender 1000W", "Powerful blender with glass jar.", 42000, 36000, 14, "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80"},
            {blessing, "home-kitchen", "Ceramic Dinner Set 16pc", "Service for 4. Dinner plates, side plates, bowls, mugs.", 68000, 55000, 12, "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"},
            {blessing, "home-kitchen", "Coffee Grinder Manual", "Burr grinder with ceramic conical burrs.", 22000, null, 30, "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80"},
            {techhub, "home-kitchen", "Air Fryer 5.5L", "Digital air fryer with 8 preset programs.", 85000, 72000, 14, "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80"},
            {blessing, "home-kitchen", "Woven Storage Basket", "Handwoven seagrass basket with lid.", 18000, 15000, 25, "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80"},

            // Beauty & Health (6)
            {fashionhub, "beauty-health", "Vitamin C Serum", "Brightening serum with 20% Vitamin C.", 15000, 12000, 45, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"},
            {techhub, "beauty-health", "Hair Dryer 2200W", "Professional hair dryer with ionic technology.", 32000, 27000, 20, "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80"},
            {fashionhub, "beauty-health", "Hyaluronic Acid Serum", "Hydrating serum with 2% hyaluronic acid.", 18000, 14000, 50, "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80"},
            {fashionhub, "beauty-health", "Shea Body Butter", "Raw shea butter whipped with coconut oil.", 9500, null, 65, "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80"},
            {fashionhub, "beauty-health", "Facial Cleansing Brush", "Silicone sonic cleansing brush, waterproof.", 28000, 24000, 30, "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"},
            {blessing, "beauty-health", "Essential Oil Set 6pc", "Lavender, eucalyptus, tea tree, peppermint, orange, lemon.", 22000, 18000, 40, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"},

            // Sports & Outdoors (6)
            {fashionhub, "sports-outdoors", "Yoga Mat Premium", "Non-slip yoga mat 6mm thick.", 20000, 16000, 25, "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80"},
            {fashionhub, "sports-outdoors", "Dumbbell Set 20kg", "Adjustable dumbbell set with chrome finish.", 55000, 48000, 10, "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80"},
            {fashionhub, "sports-outdoors", "Water Bottle 1L Insulated", "Stainless steel insulated bottle.", 12000, null, 50, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80"},
            {nathan, "sports-outdoors", "Resistance Bands Set 5pc", "Latex resistance bands, light to extra heavy.", 15000, 12000, 55, "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80"},
            {nathan, "sports-outdoors", "Jump Rope Speed", "Adjustable speed rope with ball bearings.", 8500, null, 70, "https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&q=80"},
            {fashionhub, "sports-outdoors", "Sports Duffel Bag", "Water-resistant gym bag with shoe compartment.", 32000, 27000, 22, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"},

            // Books & Toys (2)
            {fashionhub, "books-stationery", "Notebook Bundle (5)", "A5 size notebooks, 200 pages each, ruled.", 8000, 6500, 100, "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80"},
            {nathan, "books-stationery", "Leather Journal A5", "Hand-bound leather journal with 200 pages.", 18000, 14000, 35, "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"},

            // Toys & Groceries (2)
            {fashionhub, "toys-games", "Building Blocks 500pcs", "Creative building set for kids 5+.", 25000, 21000, 22, "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80"},
            {blessing, "toys-games", "Wooden Puzzle Set", "Educational wooden puzzles for ages 3+.", 15000, 12000, 30, "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80"},
            {blessing, "groceries", "Organic Coffee Beans 1kg", "Single-origin arabica beans, roasted weekly.", 18000, 15000, 30, "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"},
            {blessing, "groceries", "Raw Honey 500g", "Unfiltered raw honey from local beekeepers.", 8500, null, 50, "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80"},
        };

        int count = 0;
        for (Object[] row : products) {
            User seller = (User) row[0];
            Category cat = cats.get((String) row[1]);
            String name = (String) row[2];
            String desc = (String) row[3];
            BigDecimal price = BigDecimal.valueOf(((Number) row[4]).longValue());
            BigDecimal discount = row[5] == null ? null : BigDecimal.valueOf(((Number) row[5]).longValue());
            Integer stock = ((Number) row[6]).intValue();
            String imageUrl = (String) row[7];

            Product p = Product.builder()
                    .seller(seller).category(cat)
                    .name(name).description(desc)
                    .price(price).discountPrice(discount)
                    .stock(stock).active(true)
                    .build();
            p.getImages().add(ProductImage.builder().product(p).url(imageUrl).position(0).build());
            p.getImages().add(ProductImage.builder().product(p).url(imageUrl + "&sat=2").position(1).build());
            productRepository.save(p);
            count++;
        }

        log.info("DataSeeder: seeded {} users, {} categories, {} products.", 
                userRepository.count(), cats.size(), count);
        log.info("Demo logins (password: Password123!): customer@kora.test, admin@kora.test, blessing@kora.test, nathan@kora.test, techhub@kora.test, fashionhub@kora.test");
    }
}