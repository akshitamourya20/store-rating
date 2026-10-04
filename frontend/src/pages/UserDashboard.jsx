import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import RateStoreModal from '../components/RateStoreModal';
import api from '../api/axiosClient';
import {
  Search,
  Store,
  Star,
  MapPin,
  Edit3,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [selectedStore, setSelectedStore] = useState(null);
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores', {
        params: {
          search: search || undefined,
          sortBy: sort.field,
          sortOrder: sort.order,
        },
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sort]);

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortIndicator = (field) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline" />;
    }
    return sort.order === 'asc' ? (
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-amber-50 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Community Store Reviews
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore & Rate Registered Stores
            </h1>
            <p className="mt-2 text-sm text-amber-100">
              Share your honest feedback, submit ratings from 1 to 5 stars, or modify your submitted ratings at any time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl font-black">{stores.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-amber-200">Stores Available</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div>
              <p className="text-2xl font-black">
                {stores.filter((s) => s.myRating).length}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-amber-200">You Rated</p>
            </div>
          </div>
        </div>

        {/* Search & Sorting Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search by Name and Address */}
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search stores by Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              fetchStores();
              showToast('Store listings refreshed');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Listings</span>
          </button>
        </div>

        {/* Store Listings Table as specified in PDF */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th
                    scope="col"
                    onClick={() => handleSort('name')}
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Store Name {renderSortIndicator('name')}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('address')}
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Address {renderSortIndicator('address')}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('averageRating')}
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Overall Rating {renderSortIndicator('averageRating')}
                  </th>
                  <th scope="col" className="py-4 px-6">
                    User's Submitted Rating
                  </th>
                  <th scope="col" className="py-4 px-6 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-400">
                      <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm">Loading registered stores...</p>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-400">
                      <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-base font-semibold text-slate-700">No stores found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying your search keywords or clear filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => {
                    const hasRated = !!store.myRating;
                    return (
                      <tr key={store._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Store Name */}
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                              <Store className="w-5 h-5" />
                            </div>
                            <div>
                              <span>{store.name}</span>
                              <p className="text-xs text-slate-400 font-normal">{store.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="py-4 px-6 text-slate-600 max-w-xs">
                          <div className="flex items-start gap-1.5 text-xs text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2" title={store.address}>
                              {store.address}
                            </span>
                          </div>
                        </td>

                        {/* Overall Rating */}
                        <td className="py-4 px-6">
                          <StarRating
                            rating={store.averageRating || 0}
                            size="md"
                            showValue={true}
                            ratingCount={store.totalRatings}
                          />
                        </td>

                        {/* User's Submitted Rating */}
                        <td className="py-4 px-6">
                          {hasRated ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span className="text-xs font-bold">
                                {store.myRating.rating} / 5 Stars
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not rated yet</span>
                          )}
                        </td>

                        {/* Option to submit a rating / Option to modify their submitted rating */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedStore(store)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                              hasRated
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            }`}
                          >
                            {hasRated ? (
                              <>
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                <span>Modify Rating</span>
                              </>
                            ) : (
                              <>
                                <Star className="w-3.5 h-3.5 fill-white" />
                                <span>Rate Store</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Rate/Modify Store Rating Modal */}
      {selectedStore && (
        <RateStoreModal
          store={selectedStore}
          existingRating={selectedStore.myRating}
          onClose={() => setSelectedStore(null)}
          onSuccess={(msg) => {
            fetchStores();
            showToast(msg);
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
