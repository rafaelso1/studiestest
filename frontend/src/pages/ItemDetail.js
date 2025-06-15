import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../state/DataContext';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, updateItem, deleteItem } = useData();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const itemData = await getItemById(parseInt(id));
        setItem(itemData);
        setFormData({
          name: itemData.name || '',
          category: itemData.category || '',
          price: itemData.price || 0,
          description: itemData.description || ''
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. The item may not exist.');
        showToast('Item not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, getItemById]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form data to current item values when toggling edit mode
    if (!isEditing && item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        price: item.price || 0,
        description: item.description || ''
      });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Handle price as a number
    if (name === 'price') {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Prepare the updated item data
      const updatedItemData = {
        ...item,
        ...formData
      };
      
      // Call the API to update the item
      const result = await updateItem(parseInt(id), updatedItemData);
      
      // Update the local state
      setItem(result);
      setIsEditing(false);
      showToast('Item updated successfully', 'success');
    } catch (err) {
      console.error('Error updating item:', err);
      showToast('Failed to update item', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      await deleteItem(parseInt(id));
      showToast('Item deleted successfully', 'success');
      
      // Redirect to items list after a short delay
      setTimeout(() => {
        navigate('/items');
      }, 1500);
    } catch (err) {
      console.error('Error deleting item:', err);
      showToast('Failed to delete item', 'error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

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

  // Loading skeleton
  const ItemDetailSkeleton = () => (
    <div className="item-detail-container skeleton">
      <div className="item-detail-header skeleton">
        <div className="skeleton-title"></div>
      </div>
      <div className="item-detail-content">
        <div className="item-detail-image skeleton"></div>
        <div className="item-detail-info">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-price"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="item-detail-container error">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        <div className="error-message" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
        <div className="item-detail-actions">
          <Link to="/" className="button back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail-page">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {loading ? (
        <ItemDetailSkeleton />
      ) : (
        <div className="item-detail-container">
          <div className="item-detail-header">
            <h1>{item.name}</h1>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="item-edit-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="form-control"
                  placeholder="Add a description for this item"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button cancel-button" 
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button save-button" 
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="item-detail-content">
              <div className="item-detail-image">
                {/* Placeholder image using item properties to generate a unique colored placeholder */}
                <div 
                  className="image-placeholder" 
                  style={{
                    backgroundColor: `hsl(${(item.id * 40) % 360}, 70%, 80%)`,
                  }}
                >
                  {item.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="item-detail-info">
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value category-tag">{item.category}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{item.id}</span>
                </div>
                
                <div className="info-row description">
                  <span className="info-label">Description:</span>
                  <p className="info-value">{item.description || 'No description available.'}</p>
                </div>
                
                <div className="info-row price">
                  <span className="info-label">Price:</span>
                  <span className="info-value price-value">${item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="item-detail-actions">
            <div className="left-actions">
              <Link to="/items" className="button back-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Items
              </Link>
            </div>
            <div className="right-actions">
              <button 
                className="button delete-button"
                onClick={handleDeleteClick}
                disabled={isEditing || isSaving || isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Item
              </button>
              <button 
                className={`button edit-button ${isEditing ? 'active' : ''}`}
                onClick={handleEditToggle}
                disabled={isSaving || isDeleting}
              >
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Item
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <div className="delete-modal-overlay">
              <div className="delete-modal">
                <div className="delete-modal-header">
                  <h3>Confirm Delete</h3>
                </div>
                <div className="delete-modal-body">
                  <p>Are you sure you want to delete <strong>{item.name}</strong>?</p>
                  <p className="delete-warning">This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button 
                    className="button cancel-button" 
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="button delete-confirm-button" 
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="spinner" viewBox="0 0 50 50">
                          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                        Deleting...
                      </>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemDetail;