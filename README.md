# Twist's Apps

פלטפורמת Launchpad להפיכת קוד React מ-Gemini Canvas ל-URL פעיל להטמעה ב-Monday.com.

## התקנה

1. התקן את התלויות:
```bash
npm install
```

2. צור קובץ `.env` בתיקיית השורש עם ההגדרות הבאות:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_SECRET=your-admin-secret
```

3. הרץ את השרת המקומי:
```bash
npm run dev
```

## הגדרת Firebase

1. צור פרויקט חדש ב-[Firebase Console](https://console.firebase.google.com/)
2. הוסף אפליקציית Web חדשה
3. העתק את פרטי ההגדרה לקובץ `.env`
4. ב-Firestore, צור Collection חדש בשם `snippets` (המערכת תיצור אותו אוטומטית)

## מבנה הפרויקט

- `/create` - יצירת כלים חדשים
- `/view/:id` - צפייה והרצת כלי (להטמעה ב-iframe)
- `/admin` - ממשק ניהול לעריכה ותיקון כלים
- `/admin/login` - מסך התחברות למנהל

## פיתוח

```bash
# הרצת שרת פיתוח
npm run dev

# בניית גרסת ייצור
npm run build

# תצוגה מקדימה של גרסת ייצור
npm run preview
```

## טכנולוגיות

- React 18+ עם Vite
- TypeScript
- Firebase Firestore
- Sandpack (להרצת קוד)
- Tailwind CSS
- Monaco Editor (לעריכת קוד ב-Admin)
- React Router

## הערות

- מודול ה-Viewer (`/view/:id`) מיועד להטמעה ב-iframe בתוך Monday.com
- האבטחה ב-Admin מבוססת על סיסמה קשיחה (מומלץ לשדרג למערכת אמיתית)
- הקוד נשמר כ-String ב-Firestore ומריץ אותו ב-Client Side באמצעות Sandpack

