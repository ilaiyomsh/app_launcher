import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// האם בסדר שהמפתחות כאן גלויים?
/*
  ברוב פרויקטי Frontend (כולל React, Vite, Next.js, Vue וכו'), מפתחות ה-Firebase (apiKey, וכו') 
  ממילא חשופים בדפדפן ואין מנגנון להחביאם (כי הקוד רץ אצל הלקוח). 
  זה בסדר עיצובי, כי המפתחות האלו *לא* מעניקים גישה מלאה - כל האבטחה מבוססת על הגדרות Rules במסד הנתונים (Firestore Rules).
  יש להקפיד ש-Firestore/Storage מוגנים ל-CRUD לפי הצורך (ולא פתוחים לעולם).
  בדוק: https://firebase.google.com/docs/projects/api-keys

  יחד עם זאת:
  - אל תשים כאן מפתחות/סודות שנותנים גישה ניהולית (admin SDK, service account).
  - בפרויקט זה, המשתנים נטענים מ-.env - ערכי ברירת המחדל בקוד הם דמו בלבד.
*/

// Firebase configuration, טעינה מה-ENV בלבד (אין ערכים ברירת מחדל חשופים)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  throw new Error(
    "⚠️ נא להגדיר את משתני Firebase בקובץ .env (ראה README.md)"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

