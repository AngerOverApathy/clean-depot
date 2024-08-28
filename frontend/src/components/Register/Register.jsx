import React, { useState } from 'react';
import authService from '../../../services/authService';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            const userData = { username, email, password };
            const response = await authService.register(userData);
            console.log('Registration successful', response);
            // Redirect or handle registration success (e.g., navigate to another page)
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <form className="auth-form" onSubmit={handleRegister}>
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className='email'>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className='email'>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='password'>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
