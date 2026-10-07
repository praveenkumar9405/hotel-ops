import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const HotelForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  serverErrors = null,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    price: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        latitude: initialData.latitude !== undefined ? String(initialData.latitude) : '',
        longitude: initialData.longitude !== undefined ? String(initialData.longitude) : '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
      });

      if (initialData.image_path) {
        const fullUrl = initialData.image_path.startsWith('http')
          ? initialData.image_path
          : `${API_BASE_URL}${initialData.image_path}`;
        setPreviewUrl(fullUrl);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        latitude: '',
        longitude: '',
        price: '',
      });
      setPreviewUrl(null);
    }

    setSelectedFile(null);
    setErrors({});
  }, [initialData, isOpen]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Merge server validation errors
  useEffect(() => {
    if (serverErrors && typeof serverErrors === 'object') {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file.' }));
        return;
      }

      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.image;
        return updated;
      });
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const lat = parseFloat(formData.latitude);
    if (!formData.latitude || isNaN(lat)) {
      newErrors.latitude = 'Valid latitude is required';
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    const lng = parseFloat(formData.longitude);
    if (!formData.longitude || isNaN(lng)) {
      newErrors.longitude = 'Valid longitude is required';
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    const prc = parseFloat(formData.price);
    if (!formData.price || isNaN(prc)) {
      newErrors.price = 'Price is required';
    } else if (prc < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submission = new FormData();
    submission.append('title', formData.title.trim());
    submission.append('description', formData.description.trim());
    submission.append('latitude', formData.latitude);
    submission.append('longitude', formData.longitude);
    submission.append('price', formData.price);

    if (selectedFile) {
      submission.append('image', selectedFile);
    }

    onSubmit(submission);
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-8 transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {isEditing ? 'Edit Hotel' : 'Add New Hotel'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update the details and photo for this property.' : 'Enter property details to add a new listing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hotel Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Grand Horizon Luxury Resort"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                errors.title
                  ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500'
                  : 'border-slate-300 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1]'
              } outline-none transition-all placeholder:text-slate-400`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Overview of amenities, location highlights, and suites..."
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                errors.description
                  ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500'
                  : 'border-slate-300 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1]'
              } outline-none transition-all placeholder:text-slate-400 resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Price & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="199.00"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.price
                    ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500'
                    : 'border-slate-300 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1]'
                } outline-none transition-all`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="40.7128"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.latitude
                    ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500'
                    : 'border-slate-300 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1]'
                } outline-none transition-all`}
              />
              {errors.latitude && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.latitude}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="-74.0060"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.longitude
                    ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500'
                    : 'border-slate-300 focus:border-[#1266F1] focus:ring-1 focus:ring-[#1266F1]'
                } outline-none transition-all`}
              />
              {errors.longitude && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.longitude}</span>
                </p>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hotel Photo
            </label>

            {previewUrl ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                <img
                  src={previewUrl}
                  alt="Property preview"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-700 transition-colors flex items-center gap-1.5"
                  >
                    <X size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-[#1266F1] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all text-center">
                <div className="p-3 bg-white rounded-full shadow-sm text-[#1266F1] mb-2 border border-slate-100">
                  <ImageIcon size={22} />
                </div>
                <p className="text-xs font-semibold text-slate-700">Click to upload photo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {errors.image && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errors.image}</span>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1266F1] hover:bg-[#0F54C7] active:bg-[#0C43A0] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Hotel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelForm;
