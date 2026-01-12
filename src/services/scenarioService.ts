import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc, deleteField } from "firebase/firestore";

export interface ScenarioData {
  id?: string;
  userId: string;
  name: string;
  monthlyIncomeChange: number; // Change in monthly income
  monthlyExpenseChange: number; // Change in monthly expenses
  oneTimeEvent?: {
    name: string;
    amount: number;
    effect: "income" | "expense";
    semester: string; // e.g., "Fall 2026", "Spring 2027"
  };
  projectedBalance: number; // Balance at graduation with this scenario
  createdAt: Date;
}

const COLLECTION_NAME = "scenarios";

// Save a new scenario
export const saveScenario = async (data: Omit<ScenarioData, "id" | "createdAt">): Promise<string> => {
  try {
    // Remove undefined fields as Firestore doesn't accept them
    const cleanData: any = {
      userId: data.userId,
      name: data.name,
      monthlyIncomeChange: data.monthlyIncomeChange,
      monthlyExpenseChange: data.monthlyExpenseChange,
      projectedBalance: data.projectedBalance,
      createdAt: Timestamp.now(),
    };

    // Only add oneTimeEvent if it's defined
    if (data.oneTimeEvent) {
      cleanData.oneTimeEvent = data.oneTimeEvent;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving scenario:", error);
    throw error;
  }
};

// Get all scenarios for a user
export const getUserScenarios = async (userId: string): Promise<ScenarioData[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const scenarios: ScenarioData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scenarios.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as ScenarioData);
    });

    // Sort by createdAt in descending order (newest first)
    scenarios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return scenarios;
  } catch (error) {
    console.error("Error getting scenarios:", error);
    throw error;
  }
};

// Update a scenario
export const updateScenario = async (scenarioId: string, data: Partial<ScenarioData>): Promise<void> => {
  try {
    const scenarioRef = doc(db, COLLECTION_NAME, scenarioId);

    // Clean data to remove undefined values (Firestore doesn't accept undefined)
    const cleanData: any = {};

    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (value !== undefined) {
        cleanData[key] = value;
      } else {
        // If value is undefined, we need to delete the field from Firestore
        cleanData[key] = deleteField();
      }
    });

    await updateDoc(scenarioRef, cleanData);
  } catch (error) {
    console.error("Error updating scenario:", error);
    throw error;
  }
};

// Delete a scenario
export const deleteScenario = async (scenarioId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, scenarioId));
  } catch (error) {
    console.error("Error deleting scenario:", error);
    throw error;
  }
};
