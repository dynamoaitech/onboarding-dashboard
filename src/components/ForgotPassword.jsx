import React, { useState } from 'react';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: email.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
      } else {
        setError(data.error || 'Failed to generate reset token');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied to clipboard!');
  };

  if (token) {
    return (
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Token Generated</h1>
        <p className="text-center text-slate-500 text-sm mb-6">Use this token to reset your password</p>

        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg mb-4 text-sm text-yellow-800">
          <strong>Note:</strong> This is a temporary solution. In production, you would receive this token via email.
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4">
          <p className="text-xs text-slate-500 mb-2">Your reset token (expires in 1 hour):</p>
          <p className="font-mono text-sm break-all text-slate-800 mb-3">{token}</p>
          <button
            onClick={copyToken}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Copy Token
          </button>
        </div>

        <button
          onClick={() => onNavigate('reset')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Continue to Reset Password
        </button>

        <div className="mt-4 text-center text-sm text-slate-500">
          <button
            onClick={() => onNavigate('login')}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-center text-slate-500 text-sm mb-6">Enter your email to reset your password</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating token...' : 'Generate Reset Token'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-500">
        <button
          onClick={() => onNavigate('login')}
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
