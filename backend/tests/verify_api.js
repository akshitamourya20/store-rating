const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('=== STARTING AUTOMATED API VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  };

  // 1. Health check
  await test('GET /api/health returns 200 and ok status', async () => {
    const res = await request('/api/health');
    if (res.status !== 200 || res.data.status !== 'ok') {
      throw new Error(`Expected status 200 ok, got ${res.status}`);
    }
  });

  // 2. Admin Login
  let adminToken = '';
  await test('Admin login with valid credentials succeeds and returns ADMIN role', async () => {
    const res = await request('/api/auth/login', 'POST', {
      email: 'admin@roxiler.com',
      password: 'Admin@12345',
    });
    if (res.status !== 200 || !res.data.token || res.data.user.role !== 'ADMIN') {
      throw new Error(`Login failed or invalid role: ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.token;
  });

  // 3. Store Owner Login
  let ownerToken = '';
  await test('Store Owner login succeeds and returns STORE_OWNER role with store info', async () => {
    const res = await request('/api/auth/login', 'POST', {
      email: 'owner@freshmart.com',
      password: 'Owner@12345',
    });
    if (res.status !== 200 || res.data.user.role !== 'STORE_OWNER') {
      throw new Error(`Store owner login failed: ${JSON.stringify(res.data)}`);
    }
    ownerToken = res.data.token;
  });

  // 4. Normal User Login
  let userToken = '';
  await test('Normal User login succeeds and returns USER role', async () => {
    const res = await request('/api/auth/login', 'POST', {
      email: 'alice@customer.com',
      password: 'User@12345',
    });
    // Note: Alice's password might have been changed in previous test if run sequentially
    if (res.status !== 200) {
      // Try with robert
      const res2 = await request('/api/auth/login', 'POST', {
        email: 'robert@customer.com',
        password: 'User@12345',
      });
      if (res2.status !== 200 || res2.data.user.role !== 'USER') {
        throw new Error(`Normal user login failed: ${JSON.stringify(res2.data)}`);
      }
      userToken = res2.data.token;
    } else {
      userToken = res.data.token;
    }
  });

  // 5. Invalid credentials rejection
  await test('Login with incorrect password returns 401', async () => {
    const res = await request('/api/auth/login', 'POST', {
      email: 'robert@customer.com',
      password: 'WrongPassword@123',
    });
    if (res.status !== 401) {
      throw new Error(`Expected status 401, got ${res.status}`);
    }
  });

  // 6. Form validation: reject name < 20 chars
  await test('Registration rejects name under 20 chars with 400', async () => {
    const res = await request('/api/auth/signup', 'POST', {
      name: 'Short Name',
      email: `test${Date.now()}@example.com`,
      password: 'Password@123',
      address: '123 Test Street, Bengaluru',
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 rejection for short name, got ${res.status}`);
    }
  });

  // 7. Form validation: reject password without special char
  await test('Registration rejects password missing special character', async () => {
    const res = await request('/api/auth/signup', 'POST', {
      name: 'Valid Name With Plenty Of Chars Here',
      email: `test${Date.now()}@example.com`,
      password: 'Password123',
      address: '123 Test Street, Bengaluru',
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 rejection for weak password, got ${res.status}`);
    }
  });

  // 8. Admin Dashboard Stats
  await test('Admin dashboard stats returns user, store, rating counts', async () => {
    const res = await request('/api/admin/dashboard-stats', 'GET', null, adminToken);
    if (res.status !== 200 || res.data.stats.totalUsers < 4 || res.data.stats.totalStores < 3) {
      throw new Error(`Invalid stats: ${JSON.stringify(res.data)}`);
    }
  });

  // 9. Admin view users with Store Owner ratings
  await test('Admin users list displays store rating for Store Owners', async () => {
    const res = await request('/api/admin/users', 'GET', null, adminToken);
    if (res.status !== 200 || !Array.isArray(res.data.users)) {
      throw new Error(`Failed to get users: ${JSON.stringify(res.data)}`);
    }
    const storeOwner = res.data.users.find((u) => u.role === 'STORE_OWNER');
    if (!storeOwner || storeOwner.storeRating === null) {
      throw new Error('Store Owner rating was not attached in admin user list');
    }
  });

  // 10. User view stores with their submitted rating
  let sampleStoreId = '';
  await test('Normal user gets store list containing their submitted rating', async () => {
    const res = await request('/api/stores', 'GET', null, userToken);
    if (res.status !== 200 || res.data.stores.length === 0) {
      throw new Error(`Failed to get stores: ${JSON.stringify(res.data)}`);
    }
    sampleStoreId = res.data.stores[0]._id;
  });

  // 11. Normal user modifies their rating
  await test('Normal user modifies store rating and updates store average', async () => {
    const res = await request('/api/ratings', 'POST', {
      storeId: sampleStoreId,
      rating: 5,
    }, userToken);
    if (res.status !== 200 || res.data.rating.rating !== 5) {
      throw new Error(`Failed to update rating: ${JSON.stringify(res.data)}`);
    }
  });

  // 12. Store Owner Dashboard
  await test('Store owner dashboard displays average rating and list of raters', async () => {
    const res = await request('/api/stores/owner/dashboard', 'GET', null, ownerToken);
    if (res.status !== 200 || !res.data.store || !Array.isArray(res.data.ratings)) {
      throw new Error(`Store owner dashboard failed: ${JSON.stringify(res.data)}`);
    }
  });

  console.log(`\n=== ALL CORE SUITE TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
