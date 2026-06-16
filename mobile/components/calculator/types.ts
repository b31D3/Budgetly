export interface FormState {
  studentType: string;
  semestersLeft: string;
  tuition: string;
  books: string;
  supplies: string;
  housing: string;
  rent: string;
  utilities: string;
  groceries: string;
  cellPhone: string;
  transportation: string;
  memberships: string;
  hasJob: string;
  hoursPerWeekSchool: string;
  hoursPerWeekSummer: string;
  hourlyRate: string;
  scholarship: string;
  bursary: string;
  grant: string;
  savings: string;
}

export type FormErrors = Partial<Record<keyof FormState, string>>;

export const DEFAULT_FORM: FormState = {
  studentType: "domestic",
  semestersLeft: "",
  tuition: "",
  books: "",
  supplies: "",
  housing: "off-campus",
  rent: "",
  utilities: "",
  groceries: "",
  cellPhone: "",
  transportation: "",
  memberships: "",
  hasJob: "",
  hoursPerWeekSchool: "",
  hoursPerWeekSummer: "",
  hourlyRate: "",
  scholarship: "",
  bursary: "",
  grant: "",
  savings: "",
};
