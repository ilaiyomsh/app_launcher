import { useState, useEffect } from 'react';
import { X, Trash2, Loader2, Copy, Trash, Type } from 'lucide-react';
import { Snippet, Category, Tag } from '../types';
import { updateSnippet, deleteSnippet } from '../services/snippetService';
import { CategorySelect } from './CategorySelect';
import { TagSelect } from './TagSelect';

interface EditToolDialogProps {
  snippet: Snippet | null;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  isAdmin?: boolean;
}

export function EditToolDialog({
  snippet,
  categories,
  tags,
  onClose,
  onSave,
  onDelete,
  isAdmin = false,
}: EditToolDialogProps) {
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedCategory, setEditedCategory] = useState<string | undefined>();
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // אתחול ערכים כשהדיאלוג נפתח
  useEffect(() => {
    if (snippet) {
      setEditedName(snippet.name);
      setEditedDescription(snippet.description || '');
      setEditedCode(snippet.code);
      setEditedAuthor(snippet.author || '');
      setEditedCategory(snippet.category);
      setEditedTags(snippet.tags || []);
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [snippet]);

  // סגירה בלחיצה על ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && snippet) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snippet, onClose]);

  if (!snippet) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSnippet(snippet.id, {
        name: editedName,
        description: editedDescription,
        code: editedCode,
        author: editedAuthor,
        category: editedCategory,
        tags: editedTags,
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(`שגיאה בשמירה: ${err.message || 'נסה שוב'}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteSnippet(snippet.id);
      onDelete();
      onClose();
    } catch (err: any) {
      setError(`שגיאה במחיקה: ${err.message || 'נסה שוב'}`);
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const hasChanges =
    editedName !== snippet.name ||
    editedDescription !== snippet.description ||
    editedCode !== snippet.code ||
    editedAuthor !== snippet.author ||
    editedCategory !== snippet.category ||
    JSON.stringify(editedTags.sort()) !== JSON.stringify((snippet.tags || []).sort());

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(editedCode);
        // הצגת התראה קצרה (אפשר להוסיף toast אם יש)
        alert('הקוד הועתק!');
      }
    } catch (err) {
      console.error('שגיאה בהעתקה:', err);
      alert('לא ניתן להעתיק את הקוד');
    }
  };

  const handleClearCode = () => {
    if (confirm('בטוח שאתה רוצה לנקות את כל הקוד?')) {
      setEditedCode('');
    }
  };

  const handleSelectAllCode = () => {
    const textarea = document.getElementById('dialogCode') as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      textarea.focus();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">ערוך כלי</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="סגור"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="dialogName" className="block text-sm font-medium text-gray-700 mb-2">
                שם הכלי
              </label>
              <input
                id="dialogName"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="שם הכלי"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="dialogDescription" className="block text-sm font-medium text-gray-700 mb-2">
                תיאור
              </label>
              <textarea
                id="dialogDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="תיאור קצר של הכלי"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm resize-y"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה
                </label>
                <CategorySelect
                  value={editedCategory}
                  onChange={setEditedCategory}
                  allowCreate={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תגיות
                </label>
                <TagSelect
                  values={editedTags}
                  onChange={setEditedTags}
                  allowCreate={true}
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="dialogAuthor" className="block text-sm font-medium text-gray-700 mb-2">
                שם יוצר
              </label>
              <input
                id="dialogAuthor"
                type="text"
                value={editedAuthor}
                onChange={(e) => setEditedAuthor(e.target.value)}
                placeholder="שם היוצר"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                disabled={!isAdmin}
              />
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">רק Admin יכול לשנות את שם היוצר</p>
              )}
            </div>

            {/* Code */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="dialogCode" className="block text-sm font-medium text-gray-700">
                  קוד React
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllCode}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-1"
                    title="סמן הכל"
                  >
                    <Type size={14} />
                    סמן הכל
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors flex items-center gap-1"
                    title="העתק קוד"
                  >
                    <Copy size={14} />
                    העתק
                  </button>
                  <button
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
                id="dialogCode"
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                placeholder="הדבק קוד React כאן"
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  lineHeight: '1.5',
                  direction: 'ltr',
                }}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Delete Button */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 text-sm">
                <p className="text-gray-700">בטוח שאתה רוצה למחוק?</p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-1 transition-colors"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      מוחק...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      כן, מחק
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  ביטול
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={18} />
                מחק כלי
              </button>
            )}

            {/* Save & Cancel */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    שומר...
                  </>
                ) : (
                  'שמור שינויים'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

