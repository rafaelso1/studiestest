const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (now using async operations)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { q } = req.query;
    
    // Apply search filter if query parameter exists
    let results = data;
    if (q) {
      // Case-insensitive search on name and category fields
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Return all results without pagination
    res.json({
      items: results
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id
router.put('/:id', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const updatedItem = req.body;
    
    // Ensure ID in body matches URL parameter
    if (updatedItem.id && updatedItem.id !== itemId) {
      const err = new Error('Item ID in body must match URL parameter');
      err.status = 400;
      throw err;
    }
    
    // Ensure ID is preserved
    updatedItem.id = itemId;
    
    const data = await readData();
    const index = data.findIndex(i => i.id === itemId);
    
    if (index === -1) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    
    // Update the item
    data[index] = { ...data[index], ...updatedItem };
    
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.json(data[index]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const data = await readData();
    
    // Find the item index
    const index = data.findIndex(i => i.id === itemId);
    
    // Check if item exists
    if (index === -1) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    
    // Remove the item
    const deletedItem = data.splice(index, 1)[0];
    
    // Write updated data back to file
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    
    // Return the deleted item
    res.json(deletedItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;