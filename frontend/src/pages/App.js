import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DataProvider } from '../state/DataContext';
import Items from './Items';
import ItemDetail from './ItemDetail';
import ItemCreate from './ItemCreate';

function App() {
  return (
    <DataProvider>
      <nav style={{padding: 16, borderBottom: '1px solid #ddd'}}>
        <Link to="/">Items</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/new" element={<ItemCreate />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </DataProvider>
  );
}

export default App;