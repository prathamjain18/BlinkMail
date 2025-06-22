import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RegisterProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Register = ({ setIsAuthenticated }: RegisterProps) => {
  const navigate = useNavigate();
  // State for form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  // State for error messages
  const [error, setError] = useState('');
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to toggle confirm password visibility
  const [showConfirm, setShowConfirm] = useState(false);

  // Handles form submission for registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      // Store authentication details in localStorage
      localStorage.setItem('token', response.data.token);
      if (response.data.userId) localStorage.setItem('userId', response.data.userId);
      if (response.data.email) localStorage.setItem('email', response.data.email);
      if (response.data.firstName) localStorage.setItem('firstName', response.data.firstName);
      if (response.data.lastName) localStorage.setItem('lastName', response.data.lastName);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-accent-light dark:from-background-dark dark:via-gray-900 dark:to-primary-dark transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none select-none opacity-20 dark:opacity-10" aria-hidden="true">
        {/* Decorative SVG background */}
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="700" cy="100" r="120" fill="#60a5fa" />
          <circle cx="100" cy="500" r="100" fill="#fbbf24" />
        </svg>
      </div>
      <div className="relative z-10 max-w-md w-full mx-auto animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white shadow-lg mb-2">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
          </span>
          <h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">Create your account</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Join the email revolution!</p>
        </div>
        <form className="bg-white dark:bg-gray-900 shadow-xl rounded-xl px-8 py-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-2">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm pr-10"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* Toggle password visibility button */}
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-primary dark:hover:text-primary-light"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm pr-10"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {/* Toggle confirm password visibility button */}
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-primary dark:hover:text-primary-light"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Register
          </button>
          <div className="text-sm text-center mt-2">
            <Link to="/login" className="font-medium text-primary hover:text-primary-light">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 