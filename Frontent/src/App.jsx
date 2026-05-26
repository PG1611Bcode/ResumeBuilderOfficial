// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileNotification from "./components/ProfileNotification";

// Pages
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Dashboard from "./Pages/Dashboard.jsx";
import History from "./Pages/History.jsx";
import CVHistoryDetail from "./Pages/CVHistoryDetail.jsx";

// Components
import ForgotPassword from "./components/ForgotPassword";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />
      <Route path="/history/cv/:id" element={
        <ProtectedRoute>
          <CVHistoryDetail />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  </Router>
);


export default App;