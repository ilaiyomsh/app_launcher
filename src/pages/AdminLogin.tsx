import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

// TODO: החלף את הסיסמה הקשיחה במערכת אבטחה אמיתית
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'admin123';

function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (secret === ADMIN_SECRET) {
      localStorage.setItem('admin_authenticated', 'true');
      navigate('/admin');
    } else {
      setError('סיסמה שגויה');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            התחברות למנהל מערכת
          </h1>
          <p className="text-gray-600 mt-2">
            הזן סיסמת מנהל כדי להמשיך
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
              סיסמת מנהל
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הזן סיסמה"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            התחבר
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

