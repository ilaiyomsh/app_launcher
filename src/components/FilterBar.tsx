import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { TagSelect } from './TagSelect';
import { FilterOptions, Category, Tag } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Category[];
  tags: Tag[];
  authors: string[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  categories,
  tags: _tags,
  authors,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<'categories' | 'authors' | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const authorsRef = useRef<HTMLDivElement>(null);

  // סגירה בלחיצה מחוץ לדרופדאון
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(target) &&
        authorsRef.current &&
        !authorsRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleCategoriesChange = (selectedCategories: string[]) => {
    onFiltersChange({
      ...filters,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  };

  const handleTagsChange = (selectedTags: string[]) => {
    onFiltersChange({
      ...filters,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleAuthorsChange = (selectedAuthors: string[]) => {
    onFiltersChange({
      ...filters,
      authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any });
  };

  const handleSortDirectionChange = (direction: string) => {
    onFiltersChange({ ...filters, sortDirection: direction as any });
  };

  const handleReset = () => {
    onFiltersChange({
      search: undefined,
      categories: undefined,
      tags: undefined,
      authors: undefined,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.categories?.length ||
    filters.tags?.length ||
    filters.authors?.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="space-y-4">
        {/* שדה חיפוש */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            חיפוש
          </label>
          <div className="relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="חיפוש לפי שם, תיאור, יוצר..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* סרגל סינונים */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* קטגוריות - דרופדאון */}
          <div ref={categoriesRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קטגוריות
            </label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${openDropdown === 'categories' ? 'rotate-180' : ''}`}
              />
              <span className="text-sm">
                {!filters.categories || filters.categories.length === 0
                  ? 'כל הקטגוריות'
                  : `${filters.categories.length} נבחרות`}
              </span>
            </button>

            {/* Dropdown Menu */}
            {openDropdown === 'categories' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="space-y-2 max-h-48 overflow-y-auto p-3">
                  <button
                    onClick={() => {
                      handleCategoriesChange([]);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-right px-2 py-1 rounded text-sm transition-colors ${
                      !filters.categories || filters.categories.length === 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    כל הקטגוריות
                  </button>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.categories || []).includes(category.id)}
                        onChange={(e) => {
                          const selected = filters.categories || [];
                          if (e.target.checked) {
                            handleCategoriesChange([...selected, category.id]);
                          } else {
                            handleCategoriesChange(selected.filter((c) => c !== category.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-right flex-1">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* תגיות */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תגיות
            </label>
            <TagSelect
              values={filters.tags || []}
              onChange={handleTagsChange}
              allowCreate={false}
            />
          </div>

          {/* יוצרים - דרופדאון */}
          <div ref={authorsRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יוצרים
            </label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'authors' ? null : 'authors')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${openDropdown === 'authors' ? 'rotate-180' : ''}`}
              />
              <span className="text-sm">
                {!filters.authors || filters.authors.length === 0
                  ? 'כל היוצרים'
                  : `${filters.authors.length} נבחרים`}
              </span>
            </button>

            {/* Dropdown Menu */}
            {openDropdown === 'authors' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="space-y-2 max-h-48 overflow-y-auto p-3">
                  <button
                    onClick={() => {
                      handleAuthorsChange([]);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-right px-2 py-1 rounded text-sm transition-colors ${
                      !filters.authors || filters.authors.length === 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    כל היוצרים
                  </button>
                  {authors.map((author) => (
                    <label
                      key={author}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.authors || []).includes(author)}
                        onChange={(e) => {
                          const selected = filters.authors || [];
                          if (e.target.checked) {
                            handleAuthorsChange([...selected, author]);
                          } else {
                            handleAuthorsChange(selected.filter((a) => a !== author));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-right flex-1">{author}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* מיון */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מיון
            </label>
            <div className="flex gap-2">
              <select
                value={filters.sortDirection || 'desc'}
                onChange={(e) => handleSortDirectionChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">יורד</option>
                <option value="asc">עולה</option>
              </select>
              <select
                value={filters.sortBy || 'updatedAt'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="updatedAt">עדכון אחרון</option>
                <option value="createdAt">יצירה</option>
                <option value="name">שם</option>
                <option value="author">יוצר</option>
              </select>
            </div>
          </div>
        </div>

        {/* כפתור ניקוי */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RotateCcw size={16} />
              ניקוי סינונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

