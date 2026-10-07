import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  fetchHotelById,
  updateHotel,
  deleteHotel,
  openEditModal,
  closeModal,
  clearCurrentHotel,
} from '../store/hotelSlice';
import HotelForm from '../components/HotelForm';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Building,
  Navigation,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom pin marker for Leaflet map
const createCustomMarker = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: #1266F1;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(18, 102, 241, 0.4);
        border: 2px solid #FFFFFF;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentHotel: hotel,
    detailLoading: loading,
    actionLoading,
    error,
    validationErrors,
    isModalOpen,
    editingHotel,
  } = useSelector((state) => state.hotels);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }

    return () => {
      dispatch(clearCurrentHotel());
    };
  }, [dispatch, id]);

  const handleEditClick = () => {
    if (hotel) {
      dispatch(openEditModal(hotel));
    }
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleFormSubmit = async (formData) => {
    if (hotel) {
      await dispatch(updateHotel({ id: hotel.id, formData }));
    }
  };

  const handleDeleteHotel = async () => {
    if (hotel) {
      await dispatch(deleteHotel(hotel.id));
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <Loader2 size={36} className="text-[#1266F1] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading hotel details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Hotel Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {error || 'The requested hotel does not exist or was deleted.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-[#1266F1] hover:bg-[#0F54C7] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Hotels</span>
          </Link>
        </div>
      </div>
    );
  }

  const { title, description, latitude, longitude, price, image_path, created_at } = hotel;
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  const imageUrl = image_path
    ? (image_path.startsWith('http') ? image_path : `${API_BASE_URL}${image_path}`)
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently added';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Helmet>
        <title>{`${title} | HotelOps`}</title>
        <meta name="description" content={description.slice(0, 160)} />
      </Helmet>

      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Hotels</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Edit size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors border border-red-200/60"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle">
          <div className="relative h-72 sm:h-96 w-full bg-slate-900">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover opacity-95"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full mb-2">
                  <MapPin size={12} className="text-blue-300" />
                  <span>
                    {latNum.toFixed(4)}, {lngNum.toFixed(4)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {title}
                </h1>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 text-right shadow-elevated border border-white/50">
                <span className="text-[11px] text-slate-500 font-medium block">Price</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1266F1]">
                  ${parseFloat(price).toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-normal"> / night</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span>Added: {formattedDate}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Active Listing</span>
              </span>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#1266F1] font-medium hover:underline"
            >
              <span>View in Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Content Details and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle">
              <h2 className="text-base font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <Building size={18} className="text-[#1266F1]" />
                <span>About this Hotel</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle">
              <h2 className="text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Navigation size={18} className="text-[#1266F1]" />
                <span>Location Coordinates</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-medium text-slate-500">Latitude</span>
                  <span className="font-mono font-semibold text-slate-900">{latNum.toFixed(8)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-medium text-slate-500">Longitude</span>
                  <span className="font-mono font-semibold text-slate-900">{lngNum.toFixed(8)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-medium text-slate-500">Nightly Rate</span>
                  <span className="font-semibold text-emerald-600">${parseFloat(price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle flex flex-col h-full min-h-[460px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <MapPin size={18} className="text-[#1266F1]" />
                    <span>Location Map</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    OpenStreetMap view based on stored coordinates.
                  </p>
                </div>

                <span className="text-[11px] font-mono bg-blue-50 text-[#1266F1] px-2.5 py-1 rounded-md font-semibold">
                  GEO PIN
                </span>
              </div>

              <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 min-h-[380px] relative">
                <MapContainer
                  center={[latNum, lngNum]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                  style={{ minHeight: '380px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latNum, lngNum]} icon={createCustomMarker()}>
                    <Popup>
                      <div className="p-1">
                        <strong className="block text-sm text-[#0F172A]">{title}</strong>
                        <p className="text-xs text-slate-500 mt-1">${parseFloat(price).toFixed(2)} / night</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {latNum.toFixed(4)}, {lngNum.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <HotelForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingHotel || hotel}
        isLoading={actionLoading}
        serverErrors={validationErrors}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-[#0F172A]">Delete Hotel</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">{title}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteHotel}
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

export default DetailPage;
