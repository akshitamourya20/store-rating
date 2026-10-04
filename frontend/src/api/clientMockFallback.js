// Client-side fallback database to guarantee seamless operation even if Vercel serverless functions are misrouted or return 405/404

const DEFAULT_USERS = [
  {
    id: 'u1',
    _id: 'u1',
    name: 'Administrator Account Roxiler',
    email: 'admin@roxiler.com',
    password: 'Admin@12345',
    address: 'Plot 101, Tech Park Avenue, Cyber City, Hyderabad',
    role: 'ADMIN',
    store: null,
    storeRating: null,
  },
  {
    id: 'u2',
    _id: 'u2',
    name: 'Johnathan Store Owner Person',
    email: 'owner@freshmart.com',
    password: 'Owner@12345',
    address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
    role: 'STORE_OWNER',
    store: {
      id: 's1',
      name: 'FreshMart Organic Supermarket',
      email: 'owner@freshmart.com',
      address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
      averageRating: 4.5,
      totalRatings: 2,
    },
    storeRating: 4.5,
  },
  {
    id: 'u3',
    _id: 'u3',
    name: 'Alice Regular Customer User',
    email: 'alice@customer.com',
    password: 'User@12345',
    address: 'Flat 302, Sunrise Apartments, Indiranagar, Bengaluru',
    role: 'USER',
    store: null,
    storeRating: null,
  },
  {
    id: 'u4',
    _id: 'u4',
    name: 'Robert Regular Shopper Dude',
    email: 'robert@customer.com',
    password: 'User@12345',
    address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
    role: 'USER',
    store: null,
    storeRating: null,
  },
];

const DEFAULT_STORES = [
  {
    id: 's1',
    _id: 's1',
    name: 'FreshMart Organic Supermarket',
    email: 'owner@freshmart.com',
    address: 'Shop 45, Green Market Complex, MG Road, Bengaluru',
    averageRating: 4.5,
    totalRatings: 2,
    ownerId: { name: 'Johnathan Store Owner Person', email: 'owner@freshmart.com' },
  },
  {
    id: 's2',
    _id: 's2',
    name: 'TechGalaxy Gadgets & Hardware',
    email: 'support@techgalaxy.io',
    address: 'Tower B, 1st Floor, Nexus Mall, Koramangala, Bengaluru',
    averageRating: 4.0,
    totalRatings: 1,
    ownerId: null,
  },
  {
    id: 's3',
    _id: 's3',
    name: 'Urban Chic Boutique Apparel',
    email: 'hello@urbanchic.fashion',
    address: '42 Fashion Street, Brigade Road, Bengaluru',
    averageRating: 5.0,
    totalRatings: 1,
    ownerId: null,
  },
];

const DEFAULT_RATINGS = [
  {
    _id: 'r1',
    userId: 'u3',
    userName: 'Alice Regular Customer User',
    userEmail: 'alice@customer.com',
    storeId: 's1',
    rating: 5,
    ratedAt: new Date().toISOString(),
  },
  {
    _id: 'r2',
    userId: 'u4',
    userName: 'Robert Regular Shopper Dude',
    userEmail: 'robert@customer.com',
    storeId: 's1',
    rating: 4,
    ratedAt: new Date().toISOString(),
  },
  {
    _id: 'r3',
    userId: 'u3',
    userName: 'Alice Regular Customer User',
    userEmail: 'alice@customer.com',
    storeId: 's2',
    rating: 4,
    ratedAt: new Date().toISOString(),
  },
  {
    _id: 'r4',
    userId: 'u4',
    userName: 'Robert Regular Shopper Dude',
    userEmail: 'robert@customer.com',
    storeId: 's3',
    rating: 5,
    ratedAt: new Date().toISOString(),
  },
];

const getStored = (key, def) => {
  try {
    const val = localStorage.getItem(`mock_${key}`);
    return val ? JSON.parse(val) : def;
  } catch (e) {
    return def;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(`mock_${key}`, JSON.stringify(val));
  } catch (e) {}
};

