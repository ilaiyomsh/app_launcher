# מדריך כתיבת כלים - Monday App Launcher

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
- `react` - גרסה 18.2.0
- `react-dom` - גרסה 18.2.0
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

### 4. **עיצוב רספונסיבי**
השתמש ב-Tailwind responsive classes:

```javascript
<div className="text-sm md:text-lg lg:text-xl">
  טקסט רספונסיבי
</div>
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

השתמש בתבנית הזו כנקודת התחלה:

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
    <div dir="rtl" className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">כותרת</h1>
        {/* הקוד שלך כאן */}
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

---

**זכור:** הקוד שלך רץ בתוך Sandpack, אז ודא שהוא תקין ופשוט!

