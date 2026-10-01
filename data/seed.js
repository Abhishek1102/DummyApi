const bcrypt = require('bcryptjs');
const db = require('../config/db');

function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('⚠️  Database already has data. Skipping seed.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);

  // ===== SEED USERS (20 users) =====
  const users = [
    { name: 'Test User', email: 'test@example.com', password: bcrypt.hashSync('password123', salt), age: 25, city: 'Mumbai', bio: 'Default test account for API practice', role: 'admin' },
    { name: 'Aarav Sharma', email: 'aarav@example.com', password: bcrypt.hashSync('pass1234', salt), age: 22, city: 'Delhi', bio: 'Android developer and tech enthusiast', role: 'user' },
    { name: 'Priya Patel', email: 'priya@example.com', password: bcrypt.hashSync('pass1234', salt), age: 28, city: 'Bangalore', bio: 'Full-stack developer', role: 'user' },
    { name: 'Rahul Kumar', email: 'rahul@example.com', password: bcrypt.hashSync('pass1234', salt), age: 30, city: 'Hyderabad', bio: 'Mobile app developer specializing in Flutter', role: 'user' },
    { name: 'Sneha Gupta', email: 'sneha@example.com', password: bcrypt.hashSync('pass1234', salt), age: 26, city: 'Pune', bio: 'UI/UX designer turned developer', role: 'user' },
    { name: 'Vikram Singh', email: 'vikram@example.com', password: bcrypt.hashSync('pass1234', salt), age: 35, city: 'Chennai', bio: 'Senior backend engineer', role: 'moderator' },
    { name: 'Ananya Reddy', email: 'ananya@example.com', password: bcrypt.hashSync('pass1234', salt), age: 24, city: 'Kolkata', bio: 'React Native developer', role: 'user' },
    { name: 'Arjun Nair', email: 'arjun@example.com', password: bcrypt.hashSync('pass1234', salt), age: 29, city: 'Kochi', bio: 'DevOps and cloud engineer', role: 'user' },
    { name: 'Kavya Menon', email: 'kavya@example.com', password: bcrypt.hashSync('pass1234', salt), age: 27, city: 'Jaipur', bio: 'Data scientist with ML expertise', role: 'user' },
    { name: 'Rohan Das', email: 'rohan@example.com', password: bcrypt.hashSync('pass1234', salt), age: 31, city: 'Lucknow', bio: 'Kotlin enthusiast and Android lead', role: 'user' },
    { name: 'Meera Iyer', email: 'meera@example.com', password: bcrypt.hashSync('pass1234', salt), age: 23, city: 'Ahmedabad', bio: 'Frontend developer and blogger', role: 'user' },
    { name: 'Karthik Raj', email: 'karthik@example.com', password: bcrypt.hashSync('pass1234', salt), age: 33, city: 'Coimbatore', bio: 'Java & Spring Boot specialist', role: 'user' },
    { name: 'Ishita Verma', email: 'ishita@example.com', password: bcrypt.hashSync('pass1234', salt), age: 21, city: 'Indore', bio: 'Computer science student and coder', role: 'user' },
    { name: 'Aditya Joshi', email: 'aditya@example.com', password: bcrypt.hashSync('pass1234', salt), age: 28, city: 'Nagpur', bio: 'iOS and Android developer', role: 'user' },
    { name: 'Divya Saxena', email: 'divya@example.com', password: bcrypt.hashSync('pass1234', salt), age: 26, city: 'Bhopal', bio: 'Python developer and automation expert', role: 'user' },
    { name: 'Manish Tiwari', email: 'manish@example.com', password: bcrypt.hashSync('pass1234', salt), age: 34, city: 'Patna', bio: 'Tech lead and mentor', role: 'moderator' },
    { name: 'Nisha Kapoor', email: 'nisha@example.com', password: bcrypt.hashSync('pass1234', salt), age: 25, city: 'Chandigarh', bio: 'Flutter developer and open source contributor', role: 'user' },
    { name: 'Siddharth Rao', email: 'siddharth@example.com', password: bcrypt.hashSync('pass1234', salt), age: 29, city: 'Visakhapatnam', bio: 'Node.js and Express specialist', role: 'user' },
    { name: 'Pooja Mishra', email: 'pooja@example.com', password: bcrypt.hashSync('pass1234', salt), age: 27, city: 'Surat', bio: 'QA engineer and automation tester', role: 'user' },
    { name: 'Amit Chauhan', email: 'amit@example.com', password: bcrypt.hashSync('pass1234', salt), age: 32, city: 'Gurgaon', bio: 'Product manager and former developer', role: 'user' },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, age, city, bio, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const insertManyUsers = db.transaction((users) => {
    for (const u of users) {
      insertUser.run(u.name, u.email, u.password, u.age, u.city, u.bio, u.role);
    }
  });
  insertManyUsers(users);
  console.log(`  ✅ Inserted ${users.length} users`);

  // ===== SEED PRODUCTS (30 products) =====
  const products = [
    // Electronics (6)
    { name: 'Wireless Bluetooth Headphones', description: 'High-quality noise cancelling wireless headphones with 30-hour battery life', price: 2999.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=Headphones', stock: 50, rating: 4.5 },
    { name: 'USB-C Fast Charger 65W', description: 'GaN fast charger supporting PD 3.0 and QC 4.0', price: 1499.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=Charger', stock: 120, rating: 4.3 },
    { name: 'Mechanical Keyboard RGB', description: 'Cherry MX Blue switches, full RGB backlighting, tenkeyless', price: 4599.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=Keyboard', stock: 35, rating: 4.7 },
    { name: 'Portable Power Bank 20000mAh', description: 'Slim portable charger with dual USB-C ports', price: 1899.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=PowerBank', stock: 80, rating: 4.2 },
    { name: 'Smart Watch Fitness Tracker', description: 'Heart rate monitor, SpO2, GPS, 14-day battery', price: 3499.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=SmartWatch', stock: 45, rating: 4.4 },
    { name: 'Webcam 1080p HD', description: 'Auto-focus webcam with built-in microphone for video calls', price: 2199.00, category: 'Electronics', image_url: 'https://via.placeholder.com/300x300?text=Webcam', stock: 60, rating: 4.1 },

    // Clothing (6)
    { name: 'Classic Cotton T-Shirt', description: 'Premium 100% cotton crew neck t-shirt, available in multiple colors', price: 599.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=TShirt', stock: 200, rating: 4.0 },
    { name: 'Slim Fit Denim Jeans', description: 'Stretchable slim fit jeans with comfortable waistband', price: 1299.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=Jeans', stock: 150, rating: 4.3 },
    { name: 'Running Shoes Air Max', description: 'Lightweight running shoes with air cushion sole', price: 3999.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=Shoes', stock: 75, rating: 4.6 },
    { name: 'Formal Blazer Navy', description: 'Tailored fit blazer for office and formal events', price: 4499.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=Blazer', stock: 30, rating: 4.2 },
    { name: 'Winter Hoodie Fleece', description: 'Warm fleece-lined hoodie with zip closure', price: 1599.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=Hoodie', stock: 90, rating: 4.5 },
    { name: 'Sports Track Pants', description: 'Moisture-wicking track pants with zip pockets', price: 899.00, category: 'Clothing', image_url: 'https://via.placeholder.com/300x300?text=TrackPants', stock: 110, rating: 4.1 },

    // Books (6)
    { name: 'Clean Code', description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', price: 499.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=CleanCode', stock: 100, rating: 4.8 },
    { name: 'Head First Design Patterns', description: 'A brain-friendly guide to design patterns', price: 699.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=DesignPatterns', stock: 80, rating: 4.6 },
    { name: 'Android Programming with Kotlin', description: 'Comprehensive guide to Android development with Kotlin', price: 599.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=KotlinAndroid', stock: 65, rating: 4.4 },
    { name: 'System Design Interview', description: 'An insider guide to system design interviews', price: 799.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=SystemDesign', stock: 55, rating: 4.7 },
    { name: 'The Pragmatic Programmer', description: 'Your journey to mastery by David Thomas and Andrew Hunt', price: 549.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=PragmaticProg', stock: 70, rating: 4.9 },
    { name: 'Flutter in Action', description: 'Build cross-platform apps with Flutter and Dart', price: 649.00, category: 'Books', image_url: 'https://via.placeholder.com/300x300?text=FlutterAction', stock: 40, rating: 4.3 },

    // Sports (6)
    { name: 'Yoga Mat Premium', description: 'Non-slip 6mm thick yoga mat with carry strap', price: 999.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=YogaMat', stock: 85, rating: 4.4 },
    { name: 'Resistance Bands Set', description: 'Set of 5 resistance bands with different strengths', price: 499.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=ResistanceBands', stock: 130, rating: 4.2 },
    { name: 'Adjustable Dumbbells 10kg', description: 'Space-saving adjustable dumbbells pair', price: 2999.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=Dumbbells', stock: 40, rating: 4.5 },
    { name: 'Cricket Bat English Willow', description: 'Grade A English Willow bat for professional play', price: 5999.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=CricketBat', stock: 20, rating: 4.7 },
    { name: 'Football Size 5', description: 'FIFA approved match ball with thermal bonding', price: 1299.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=Football', stock: 60, rating: 4.3 },
    { name: 'Skipping Rope Speed', description: 'Adjustable speed skipping rope with ball bearings', price: 349.00, category: 'Sports', image_url: 'https://via.placeholder.com/300x300?text=SkippingRope', stock: 150, rating: 4.1 },

    // Home (6)
    { name: 'LED Desk Lamp', description: 'Dimmable LED desk lamp with USB charging port and 5 color modes', price: 1799.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=DeskLamp', stock: 70, rating: 4.3 },
    { name: 'Stainless Steel Water Bottle', description: 'Vacuum insulated 1L bottle, keeps drinks hot/cold 24hrs', price: 699.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=WaterBottle', stock: 200, rating: 4.5 },
    { name: 'Ceramic Coffee Mug Set', description: 'Set of 4 handcrafted ceramic mugs, 350ml each', price: 899.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=CoffeeMugs', stock: 95, rating: 4.2 },
    { name: 'Bamboo Laptop Stand', description: 'Ergonomic bamboo stand with ventilation slots', price: 1499.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=LaptopStand', stock: 55, rating: 4.6 },
    { name: 'Aroma Essential Oil Diffuser', description: 'Ultrasonic diffuser with 7 LED colors, 300ml capacity', price: 1299.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=Diffuser', stock: 45, rating: 4.4 },
    { name: 'Wall Clock Minimalist', description: 'Silent sweep 12-inch modern minimalist wall clock', price: 799.00, category: 'Home', image_url: 'https://via.placeholder.com/300x300?text=WallClock', stock: 80, rating: 4.0 },
  ];

  const insertProduct = db.prepare(
    'INSERT INTO products (name, description, price, category, image_url, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const insertManyProducts = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.name, p.description, p.price, p.category, p.image_url, p.stock, p.rating);
    }
  });
  insertManyProducts(products);
  console.log(`  ✅ Inserted ${products.length} products`);

  // ===== SEED POSTS (15 posts) =====
  const posts = [
    { user_id: 1, title: 'Getting Started with Retrofit in Android', content: 'Retrofit is a type-safe HTTP client for Android and Java. In this post, I\'ll walk you through setting up Retrofit in your Android project, creating API interfaces, and making your first network call. We\'ll also look at how to handle errors and parse JSON responses using Gson.', likes: 24 },
    { user_id: 2, title: 'Understanding Kotlin Coroutines', content: 'Coroutines simplify asynchronous programming in Kotlin. They allow you to write asynchronous code in a sequential manner. In this article, we\'ll explore launch, async, withContext, and how to use them effectively in your Android applications.', likes: 18 },
    { user_id: 3, title: 'Flutter vs React Native in 2024', content: 'Both Flutter and React Native are powerful frameworks for cross-platform development. This comparison covers performance, developer experience, community support, and when to choose one over the other.', likes: 42 },
    { user_id: 4, title: 'JWT Authentication Explained Simply', content: 'JSON Web Tokens (JWT) are a compact way to securely transmit information between parties. I\'ll explain how JWT works, the structure of a token (header, payload, signature), and how to implement it in your mobile app.', likes: 31 },
    { user_id: 5, title: 'Best Practices for REST API Design', content: 'A well-designed API is crucial for any application. This post covers naming conventions, HTTP methods, status codes, pagination, error handling, and versioning strategies that every developer should know.', likes: 56 },
    { user_id: 6, title: 'Android MVVM Architecture Deep Dive', content: 'The Model-View-ViewModel architecture pattern helps separate concerns in Android apps. We\'ll implement MVVM from scratch using ViewModel, LiveData, and Repository pattern with a practical example.', likes: 37 },
    { user_id: 7, title: 'File Upload in Android: A Complete Guide', content: 'Uploading files (images, videos, documents) from Android apps is a common requirement. This guide covers using OkHttp and Retrofit for multipart file uploads, handling progress, and managing large files.', likes: 29 },
    { user_id: 8, title: 'Introduction to Jetpack Compose', content: 'Jetpack Compose is Android\'s modern toolkit for building native UI. It simplifies and accelerates UI development with less code, powerful tools, and intuitive Kotlin APIs. Let\'s build our first Compose app!', likes: 45 },
    { user_id: 9, title: 'Database Optimization Tips for Mobile Apps', content: 'Performance matters in mobile apps. This post discusses Room database optimization, indexing strategies, query optimization, and how to profile database performance in Android.', likes: 15 },
    { user_id: 10, title: 'Handling Network States in Android', content: 'Users expect apps to handle network changes gracefully. Learn how to detect connectivity changes, implement offline-first architecture, and show appropriate UI states using Kotlin Flow.', likes: 22 },
    { user_id: 1, title: 'Mastering RecyclerView', content: 'RecyclerView is the backbone of lists in Android. This comprehensive guide covers ViewHolder pattern, DiffUtil, multiple view types, item decoration, and smooth scrolling optimizations.', likes: 38 },
    { user_id: 3, title: 'State Management in Flutter', content: 'Managing state effectively is key to building robust Flutter apps. We compare Provider, Riverpod, BLoC, and GetX - their pros, cons, and when to use each approach.', likes: 33 },
    { user_id: 5, title: 'API Security Best Practices', content: 'Securing your API is non-negotiable. This post covers HTTPS, authentication methods, rate limiting, input validation, CORS, and common vulnerabilities to watch out for.', likes: 27 },
    { user_id: 2, title: 'Dependency Injection with Hilt', content: 'Hilt is Jetpack\'s recommended DI library for Android. It reduces boilerplate and provides compile-time correctness. Let\'s set it up and inject dependencies into ViewModels, Fragments, and Services.', likes: 20 },
    { user_id: 4, title: 'Building Offline-First Apps', content: 'Users don\'t always have internet. Learn to build apps that work offline using Room, WorkManager for sync, and conflict resolution strategies. Includes a practical e-commerce app example.', likes: 35 },
  ];

  const insertPost = db.prepare(
    'INSERT INTO posts (user_id, title, content, likes) VALUES (?, ?, ?, ?)'
  );

  const insertManyPosts = db.transaction((posts) => {
    for (const p of posts) {
      insertPost.run(p.user_id, p.title, p.content, p.likes);
    }
  });
  insertManyPosts(posts);
  console.log(`  ✅ Inserted ${posts.length} posts`);

  // ===== SEED COMMENTS (40 comments) =====
  const comments = [
    { post_id: 1, user_id: 2, content: 'Great tutorial! Retrofit made API calls so much easier for me.' },
    { post_id: 1, user_id: 3, content: 'Can you also cover interceptors and logging?' },
    { post_id: 1, user_id: 5, content: 'This saved me hours of debugging. Thank you!' },
    { post_id: 2, user_id: 1, content: 'Coroutines are a game changer for Android dev.' },
    { post_id: 2, user_id: 4, content: 'The withContext example really clarified things for me.' },
    { post_id: 2, user_id: 6, content: 'How does this compare to RxJava?' },
    { post_id: 3, user_id: 7, content: 'I switched from React Native to Flutter and never looked back!' },
    { post_id: 3, user_id: 8, content: 'Both have their place. It depends on the project requirements.' },
    { post_id: 3, user_id: 9, content: 'Flutter\'s hot reload is amazing for productivity.' },
    { post_id: 4, user_id: 10, content: 'Finally understood how JWT refresh tokens work!' },
    { post_id: 4, user_id: 1, content: 'Security tip: always validate tokens on the server side.' },
    { post_id: 4, user_id: 3, content: 'What about storing tokens securely on Android?' },
    { post_id: 5, user_id: 2, content: 'This should be mandatory reading for all backend devs.' },
    { post_id: 5, user_id: 4, content: 'The pagination section was very helpful.' },
    { post_id: 5, user_id: 6, content: 'Can you add examples for GraphQL APIs too?' },
    { post_id: 5, user_id: 8, content: 'Bookmarked for reference. Excellent resource!' },
    { post_id: 6, user_id: 1, content: 'MVVM + Repository + Coroutines = Best combo!' },
    { post_id: 6, user_id: 5, content: 'How do you handle the ViewModel for multiple data sources?' },
    { post_id: 6, user_id: 9, content: 'This architecture example is very clean.' },
    { post_id: 7, user_id: 3, content: 'File upload was always confusing. This makes it clear!' },
    { post_id: 7, user_id: 7, content: 'What about progress tracking for large files?' },
    { post_id: 7, user_id: 10, content: 'I use this approach in production. Works great!' },
    { post_id: 8, user_id: 2, content: 'Compose is the future of Android UI.' },
    { post_id: 8, user_id: 4, content: 'Still getting used to the declarative paradigm.' },
    { post_id: 8, user_id: 6, content: 'The LazyColumn performance is impressive.' },
    { post_id: 9, user_id: 1, content: 'Indexing alone improved my query speed by 10x!' },
    { post_id: 9, user_id: 5, content: 'Database Inspector in Android Studio is a great tool for profiling.' },
    { post_id: 10, user_id: 3, content: 'Offline-first with Flow is the way to go.' },
    { post_id: 10, user_id: 7, content: 'ConnectivityManager callback example would be nice.' },
    { post_id: 11, user_id: 2, content: 'DiffUtil is a must for smooth scrolling!' },
    { post_id: 11, user_id: 8, content: 'How about ListAdapter with DiffUtil?' },
    { post_id: 11, user_id: 10, content: 'The multiple view types section was exactly what I needed.' },
    { post_id: 12, user_id: 1, content: 'Riverpod is my favorite state management solution.' },
    { post_id: 12, user_id: 4, content: 'BLoC has a steeper learning curve but is very powerful.' },
    { post_id: 13, user_id: 6, content: 'Rate limiting saved our API from abuse. Highly recommend.' },
    { post_id: 13, user_id: 9, content: 'CORS configuration is often overlooked. Good mention!' },
    { post_id: 14, user_id: 3, content: 'Hilt simplified our DI setup significantly.' },
    { post_id: 14, user_id: 5, content: 'Much better than Dagger 2 for most projects.' },
    { post_id: 15, user_id: 7, content: 'WorkManager for sync is perfect for this use case.' },
    { post_id: 15, user_id: 10, content: 'The conflict resolution strategy section is gold!' },
  ];

  const insertComment = db.prepare(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
  );

  const insertManyComments = db.transaction((comments) => {
    for (const c of comments) {
      insertComment.run(c.post_id, c.user_id, c.content);
    }
  });
  insertManyComments(comments);
  console.log(`  ✅ Inserted ${comments.length} comments`);

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📌 Test Account:');
  console.log('   Email:    test@example.com');
  console.log('   Password: password123');
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = seedDatabase;
