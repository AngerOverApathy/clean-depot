import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './index.css'

const Navbar = () => {
    const { isLoggedIn } = useAuth();

    return (
        <nav>
            <ul>
                {/* <li><Link to="/">Home</Link></li> */}
                {!isLoggedIn && <li><Link to="/">Login</Link></li>}
                {!isLoggedIn && <li><Link to="/">Register</Link></li>}
                {isLoggedIn && <li><Link to="/logout">Logout</Link></li>}
            </ul>
        </nav>
    );
};

export default Navbar;