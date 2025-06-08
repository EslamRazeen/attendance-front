/**
 * Common constants used throughout the application
 */

// Student levels
export const LEVELS = ["1", "2", "3", "4"];

// Department codes
export const DEPARTMENTS = ["CS", "IS", "AI", "BIO"];

// Function to validate level
export const isValidLevel = (level) => {
  return LEVELS.includes(level?.toString());
};

// Function to validate department
export const isValidDepartment = (dept) => {
  return DEPARTMENTS.includes(dept?.toString().toUpperCase());
}; 