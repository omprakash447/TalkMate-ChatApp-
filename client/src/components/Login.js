import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginResponse = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', loginResponse.data.token);
      setUser(loginResponse.data);
      toast.success('Login successful! Redirecting...', { autoClose: 1500 });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please try again.', { autoClose: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-indigo-700 px-4 sm:px-6 lg:px-8 animate-background">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full space-y-8 transform transition-all duration-500 ease-in-out hover:scale-105 animate-form">
        <div className="text-center text-white">
          <h2 className="text-3xl font-extrabold animate-title">Sign In</h2>
          <p className="text-sm mt-2 animate-subtitle">Welcome back, please log in to your account.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-transform duration-300 ease-in-out transform hover:scale-105"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-transform duration-300 ease-in-out transform hover:scale-105"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-110 hover:shadow-xl"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/register" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition duration-300 ease-in-out transform hover:scale-105">
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
