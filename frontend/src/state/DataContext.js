import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';
const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    itemsPerPage: 1,
    totalPages: 0,
    links: {}
  });
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 0 }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available filters on mount
  useEffect(() => {
    fetchItems({ limit: 1 }).catch(err => {
      console.error('Failed to fetch initial filters:', err);
    });
  }, []);

  // Fetch items with search support (no pagination)
  const fetchItems = useCallback(async ({
    q = '',
    category = null,
    minPrice = null,
    maxPrice = null,
    sortBy = null,
    sortOrder = 'asc'
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string with parameters
      const queryParams = new URLSearchParams();
      
      if (q) queryParams.append('q', q);
      if (category) {
        if (Array.isArray(category)) {
          category.forEach(cat => queryParams.append('category', cat));
        } else {
          queryParams.append('category', category);
        }
      }
      if (minPrice !== null) queryParams.append('minPrice', minPrice);
      if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (sortOrder) queryParams.append('sortOrder', sortOrder);
      
      const url = `${API_BASE_URL}/items?${queryParams.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Update state with fetched data
      setItems(data.items);
      
      // Set dummy pagination data since we're not using pagination anymore
      setPagination({
        total: data.items.length,
        page: 1,
        itemsPerPage: data.items.length,
        totalPages: 1,
        links: {}
      });
      
      if (data.filters) {
        setFilters(data.filters);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Create a new item
  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Failed to create item');
      }
      
      const newItem = await res.json();
      
      // Refresh the items list to include the new item
      await fetchItems();
      
      setLoading(false);
      return newItem;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [fetchItems]);

  // Update an existing item
  const updateItem = useCallback(async (id, itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors ? errorData.errors.join(', ') : `Failed to update item ${id}`);
      }
      
      const updatedItem = await res.json();
      
      // Refresh the items list to reflect the update
      await fetchItems();
      
      setLoading(false);
      return updatedItem;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [fetchItems]);

  // Delete an item
  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to delete item ${id}`);
      }
      
      const result = await res.json();
      
      // Refresh the items list to reflect the deletion
      await fetchItems();
      
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [fetchItems]);

  // Get a single item by ID
  const getItemById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/items/${id}`);
      
      if (!res.ok) {
        throw new Error(`Item not found with ID: ${id}`);
      }
      
      const item = await res.json();
      setLoading(false);
      return item;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Update search query
  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      setItems,
      pagination,
      setPagination,
      filters,
      searchQuery,
      updateSearchQuery,
      loading,
      error,
      fetchItems,
      createItem,
      updateItem,
      deleteItem,
      getItemById
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);