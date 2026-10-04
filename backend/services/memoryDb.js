const bcrypt = require('bcryptjs');

// Preloaded demo dataset
const users = [
  {
    _id: 'u1',
    id: 'u1',
    name: 'Administrator Account Roxiler',
    email: 'admin@roxiler.com',
    passwordHash: bcrypt.hashSync('Admin@12345', 10),
    address: 'Plot 101, Tech Park Avenue, Cyber City, Hyderabad',
    role: 'ADMIN',
    storeId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    _id: 'u2',
    id: 'u2',
    name: 'Johnathan Store Owner Person',
    email: 'owner@freshmart.com',
    passwordHash: bcrypt.hashSync('Owner@12345', 10),
    address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
    role: 'STORE_OWNER',
    storeId: 's1',
    createdAt: new Date('2026-01-02T00:00:00Z'),
  },
  {
    _id: 'u3',
    id: 'u3',
    name: 'Alice Regular Customer User',
    email: 'alice@customer.com',
    passwordHash: bcrypt.hashSync('User@12345', 10),
    address: 'Flat 302, Sunrise Apartments, Indiranagar, Bengaluru',
    role: 'USER',
    storeId: null,
    createdAt: new Date('2026-01-03T00:00:00Z'),
  },
  {
    _id: 'u4',
    id: 'u4',
    name: 'Robert Regular Shopper Dude',
    email: 'robert@customer.com',
    passwordHash: bcrypt.hashSync('User@12345', 10),
    address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
    role: 'USER',
    storeId: null,
    createdAt: new Date('2026-01-04T00:00:00Z'),
  },
];

const stores = [
  {
    _id: 's1',
    id: 's1',
    name: 'FreshMart Organic Supermarket',
    email: 'owner@freshmart.com',
    address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
    ownerId: 'u2',
    averageRating: 4.5,
    totalRatings: 2,
    createdAt: new Date('2026-01-02T00:00:00Z'),
  },
  {
    _id: 's2',
    id: 's2',
    name: 'TechGalaxy Gadgets & Hardware',
    email: 'support@techgalaxy.io',
    address: 'Tower B, 1st Floor, Nexus Mall, Koramangala, Bengaluru',
    ownerId: null,
    averageRating: 4.0,
    totalRatings: 1,
    createdAt: new Date('2026-01-03T00:00:00Z'),
  },
  {
    _id: 's3',
    id: 's3',
    name: 'Urban Chic Boutique Apparel',
    email: 'hello@urbanchic.fashion',
    address: '42 Fashion Street, Brigade Road, Bengaluru',
    ownerId: null,
    averageRating: 5.0,
    totalRatings: 1,
    createdAt: new Date('2026-01-04T00:00:00Z'),
  },
];

const ratings = [
  {
    _id: 'r1',
    userId: 'u3',
    storeId: 's1',
    rating: 5,
    updatedAt: new Date('2026-01-05T10:00:00Z'),
  },
  {
    _id: 'r2',
    userId: 'u4',
    storeId: 's1',
    rating: 4,
    updatedAt: new Date('2026-01-05T11:00:00Z'),
  },
  {
    _id: 'r3',
    userId: 'u3',
    storeId: 's2',
    rating: 4,
    updatedAt: new Date('2026-01-05T12:00:00Z'),
  },
  {
    _id: 'r4',
    userId: 'u4',
    storeId: 's3',
    rating: 5,
    updatedAt: new Date('2026-01-05T13:00:00Z'),
  },
];

// Helper to recalculate store ratings
const recalculateStoreRating = (storeId) => {
  const storeRatings = ratings.filter((r) => r.storeId === storeId);
  const store = stores.find((s) => s._id === storeId);
  if (!store) return;

  if (storeRatings.length === 0) {
    store.averageRating = 0;
    store.totalRatings = 0;
  } else {
    const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
    store.averageRating = Math.round((sum / storeRatings.length) * 10) / 10;
    store.totalRatings = storeRatings.length;
  }
};

