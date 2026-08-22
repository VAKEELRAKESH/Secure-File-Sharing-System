import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      // Send data to backend (excluding confirmPassword as the API won't need it)
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // On success, send them to login page
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-zinc-50 p-10 rounded-xl shadow-2xl border border-zinc-200"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Join TrustShare to start sharing securely
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 mt-1 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="John Doe"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email address</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="appearance-none block w-full px-3 py-2 mt-1 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="you@company.com"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2 mt-1 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2 mt-1 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4">
          <span className="text-zinc-600">Already have an account? </span>
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Sign in here
          </Link>
        </div>
        
      </motion.div>
    </div>
  );
}