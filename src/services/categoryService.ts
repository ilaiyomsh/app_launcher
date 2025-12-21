import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Category } from '../types';

const COLLECTION_NAME = 'categories';

export const getAllCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      color: data.color,
      createdBy: data.createdBy,
      createdAt: data.createdAt.toDate(),
    };
  });
};

export const createCategory = async (
  name: string,
  color: string
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('משתמש לא מחובר');
  }

  const now = Timestamp.now();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    name,
    color,
    createdBy: user.email || user.displayName || 'Unknown',
    createdAt: now,
  });

  return docRef.id;
};

export const updateCategory = async (
  id: string,
  data: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);

  const cleanData: Record<string, any> = {};

  if (data.name !== undefined && data.name !== null) {
    cleanData.name = data.name;
  }
  if (data.color !== undefined && data.color !== null) {
    cleanData.color = data.color;
  }

  if (Object.keys(cleanData).length > 0) {
    await updateDoc(docRef, cleanData);
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

