import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSnippets, filterSnippets } from '../services/snippetService';
import { getAllCategories } from '../services/categoryService';
import { getAllTags } from '../services/tagService';
import { useAuth } from '../contexts/AuthContext';
import { Snippet, Category, Tag, FilterOptions } from '../types';
import { ExternalLink, Loader2, Settings, Copy, Check, Plus, Edit } from 'lucide-react';
import { FilterBar } from '../components/FilterBar';
import { EditToolDialog } from '../components/EditToolDialog';

function BrowsePage() {
  const { user, isAdmin } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  });

  const canEditSnippet = (snippet: Snippet) => {
    if (!user) return false;
    return isAdmin || snippet.author === user.email;
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, snippets]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [snippetsData, categoriesData, tagsData] = await Promise.all([
        getAllSnippets(),
        getAllCategories(),
        getAllTags(),
      ]);
      setSnippets(snippetsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      setError('שגיאה בטעינת הכלים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await filterSnippets({ ...filters });
      setFilteredSnippets(filtered);
    } catch (err) {
      console.error('שגיאה בסינון:', err);
      setFilteredSnippets(snippets);
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

  const authors = [...new Set(snippets.map((s) => s.author))].sort();

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-center sm:text-right flex-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">גלריית כלים</h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">כל הכלים הזמינים לשימוש</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">צור כלי חדש</span>
                    <span className="sm:hidden">צור</span>
                  </Link>
                  <Link
                    to="/admin"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">ניהול</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">צור כלי חדש</span>
                  <span className="sm:hidden">צור</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {snippets.length > 0 && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            tags={tags}
            authors={authors}
          />
        )}

        {/* Tools Grid */}
        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין כלים זמינים כרגע</p>
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">לא נמצאו כלים התואמים לסינון</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {snippet.name}
                </h3>

                {/* Description - Always takes space (2 lines) */}
                <div className="mb-4">
                  {snippet.description ? (
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem] sm:min-h-[2.625rem]">
                      {snippet.description}
                    </p>
                  ) : (
                    <div className="h-[2.5rem] sm:h-[2.625rem]"></div>
                  )}
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Right Column */}
                  <div className="col-span-1">
                    {/* קטגוריה - Right Top */}
                    {snippet.category && (
                      <div className="mb-2">
                        {(() => {
                          const cat = categories.find((c) => c.id === snippet.category);
                          return cat ? (
                            <div
                              className="inline-flex px-2 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* תגיות - Right Bottom */}
                    {snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs"
                            >
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Left Column */}
                  <div className="col-span-1 text-right">
                    {/* Author - Left Top */}
                    {snippet.author && (
                      <div className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                        {snippet.author}
                      </div>
                    )}

                    {/* Updated Date - Left Bottom */}
                    <div className="text-xs sm:text-sm text-gray-600">
                      {snippet.updatedAt.toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <a
                    href={getViewUrl(snippet.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>פתח כלי</span>
                  </a>
                  {canEditSnippet(snippet) && (
                    <button
                      onClick={() => setEditingSnippet(snippet)}
                      className="sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                      title="ערוך כלי"
                    >
                      <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">ערוך</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyLink(snippet.id)}
                    className="sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    title="העתק קישור"
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">הועתק!</span>
                        <span className="sm:hidden">הועתק</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">העתק</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Tool Dialog */}
        <EditToolDialog
          snippet={editingSnippet}
          categories={categories}
          tags={tags}
          onClose={() => setEditingSnippet(null)}
          onSave={loadData}
          onDelete={loadData}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

export default BrowsePage;

