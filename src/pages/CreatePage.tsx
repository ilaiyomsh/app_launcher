import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createSnippet } from '../services/snippetService';
import { validateReactCode } from '../utils/codeValidator';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check, Loader2, Grid3x3, Download, Type, BookOpen, Trash } from 'lucide-react';
import { CategorySelect } from '../components/CategorySelect';
import { TagSelect } from '../components/TagSelect';
import { getAllCategories } from '../services/categoryService';
import { getAllTags } from '../services/tagService';

function CreatePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      // Load categories and tags in background (not used directly but needed for components)
      await Promise.all([
        getAllCategories(),
        getAllTags(),
      ]);
    } catch (err) {
      console.error('שגיאה בטעינת מטא-דטה:', err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('יש להתחבר כדי ליצור כלי');
      return;
    }

    if (!name.trim()) {
      setError('שם הכלי הוא שדה חובה');
      return;
    }

    if (!code.trim()) {
      setError('קוד React הוא שדה חובה');
      return;
    }

    // ולידציה מתקדמת של הקוד
    setLoading(true);
    const validation = await validateReactCode(code);
    if (!validation.valid) {
      setError(validation.error || 'הקוד לא תקין');
      setLoading(false);
      return;
    }

    try {
      let codeToSave = code.trim();

      // תיקון: אם הקוד מתחיל ב-unction במקום function, נוסיף f
      if (codeToSave.startsWith('unction ')) {
        codeToSave = 'f' + codeToSave;
      }
      
      const id = await createSnippet({
        name: name.trim(),
        description: description.trim() || undefined,
        code: codeToSave,
        category,
        tags,
      });

      const url = `${window.location.origin}/view/${id}`;
      setCreatedUrl(url);

      // איפוס הטופס
      setName('');
      setDescription('');
      setCode('');
      setCategory(undefined);
      setTags([]);
    } catch (err) {
      setError('שגיאה ביצירת הכלי. נסה שוב.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdUrl) return;
    
    try {
      // נסה להשתמש ב-Clipboard API המודרני
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(createdUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback לשיטה הישנה
        const textArea = document.createElement('textarea');
        textArea.value = createdUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('שגיאה בהעתקה:', err);
          alert('לא ניתן להעתיק אוטומטית. הקישור: ' + createdUrl);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('שגיאה בהעתקה:', err);
      // Fallback נוסף - הצג את הקישור למשתמש
      const textArea = document.createElement('textarea');
      textArea.value = createdUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('שגיאה גם ב-fallback:', fallbackErr);
        alert('לא ניתן להעתיק אוטומטית. הקישור: ' + createdUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadGuide = async () => {
    try {
      const response = await fetch('/GUIDE.md');
      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'מדריך-כתיבת-כלים.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('שגיאה בהורדת המדריך:', err);
      alert('שגיאה בהורדת המדריך. נסה שוב.');
    }
  };

  const handleSelectAll = () => {
    const textarea = document.getElementById('code') as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      textarea.focus();
    }
  };

  const handleCopyAll = async () => {
    if (!code.trim()) return;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        alert('הקוד הועתק!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('הקוד הועתק!');
        } catch (err) {
          console.error('שגיאה בהעתקה:', err);
          alert('לא ניתן להעתיק אוטומטית');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('שגיאה בהעתקת הקוד:', err);
      alert('שגיאה בהעתקת הקוד');
    }
  };

  const handleClearCode = () => {
    if (confirm('האם אתה בטוח שברצונך לנקות את שדה הקוד?')) {
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              יצירת כלי חדש
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadGuide}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 text-sm sm:text-base"
                title="הורד את המדריך בפורמט MD"
              >
                <Download size={18} />
                <span className="hidden sm:inline">הורד מדריך</span>
                <span className="sm:hidden">מדריך</span>
              </button>
              <a
                href="https://github.com/ilaiyomsh/app_launcher/blob/main/GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 text-sm sm:text-base"
                title="פתח את המדריך לכתיבת כלים"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">פתח מדריך</span>
                <span className="sm:hidden">מדריך</span>
              </a>
              <Link
                to="/browse"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Grid3x3 size={18} />
                <span className="hidden sm:inline">גלריית הכלים</span>
                <span className="sm:hidden">גלריה</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector('form');
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                    handleSubmit(submitEvent as any);
                  }
                }}
                disabled={loading || !name.trim() || !code.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                title="שמור כלי"
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
            </div>
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={createdUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>הועתק!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>העתק</span>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                תיאור הכלי (אופציונלי)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תיאור קצר של מה הכלי עושה..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category & Tags - Same Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה (אופציונלי)
                </label>
                <CategorySelect
                  value={category}
                  onChange={setCategory}
                  allowCreate={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תגיות (אופציונלי)
                </label>
                <TagSelect
                  values={tags}
                  onChange={setTags}
                  allowCreate={true}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  קוד React *
                </label>
                {/* Code Actions Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-1"
                    title="סמן הכל"
                  >
                    <Type size={14} />
                    סמן הכל
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors flex items-center gap-1"
                    title="העתק קוד"
                  >
                    <Copy size={14} />
                    העתק
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors flex items-center gap-1"
                    title="נקה קוד"
                  >
                    <Trash size={14} />
                    נקה
                  </button>
                </div>
              </div>

              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="הדבק כאן את קוד React מ-Gemini Canvas..."
                rows={15}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs sm:text-sm"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 טיפ: ודא שהקוד כולל <code className="bg-gray-100 px-1 rounded">export default App;</code> בסוף
              </p>
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

