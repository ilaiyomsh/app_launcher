import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSnippets } from '../services/snippetService';
import { Snippet } from '../types';
import { ExternalLink, Loader2, Calendar, User, Settings, Copy, Check, Plus } from 'lucide-react';

function BrowsePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const data = await getAllSnippets();
      setSnippets(data);
    } catch (err) {
      setError('שגיאה בטעינת הכלים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getViewUrl = (id: string) => {
    return `${window.location.origin}/view/${id}`;
  };

  const handleCopyLink = async (id: string) => {
    const url = getViewUrl(id);
    try {
      // נסה להשתמש ב-Clipboard API המודרני
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        // Fallback לשיטה הישנה
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
          console.error('שגיאה בהעתקה:', err);
          alert('לא ניתן להעתיק אוטומטית. הקישור: ' + url);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('שגיאה בהעתקת הקישור:', err);
      // Fallback נוסף - שיטה ישנה
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        console.error('שגיאה גם ב-fallback:', fallbackErr);
        alert('לא ניתן להעתיק אוטומטית. הקישור: ' + url);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען כלים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">גלריית כלים</h1>
              <p className="text-gray-600 text-lg">כל הכלים הזמינים לשימוש</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus size={18} />
                צור כלי חדש
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-lg transition-colors"
              >
                <Settings size={18} />
                ניהול
              </Link>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין כלים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {snippet.name}
                </h3>

                {snippet.description && (
                  <p className="text-gray-600 mb-3 text-sm">
                    {snippet.description}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {snippet.author && (
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>יוצר: {snippet.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>עודכן: {snippet.updatedAt.toLocaleDateString('he-IL')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getViewUrl(snippet.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={18} />
                    פתח כלי
                  </a>
                  <button
                    onClick={() => handleCopyLink(snippet.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    title="העתק קישור"
                  >
                    {copiedId === snippet.id ? (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;

