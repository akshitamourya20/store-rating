import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import AddStoreModal from '../components/AddStoreModal';
import AddUserModal from '../components/AddUserModal';
import api from '../api/axiosClient';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  UserCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' or 'users'
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Stores state
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState({ field: 'createdAt', order: 'desc' });
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: 'ALL' });
  const [userSort, setUserSort] = useState({ field: 'createdAt', order: 'desc' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Notification message
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 1. Fetch Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Fetch Stores with filtering and sorting
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const params = {
        name: storeFilters.name || undefined,
        email: storeFilters.email || undefined,
        address: storeFilters.address || undefined,
        sortBy: storeSort.field,
        sortOrder: storeSort.order,
      };
      const res = await api.get('/admin/stores', { params });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  // 3. Fetch Users with filtering and sorting
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = {
        name: userFilters.name || undefined,
        email: userFilters.email || undefined,
        address: userFilters.address || undefined,
        role: userFilters.role !== 'ALL' ? userFilters.role : undefined,
        sortBy: userSort.field,
        sortOrder: userSort.order,
      };
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [storeFilters, storeSort]);

  useEffect(() => {
    fetchUsers();
  }, [userFilters, userSort]);

  const handleStoreSort = (field) => {
    setStoreSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUserSort = (field) => {
    setUserSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortIndicator = (currentField, activeField, order) => {
    if (currentField !== activeField) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500 ml-1 inline" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              System Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Platform dashboard, user controls, store listings, and real-time statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchStores();
                fetchUsers();
                showToast('Data refreshed');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Cards as specified in PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.totalUsers}
              </p>
              <span className="inline-block mt-2 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Admins, Owners & Users
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-100/80 flex items-center justify-center text-purple-600 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
          </div>

          {/* Total Stores */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Stores</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.totalStores}
              </p>
              <span className="inline-block mt-2 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Registered Businesses
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-inner">
              <Store className="w-7 h-7" />
            </div>
          </div>

          {/* Total Submitted Ratings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ratings</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.totalRatings}
              </p>
              <span className="inline-block mt-2 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Submitted Reviews (1-5★)
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-600 shadow-inner">
              <Star className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('stores')}
              className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'stores'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store Management ({stores.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management ({users.length})</span>
            </button>
          </nav>
        </div>

        {/* TAB 1: STORES MANAGEMENT */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Multi-field filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Store name..."
                      value={storeFilters.name}
                      onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Email address..."
                      value={storeFilters.email}
                      onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Address location..."
                      value={storeFilters.address}
                      onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>
              </div>

              {/* Add Store Button */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowAddStoreModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Store</span>
                </button>
              </div>
            </div>

            {/* Stores Table with Sorting */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 select-none">
                    <tr>
                      <th
                        scope="col"
                        onClick={() => handleStoreSort('name')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Store Name {renderSortIndicator('name', storeSort.field, storeSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleStoreSort('email')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Email {renderSortIndicator('email', storeSort.field, storeSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleStoreSort('address')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Address {renderSortIndicator('address', storeSort.field, storeSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleStoreSort('averageRating')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Overall Rating {renderSortIndicator('averageRating', storeSort.field, storeSort.order)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingStores ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400">
                          <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p>Loading stores...</p>
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400">
                          No stores match your current filters.
                        </td>
                      </tr>
                    ) : (
                      stores.map((store) => (
                        <tr key={store._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900">
                            {store.name}
                            {store.ownerId && (
                              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                                Owner: {store.ownerId.name}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-600">{store.email}</td>
                          <td className="py-4 px-4 text-slate-600 max-w-xs truncate" title={store.address}>
                            {store.address}
                          </td>
                          <td className="py-4 px-4">
                            <StarRating
                              rating={store.averageRating || 0}
                              size="sm"
                              showValue={true}
                              ratingCount={store.totalRatings}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="User name..."
                      value={userFilters.name}
                      onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Email address..."
                      value={userFilters.email}
                      onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Address..."
                      value={userFilters.address}
                      onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Filter by Role
                  </label>
                  <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">Normal User</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>
              </div>

              {/* Add User Button */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Users Table with Sorting */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 select-none">
                    <tr>
                      <th
                        scope="col"
                        onClick={() => handleUserSort('name')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Full Name {renderSortIndicator('name', userSort.field, userSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleUserSort('email')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Email {renderSortIndicator('email', userSort.field, userSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleUserSort('address')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Address {renderSortIndicator('address', userSort.field, userSort.order)}
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleUserSort('role')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Role {renderSortIndicator('role', userSort.field, userSort.order)}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Store Rating (Owners)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400">
                          <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                          <p>Loading users...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400">
                          No users found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900">{u.name}</td>
                          <td className="py-4 px-4 text-slate-600">{u.email}</td>
                          <td className="py-4 px-4 text-slate-600 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-4 px-4">
                            {u.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                <Shield className="w-3 h-3 text-purple-600" />
                                Admin
                              </span>
                            )}
                            {u.role === 'STORE_OWNER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                <Store className="w-3 h-3 text-blue-600" />
                                Store Owner
                              </span>
                            )}
                            {u.role === 'USER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Normal User
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {u.role === 'STORE_OWNER' ? (
                              u.storeRating !== null ? (
                                <StarRating
                                  rating={u.storeRating}
                                  size="sm"
                                  showValue={true}
                                  ratingCount={u.store?.totalRatings}
                                />
                              ) : (
                                <span className="text-xs text-slate-400 italic">No store linked</span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <AddStoreModal
          onClose={() => setShowAddStoreModal(false)}
          onSuccess={(msg) => {
            fetchStores();
            fetchStats();
            showToast(msg);
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSuccess={(msg) => {
            fetchUsers();
            fetchStats();
            showToast(msg);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
