import { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getAllTags, createTag } from '../services/tagService';
import { Tag } from '../types';

interface TagSelectProps {
  values: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export function TagSelect({
  values,
  onChange,
  placeholder = 'בחר תגיות',
  allowCreate = true,
}: TagSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTags();
  }, []);

  // סגירה בלחיצה מחוץ לקומפוננטה
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (err) {
      console.error('שגיאה בטעינת תגיות:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (!values.includes(tagId)) {
      onChange([...values, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(values.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!searchTerm.trim()) return;

    try {
      const newId = await createTag(searchTerm);
      const newTag: Tag = {
        id: newId,
        name: searchTerm,
        createdBy: 'current-user',
        createdAt: new Date(),
      };
      setTags([newTag, ...tags]);
      handleAddTag(newId);
      setSearchTerm('');
    } catch (err) {
      console.error('שגיאה ביצירת תגית:', err);
    }
  };

  const selectedTags = tags.filter((tag) => values.includes(tag.id));
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.includes(tag.id)
  );
  const shouldShowCreateOption =
    allowCreate &&
    searchTerm.trim() &&
    !tags.some((tag) => tag.name.toLowerCase() === searchTerm.toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      {/* תגיות שנבחרו */}
      <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg min-h-[40px] flex flex-wrap gap-2 items-center cursor-text"
           onClick={() => setIsOpen(true)}>
        {selectedTags.length === 0 && !isOpen && (
          <span className="text-gray-500">{placeholder}</span>
        )}
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {tag.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.id);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {isOpen && (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש או יצירה..."
            className="outline-none flex-1 min-w-[100px] bg-transparent text-right"
            autoFocus
          />
        )}
      </div>

      {/* דרופדאון */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="max-h-48 overflow-y-auto">
            {/* תגיות זמינות */}
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  handleAddTag(tag.id);
                  setSearchTerm('');
                }}
                className="w-full text-right px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
              >
                {tag.name}
              </button>
            ))}

            {/* אופציה ליצירת תגית חדשה */}
            {shouldShowCreateOption && (
              <button
                onClick={handleCreateTag}
                className="w-full text-right px-4 py-2 border-t border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2 text-blue-600"
              >
                <Plus size={18} />
                תגית חדשה: "{searchTerm}"
              </button>
            )}

            {/* הודעה כשאין תוצאות */}
            {filteredTags.length === 0 && !shouldShowCreateOption && searchTerm && (
              <div className="px-4 py-2 text-gray-500 text-center">
                לא נמצאו תגיות
              </div>
            )}

            {filteredTags.length === 0 && !searchTerm && (
              <div className="px-4 py-2 text-gray-500 text-center">
                התחל בהקלדה לחיפוש
              </div>
            )}
          </div>

          {/* כפתור סגירה */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 border-t border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
          >
            סיום
          </button>
        </div>
      )}
    </div>
  );
}

