import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Snippet, SnippetData } from '../types';

const COLLECTION_NAME = 'snippets';

export const createSnippet = async (data: SnippetData): Promise<string> => {
  const now = Timestamp.now();
  
  // לוגים לבדיקה
  console.log('💾 שומר קוד ב-Firebase:');
  console.log('📏 אורך הקוד:', data.code.length);
  console.log('📄 100 תווים ראשונים:', data.code.substring(0, 100));
  console.log('📄 100 תווים אחרונים:', data.code.substring(Math.max(0, data.code.length - 100)));
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    name: data.name,
    description: data.description || '',
    code: data.code,
    author: data.author || '',
    createdAt: now,
    updatedAt: now,
  });
  
  console.log('✅ קוד נשמר בהצלחה, ID:', docRef.id);
  return docRef.id;
};

export const getSnippet = async (id: string): Promise<Snippet | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  
  // לוגים לבדיקה
  console.log('📥 טוען קוד מ-Firebase:');
  console.log('📏 אורך הקוד שנטען:', data.code?.length || 0);
  console.log('📄 100 תווים ראשונים:', data.code?.substring(0, 100) || 'אין קוד');
  console.log('📄 100 תווים אחרונים:', data.code?.substring(Math.max(0, (data.code?.length || 0) - 100)) || 'אין קוד');
  
  return {
    id: docSnap.id,
    name: data.name,
    description: data.description,
    code: data.code,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    author: data.author,
  };
};

export const getAllSnippets = async (): Promise<Snippet[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      code: data.code,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      author: data.author,
    };
  });
};

export const searchSnippets = async (searchTerm: string): Promise<Snippet[]> => {
  // טוען את כל הכלים (ללא הגבלה) ומסנן ב-client
  // הערה: Firestore לא תומך בחיפוש טקסט חופשי מלא, לכן הסינון נעשה ב-client
  // אם בעתיד יהיו הרבה כלים, ניתן להוסיף pagination או caching
  const allSnippets = await getAllSnippets();
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  
  if (!lowerSearchTerm) {
    return allSnippets;
  }
  
  return allSnippets.filter(snippet => 
    snippet.name.toLowerCase().includes(lowerSearchTerm) ||
    (snippet.description && snippet.description.toLowerCase().includes(lowerSearchTerm)) ||
    (snippet.author && snippet.author.toLowerCase().includes(lowerSearchTerm))
  );
};

export const updateSnippet = async (id: string, data: Partial<SnippetData>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  
  // ניקוי של undefined values - Firestore לא מקבל אותם
  const cleanData: Record<string, any> = {
    updatedAt: Timestamp.now(),
  };
  
  if (data.name !== undefined) cleanData.name = data.name;
  if (data.description !== undefined) cleanData.description = data.description || '';
  if (data.author !== undefined) cleanData.author = data.author || '';
  if (data.code !== undefined) cleanData.code = data.code;
  
  await updateDoc(docRef, cleanData);
};

export const deleteSnippet = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

