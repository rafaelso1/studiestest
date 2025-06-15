import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../state/DataContext';
import './ItemDetail.css'; // Reuse the same CSS

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

function ItemCreate() {
  const navigate = useNavigate();
  const { createItem } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert price to number
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      const newItem = await createItem(itemData);
      
      // Show success message
      setToast({
        message: 'Item created successfully!',
        type: 'success'
      });
      
      // Redirect to the new item page after a short delay
      setTimeout(() => {
        navigate(`/items/${newItem.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating item:', error);
      setToast({
        message: error.message || 'Failed to create item',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="item-detail-container">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="item-detail-header">
        <Link to="/items" className="button back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Items
        </Link>
        <h1>Create New Item</h1>
      </div>
      
      <div className="item-detail-content">
        <div className="item-detail-card">
          <form onSubmit={handleSubmit} className="item-edit-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
                disabled={isLoading}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter item category"
                disabled={isLoading}
              />
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                className={`form-control ${errors.price ? 'error' : ''}`}
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter item price"
                disabled={isLoading}
              />
              {errors.price && <div className="error-message">{errors.price}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description (optional)"
                rows="5"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-actions">
              <Link to="/items" className="button cancel-button">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="button save-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ItemCreate;
