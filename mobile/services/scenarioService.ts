import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

export type ScenarioPeriod = "all" | "summer" | "school" | "winter" | "fall";

export interface OneTimeEvent {
  name: string;
  amount: number;
  effect: "income" | "expense";
  semester: string;
}

export interface ScenarioData {
  id?: string;
  userId: string;
  name: string;
  monthlyIncomeChange: number;
  monthlyExpenseChange: number;
  period: ScenarioPeriod;
  oneTimeEvent?: OneTimeEvent;
  projectedBalance: number;
  createdAt: Date;
}

const COLLECTION_NAME = "scenarios";

export const saveScenario = async (
  data: Omit<ScenarioData, "id" | "createdAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserScenarios = async (userId: string): Promise<ScenarioData[]> => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const scenarios: ScenarioData[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt.toDate(),
  })) as ScenarioData[];
  return scenarios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateScenario = async (
  scenarioId: string,
  data: Partial<Omit<ScenarioData, "id" | "createdAt" | "userId">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, scenarioId), data);
};

export const deleteScenario = async (scenarioId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, scenarioId));
};
