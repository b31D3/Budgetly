import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export interface CalculationData {
  id?: string;
  userId: string;
  tuition: number;
  creditsPerSemester: number;
  semestersPerYear: number;
  yearsToGraduate: number;
  housingCost: number;
  mealPlanCost: number;
  booksCost: number;
  transportationCost: number;
  otherExpenses: number;
  totalCost: number;
  costPerCredit: number;
  costPerYear: number;
  currentBalance: number;
  remainingSemesters: number;
  projectedBalance: number;
  semesterData?: any[];
  formInputs?: {
    studentType?: string;
    semestersLeft?: string;
    books?: string;
    supplies?: string;
    housing?: string;
    rent?: string;
    utilities?: string;
    groceries?: string;
    cellPhone?: string;
    transportation?: string;
    memberships?: string;
    hasJob?: string;
    hoursPerWeekSchool?: string;
    hoursPerWeekSummer?: string;
    hourlyRate?: string;
    scholarship?: string;
    bursary?: string;
    grant?: string;
    savings?: string;
  };
  createdAt: Date;
}

const COLLECTION_NAME = "calculations";

export const saveCalculation = async (
  data: Omit<CalculationData, "id" | "createdAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserCalculations = async (
  userId: string
): Promise<CalculationData[]> => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const calculations: CalculationData[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt.toDate(),
  })) as CalculationData[];
  return calculations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const deleteCalculation = async (calculationId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, calculationId));
};

export const getLatestCalculation = async (
  userId: string
): Promise<CalculationData | null> => {
  const calculations = await getUserCalculations(userId);
  return calculations.length > 0 ? calculations[0] : null;
};
