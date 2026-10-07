import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  fetchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  openCreateModal,
  openEditModal,
  closeModal,
  setFilters,
  setPage,
  resetFilters,
} from '../store/hotelSlice';
import HotelCard from '../components/HotelCard';
import HotelForm from '../components/HotelForm';
import Pagination from '../components/Pagination';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  DollarSign,
  AlertTriangle,
  Hotel,
  Compass,
} from 'lucide-react';

const ListPage = () => {
  const dispatch = useDispatch();

  const {
    hotels,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    validationErrors,
    isModalOpen,
    editingHotel,
  } = useSelector((state) => state.hotels);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, id: null, title: '' });

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();

    dispatch(
      setFilters({
        search: searchInput,
        minPrice: minPriceInput,
        maxPrice: maxPriceInput,
        page: 1,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    dispatch(resetFilters());
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddModal = () => {
    dispatch(openCreateModal());
  };

  const handleOpenEditModal = (hotel) => {
    dispatch(openEditModal(hotel));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleFormSubmit = async (formData) => {
    if (editingHotel) {
      await dispatch(updateHotel({ id: editingHotel.id, formData }));
    } else {
      await dispatch(createHotel(formData));
    }
  };

  const promptDelete = (id, title) => {
    setDeleteModalState({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    if (deleteModalState.id) {
      await dispatch(deleteHotel(deleteModalState.id));
      setDeleteModalState({ isOpen: false, id: null, title: '' });
      dispatch(fetchHotels(filters));
    }
  };

  const hasActiveFilters = Boolean(filters.search || filters.minPrice || filters.maxPrice);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Helmet>
        <title>Hotel Management Dashboard | HotelOps</title>
        <meta
          name="description"
          content="Manage hotels, rooms, pricing, and locations from an integrated dashboard."
        />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1266F1] text-white flex items-center justify-center shadow-sm">
              <Building2 size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0F172A]">
                Hotel<span className="text-[#1266F1]">Ops</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-[#1266F1] rounded">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#1266F1] hover:bg-[#0F54C7] active:bg-[#0C43A0] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Plus size={16} />
            <span>Add Hotel</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1266F1] bg-blue-50 px-2.5 py-1 rounded-md mb-2">
              <Compass size={13} />
              <span>Property Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Hotel Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Browse, filter, and manage your property listings and real-time geographic locations.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="text-xs text-slate-500 block">Total Hotels</span>
              <span className="text-2xl font-black text-[#0F172A]">{pagination.totalItems}</span>
            </div>
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div>
              <span className="text-xs text-slate-500 block">Page</span>
              <span className="text-2xl font-black text-[#1266F1]">
                {pagination.currentPage} <span className="text-sm font-normal text-slate-400">/ {pagination.totalPages}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-subtle mb-6">
          <form onSubmit={handleApplyFilters} className="flex flex-col lg:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by hotel title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1] outline-none transition-colors"
              />
            </div>

            <div className="relative w-full lg:w-40">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Min Price"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1] outline-none transition-colors"
              />
            </div>

            <div className="relative w-full lg:w-40">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Max Price"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1] outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                type="submit"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Filter size={13} />
                <span>Filter</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  title="Reset Filters"
                >
                  <RefreshCw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => dispatch(fetchHotels(filters))}
              className="font-semibold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-video bg-slate-200 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onDelete={promptDelete}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-subtle">
            <div className="w-14 h-14 bg-blue-50 text-[#1266F1] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Hotel size={28} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">No Hotels Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              {hasActiveFilters
                ? 'No hotels match the current search or price criteria.'
                : 'There are currently no hotels registered. Click below to add one.'}
            </p>

            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1266F1] hover:bg-[#0F54C7] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={14} />
                <span>Add First Hotel</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <HotelForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingHotel}
        isLoading={actionLoading}
        serverErrors={validationErrors}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Delete Hotel</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800 font-semibold">{deleteModalState.title}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, id: null, title: '' })}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-sm"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage;
