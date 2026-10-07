const { Pool } = require('pg');
require('dotenv').config();

let activePool = null;

// Initial demonstration data if running with local fallback
const initialSeedData = [
  {
    title: 'The Ritz Carlton Marina Bay',
    description: 'Premier waterfront luxury suites with panoramic skyline views, fine dining culinary experiences, and an infinity rooftop lounge.',
    latitude: 1.2858,
    longitude: 103.8588,
    price: 450.00,
    image_path: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Grand Alpine Lodge & Spa',
    description: 'Picturesque alpine ski resort nestled in pristine mountain ranges with heated indoor pools, sauna suites, and direct ski-in access.',
    latitude: 45.9237,
    longitude: 6.8694,
    price: 320.00,
    image_path: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Azure Horizon Beach Resort',
    description: 'Exclusive beachfront bungalows over crystal blue waters. Enjoy personalized concierge service and private diving charters.',
    latitude: 4.1755,
    longitude: 73.5093,
    price: 680.00,
    image_path: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Manhattan Sky Boutique Hotel',
    description: 'Sleek industrial chic boutique hotel in the heart of SoHo featuring mid-century design, curated cocktail bars, and rooftop garden.',
    latitude: 40.7128,
    longitude: -74.0060,
    price: 285.00,
    image_path: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Kyoto Imperial Garden Sanctuary',
    description: 'Traditional ryokan blended with state-of-the-art Japanese hospitality, private zen onsen gardens, and seasonal kaiseki gastronomy.',
    latitude: 35.0116,
    longitude: 135.7681,
    price: 390.00,
    image_path: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Santorini Caldera Sunset Villas',
    description: 'Cycladic whitewashed cave suites carved into the cliffs of Oia overlooking the Aegean sea and world-renowned sunset vistas.',
    latitude: 36.4618,
    longitude: 25.3753,
    price: 520.00,
    image_path: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Mayfair Heritage Palace',
    description: 'Historic Victorian mansion offering timeless British elegance, bespoke afternoon tea, and prime proximity to Hyde Park.',
    latitude: 51.5074,
    longitude: -0.1278,
    price: 410.00,
    image_path: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Sydney Harbour Waterfront Haven',
    description: 'Contemporary architectural marvel facing the iconic Sydney Opera House with floor-to-ceiling glass facades and marina mooring.',
    latitude: -33.8568,
    longitude: 151.2153,
    price: 360.00,
    image_path: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'
  }
];

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT, 10) || 5432,
      database: process.env.PGDATABASE || 'hotel_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      connectionTimeoutMillis: 3000
    };

const nativePgPool = new Pool(poolConfig);

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const setupEmbeddedFallback = async () => {
  const { newDb } = require('pg-mem');
  const memDb = newDb();

  const fallbackSchema = `
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      latitude DECIMAL NOT NULL,
      longitude DECIMAL NOT NULL,
      price DECIMAL NOT NULL,
      image_path VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  activePool = memDb.adapters.createPg().Pool;
  const poolInstance = new activePool();
  activePool = poolInstance;

  await activePool.query(fallbackSchema);

  // Pre-seed sample hotels for demonstration
  for (const item of initialSeedData) {
    await activePool.query(
      `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [item.title, item.description, item.latitude, item.longitude, item.price, item.image_path]
    );
  }

  console.log(`Using in-memory database fallback (${initialSeedData.length} records loaded)`);
};

const initDB = async () => {
  try {
    const client = await nativePgPool.connect();
    await client.query(createTableQuery);
    client.release();

    activePool = nativePgPool;
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.warn(`PostgreSQL connection failed (${err.message}). Falling back to in-memory store.`);
    await setupEmbeddedFallback();
  }
};

module.exports = {
  query: async (text, params) => {
    if (!activePool) {
      await initDB();
    }
    return activePool.query(text, params);
  },

  get pool() {
    return activePool || nativePgPool;
  },

  initDB
};
