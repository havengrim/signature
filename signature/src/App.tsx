import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login'; // Import the Login component
import Signature from './Signature'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Private Routes */}
        <Route
          path="/signature"
          element={isLoggedIn ? <Signature /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
