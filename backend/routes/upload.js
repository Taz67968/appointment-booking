import express from 'express';
import jwt from 'jsonwebtoken';
import { uploadProfile, uploadProduct } from '../middilewares/upload.js';
import { query } from '../config/db.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Base URL for serving uploaded files
const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get('host')}`;
};

// Helper function to verify token and get user info
const verifyToken = (req) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    return { error: 'No token, authorization has been denied', userId: null, userRole: null };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { error: null, userId: decoded.user?.id, userRole: decoded.user?.role };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token is expired', userId: null, userRole: null };
    }
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Token is not valid', userId: null, userRole: null };
    }
    return { error: 'Server error during token verification', userId: null, userRole: null };
  }
};

/**
 * POST /upload/profile
 * Upload a profile image for the authenticated user
 */
router.post('/profile', uploadProfile.single('profileImage'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify token after file upload
    const { error, userId, userRole } = verifyToken(req);
    
    if (error) {
      return res.status(401).json({ message: error });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const profileImageUrl = `/uploads/profile/${req.file.filename}`;
    const baseUrl = getBaseUrl(req);
    const fullImageUrl = `${baseUrl}${profileImageUrl}`;

    // Update profile image based on user role
    if (userRole === 'client') {
      await query(
        'UPDATE client SET profile_image = $1 WHERE id = $2',
        [profileImageUrl, userId]
      );
    } else if (userRole === 'provider') {
      await query(
        'UPDATE serviceProvider SET profile_image = $1 WHERE id = $2',
        [profileImageUrl, userId]
      );
    }

    logger.info(`Profile image uploaded for user ${userId}: ${req.file.filename}`);

    res.status(201).json({
      message: 'Profile image uploaded successfully',
      imageUrl: profileImageUrl,
      fullImageUrl: fullImageUrl
    });
  } catch (error) {
    logger.error('Error uploading profile image:', error);
    next(error);
  }
});

/**
 * POST /upload/product
 * Upload a product image
 */
router.post('/product', uploadProduct.single('productImage'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify token after file upload
    const { error, userId } = verifyToken(req);
    
    if (error) {
      return res.status(401).json({ message: error });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { productName, productDescription, price, currency } = req.body;
    const productImageUrl = `/uploads/products/${req.file.filename}`;
    const baseUrl = getBaseUrl(req);
    const fullImageUrl = `${baseUrl}${productImageUrl}`;

    // Insert product into database
    const result = await query(
      `INSERT INTO products (provider_id, name, description, price, currency, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, productName, productDescription || null, price || null, currency || 'USD', productImageUrl]
    );

    const productId = result.rows[0].id;

    logger.info(`Product image uploaded for user ${userId}: ${req.file.filename}, product ID: ${productId}`);

    res.status(201).json({
      message: 'Product uploaded successfully',
      productId: productId,
      imageUrl: productImageUrl,
      fullImageUrl: fullImageUrl
    });
  } catch (error) {
    logger.error('Error uploading product:', error);
    next(error);
  }
});

/**
 * GET /upload/products
 * Get all products for the authenticated provider
 */
router.get('/products', async (req, res, next) => {
  try {
    // Verify token
    const { error, userId } = verifyToken(req);
    
    if (error) {
      return res.status(401).json({ message: error });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await query(
      `SELECT id, name, description, price, currency, image_url, created_at
       FROM products
       WHERE provider_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const baseUrl = getBaseUrl(req);
    const products = result.rows.map(product => ({
      ...product,
      fullImageUrl: product.image_url ? `${baseUrl}${product.image_url}` : null
    }));

    res.json({ products });
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
});

/**
 * GET /upload/products/provider/:providerId
 * Get all products for a specific provider (public endpoint for clients)
 */
router.get('/products/provider/:providerId', async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const result = await query(
      `SELECT id, name, description, price, currency, image_url, created_at
       FROM products
       WHERE provider_id = $1
       ORDER BY created_at DESC`,
      [providerId]
    );

    const baseUrl = getBaseUrl(req);
    const products = result.rows.map(product => ({
      ...product,
      fullImageUrl: product.image_url ? `${baseUrl}${product.image_url}` : null
    }));

    res.json({ products });
  } catch (error) {
    logger.error('Error fetching provider products:', error);
    next(error);
  }
});

/**
 * PUT /upload/products/:productId
 * Update a product's details (name, description, price)
 */
router.put('/products/:productId', async (req, res, next) => {
  try {
    // Verify token
    const { error, userId } = verifyToken(req);
    
    if (error) {
      return res.status(401).json({ message: error });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { productId } = req.params;
    const { name, description, price, currency } = req.body;

    // Check if product belongs to the user
    const checkResult = await query(
      'SELECT * FROM products WHERE id = $1 AND provider_id = $2',
      [productId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    const product = checkResult.rows[0];

    // Update product (only provided fields)
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramCount}`);
      updateValues.push(price);
      paramCount++;
    }
    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCount}`);
      updateValues.push(currency);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(productId);
    updateValues.push(userId);

    const result = await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND provider_id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    logger.info(`Product ${productId} updated by user ${userId}`);

    res.json({ 
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    next(error);
  }
});

/**
 * DELETE /upload/products/:productId
 * Delete a product
 */
router.delete('/products/:productId', async (req, res, next) => {
  try {
    // Verify token
    const { error, userId } = verifyToken(req);
    
    if (error) {
      return res.status(401).json({ message: error });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { productId } = req.params;

    // Delete the product (only if it belongs to the user)
    const result = await query(
      'DELETE FROM products WHERE id = $1 AND provider_id = $2 RETURNING id',
      [productId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    logger.info(`Product ${productId} deleted by user ${userId}`);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    next(error);
  }
});

export default router;
