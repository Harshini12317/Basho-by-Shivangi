// GST validation utility
export function validateGST(gstNumber: string): boolean {
  // Remove any spaces or special characters
  const cleanGST = gstNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  // GST should be 15 characters long
  if (cleanGST.length !== 15) {
    return false;
  }

  // First 2 characters should be state code (01-37)
  const stateCode = cleanGST.substring(0, 2);
  const stateNum = parseInt(stateCode);
  if (isNaN(stateNum) || stateNum < 1 || stateNum > 37) {
    return false;
  }

  // Next 10 characters should be PAN format: AAAAA9999A
  const panPart = cleanGST.substring(2, 12);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (!panRegex.test(panPart)) {
    return false;
  }

  // 13th character should be entity number (1-9, A-Z)
  const entityChar = cleanGST.charAt(12);
  if (!/[1-9A-Z]/.test(entityChar)) {
    return false;
  }

  // Last character should be Z or 1-9
  const checkChar = cleanGST.charAt(14);
  if (!/[Z1-9]/.test(checkChar)) {
    return false;
  }

  return true;
}