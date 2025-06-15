# Product Management System

A full-stack web application for managing product inventory with complete CRUD functionality. Built with React for the frontend and Express.js for the backend.

## Features

### Product Listing
- Display all products in a responsive grid layout
- Search functionality to filter products by name or category
- Clean and modern UI with visual feedback for loading states

### Product Details
- Detailed view of individual products
- Visual representation with color-coded placeholders
- Display of product name, category, price, and description

### Product Editing
- In-place editing of product details
- Form validation for required fields and correct data types
- Visual feedback during saving operations
- Success/error notifications via toast messages

### Product Creation
- Dedicated page for adding new products
- Form with validation for all required fields
- Redirect to product details upon successful creation

### Product Deletion
- Delete button with confirmation modal
- Visual feedback during deletion process
- Redirect to product list after successful deletion
- Protection against accidental deletion

## Technical Implementation

### Frontend (React)
- **Component Structure**:
  - `App.js`: Main routing component
  - `Items.js`: Product listing page with search functionality
  - `ItemDetail.js`: Product detail and edit page
  - `ItemCreate.js`: New product creation form

- **State Management**:
  - React Context API via `DataContext.js`
  - Centralized API communication
  - Loading and error states

- **Styling**:
  - CSS modules for component-specific styling
  - Responsive design for various screen sizes
  - Consistent color scheme and visual language

### Backend (Express.js)
- **API Endpoints**:
  - `GET /api/items`: Retrieve all products with optional search
  - `GET /api/items/:id`: Get a specific product by ID
  - `POST /api/items`: Create a new product
  - `PUT /api/items/:id`: Update an existing product
  - `DELETE /api/items/:id`: Delete a product

- **Data Storage**:
  - JSON file-based storage
  - Asynchronous file operations
  - Error handling for all operations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/studiestest.git
   cd studiestest
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Future Enhancements

- User authentication and authorization
- Image upload for products
- Advanced filtering and sorting options
- Pagination for large datasets
- Unit and integration testing
- Dark mode support

## Technologies Used

- **Frontend**:
  - React.js
  - React Router DOM
  - Context API for state management
  - CSS for styling

- **Backend**:
  - Express.js
  - Node.js file system for data storage
  - RESTful API design

## License

This project is licensed under the MIT License - see the LICENSE file for details.