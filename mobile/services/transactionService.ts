import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export interface Transaction {
  id?: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  createdAt: Date;
}

const COLLECTION_NAME = "transactions";

export const addTransaction = async (
  data: Omit<Transaction, "id" | "createdAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const transactions: Transaction[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt.toDate(),
  })) as Transaction[];
  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const updateTransaction = async (
  id: string,
  data: Partial<Omit<Transaction, "id" | "createdAt">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
