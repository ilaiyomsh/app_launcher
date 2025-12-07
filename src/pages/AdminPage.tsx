import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllSnippets, updateSnippet, deleteSnippet, searchSnippets } from '../services/snippetService';
import { validateReactCode } from '../utils/codeValidator';
import { Snippet } from '../types';
import { Search, Trash2, Save, LogOut, Loader2, ExternalLink, Grid3x3 } from 'lucide-react';

function AdminPage() {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // בדיקת אימות
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    loadSnippets();
  }, [navigate]);

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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      loadSnippets();
      return;
    }

    try {
      const results = await searchSnippets(term);
      setSnippets(results);
    } catch (err) {
      // אם החיפוש נכשל, נטען את כל הכלים
      loadSnippets();
    }
  };

  const handleSelectSnippet = (snippet: Snippet) => {
    console.log('📝 בוחר snippet:', snippet.name);
    console.log('📏 אורך הקוד:', snippet.code?.length || 0);
    setSelectedSnippet(snippet);
    setEditedName(snippet.name || '');
    setEditedDescription(snippet.description || '');
    setEditedAuthor(snippet.author || '');
    setEditedCode(snippet.code || '');
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedSnippet) return;

    // ולידציה בסיסית
    if (!editedName.trim()) {
      setError('שם הכלי הוא שדה חובה');
      return;
    }

    setSaving(true);
    setError(null);
    
    // ולידציה של הקוד
    const validation = await validateReactCode(editedCode);
    if (!validation.valid) {
      setError(validation.error || 'הקוד לא תקין ולא ניתן לשמור');
      setSaving(false);
      return;
    }

    try {
      console.log('💾 שומר שינויים:', {
        id: selectedSnippet.id,
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
        author: editedAuthor.trim() || undefined,
        codeLength: editedCode.length,
      });

      await updateSnippet(selectedSnippet.id, {
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
        author: editedAuthor.trim() || undefined,
        code: editedCode,
      });

      console.log('✅ שמירה הושלמה בהצלחה');

      // עדכון הרשימה
      await loadSnippets();
      // עדכון הכלי הנבחר
      const updated = await getAllSnippets();
      const updatedSnippet = updated.find(s => s.id === selectedSnippet.id);
      if (updatedSnippet) {
        setSelectedSnippet(updatedSnippet);
        // עדכון השדות הנערכים עם הערכים החדשים
        setEditedName(updatedSnippet.name || '');
        setEditedDescription(updatedSnippet.description || '');
        setEditedAuthor(updatedSnippet.author || '');
        setEditedCode(updatedSnippet.code || '');
      }
      alert('השינויים נשמרו בהצלחה!');
    } catch (err) {
      console.error('❌ שגיאה בשמירת השינויים:', err);
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      setError(`שגיאה בשמירת השינויים: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הכלי הזה?')) {
      return;
    }

    try {
      await deleteSnippet(id);
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(null);
        setEditedName('');
        setEditedDescription('');
        setEditedAuthor('');
        setEditedCode('');
      }
      await loadSnippets();
    } catch (err) {
      setError('שגיאה במחיקת הכלי');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  const getViewUrl = (id: string) => {
    return `${window.location.origin}/view/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ניהול כלים</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Grid3x3 size={18} />
              צפה בכל הכלים
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              התנתק
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - רשימת כלים */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* חיפוש */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="חפש כלי..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* רשימת כלים */}
          <div className="flex-1 overflow-y-auto">
            {snippets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                לא נמצאו כלים
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {snippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSnippet?.id === snippet.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                    }`}
                    onClick={() => handleSelectSnippet(snippet)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {snippet.name}
                        </h3>
                        {snippet.description && (
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {snippet.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          עודכן: {snippet.updatedAt.toLocaleDateString('he-IL')}
                        </p>
                        {snippet.author && (
                          <p className="text-xs text-gray-400 mt-1">
                            יוצר: {snippet.author}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(snippet.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="מחק"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - עורך קוד */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedSnippet ? (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedSnippet.name}
                  </h2>
                  <a
                    href={getViewUrl(selectedSnippet.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={14} />
                    פתח בתצוגה
                  </a>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || (
                    editedName === selectedSnippet.name &&
                    editedDescription === (selectedSnippet.description || '') &&
                    editedAuthor === (selectedSnippet.author || '') &&
                    editedCode === selectedSnippet.code
                  )}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      שמור שינויים
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Editor */}
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
                {/* Name Editor */}
                <div>
                  <label htmlFor="editedName" className="block text-sm font-medium text-gray-700 mb-2">
                    שם הכלי *
                  </label>
                  <input
                    id="editedName"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="שם הכלי"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description Editor */}
                <div>
                  <label htmlFor="editedDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    תיאור הכלי
                  </label>
                  <textarea
                    id="editedDescription"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="תיאור קצר של הכלי"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm resize-y"
                  />
                </div>

                {/* Author Editor */}
                <div>
                  <label htmlFor="editedAuthor" className="block text-sm font-medium text-gray-700 mb-2">
                    שם יוצר
                  </label>
                  <input
                    id="editedAuthor"
                    type="text"
                    value={editedAuthor}
                    onChange={(e) => setEditedAuthor(e.target.value)}
                    placeholder="שם היוצר"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <label htmlFor="editedCode" className="block text-sm font-medium text-gray-700 mb-2">
                    קוד React
                  </label>
                  <textarea
                    id="editedCode"
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full flex-1 min-h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      direction: 'ltr',
                      textAlign: 'left',
                      whiteSpace: 'pre',
                      overflowWrap: 'normal',
                      tabSize: 2,
                    }}
                    spellCheck={false}
                    placeholder="הדבק את קוד React כאן..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              בחר כלי מהרשימה כדי לערוך
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

