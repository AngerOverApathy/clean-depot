import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ element }) => {
    const { isLoggedIn } = useAuth();

    console.log('ProtectedRoute render - isLoggedIn:', isLoggedIn);

    return isLoggedIn ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;