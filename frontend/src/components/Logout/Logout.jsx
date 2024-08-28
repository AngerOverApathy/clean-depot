import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        logout(); // Perform the logout
        navigate('/login'); // Redirect to login page
    }, [logout, navigate]);

    return null;
};

export default Logout;