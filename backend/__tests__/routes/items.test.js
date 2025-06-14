const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }
}));

// Import the router
const itemsRouter = require('../../src/routes/items');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Sample test data
const testItems = [
  { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
  { id: 2, name: "Noise Cancelling Headphones", category: "Electronics", price: 399 },
  { id: 3, name: "Ultra-Wide Monitor", category: "Electronics", price: 999 },
  { id: 4, name: "Ergonomic Chair", category: "Furniture", price: 799 },
  { id: 5, name: "Standing Desk", category: "Furniture", price: 1199 }
];

describe('Items API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for readFile
    fs.readFile.mockResolvedValue(JSON.stringify(testItems));
  });

  // GET /api/items - Happy Path
  describe('GET /api/items', () => {
    test('should return all items', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    test('should filter items by query parameter', async () => {
      const response = await request(app).get('/api/items?q=laptop');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Laptop Pro');
    });

    test('should limit returned items when limit parameter is provided', async () => {
      const response = await request(app).get('/api/items?limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should handle file read error', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('Failed to read file'));
      
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(500);
    });
  });

  // GET /api/items/:id - Happy Path
  describe('GET /api/items/:id', () => {
    test('should return a single item by id', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Laptop Pro');
    });

    // Error Case - Item not found
    test('should return 404 if item not found', async () => {
      const response = await request(app).get('/api/items/999');
      
      expect(response.status).toBe(404);
    });

    // Error Case - Invalid ID format
    test('should handle invalid id format', async () => {
      const response = await request(app).get('/api/items/invalid');
      
      expect(response.status).toBe(404); // Since parsing 'invalid' as int gives NaN
    });

    test('should handle file read error', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('Failed to read file'));
      
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(500);
    });
  });

  // POST /api/items - Happy Path
  describe('POST /api/items', () => {
    const newItem = { name: 'New Item', category: 'Test', price: 100 };

    test('should create a new item', async () => {
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Item');
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    test('should handle file read error during creation', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('Failed to read file'));
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(500);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('should handle file write error', async () => {
      fs.writeFile.mockRejectedValueOnce(new Error('Failed to write file'));
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(500);
    });
  });
});
