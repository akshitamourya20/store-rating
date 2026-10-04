import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import api from '../api/axiosClient';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Award,
} from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ field: 'ratedAt', order: 'desc' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stores/owner/dashboard');
      if (res.data.success) {
        setStoreData(res.data.store);
        setRatings(res.data.ratings);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
      setError(
        err.response?.data?.message || 'Unable to load store data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    let aVal, bVal;
    if (sort.field === 'name') {
      aVal = a.user?.name || '';
      bVal = b.user?.name || '';
      return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sort.field === 'email') {
      aVal = a.user?.email || '';
      bVal = b.user?.email || '';
      return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sort.field === 'rating') {
      aVal = a.rating;
      bVal = b.rating;
      return sort.order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (sort.field === 'ratedAt') {
      aVal = new Date(a.ratedAt).getTime();
      bVal = new Date(b.ratedAt).getTime();
      return sort.order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Store Owner Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor store reputation, view average rating, and inspect customer feedback
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Dashboard</span>
          </button>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-rose-500 mt-1">
              Please contact the system administrator to verify your store linkage.
            </p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading store analytics...</p>
          </div>
        ) : storeData ? (
          <>
            {/* Store Information & Performance Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Store Details Card */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                    <Store className="w-3.5 h-3.5" />
                    <span>Your Registered Store</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {storeData.name}
                  </h2>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{storeData.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{storeData.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reviews</p>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">{storeData.totalRatings}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Reach</p>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">{ratings.length} Users</p>
                  </div>
                </div>
              </div>

              {/* Average Rating Big Showcase */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/20 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-100">
                  Average Store Rating
                </p>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">
                    {Number(storeData.averageRating).toFixed(1)}
                  </span>
                  <span className="text-xl font-bold text-amber-200">/ 5</span>
                </div>
                <div className="bg-black/10 px-4 py-2 rounded-2xl backdrop-blur-sm mt-1">
                  <StarRating rating={storeData.averageRating} size="lg" />
                </div>
                <p className="text-xs text-amber-100 mt-3 font-medium">
                  Based on {storeData.totalRatings} customer rating{storeData.totalRatings === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {/* List of Users Who Submitted Ratings for Their Store */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    User Ratings & Reviews ({ratings.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detailed breakdown of each user who evaluated your store
                  </p>
                </div>
              </div>

              {/* Table with sorting */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 select-none">
                      <tr>
                        <th
                          scope="col"
                          onClick={() => handleSort('name')}
                          className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          User Name {renderSortIndicator('name')}
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort('email')}
                          className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          User Email {renderSortIndicator('email')}
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort('rating')}
                          className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          Rating Submitted {renderSortIndicator('rating')}
                        </th>
                        <th
                          scope="col"
                          onClick={() => handleSort('ratedAt')}
                          className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          Date / Time {renderSortIndicator('ratedAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRatings.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-16 text-center text-slate-400">
                            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-700">No ratings yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                              When customers rate your store, their entries will show up here.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        sortedRatings.map((item) => (
                          <tr key={item.ratingId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              {item.user.name}
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              {item.user.email}
                            </td>
                            <td className="py-4 px-6">
                              <StarRating rating={item.rating} size="sm" showValue={true} />
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-500">
                              {new Date(item.ratedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default StoreOwnerDashboard;
