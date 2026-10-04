const dotenv = require('dotenv');
dotenv.config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Populating initial demo dataset...');

    await Rating.deleteMany({});
    await Store.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Creating demo users...');

    // 1. Admin User
    const admin = await User.create({
      name: 'Administrator Account Roxiler', // 30 chars
      email: 'admin@roxiler.com',
      password: 'Admin@12345',
      address: 'Plot 101, Tech Park Avenue, Cyber City, Hyderabad',
      role: 'ADMIN',
    });

    // 2. Store Owner User
    const storeOwner = await User.create({
      name: 'Johnathan Store Owner Person', // 28 chars
      email: 'owner@freshmart.com',
      password: 'Owner@12345',
      address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
      role: 'STORE_OWNER',
    });

    // 3. Normal Users
    const userAlice = await User.create({
      name: 'Alice Regular Customer User', // 27 chars
      email: 'alice@customer.com',
      password: 'User@12345',
      address: 'Flat 302, Sunrise Apartments, Indiranagar, Bengaluru',
      role: 'USER',
    });

    const userRobert = await User.create({
      name: 'Robert Regular Shopper Dude', // 27 chars
      email: 'robert@customer.com',
      password: 'User@12345',
      address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
      role: 'USER',
    });

    console.log('[Seed] Creating stores...');

    // Stores
    const store1 = await Store.create({
      name: 'FreshMart Organic Supermarket',
      email: 'owner@freshmart.com',
      address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
      ownerId: storeOwner._id,
    });

    // Link store to owner
    storeOwner.storeId = store1._id;
    await storeOwner.save();

    const store2 = await Store.create({
      name: 'TechGalaxy Gadgets & Hardware',
      email: 'support@techgalaxy.io',
      address: 'Tower B, 1st Floor, Nexus Mall, Koramangala, Bengaluru',
    });

    const store3 = await Store.create({
      name: 'Urban Chic Boutique Apparel',
      email: 'hello@urbanchic.fashion',
      address: '42 Fashion Street, Brigade Road, Bengaluru',
    });

    console.log('[Seed] Submitting initial ratings...');

    // Ratings
    await Rating.create({
      userId: userAlice._id,
      storeId: store1._id,
      rating: 5,
    });

    await Rating.create({
      userId: userRobert._id,
      storeId: store1._id,
      rating: 4,
    });

    await Rating.create({
      userId: userAlice._id,
      storeId: store2._id,
      rating: 4,
    });

    await Rating.create({
      userId: userRobert._id,
      storeId: store3._id,
      rating: 5,
    });

    // Recalculate averages
    await Rating.calculateAverageRating(store1._id);
    await Rating.calculateAverageRating(store2._id);
    await Rating.calculateAverageRating(store3._id);

    console.log('----------------------------------------------------');
    console.log(' Seed Database Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log(' Demo Accounts Created:');
    console.log(' 1. System Administrator:');
    console.log('    Email:    admin@roxiler.com');
    console.log('    Password: Admin@12345');
    console.log(' 2. Store Owner:');
    console.log('    Email:    owner@freshmart.com');
    console.log('    Password: Owner@12345');
    console.log(' 3. Normal User:');
    console.log('    Email:    alice@customer.com (or robert@customer.com)');
    console.log('    Password: User@12345');
    console.log('----------------------------------------------------');

    return true;
  } catch (err) {
    console.error('[Seed] Error populating database:', err);
    throw err;
  }
};

// If run directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
