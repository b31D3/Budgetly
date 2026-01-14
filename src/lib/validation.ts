import { z } from "zod";

/**
 * VALIDATION SCHEMAS FOR BUDGETLY CALCULATOR
 *
 * Purpose: Define strict validation rules for all form inputs
 * Benefits:
 * - Prevents invalid data entry (negative numbers, unrealistic values)
 * - Type-safe form data throughout the application
 * - Automatic error messages for users
 * - Runtime validation of all inputs
 */

// Step 1: Academic Year Details Validation
export const academicSchema = z.object({
  studentType: z.enum(["domestic", "international"], {
    errorMap: () => ({ message: "Please select student type" }),
  }),
  semestersLeft: z.string()
    .min(1, "Please select number of semesters")
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 8;
    }, "Semesters must be between 1 and 8"),
  tuition: z.string()
    .min(1, "Tuition is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 200000;
    }, "Tuition must be between $0 and $200,000"),
  books: z.string()
    .refine((val) => {
      if (!val) return true; // Optional field
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 10000;
    }, "Books cost must be between $0 and $10,000")
    .optional()
    .transform(val => val || "0"),
  supplies: z.string()
    .refine((val) => {
      if (!val) return true; // Optional field
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 10000;
    }, "Supplies cost must be between $0 and $10,000")
    .optional()
    .transform(val => val || "0"),
});

// Step 2: Expenses Validation
export const expensesSchema = z.object({
  housing: z.string().optional(),
  rent: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 10000;
    }, "Rent must be between $0 and $10,000/month")
    .optional()
    .transform(val => val || "0"),
  utilities: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000;
    }, "Utilities must be between $0 and $1,000/month")
    .optional()
    .transform(val => val || "0"),
  groceries: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 2000;
    }, "Groceries must be between $0 and $2,000/month")
    .optional()
    .transform(val => val || "0"),
  cellPhone: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 500;
    }, "Cell phone bill must be between $0 and $500/month")
    .optional()
    .transform(val => val || "0"),
  transportation: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000;
    }, "Transportation must be between $0 and $1,000/month")
    .optional()
    .transform(val => val || "0"),
  memberships: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 500;
    }, "Memberships must be between $0 and $500/month")
    .optional()
    .transform(val => val || "0"),
});

// Step 3: Income & Financial Aid Validation
export const incomeSchema = z.object({
  hasJob: z.enum(["yes", "no", ""], {
    errorMap: () => ({ message: "Please select if you have a job" }),
  }),
  hoursPerWeekSchool: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 40;
    }, "School work hours must be between 0 and 40 hours/week")
    .optional()
    .transform(val => val || "0"),
  hoursPerWeekSummer: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 80;
    }, "Summer work hours must be between 0 and 80 hours/week")
    .optional()
    .transform(val => val || "0"),
  hourlyRate: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Hourly rate must be between $0 and $100/hour")
    .optional()
    .transform(val => val || "0"),
  scholarship: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 50000;
    }, "Scholarship must be between $0 and $50,000/semester")
    .optional()
    .transform(val => val || "0"),
  bursary: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 50000;
    }, "Bursary must be between $0 and $50,000/semester")
    .optional()
    .transform(val => val || "0"),
  grant: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 50000;
    }, "Grant must be between $0 and $50,000/semester")
    .optional()
    .transform(val => val || "0"),
  savings: z.string()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000000;
    }, "Savings must be between $0 and $1,000,000")
    .optional()
    .transform(val => val || "0"),
});

// Combined schema for the entire form
export const calculatorFormSchema = z.object({
  ...academicSchema.shape,
  ...expensesSchema.shape,
  ...incomeSchema.shape,
});

export type CalculatorFormData = z.infer<typeof calculatorFormSchema>;
