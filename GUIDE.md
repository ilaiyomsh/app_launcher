# מדריך כתיבת כלים - Twist's Apps

## 📋 כללי יסוד

כל כלי שאתה יוצר חייב להיות **קומפוננטת React אחת** שמופיעה כ-`export default`.

## ✅ דרישות חובה

### 1. **קומפוננטה ראשית**
הקוד חייב לכלול קומפוננטת React אחת עם `export default`:

```javascript
function App() {
  return (
    <div>
      <h1>שלום עולם</h1>
    </div>
  );
}

export default App;
```

### 2. **Import של React**
תמיד התחל עם import של React:

```javascript
import React from 'react';
// או
import React, { useState, useEffect } from 'react';
```

### 3. **חבילות נתמכות**
אתה יכול להשתמש בחבילות הבאות:
- `react` - גרסה 19.2.0
- `react-dom` - גרסה 19.2.0
- `lucide-react` - גרסה 0.294.0 (אייקונים)

**⚠️ חשוב:** חבילות אחרות לא יעבדו! אם אתה צריך משהו אחר, תצטרך להוסיף אותו לקוד שלך ישירות.

### 4. **Tailwind CSS**
אתה יכול להשתמש ב-Tailwind CSS! כל ה-classes של Tailwind יעבדו:

```javascript
function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        כותרת יפה
      </h1>
    </div>
  );
}

export default App;
```

## 📝 דוגמאות

### דוגמה 1: כלי פשוט עם state

```javascript
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">מונה</h1>
      <p className="text-2xl mb-4">{count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        הוסף 1
      </button>
    </div>
  );
}

export default App;
```

### דוגמה 2: כלי עם אייקונים

```javascript
import React, { useState } from 'react';
import { Heart, Star, ThumbsUp } from 'lucide-react';

function App() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="p-8 text-center">
      <button
        onClick={() => setLiked(!liked)}
        className={`p-4 rounded-full ${
          liked ? 'bg-red-500' : 'bg-gray-200'
        }`}
      >
        <Heart 
          size={32} 
          className={liked ? 'text-white fill-white' : 'text-gray-600'} 
        />
      </button>
    </div>
  );
}

export default App;
```

### דוגמה 3: כלי עם useEffect

```javascript
import React, { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold">
        {time.toLocaleTimeString('he-IL')}
      </h1>
    </div>
  );
}

export default App;
```

### דוגמה 4: כלי רספונסיבי לנייד

```javascript
import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header רספונסיבי */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              כלי רספונסיבי
            </h1>
            
            {/* תפריט נייד */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* תוכן ראשי */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* שדה חיפוש רספונסיבי */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid רספונסיבי */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                פריט {item}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                תיאור הפריט
              </p>
            </div>
          ))}
        </div>

        {/* כפתורים רספונסיביים */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
            כפתור ראשי
          </button>
          <button className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base">
            כפתור משני
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
```

## ⚠️ שגיאות נפוצות - מה להימנע

### ❌ שגיאה 1: שכחת export default
```javascript
// ❌ לא יעבוד!
function App() {
  return <div>שלום</div>;
}
// חסר: export default App;
```

### ❌ שגיאה 2: שימוש בחבילות לא נתמכות
```javascript
// ❌ לא יעבוד!
import axios from 'axios'; // חבילה לא נתמכת
import moment from 'moment'; // חבילה לא נתמכת
```

### ❌ שגיאה 3: קוד לא תקין
```javascript
// ❌ לא יעבוד!
function App() {
  return <div>שלום</div> // חסר נקודה-פסיק
}
```

### ❌ שגיאה 4: שימוש ב-JSX ללא React
```javascript
// ❌ לא יעבוד!
const App = () => {
  return <div>שלום</div>;
};
// חסר: import React from 'react';
```

## ✅ טיפים להצלחה

### 1. **תמיד בדוק את הקוד לפני שמירה**
- ודא שיש `export default App;`
- ודא שהקוד מתקמפל ללא שגיאות
- נסה את הקוד ב-CodeSandbox או ב-Sandpack לפני שמירה

### 2. **השתמש ב-Tailwind CSS**
Tailwind CSS כבר מוגדר וזמין! אתה יכול להשתמש בכל ה-classes שלו.

### 3. **כיוון RTL**
אם אתה רוצה כיוון עברי, הוסף `dir="rtl"`:

```javascript
function App() {
  return (
    <div dir="rtl" className="p-8">
      <h1>כותרת בעברית</h1>
    </div>
  );
}
```

### 4. **עיצוב רספונסיבי לנייד**
הכלים שלך יוצגו במגוון גדלים של מסכים - מניידים קטנים ועד מסכי מחשב גדולים. חשוב מאוד שהכלי יהיה רספונסיבי!

#### Breakpoints של Tailwind:
- `sm:` - 640px ומעלה (טאבלטים קטנים)
- `md:` - 768px ומעלה (טאבלטים)
- `lg:` - 1024px ומעלה (מחשבים ניידים)
- `xl:` - 1280px ומעלה (מחשבים שולחניים)
- `2xl:` - 1536px ומעלה (מסכים גדולים)

