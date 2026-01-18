export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // Password must be at least 8 characters long and contain at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidUsername(username: string): boolean {
    // Username must be alphanumeric and between 3 to 20 characters
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    return usernameRegex.test(username);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeString(input: string): string {
    return input.replace(/[<>&'"]/g, (char) => {
      const charMap: { [key: string]: string } = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&#39;",
        '"': "&quot;",
      };
      return charMap[char] || char;
    });
  }
}
