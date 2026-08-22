/**
 * Login ID generator based on the specification:
 * [First 2 letters of company][First 2 letters of first name + First 2 letters of last name][Year of joining][4-digit Serial number]
 * Example: 'Odoo India', 'John', 'Doe', 2022, 1 -> 'OIJODO20220001'
 */
export function generateLoginId(
  companyName: string,
  firstName: string,
  lastName: string,
  yearOfJoining: number,
  serialNumber: number
): string {
  // 1. Company initials/code (first 2 alphanumeric characters, uppercase)
  const cleanCompany = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const companyCode = (cleanCompany.slice(0, 2) || 'HR').padEnd(2, 'X');

  // 2. First name 2 chars + Last name 2 chars
  const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  const firstPart = (cleanFirst.slice(0, 2) || 'EM').padEnd(2, 'X');
  const lastPart = (cleanLast.slice(0, 2) || 'PL').padEnd(2, 'X');
  const nameCode = `${firstPart}${lastPart}`;

  // 3. Year (4 digits)
  const yearStr = String(yearOfJoining).padStart(4, '2026');

  // 4. Serial number (4 digits, e.g. 0001)
  const serialStr = String(serialNumber).padStart(4, '0');

  return `${companyCode}${nameCode}${yearStr}${serialStr}`;
}

/**
 * Generates an initial secure temporary password for new employees
 */
export function generateTemporaryPassword(firstName: string): string {
  const clean = firstName.replace(/[^a-zA-Z]/g, '');
  const prefix = clean.charAt(0).toUpperCase() + clean.slice(1, 4).toLowerCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const symbols = ['@', '#', '!', '$', '%'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${prefix || 'Emp'}#${randomDigits}${symbol}`;
}
