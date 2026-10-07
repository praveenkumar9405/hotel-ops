# HotelOps - Hotel Management Application

A full-stack web application for managing hotel listings, pricing, and locations. Built with a React and Redux Toolkit frontend and an Express and PostgreSQL backend.

---

## Features

- **Hotel Management (CRUD)**: Create, view, update, and delete hotel listings.
- **Search & Filtering**: Search hotels by name or description with price range filtering.
- **Server-side Pagination**: Efficient pagination with configurable limits.
- **Interactive Map**: View hotel locations on an OpenStreetMap interface powered by Leaflet.
- **Photo Uploads**: Upload and update hotel photos with automatic local storage cleanup.
- **In-memory Database Fallback**: Built-in SQLite/pg-mem fallback so the application runs seamlessly even without a local PostgreSQL instance installed.

---

## Tech Stack

### Frontend
- **React 18** with **Vite**
- **Redux Toolkit** for centralized state management
- **React Router v6** for client-side routing
- **Tailwind CSS** for UI styling
- **Leaflet & React-Leaflet** for interactive maps
- **Lucide React** for icons

### Backend
- **Node.js & Express**
- **PostgreSQL (`pg`)** with native parameterized SQL queries
- **Multer** for multipart image uploads
- **pg-mem** for local in-memory fallback during development

---

## Project Structure

```text
hotel-crud-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool & in-memory fallback
│   ├── controllers/
│   │   └── hotelController.js    # Hotel CRUD controllers
│   ├── routes/
│   │   └── hotelRoutes.js        # Express routes & file upload handling
│   ├── uploads/                  # Uploaded hotel images
│   ├── schema.sql                # Database schema
│   ├── seed.js                   # Database seed script
│   ├── server.js                 # Express server entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HotelCard.jsx     # Hotel card item
│   │   │   ├── HotelForm.jsx     # Add/Edit modal form
│   │   │   └── Pagination.jsx    # Pagination controls
│   │   ├── pages/
│   │   │   ├── ListPage.jsx      # Dashboard and listings view
│   │   │   └── DetailPage.jsx    # Single hotel view with interactive map
│   │   ├── store/
│   │   │   ├── store.js          # Redux store
│   │   │   └── hotelSlice.js     # State slice and async thunks
│   │   ├── App.jsx               # Routes definition
│   │   ├── main.jsx              # Application root
│   │   └── index.css             # Base styles
│   ├── index.html
│   ├── vite.config.js            # Vite configuration with proxy
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **PostgreSQL** (optional; the app falls back to an embedded in-memory database if PostgreSQL is not running)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and adjust database credentials if using a local PostgreSQL instance:
   ```bash
   cp .env.example .env
   ```

4. *(Optional)* Seed initial data:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend server runs on `http://localhost:5000`.

---

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/hotels` | Get paginated hotels (supports `search`, `minPrice`, `maxPrice`, `page`, `limit`) |
| `GET` | `/api/hotels/:id` | Get hotel details by ID |
| `POST` | `/api/hotels` | Create a new hotel (`multipart/form-data`) |
| `PUT` | `/api/hotels/:id` | Update an existing hotel (`multipart/form-data`) |
| `DELETE` | `/api/hotels/:id` | Delete hotel and remove its photo |
