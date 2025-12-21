import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
  getDocs as getDocsQuery,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Tag } from '../types';

const COLLECTION_NAME = 'tags';

export const getAllTags = async (): Promise<Tag[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      createdBy: data.createdBy,
      createdAt: data.createdAt.toDate(),
    };
  });
};

export const createTag = async (name: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('משתמש לא מחובר');
  }

  const now = Timestamp.now();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    name,
    createdBy: user.email || user.displayName || 'Unknown',
    createdAt: now,
  });

  return docRef.id;
};

export const getOrCreateTag = async (name: string): Promise<string> => {
  // חפש תגית קיימת עם השם הזה
  const q = query(
    collection(db, COLLECTION_NAME),
    where('name', '==', name)
  );
  const querySnapshot = await getDocsQuery(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }

  // אם לא קיימת, צור חדשה
  return createTag(name);
};

export const deleteTag = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

