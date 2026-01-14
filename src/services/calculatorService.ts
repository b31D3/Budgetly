import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";

export interface CalculationData {
  id?: string;
  userId: string;

  // Calculated values
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
  semesterData?: any[]; // Store semester-by-semester breakdown

  // Raw form inputs - needed to restore the form
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

// Save a new calculation
export const saveCalculation = async (data: Omit<CalculationData, "id" | "createdAt">): Promise<string> => {
  try {
    console.log("saveCalculation called with data:", data);
    console.log("Collection name:", COLLECTION_NAME);

    const dataToSave = {
      ...data,
      createdAt: Timestamp.now(),
    };

    console.log("Data to save:", dataToSave);
    console.log("Starting addDoc...");

    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);

    console.log("addDoc completed. Document ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving calculation:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

// Get all calculations for a user
export const getUserCalculations = async (userId: string): Promise<CalculationData[]> => {
  try {
    console.log("getUserCalculations called with userId:", userId);

    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
      // Removed orderBy temporarily to check if index is the issue
      // orderBy("createdAt", "desc")
    );

    console.log("Executing Firestore query...");
    const querySnapshot = await getDocs(q);
    console.log("Query completed. Document count:", querySnapshot.size);

    const calculations: CalculationData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document data:", doc.id, data);
      calculations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as CalculationData);
    });

    // Sort by createdAt in descending order (newest first)
    calculations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log("Returning calculations:", calculations.length);
    return calculations;
  } catch (error) {
    console.error("Error getting calculations:", error);
    throw error;
  }
};

// Delete a calculation
export const deleteCalculation = async (calculationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, calculationId));
  } catch (error) {
    console.error("Error deleting calculation:", error);
    throw error;
  }
};

// Get the latest calculation for a user
export const getLatestCalculation = async (userId: string): Promise<CalculationData | null> => {
  try {
    const calculations = await getUserCalculations(userId);
    return calculations.length > 0 ? calculations[0] : null;
  } catch (error) {
    console.error("Error getting latest calculation:", error);
    throw error;
  }
};
