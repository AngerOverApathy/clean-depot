const API_BASE_URL = 'http://localhost:5050/user/';

const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
};

export default {
    register,
    login,
    logout,
};