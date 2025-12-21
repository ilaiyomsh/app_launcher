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
import { db, auth } from '../config/firebase';
import { Snippet, SnippetData, FilterOptions } from '../types';

const COLLECTION_NAME = 'snippets';

export const createSnippet = async (data: Omit<SnippetData, 'author'>): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('משתמש לא מחובר');
  }

  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    name: data.name,
    description: data.description || '',
    code: data.code,
    author: user.email || user.displayName || 'Unknown',
    category: data.category || null,
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
  });
  
  return docRef.id;
};

export const getSnippet = async (id: string): Promise<Snippet | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    name: data.name,
    description: data.description,
    code: data.code,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    author: data.author || 'Unknown', // Fallback לכלים ישנים
    category: data.category || undefined,
    tags: data.tags || [],
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
      author: data.author || 'Unknown', // Fallback לכלים ישנים
      category: data.category || undefined,
      tags: data.tags || [],
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
  // רק שדות שמוגדרים בפועל (לא undefined) יועברו לעדכון
  const cleanData: Record<string, any> = {
    updatedAt: Timestamp.now(),
  };
  
  // רק אם השדה מוגדר (לא undefined), נוסיף אותו לעדכון
  if (data.name !== undefined && data.name !== null) {
    cleanData.name = data.name;
  }
  if (data.description !== undefined && data.description !== null) {
    cleanData.description = data.description;
  }
  if (data.author !== undefined && data.author !== null) {
    cleanData.author = data.author;
  }
  if (data.code !== undefined && data.code !== null) {
    cleanData.code = data.code;
  }
  if (data.category !== undefined) {
    cleanData.category = data.category || null;
  }
  if (data.tags !== undefined && data.tags !== null) {
    cleanData.tags = data.tags;
  }
  
  await updateDoc(docRef, cleanData);
};

export const filterSnippets = async (options: FilterOptions): Promise<Snippet[]> => {
  // קבל את כל הכלים
  const allSnippets = await getAllSnippets();

  // החל סינונים
  let filtered = allSnippets;

  // סינון לפי חיפוש חופשי
  if (options.search) {
    const lowerSearch = options.search.toLowerCase().trim();
    filtered = filtered.filter((snippet) =>
      snippet.name.toLowerCase().includes(lowerSearch) ||
      (snippet.description && snippet.description.toLowerCase().includes(lowerSearch)) ||
      (snippet.author && snippet.author.toLowerCase().includes(lowerSearch))
    );
  }

  // סינון לפי קטגוריות (מרובות)
  if (options.categories && options.categories.length > 0) {
    filtered = filtered.filter((snippet) =>
      options.categories!.includes(snippet.category || '')
    );
  }

  // סינון לפי תגיות
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter((snippet) =>
      options.tags!.some((tag) => snippet.tags.includes(tag))
    );
  }

  // סינון לפי יוצרים (מרובים)
  if (options.authors && options.authors.length > 0) {
    filtered = filtered.filter((snippet) =>
      options.authors!.includes(snippet.author)
    );
  }

  // מיון
  const sortBy = options.sortBy || 'updatedAt';
  const sortDirection = options.sortDirection || 'desc';

  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'updatedAt':
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      case 'createdAt':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'author':
        aValue = a.author.toLowerCase();
        bValue = b.author.toLowerCase();
        break;
      default:
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return filtered;
};

export const deleteSnippet = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

