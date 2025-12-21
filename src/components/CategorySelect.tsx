import { useEffect, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { getAllCategories, createCategory } from '../services/categoryService';
import { Category } from '../types';

interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string | undefined) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#6366F1', // indigo
];

export function CategorySelect({
  value,
  onChange,
  placeholder = 'בחר קטגוריה',
  allowCreate = true,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('שגיאה בטעינת קטגוריות:', err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newId = await createCategory(newCategoryName, selectedColor);
      const newCategory: Category = {
        id: newId,
        name: newCategoryName,
        color: selectedColor,
        createdBy: 'current-user',
        createdAt: new Date(),
      };
      setCategories([newCategory, ...categories]);
      onChange(newId);
      setNewCategoryName('');
      setSelectedColor(DEFAULT_COLORS[0]);
      setIsCreating(false);
      setIsOpen(false);
    } catch (err) {
      console.error('שגיאה ביצירת קטגוריה:', err);
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        {selectedCategory ? (
          <span className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
            {selectedCategory.name}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown size={18} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {/* רשימת קטגוריות */}
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => onChange(undefined)}
              className="w-full text-right px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
            >
              <span className="text-gray-500">ללא קטגוריה</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onChange(category.id);
                  setIsOpen(false);
                }}
                className="w-full text-right px-4 py-2 hover:bg-gray-100 transition-colors flex items-center justify-end gap-2"
              >
                {category.name}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
              </button>
            ))}
          </div>

          {/* כפתור יצירה */}
          {allowCreate && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full text-right px-4 py-2 border-t border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2 text-blue-600"
            >
              <Plus size={18} />
              קטגוריה חדשה
            </button>
          )}

          {/* טופס יצירה */}
          {isCreating && (
            <div className="p-4 border-t border-gray-200 space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="שם הקטגוריה"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                autoFocus
              />
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  צור
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCategoryName('');
                    setSelectedColor(DEFAULT_COLORS[0]);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

