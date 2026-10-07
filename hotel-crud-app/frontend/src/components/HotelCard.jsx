import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trash2, ArrowUpRight, Calendar, Edit2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const HotelCard = ({ hotel, onDelete, onEdit }) => {
  const { id, title, description, latitude, longitude, price, image_path, created_at } = hotel;

  const imageUrl = image_path
    ? (image_path.startsWith('http') ? image_path : `${API_BASE_URL}${image_path}`)
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden">
      {/* Hotel Photo */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-semibold px-3 py-1 rounded-full text-xs flex items-center shadow-sm">
          <span>${parseFloat(price).toFixed(2)}</span>
          <span className="text-slate-300 text-[10px] ml-1 font-normal">/ night</span>
        </div>

        {/* Quick Edit */}
        {onEdit && (
          <button
            onClick={() => onEdit(hotel)}
            title="Edit hotel"
            className="absolute top-3 left-3 bg-white/90 hover:bg-white text-slate-700 hover:text-[#1266F1] p-1.5 rounded-lg shadow-sm backdrop-blur transition-colors opacity-90 hover:opacity-100"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>

      {/* Hotel Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-mono tracking-tight">
              <MapPin size={11} className="text-[#1266F1]" />
              {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
            </span>

            {formattedDate && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                <Calendar size={11} />
                {formattedDate}
              </span>
            )}
          </div>

          <h3 className="font-bold text-base text-[#0F172A] line-clamp-1 group-hover:text-[#1266F1] transition-colors">
            {title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/hotels/${id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1266F1] hover:bg-[#0F54C7] active:bg-[#0C43A0] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span>View Details</span>
            <ArrowUpRight size={13} />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(id, title)}
            className="inline-flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors border border-red-200/60"
            title="Delete hotel"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
