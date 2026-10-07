const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// Helper to safely delete an uploaded file
const removePhysicalFile = (relativePath) => {
  if (!relativePath) return;

  try {
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const absolutePath = path.join(__dirname, '..', cleanPath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error(`Failed to delete file (${relativePath}):`, err.message);
  }
};

// GET /api/hotels - Get hotels with optional search and price filters
const getHotels = async (req, res) => {
  try {
    const { search = '', minPrice, maxPrice, page = 1, limit = 6 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const queryParams = [];

    // Search query filter
    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim()}%`);
      whereClauses.push(`(title ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`);
    }

    // Min price filter
    if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) {
      queryParams.push(parseFloat(minPrice));
      whereClauses.push(`price >= $${queryParams.length}`);
    }

    // Max price filter
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) {
      queryParams.push(parseFloat(maxPrice));
      whereClauses.push(`price <= $${queryParams.length}`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query for pagination
    const countSql = `SELECT COUNT(*) AS total FROM hotels ${whereString};`;
    const countResult = await db.query(countSql, queryParams);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    // Fetch paginated data
    const dataQueryParams = [...queryParams];
    dataQueryParams.push(limitNum);
    const limitIndex = dataQueryParams.length;
    dataQueryParams.push(offset);
    const offsetIndex = dataQueryParams.length;

    const dataSql = `
      SELECT 
        id, 
        title, 
        description, 
        latitude, 
        longitude, 
        price, 
        image_path, 
        created_at 
      FROM hotels 
      ${whereString}
      ORDER BY id DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;

    const dataResult = await db.query(dataSql, dataQueryParams);

    return res.status(200).json({
      success: true,
      hotels: dataResult.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotels',
      error: error.message
    });
  }
};

// GET /api/hotels/:id - Get a single hotel by ID
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
    }

    const sql = `SELECT * FROM hotels WHERE id = $1;`;
    const result = await db.query(sql, [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    return res.status(200).json({
      success: true,
      hotel: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching hotel by id:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotel',
      error: error.message
    });
  }
};

// POST /api/hotels - Create a new hotel
const createHotel = async (req, res) => {
  try {
    const { title, description, latitude, longitude, price } = req.body;

    // Validation
    const errors = {};

    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }

    if (!description || !description.trim()) {
      errors.description = 'Description is required';
    }

    if (latitude === undefined || latitude === '' || isNaN(latitude)) {
      errors.latitude = 'Valid latitude is required';
    } else {
      const lat = parseFloat(latitude);
      if (lat < -90 || lat > 90) errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (longitude === undefined || longitude === '' || isNaN(longitude)) {
      errors.longitude = 'Valid longitude is required';
    } else {
      const lng = parseFloat(longitude);
      if (lng < -180 || lng > 180) errors.longitude = 'Longitude must be between -180 and 180';
    }

    if (price === undefined || price === '' || isNaN(price) || parseFloat(price) < 0) {
      errors.price = 'Valid non-negative price is required';
    }

    if (Object.keys(errors).length > 0) {
      if (req.file) {
        removePhysicalFile(`/uploads/${req.file.filename}`);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const insertSql = `
      INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      title.trim(),
      description.trim(),
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(price),
      image_path
    ];

    const result = await db.query(insertSql, values);

    return res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel: result.rows[0]
    });
  } catch (error) {
    if (req.file) {
      removePhysicalFile(`/uploads/${req.file.filename}`);
    }

    console.error('Error creating hotel:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error.message
    });
  }
};

// PUT /api/hotels/:id - Update an existing hotel
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      if (req.file) removePhysicalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
    }

    // Check if hotel exists
    const checkSql = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkSql, [hotelId]);

    if (checkResult.rows.length === 0) {
      if (req.file) removePhysicalFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const existingHotel = checkResult.rows[0];
    const { title, description, latitude, longitude, price } = req.body;

    // Field validations
    const errors = {};

    if (title !== undefined && !title.trim()) {
      errors.title = 'Title cannot be empty';
    }

    if (description !== undefined && !description.trim()) {
      errors.description = 'Description cannot be empty';
    }

    if (latitude !== undefined) {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
    }

    if (longitude !== undefined) {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    if (price !== undefined) {
      const prc = parseFloat(price);
      if (isNaN(prc) || prc < 0) {
        errors.price = 'Price must be a valid positive number';
      }
    }

    if (Object.keys(errors).length > 0) {
      if (req.file) removePhysicalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    let newImagePath = existingHotel.image_path;

    // Replace uploaded image file if new file was provided
    if (req.file) {
      newImagePath = `/uploads/${req.file.filename}`;
      if (existingHotel.image_path) {
        removePhysicalFile(existingHotel.image_path);
      }
    }

    const updatedTitle = title !== undefined ? title.trim() : existingHotel.title;
    const updatedDescription = description !== undefined ? description.trim() : existingHotel.description;
    const updatedLat = latitude !== undefined ? parseFloat(latitude) : existingHotel.latitude;
    const updatedLng = longitude !== undefined ? parseFloat(longitude) : existingHotel.longitude;
    const updatedPrice = price !== undefined ? parseFloat(price) : existingHotel.price;

    const updateSql = `
      UPDATE hotels
      SET 
        title = $1,
        description = $2,
        latitude = $3,
        longitude = $4,
        price = $5,
        image_path = $6
      WHERE id = $7
      RETURNING *;
    `;

    const values = [
      updatedTitle,
      updatedDescription,
      updatedLat,
      updatedLng,
      updatedPrice,
      newImagePath,
      hotelId
    ];

    const result = await db.query(updateSql, values);

    return res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      hotel: result.rows[0]
    });
  } catch (error) {
    if (req.file) removePhysicalFile(`/uploads/${req.file.filename}`);

    console.error('Error updating hotel:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: error.message
    });
  }
};

// DELETE /api/hotels/:id - Delete a hotel and remove its photo
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
    }

    const checkSql = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkSql, [hotelId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const hotel = checkResult.rows[0];

    const deleteSql = `DELETE FROM hotels WHERE id = $1 RETURNING id;`;
    await db.query(deleteSql, [hotelId]);

    // Remove photo from uploads
    if (hotel.image_path) {
      removePhysicalFile(hotel.image_path);
    }

    return res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
      deletedId: hotelId
    });
  } catch (error) {
    console.error('Error deleting hotel:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: error.message
    });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
