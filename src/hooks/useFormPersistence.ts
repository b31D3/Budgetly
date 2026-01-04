import { useEffect } from "react";

/**
 * FORM DATA PERSISTENCE HOOK
 *
 * Purpose: Automatically save and restore form data to/from localStorage
 *
 * Benefits:
 * 1. User doesn't lose data on page refresh
 * 2. Can close browser and come back later
 * 3. Improves user experience significantly
 *
 * Usage:
 * const { saveFormData, loadFormData, clearFormData } = useFormPersistence('budgetly-form');
 *
 * Technical details:
 * - Uses localStorage API (available in all modern browsers)
 * - Data is stored as JSON string
 * - Handles errors gracefully (e.g., if localStorage is disabled)
 * - Automatically cleans up on unmount
 */

const STORAGE_KEY_PREFIX = "budgetly_";

interface FormPersistenceOptions {
  /**
   * Whether to automatically load data on mount
   * Default: true
   */
  autoLoad?: boolean;

  /**
   * Debounce delay in ms for auto-save
   * Default: 500ms
   */
  debounceMs?: number;
}

export const useFormPersistence = <T extends Record<string, any>>(
  storageKey: string,
  options: FormPersistenceOptions = {}
) => {
  const { autoLoad = true, debounceMs = 500 } = options;
  const fullKey = `${STORAGE_KEY_PREFIX}${storageKey}`;

  /**
   * Save form data to localStorage
   * Handles errors gracefully if localStorage is unavailable
   */
  const saveFormData = (data: T): boolean => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
      // Could be quota exceeded, localStorage disabled, or other error
      return false;
    }
  };

  /**
   * Load form data from localStorage
   * Returns null if no data exists or if there's an error
   */
  const loadFormData = (): T | null => {
    try {
      const serialized = localStorage.getItem(fullKey);
      if (!serialized) return null;

      const parsed = JSON.parse(serialized) as T;
      return parsed;
    } catch (error) {
      console.error("Failed to load form data from localStorage:", error);
      // Could be invalid JSON, localStorage disabled, or other error
      return null;
    }
  };

  /**
   * Clear saved form data from localStorage
   */
  const clearFormData = (): boolean => {
    try {
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error("Failed to clear form data from localStorage:", error);
      return false;
    }
  };

  /**
   * Check if saved data exists
   */
  const hasSavedData = (): boolean => {
    try {
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      return false;
    }
  };

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    hasSavedData,
  };
};

/**
 * Debounce utility for auto-save functionality
 * Prevents saving on every keystroke (performance optimization)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};