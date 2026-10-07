const { pool } = require('./config/db');

const sampleHotels = [
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

async function seed() {
  console.log('Seeding initial hotels...');

  try {
    // Ensure table exists
    await pool.query(`
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
    `);

    for (const hotel of sampleHotels) {
      await pool.query(
        `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING;`,
        [hotel.title, hotel.description, hotel.latitude, hotel.longitude, hotel.price, hotel.image_path]
      );
    }

    console.log(`Seeded ${sampleHotels.length} hotels successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
