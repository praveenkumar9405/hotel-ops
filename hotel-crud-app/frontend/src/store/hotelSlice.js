import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Fetch hotels list with query parameters
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();

      if (params.search) searchParams.append('search', params.search);
      if (params.minPrice !== undefined && params.minPrice !== '') searchParams.append('minPrice', params.minPrice);
      if (params.maxPrice !== undefined && params.maxPrice !== '') searchParams.append('maxPrice', params.maxPrice);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);

      const response = await fetch(`${API_BASE_URL}/api/hotels?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch hotels');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error while fetching hotels');
    }
  }
);

// Fetch a single hotel by id
export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch hotel details');
      }

      return data.hotel;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error while fetching hotel');
    }
  }
);

// Create a new hotel
export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotels`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.errors || 'Failed to create hotel');
      }

      return data.hotel;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error creating hotel');
    }
  }
);

// Update an existing hotel
export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.errors || 'Failed to update hotel');
      }

      return data.hotel;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error updating hotel');
    }
  }
);

// Delete a hotel
export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete hotel');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting hotel');
    }
  }
);

const initialState = {
  hotels: [],
  currentHotel: null,
  pagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6,
  },
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  },
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  validationErrors: null,
  isModalOpen: false,
  editingHotel: null,
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page || 1,
      };
    },

    setPage: (state, action) => {
      state.filters.page = action.payload;
    },

    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: '',
        maxPrice: '',
        page: 1,
      };
    },

    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingHotel = null;
      state.validationErrors = null;
    },

    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingHotel = action.payload;
      state.validationErrors = null;
    },

    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingHotel = null;
      state.validationErrors = null;
    },

    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },

    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
  },

  extraReducers: (builder) => {
    // fetchHotels
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.hotels;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchHotelById
    builder
      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // createHotel
    builder
      .addCase(createHotel.pending, (state) => {
        state.actionLoading = true;
        state.validationErrors = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isModalOpen = false;
        state.hotels.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.validationErrors = action.payload;
      });

    // updateHotel
    builder
      .addCase(updateHotel.pending, (state) => {
        state.actionLoading = true;
        state.validationErrors = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isModalOpen = false;
        state.editingHotel = null;

        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }

        if (state.currentHotel && state.currentHotel.id === action.payload.id) {
          state.currentHotel = action.payload;
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.validationErrors = action.payload;
      });

    // deleteHotel
    builder
      .addCase(deleteHotel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.hotels = state.hotels.filter((h) => h.id !== action.payload);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);

        if (state.currentHotel && state.currentHotel.id === action.payload) {
          state.currentHotel = null;
        }
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setPage,
  resetFilters,
  openCreateModal,
  openEditModal,
  closeModal,
  clearCurrentHotel,
  clearErrors,
} = hotelSlice.actions;

export default hotelSlice.reducer;
