import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Registration failed';
        toast.error(msg);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
          <p className="text-slate-500 mt-2">Start organizing your life today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input 
              className="w-full border border-slate-300 px-4 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              className="w-full border border-slate-300 px-4 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2">
            Create account
          </button>
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}