import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ListPage />} />
      <Route path="/hotels/:id" element={<DetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
