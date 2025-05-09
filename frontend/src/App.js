import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadPage from './components/FileUploadPage';
import FileDetailPage from './components/FileDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<FileUploadPage />} />
        <Route path="/file/:id" exact element={<FileDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