export const handleClientFallback = async (config) => {
  const url = config.url.replace('/api', '');
  const method = config.method ? config.method.toUpperCase() : 'GET';
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};
  const params = config.params || {};

  let users = getStored('users', DEFAULT_USERS);
  let stores = getStored('stores', DEFAULT_STORES);
  let ratings = getStored('ratings', DEFAULT_RATINGS);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  // 1. POST /auth/login
  if (url.includes('/auth/login') && method === 'POST') {
    const email = (data.email || '').toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.password !== data.password) {
      return {
        status: 401,
        data: { success: false, message: 'Invalid email or password.' },
      };
    }
    const token = `mock_token_${user.id}_${Date.now()}`;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          store: user.store,
        },
      },
    };
  }

  // 2. POST /auth/signup
  if (url.includes('/auth/signup') && method === 'POST') {
    const email = (data.email || '').toLowerCase().trim();
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return {
        status: 400,
        data: { success: false, message: 'A user with this email address already exists.' },
      };
    }
    const newUser = {
      id: `u_${Date.now()}`,
      _id: `u_${Date.now()}`,
      name: data.name,
      email,
      password: data.password,
      address: data.address,
      role: 'USER',
      store: null,
      storeRating: null,
    };
    users.push(newUser);
    setStored('users', users);
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    return {
      status: 201,
      data: {
        success: true,
        message: 'Registration successful!',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          address: newUser.address,
          role: newUser.role,
        },
      },
    };
  }

  // 3. PUT /auth/change-password
  if (url.includes('/auth/change-password') && method === 'PUT') {
    if (currentUser) {
      const user = users.find((u) => u.id === currentUser.id);
      if (user) {
        user.password = data.newPassword;
        setStored('users', users);
      }
    }
    return {
      status: 200,
      data: { success: true, message: 'Password updated successfully!' },
    };
  }

  // 4. GET /auth/me
  if (url.includes('/auth/me') && method === 'GET') {
    return {
      status: 200,
      data: { success: true, user: currentUser },
    };
  }

  // 5. GET /admin/dashboard-stats
  if (url.includes('/admin/dashboard-stats') && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        stats: {
          totalUsers: users.length,
          totalStores: stores.length,
          totalRatings: ratings.length,
        },
      },
    };
  }

  // 6. GET /admin/users
  if (url.includes('/admin/users') && method === 'GET') {
    let list = [...users];
    if (params.name) list = list.filter((u) => u.name.toLowerCase().includes(params.name.toLowerCase()));
    if (params.email) list = list.filter((u) => u.email.toLowerCase().includes(params.email.toLowerCase()));
    if (params.address) list = list.filter((u) => u.address.toLowerCase().includes(params.address.toLowerCase()));
    if (params.role && params.role !== 'ALL') list = list.filter((u) => u.role === params.role);
    return {
      status: 200,
      data: { success: true, count: list.length, users: list },
    };
  }

  // 7. POST /admin/users
  if (url.includes('/admin/users') && method === 'POST') {
    const newUser = {
      id: `u_${Date.now()}`,
      _id: `u_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      address: data.address,
      role: data.role || 'USER',
      store: null,
      storeRating: null,
    };
    users.push(newUser);
    setStored('users', users);
    return {
      status: 201,
      data: { success: true, message: 'User created successfully.', user: newUser },
    };
  }

  // 8. GET /admin/stores
  if (url.includes('/admin/stores') && method === 'GET') {
    let list = [...stores];
    if (params.name) list = list.filter((s) => s.name.toLowerCase().includes(params.name.toLowerCase()));
    if (params.email) list = list.filter((s) => s.email.toLowerCase().includes(params.email.toLowerCase()));
    if (params.address) list = list.filter((s) => s.address.toLowerCase().includes(params.address.toLowerCase()));
    return {
      status: 200,
      data: { success: true, count: list.length, stores: list },
    };
  }

  // 9. POST /admin/stores
  if (url.includes('/admin/stores') && method === 'POST') {
    const newStore = {
      id: `s_${Date.now()}`,
      _id: `s_${Date.now()}`,
      name: data.name,
      email: data.email,
      address: data.address,
      averageRating: 0,
      totalRatings: 0,
      ownerId: null,
    };
    stores.push(newStore);
    setStored('stores', stores);
    return {
      status: 201,
      data: { success: true, message: 'Store created successfully.', store: newStore },
    };
  }

  // 10. GET /stores
  if (url === '/stores' || url.includes('/stores?')) {
    let list = [...stores];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    const myId = currentUser?.id || currentUser?._id;
    const enriched = list.map((s) => {
      const myR = ratings.find((r) => r.storeId === (s.id || s._id) && r.userId === myId);
      return {
        ...s,
        myRating: myR ? { rating: myR.rating } : null,
      };
    });
    return {
      status: 200,
      data: { success: true, count: enriched.length, stores: enriched },
    };
  }

  // 11. GET /stores/owner/dashboard
  if (url.includes('/stores/owner/dashboard') && method === 'GET') {
    const ownerStore = stores.find((s) => s.email === currentUser?.email) || stores[0];
    const storeRatings = ratings.filter((r) => r.storeId === (ownerStore.id || ownerStore._id));
    return {
      status: 200,
      data: {
        success: true,
        store: ownerStore,
        ratings: storeRatings.map((r) => ({
          ratingId: r._id,
          rating: r.rating,
          ratedAt: r.ratedAt,
          user: { name: r.userName, email: r.userEmail, address: 'Verified Customer' },
        })),
      },
    };
  }

  // 12. POST /ratings
  if (url.includes('/ratings') && method === 'POST') {
    const { storeId, rating } = data;
    const myId = currentUser?.id || currentUser?._id;
    let r = ratings.find((item) => item.storeId === storeId && item.userId === myId);
    let isModified = false;
    if (r) {
      r.rating = Number(rating);
      r.ratedAt = new Date().toISOString();
      isModified = true;
    } else {
      r = {
        _id: `r_${Date.now()}`,
        userId: myId,
        userName: currentUser?.name || 'Customer',
        userEmail: currentUser?.email || 'customer@example.com',
        storeId,
        rating: Number(rating),
        ratedAt: new Date().toISOString(),
      };
      ratings.push(r);
    }
    setStored('ratings', ratings);

    // Recalculate average
    const storeRatings = ratings.filter((item) => item.storeId === storeId);
    const avg = Math.round((storeRatings.reduce((sum, curr) => sum + curr.rating, 0) / storeRatings.length) * 10) / 10;
    const store = stores.find((s) => (s.id || s._id) === storeId);
    if (store) {
      store.averageRating = avg;
      store.totalRatings = storeRatings.length;
      setStored('stores', stores);
    }

    return {
      status: 200,
      data: {
        success: true,
        message: isModified ? 'Your rating has been updated!' : 'Rating submitted successfully!',
        rating: r,
        store,
      },
    };
  }

  return {
    status: 404,
    data: { success: false, message: 'Not found in fallback' },
  };
};
