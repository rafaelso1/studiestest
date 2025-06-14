const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache object to store stats calculation results
let statsCache = null;
let cacheTimestamp = null;

// Set up file watcher to invalidate cache when data changes
fs.watch(DATA_PATH, (eventType) => {
  if (eventType === 'change') {
    console.log('Data file changed, invalidating stats cache');
    statsCache = null;
    cacheTimestamp = null;
  }
});

// Function to calculate stats
async function calculateStats() {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    // Intentional heavy CPU calculation
    const stats = {
      total: items.length,
      averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length,
      cachedAt: new Date().toISOString()
    };
    
    // Update cache
    statsCache = stats;
    cacheTimestamp = Date.now();
    
    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Cache expiration time (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;
    
    // Check if we have a valid cache
    if (statsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      console.log('Serving stats from cache');
      return res.json(statsCache);
    }
    
    // Calculate fresh stats
    console.log('Calculating fresh stats');
    const stats = await calculateStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;