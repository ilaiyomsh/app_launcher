// ולידציה בסיסית של קוד React
export const validateReactCode = async (code: string): Promise<{ valid: boolean; error?: string }> => {
  // בדיקות בסיסיות
  if (!code.trim()) {
    return { valid: false, error: 'הקוד לא יכול להיות ריק' };
  }

  // בדיקה שיש import React או שימוש ב-React
  const hasReactImport = code.includes('import') && (code.includes('react') || code.includes('React'));
  const hasReactUsage = code.includes('React.') || code.includes('useState') || code.includes('useEffect');
  
  if (!hasReactImport && !hasReactUsage && !code.includes('function') && !code.includes('const')) {
    return { valid: false, error: 'הקוד חייב לכלול קומפוננטת React (function או const)' };
  }

  // בדיקה שיש export default (או שנוכל להוסיף אותו)
  const hasExportDefault = code.includes('export default');
  const hasFunction = code.includes('function') || code.includes('const') || code.includes('=>');
  
  if (!hasExportDefault && !hasFunction) {
    return { valid: false, error: 'הקוד חייב לכלול קומפוננטת React (function או const)' };
  }

  // בדיקות סינטקס בסיסיות
  // בדיקה שיש סוגריים מאוזנים (פשוט)
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (Math.abs(openBraces - closeBraces) > 2) {
    // מאפשרים הבדל קטן בגלל JSX
    return { valid: false, error: 'הקוד מכיל שגיאת סינטקס - סוגריים לא מאוזנים' };
  }

  // אם כל הבדיקות עברו, הקוד נראה תקין
  return { valid: true };
};

