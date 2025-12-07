import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createSnippet } from '../services/snippetService';
import { Copy, Check, Loader2, Grid3x3 } from 'lucide-react';

function CreatePage() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('שם הכלי הוא שדה חובה');
      return;
    }

    if (!code.trim()) {
      setError('קוד React הוא שדה חובה');
      return;
    }

    setLoading(true);
    try {
      let codeToSave = code.trim();
      
      // תיקון: אם הקוד מתחיל ב-unction במקום function, נוסיף f
      if (codeToSave.startsWith('unction ')) {
        codeToSave = 'f' + codeToSave;
        console.log('🔧 תוקן: הוסף f בתחילת הקוד לפני שמירה');
      }
      
      // לוגים לבדיקה
      console.log('📋 לפני שמירה:');
      console.log('📏 אורך הקוד:', codeToSave.length);
      console.log('📄 100 תווים ראשונים:', codeToSave.substring(0, 100));
      console.log('📄 100 תווים אחרונים:', codeToSave.substring(Math.max(0, codeToSave.length - 100)));
      
      const id = await createSnippet({
        name: name.trim(),
        code: codeToSave,
        author: author.trim() || undefined,
      });

      const url = `${window.location.origin}/view/${id}`;
      setCreatedUrl(url);
      
      // איפוס הטופס
      setName('');
      setCode('');
      setAuthor('');
    } catch (err) {
      setError('שגיאה ביצירת הכלי. נסה שוב.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdUrl) {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              יצירת כלי חדש
            </h1>
            <Link
              to="/browse"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Grid3x3 size={18} />
              צפה בכל הכלים
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {createdUrl && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">
                הכלי נוצר בהצלחה!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      הועתק!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      העתק
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                שם הכלי *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="למשל: מחשבון עמלות מרץ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                שם יוצר (אופציונלי)
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="שם המשתמש שיצר את הכלי"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                קוד React *
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="הדבק כאן את קוד React מ-Gemini Canvas..."
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  יוצר כלי...
                </>
              ) : (
                'צור כלי'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;

