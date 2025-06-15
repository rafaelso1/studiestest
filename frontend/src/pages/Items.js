import React, { useEffect, useState, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import './Items.css';

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`toast ${type}`}>
    <div className="toast-content">
      {type === 'success' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )}
      {type === 'error' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )}
      <span>{message}</span>
    </div>
    <button className="toast-close" onClick={onClose} aria-label="Close notification">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
);

// Skeleton loader component for items
const ItemSkeleton = () => (
  <li className="item-card skeleton">
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-details">
        <div className="skeleton-category"></div>
        <div className="skeleton-price"></div>
      </div>
    </div>
  </li>
);

function Items() {
  const { 
    items, 
    setItems, 
    pagination, 
    setPagination, 
    searchQuery, 
    updateSearchQuery, 
    fetchItems 
  } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [toast, setToast] = useState(null);
  const searchInputRef = useRef(null);

  // Load items with search parameters
  const loadItems = async (query = searchQuery) => {
    setIsLoading(true);
    try {
      await fetchItems({ q: query });
      if (query) {
        showToast(`Search results for "${query}"`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to load items');
      showToast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Initial load
  useEffect(() => {
    // Flag to track if component is mounted
    let active = true;
    
    const initialLoad = async () => {
      setIsLoading(true);
      
      try {
        // Get data from the API
        const data = await fetchItems({ q: searchQuery });
        
        // Only update state if component is still mounted
        if (active) {
          setItems(data.items);
          setIsLoading(false);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (active) {
          console.error('Error fetching items:', err);
          setError(err.message || 'Failed to load items');
          setIsLoading(false);
        }
      }
    };

    initialLoad();

    // Cleanup function to prevent memory leaks
    return () => {
      active = false;
    };
  }, [fetchItems, setItems, searchQuery]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchQuery(searchInput);
    loadItems(searchInput);
    
    // Focus back to search input for better UX
    if (searchInputRef.current) {
      searchInputRef.current.blur();
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  };

  if (error) return <div className="error-message" role="alert">{error}</div>;

  return (
    <div className="items-container">
      <div className="items-header">
        <div className="items-top-row">
          <h1>Items</h1>
          <Link to="/items/new" className="button create-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Item
          </Link>
        </div>
      </div>
      
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form" role="search">
        <label htmlFor="search-input" className="visually-hidden">Search items</label>
        <div className="search-container">
          <input
            id="search-input"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or category..."
            className="search-input"
            aria-label="Search items"
            ref={searchInputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="search-button"
            aria-label="Submit search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>
        </div>
        {searchQuery && (
          <div className="search-status" aria-live="polite">
            Showing results for "{searchQuery}"
            <button 
              type="button" 
              className="clear-search" 
              onClick={() => {
                setSearchInput('');
                updateSearchQuery('');
                loadItems('');
              }}
              aria-label="Clear search"
            >
              Clear
            </button>
          </div>
        )}
      </form>
      {/* Items list */}
      {isLoading ? (
        <>
          <div className="loading" aria-live="polite">Loading items...</div>
          <ul className="items-list" aria-hidden="true">
            {[...Array(6)].map((_, index) => (
              <ItemSkeleton key={index} />
            ))}
          </ul>
        </>
      ) : items.length === 0 ? (
        <div className="no-results" role="status">No items found</div>
      ) : (
        <>
          <ul className="items-list" role="list">
            {items.map(item => (
              <li key={item.id} className="item-card" role="listitem">
                <Link to={`/items/${item.id}`} className="item-link" aria-label={`${item.name}, ${item.category}, $${item.price}`}>
                  <h3>{item.name}</h3>
                  <div className="item-details">
                    <span className="item-category">{item.category}</span>
                    <span className="item-price">
                      <span className="visually-hidden">Price:</span>
                      ${item.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="items-count" aria-live="polite">
            Showing {items.length} items
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default Items;