const memoryDb = {
  // Users
  findUserByEmail: async (email) => {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  findUserById: async (id) => {
    return users.find((u) => u._id === id || u.id === id) || null;
  },

  createUser: async ({ name, email, password, address, role = 'USER' }) => {
    const newUser = {
      _id: `u${Date.now()}`,
      id: `u${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      passwordHash: bcrypt.hashSync(password, 10),
      address,
      role,
      storeId: null,
      createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  },

  comparePassword: async (user, candidatePassword) => {
    return bcrypt.compare(candidatePassword, user.passwordHash);
  },

  updatePassword: async (userId, newPassword) => {
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) throw new Error('User not found');
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    return true;
  },

  getStats: async () => {
    return {
      totalUsers: users.length,
      totalStores: stores.length,
      totalRatings: ratings.length,
    };
  },

  getUsers: async ({ name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    let list = [...users];

    if (name) list = list.filter((u) => u.name.toLowerCase().includes(name.toLowerCase()));
    if (email) list = list.filter((u) => u.email.toLowerCase().includes(email.toLowerCase()));
    if (address) list = list.filter((u) => u.address.toLowerCase().includes(address.toLowerCase()));
    if (role && role !== 'ALL') list = list.filter((u) => u.role === role);

    list.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return list.map((u) => {
      let storeObj = null;
      let storeRating = null;
      if (u.role === 'STORE_OWNER') {
        const store = stores.find((s) => s.ownerId === u._id || s.email === u.email);
        if (store) {
          storeObj = {
            storeId: store._id,
            storeName: store.name,
            averageRating: store.averageRating,
            totalRatings: store.totalRatings,
          };
          storeRating = store.averageRating;
        }
      }
      return {
        _id: u._id,
        id: u._id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        store: storeObj,
        storeRating,
        createdAt: u.createdAt,
      };
    });
  },

  // Stores
  getStores: async ({ name, email, address, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    let list = [...stores];

    if (name) list = list.filter((s) => s.name.toLowerCase().includes(name.toLowerCase()));
    if (email) list = list.filter((s) => s.email.toLowerCase().includes(email.toLowerCase()));
    if (address) list = list.filter((s) => s.address.toLowerCase().includes(address.toLowerCase()));

    list.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return list.map((s) => {
      const owner = users.find((u) => u._id === s.ownerId);
      return {
        ...s,
        ownerId: owner ? { _id: owner._id, name: owner.name, email: owner.email } : null,
      };
    });
  },

  getStoresForUser: async ({ userId, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    let list = [...stores];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    const userRatingsMap = {};
    ratings
      .filter((r) => r.userId === userId)
      .forEach((r) => {
        userRatingsMap[r.storeId] = {
          ratingId: r._id,
          rating: r.rating,
          updatedAt: r.updatedAt,
        };
      });

    return list.map((s) => ({
      ...s,
      myRating: userRatingsMap[s._id] || null,
    }));
  },

  createStore: async ({ name, email, address, ownerId }) => {
    const newStore = {
      _id: `s${Date.now()}`,
      id: `s${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      address,
      ownerId: ownerId || null,
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date(),
    };
    stores.push(newStore);

    if (ownerId) {
      const user = users.find((u) => u._id === ownerId);
      if (user) {
        user.role = 'STORE_OWNER';
        user.storeId = newStore._id;
      }
    }
    return newStore;
  },

  getStoreOwnerDashboard: async (userId, userEmail) => {
    let store = stores.find((s) => s.ownerId === userId);
    if (!store) {
      store = stores.find((s) => s.email.toLowerCase() === userEmail?.toLowerCase());
    }

    if (!store) {
      throw new Error('No store found associated with your store owner account.');
    }

    const storeRatings = ratings
      .filter((r) => r.storeId === store._id)
      .map((r) => {
        const user = users.find((u) => u._id === r.userId);
        return {
          ratingId: r._id,
          rating: r.rating,
          ratedAt: r.updatedAt,
          user: user
            ? { id: user._id, name: user.name, email: user.email, address: user.address }
            : { name: 'Anonymous User', email: 'N/A', address: 'N/A' },
        };
      })
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    return {
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.averageRating,
        totalRatings: store.totalRatings,
      },
      ratings: storeRatings,
    };
  },

  // Ratings
  submitOrUpdateRating: async ({ userId, storeId, rating }) => {
    let existing = ratings.find((r) => r.userId === userId && r.storeId === storeId);
    let isModified = false;

    if (existing) {
      existing.rating = rating;
      existing.updatedAt = new Date();
      isModified = true;
    } else {
      existing = {
        _id: `r${Date.now()}`,
        userId,
        storeId,
        rating,
        updatedAt: new Date(),
      };
      ratings.push(existing);
    }

    recalculateStoreRating(storeId);
    const store = stores.find((s) => s._id === storeId);

    return {
      isModified,
      rating: existing,
      store: {
        id: store._id,
        averageRating: store.averageRating,
        totalRatings: store.totalRatings,
      },
    };
  },
};

module.exports = memoryDb;