#### דוגמאות לרספונסיביות:

**טקסט רספונסיבי:**
```javascript
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  כותרת רספונסיבית
</h1>
```

**Padding רספונסיבי:**
```javascript
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  תוכן עם padding משתנה
</div>
```

**Grid רספונסיבי:**
```javascript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* פריטים */}
</div>
```

**כפתורים רספונסיביים:**
```javascript
<button className="w-full sm:w-auto px-4 py-2 sm:py-3 text-sm sm:text-base">
  כפתור רספונסיבי
</button>
```

**הסתרה/הצגה לפי גודל מסך:**
```javascript
{/* מופיע רק במסכים גדולים */}
<div className="hidden md:block">תוכן למחשב</div>

{/* מופיע רק בנייד */}
<div className="block md:hidden">תוכן לנייד</div>
```

### 5. **טיפול בשגיאות**
תמיד הוסף טיפול בשגיאות:

```javascript
function App() {
  const [error, setError] = useState(null);

  const handleClick = () => {
    try {
      // קוד שלך
    } catch (err) {
      setError('אירעה שגיאה');
    }
  };

  return (
    <div>
      {error && <p className="text-red-600">{error}</p>}
      {/* שאר הקוד */}
    </div>
  );
}
```

### 6. **טיפים ספציפיים לנייד**

#### ✅ מה לעשות:
- **השתמש ב-`w-full` לכפתורים בנייד** - כפתורים צריכים להיות ברוחב מלא בנייד
- **הוסף `touch-friendly` sizing** - כפתורים צריכים להיות לפחות 44x44px בנייד
- **השתמש ב-`flex-col` בנייד ו-`flex-row` במחשב** - `flex-col sm:flex-row`
- **הגבל רוחב מקסימלי** - `max-w-7xl mx-auto` מונע מהתוכן להיות רחב מדי
- **השתמש ב-`px-4 sm:px-6 lg:px-8`** - padding משתנה לפי גודל המסך
- **טקסט צריך להיות קריא** - `text-sm sm:text-base lg:text-lg`

#### ❌ מה להימנע:
- אל תשתמש ב-`fixed width` - `w-96` במקום `w-full sm:w-96`
- אל תשים יותר מדי תוכן בשורה בנייד - השתמש ב-`grid-cols-1 sm:grid-cols-2`
- אל תשתמש ב-`hover:` בלבד - הוסף גם `active:` לנייד
- אל תשתמש ב-`px-8` בלבד - זה גדול מדי בנייד, השתמש ב-`px-4 sm:px-8`

## 🔧 פתרון בעיות

### הבעיה: הכלי לא נטען
**פתרון:**
1. ודא שיש `export default App;`
2. ודא שהקוד מתחיל ב-`function App()` ולא `unction App()`
3. בדוק שאין שגיאות תחביר

### הבעיה: Tailwind לא עובד
**פתרון:**
- Tailwind עובד אוטומטית! פשוט השתמש ב-classes שלו
- ודא שאתה משתמש ב-classes הנכונים (לדוגמה: `bg-blue-500` ולא `background-blue`)

### הבעיה: אייקונים לא מופיעים
**פתרון:**
- ודא ש-import נכון: `import { IconName } from 'lucide-react';`
- בדוק את שם האייקון - הוא חייב להיות בדיוק כמו ב-[lucide.dev](https://lucide.dev)

## 📚 משאבים

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [React Documentation](https://react.dev)

## 🎯 תבנית בסיסית מומלצת

השתמש בתבנית הזו כנקודת התחלה (כולל רספונסיביות לנייד):

```javascript
import React, { useState } from 'react';
import { IconName } from 'lucide-react'; // אופציונלי

function App() {
  // State כאן
  const [value, setValue] = useState('');

  // Handlers כאן
  const handleClick = () => {
    // לוגיקה כאן
  };

  // Render
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
          כותרת
        </h1>
        
        {/* התוכן שלך כאן - זכור להשתמש ב-classes רספונסיביים */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* פריטים */}
        </div>
        
        <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
          כפתור
        </button>
      </div>
    </div>
  );
}

export default App;
```

## ✅ רשימת בדיקה לפני שמירה

- [ ] יש `import React from 'react';`
- [ ] יש `function App() { ... }`
- [ ] יש `export default App;`
- [ ] הקוד מתקמפל ללא שגיאות
- [ ] לא משתמשים בחבילות לא נתמכות
- [ ] הקוד נבדק ב-Sandpack/CodeSandbox
- [ ] הכלי רספונסיבי לנייד (נבדק במסכים שונים)
- [ ] כפתורים נוחים ללחיצה בנייד (מינימום 44x44px)

---

**זכור:** הקוד שלך רץ בתוך Sandpack, אז ודא שהוא תקין ופשוט!

