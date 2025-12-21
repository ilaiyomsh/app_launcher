import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllSnippets, updateSnippet, deleteSnippet, searchSnippets } from '../services/snippetService';
import { getAllCategories } from '../services/categoryService';
import { getAllTags } from '../services/tagService';
import { validateReactCode } from '../utils/codeValidator';
import { useAuth } from '../contexts/AuthContext';
import { Snippet, Category, Tag } from '../types';
import { Search, Trash2, Save, LogOut, Loader2, ExternalLink, Grid3x3, Menu, X, Type, Copy, Trash, Plus } from 'lucide-react';
import { CategorySelect } from '../components/CategorySelect';
import { TagSelect } from '../components/TagSelect';

function AdminPage() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [editedCategory, setEditedCategory] = useState<string | undefined>();
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/admin/login');
      return;
    }

    loadSnippets();
  }, [user, authLoading, navigate]);

  // טיפול בפרמטר snippet מ-URL
  useEffect(() => {
    if (!user || snippets.length === 0) return;
    
    const params = new URLSearchParams(window.location.search);
    const snippetId = params.get('snippet');
    if (snippetId) {
      const snippet = snippets.find(s => s.id === snippetId);
      if (snippet) {
        setSelectedSnippet(snippet);
        setEditedName(snippet.name || '');
        setEditedDescription(snippet.description || '');
        setEditedAuthor(snippet.author || '');
        setEditedCode(snippet.code || '');
        setEditedCategory(snippet.category);
        setEditedTags(snippet.tags || []);
        setError(null);
        // נקה את ה-URL
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [snippets, user]);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const [snippetsData, categoriesData, tagsData] = await Promise.all([
        getAllSnippets(),
        getAllCategories(),
        getAllTags(),
      ]);
      setSnippets(snippetsData);
      setCategories(categoriesData);
      setAllTags(tagsData);
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
    setSelectedSnippet(snippet);
    setEditedName(snippet.name || '');
    setEditedDescription(snippet.description || '');
    setEditedAuthor(snippet.author || '');
    setEditedCode(snippet.code || '');
    setEditedCategory(snippet.category);
    setEditedTags(snippet.tags || []);
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
      // הכנת הנתונים לעדכון - רק שדות שצריכים לעדכן
      const updateData: Partial<{ name: string; description?: string; author?: string; code: string; category?: string; tags?: string[] }> = {
        name: editedName.trim(),
        code: editedCode,
      };

      // הוסף description רק אם יש ערך או אם צריך למחוק אותו (מחרוזת ריקה)
      if (editedDescription.trim() !== '' || selectedSnippet.description) {
        updateData.description = editedDescription.trim();
      }

      // הוסף category ו-tags
      updateData.category = editedCategory;
      updateData.tags = editedTags;

      // הוסף author רק אם יש ערך או אם צריך למחוק אותו (מחרוזת ריקה)
      if (editedAuthor.trim() !== '' || selectedSnippet.author) {
        updateData.author = editedAuthor.trim();
      }

      await updateSnippet(selectedSnippet.id, updateData);

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
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      setError(`שגיאה בשמירת השינויים: ${errorMessage}`);
      console.error('שגיאה בשמירת השינויים:', err);
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

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleSelectAll = () => {
    const textarea = document.getElementById('editedCode') as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      textarea.focus();
    }
  };

  const handleCopyAll = async () => {
    if (!editedCode.trim()) return;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(editedCode);
        alert('הקוד הועתק!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = editedCode;
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
      setEditedCode('');
    }
  };

  const canEditSnippet = (snippet: Snippet) => {
    if (!user) return false;
    return isAdmin || snippet.author === user.email;
  };

  const canDeleteSnippet = (snippet: Snippet) => {
    if (!user) return false;
    return isAdmin || snippet.author === user.email;
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
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">ניהול כלים</h1>
              {user && (
                <div className="flex items-center gap-2 mt-1">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                    {user.displayName || user.email}
                  </span>
                  {isAdmin && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex-shrink-0">
                      Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              to="/create"
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">צור כלי חדש</span>
              <span className="sm:hidden">צור</span>
            </Link>
            <Link
              to="/browse"
              className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Grid3x3 size={18} />
              <span className="hidden sm:inline">גלריית הכלים</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - רשימת כלים */}
        <div className={`fixed lg:static inset-y-0 right-0 lg:right-auto z-50 lg:z-auto w-80 bg-white border-l border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          {/* חיפוש */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="חפש כלי..."
                className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    onClick={() => {
                      handleSelectSnippet(snippet);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
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
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            יוצר: {snippet.author}
                          </p>
                        )}
                      </div>
                      {canDeleteSnippet(snippet) && (
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
                      )}
                      {!canEditSnippet(snippet) && (
                        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                          לא שלך
                        </span>
                      )}
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
              <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {selectedSnippet.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-1">
                    <a
                      href={getViewUrl(selectedSnippet.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      פתח בתצוגה
                    </a>
                    {!canEditSnippet(selectedSnippet) && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠️ כלי של משתמש אחר - עריכה מוגבלת
                      </span>
                    )}
                  </div>
                </div>
                {canEditSnippet(selectedSnippet) ? (
                  <button
                    onClick={handleSave}
                    disabled={saving || (
                      editedName === selectedSnippet.name &&
                      editedDescription === (selectedSnippet.description || '') &&
                      editedAuthor === (selectedSnippet.author || '') &&
                      editedCode === selectedSnippet.code
                    )}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
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
                ) : (
                  <span className="text-xs sm:text-sm text-gray-500">
                    אין הרשאה לערוך כלי זה
                  </span>
                )}
              </div>

              {error && (
                <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
                  {error}
                </div>
              )}

              {/* Editor */}
              <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-auto">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!canEditSnippet(selectedSnippet)}
                  />
                </div>

                {/* Category & Tags Editor - Same Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קטגוריה
                    </label>
                    <CategorySelect
                      value={editedCategory}
                      onChange={setEditedCategory}
                      allowCreate={canEditSnippet(selectedSnippet)}
                    />
                  </div>

                  {/* Tags Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תגיות
                    </label>
                    <TagSelect
                      values={editedTags}
                      onChange={setEditedTags}
                      allowCreate={canEditSnippet(selectedSnippet)}
                    />
                  </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!canEditSnippet(selectedSnippet)}
                  />
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="editedCode" className="block text-sm font-medium text-gray-700">
                      קוד React
                    </label>
                    {/* Code Actions Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="סמן הכל"
                        disabled={!canEditSnippet(selectedSnippet)}
                      >
                        <Type size={14} />
                        סמן הכל
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyAll}
                        className="px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="העתק קוד"
                        disabled={!editedCode.trim()}
                      >
                        <Copy size={14} />
                        העתק
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCode}
                        className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="נקה קוד"
                        disabled={!canEditSnippet(selectedSnippet)}
                      >
                        <Trash size={14} />
                        נקה
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="editedCode"
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full flex-1 min-h-[400px] sm:min-h-[600px] p-3 sm:p-4 border border-gray-300 rounded-lg font-mono text-xs sm:text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                      lineHeight: '1.5',
                      direction: 'ltr',
                      textAlign: 'left',
                      whiteSpace: 'pre',
                      overflowWrap: 'normal',
                      tabSize: 2,
                    }}
                    spellCheck={false}
                    placeholder="הדבק את קוד React כאן..."
                    disabled={!canEditSnippet(selectedSnippet)}
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

