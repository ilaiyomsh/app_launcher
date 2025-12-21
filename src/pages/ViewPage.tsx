import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sandpack } from '@codesandbox/sandpack-react';
import { getSnippet } from '../services/snippetService';
import { Loader2, AlertCircle } from 'lucide-react';

// פונקציה עזר לזיהוי שם קומפוננטה
function extractComponentName(code: string): string | null {
  const patterns = [
    /function\s+(\w+)\s*[\(<]/,
    /const\s+(\w+)\s*=\s*(\(|function|React\.memo|React\.forwardRef)/,
    /export\s+default\s+function\s+(\w+)/,
  ];
  
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null; // אם לא מצאנו, נשתמש ב-'App' כברירת מחדל
}

function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState<string | null>(null);
  const [snippetName, setSnippetName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) {
        setError('ID לא תקין');
        setLoading(false);
        return;
      }

      try {
        const snippet = await getSnippet(id);
        if (!snippet) {
          setError('כלי לא נמצא');
        } else {
          // שמירת שם הכלי לעדכון כותרת החלון
          setSnippetName(snippet.name);
          
          let processedCode = snippet.code.trim();
          
          // תיקון: אם הקוד מתחיל ב-unction במקום function, נוסיף f
          if (processedCode.startsWith('unction ')) {
            processedCode = 'f' + processedCode;
          }
          
          // אם הקוד לא כולל export default, נוסיף אותו
          if (!processedCode.includes('export default')) {
            const componentName = extractComponentName(processedCode) || 'App';
            processedCode = processedCode + `\n\nexport default ${componentName};`;
          }
          
          setCode(processedCode);
        }
      } catch (err) {
        setError('שגיאה בטעינת הכלי');
        console.error('שגיאה בטעינת snippet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  // עדכון כותרת החלון עם שם הכלי
  useEffect(() => {
    if (snippetName) {
      document.title = snippetName;
    } else {
      document.title = "Twist's Apps";
    }

    // ניקוי בעת יציאה מהדף
    return () => {
      document.title = "Twist's Apps";
    };
  }, [snippetName]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען כלי...</p>
        </div>
      </div>
    );
  }

  if (error || !code) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'כלי לא נמצא'}
          </h2>
          <p className="text-gray-600">
            הכלי שביקשת לא קיים או שאירעה שגיאה בטעינתו.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden" style={{ margin: 0, padding: 0, position: 'relative' }}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .sp-wrapper {
          height: 100vh !important;
          width: 100vw !important;
          position: relative;
        }
        .sp-layout {
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .sp-stack {
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .sp-editor {
          display: none !important;
        }
        .sp-preview-container {
          height: 100vh !important;
          width: 100vw !important;
          flex: 1 !important;
          position: relative !important;
        }
        .sp-preview-iframe {
          height: 100vh !important;
          width: 100vw !important;
          border: none !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        .sp-preview-actions {
          display: none !important;
        }
        .sp-error-overlay {
          display: none !important;
        }
      `}</style>
      <Sandpack
        template="react"
        theme="light"
        customSetup={{
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'lucide-react': '^0.294.0',
          },
        }}
        files={{
          '/App.js': code,
          '/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// הוספת Tailwind CSS דרך CDN
const loadTailwind = () => {
  return new Promise((resolve) => {
    if (window.tailwind) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com';
    script.onload = () => resolve();
    script.onerror = () => resolve(); // ממשיך גם אם נכשל
    document.head.appendChild(script);
  });
};

// טעינת Tailwind ואז React
loadTailwind().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
});`,
        }}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: false,
          showInlineErrors: true,
          editorHeight: 0,
          editorWidthPercentage: 0,
          wrapContent: true,
          closableTabs: false,
          showRefreshButton: false,
          layout: 'preview',
        }}
      />
    </div>
  );
}

export default ViewPage;

