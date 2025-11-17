/**
 * TypeScript Test File
 *
 * This demonstrates TypeScript IntelliSense and type checking
 * with the string-utils package.
 *
 * To run this:
 * 1. Install TypeScript: npm install -g typescript
 * 2. Type check: tsc --noEmit test-types.ts
 * 3. Or use VS Code - you'll get IntelliSense automatically!
 */

// Import from main entry point
import {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  isEmail,
  isURL,
  isEmpty,
  hasMinLength,
} from "string-utils";

// Import from subpaths
import { toUpperCase, toLowerCase } from "string-utils/case";
import { isUUID } from "string-utils/validation";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Valid Usage - TypeScript is happy!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Case conversion
const upper: string = toUpperCase("hello");
const lower: string = toLowerCase("WORLD");
const cap: string = capitalize("hello world");
const camel: string = camelCase("hello-world");
const kebab: string = kebabCase("helloWorld");
const snake: string = snakeCase("helloWorld");

// Validation
const emailValid: boolean = isEmail("test@example.com");
const urlValid: boolean = isURL("https://example.com");
const uuidValid: boolean = isUUID("550e8400-e29b-41d4-a716-446655440000");
const empty: boolean = isEmpty("");
const hasMin: boolean = hasMinLength("hello", 3);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ Invalid Usage - TypeScript will catch these errors!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Uncomment these to see TypeScript errors:

// Wrong argument type
const result1 = capitalize(123);  // Error: number is not assignable to string

// Wrong number of arguments
const result2 = camelCase();  // Error: Expected 1 argument, but got 0

// Wrong return type assignment
const result3: number = isEmail('test@example.com');  // Error: boolean is not assignable to number

// Missing required argument
const result4 = hasMinLength('hello');  // Error: Expected 2 arguments, but got 1

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 IntelliSense Examples
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// When you type "capitalize(", your editor will show:
  capitalize(str: string): string
//
// When you hover over "isEmail", you'll see:
//   Validates if a string is a valid email address
//   @param str - The string to validate
//   @returns True if the string is a valid email, false otherwise

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 Real-World Usage Example
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface User {
  name: string;
  email: string;
  username: string;
}

function processUser(input: { name: string; email: string }): User | null {
  // Validate email
  if (!isEmail(input.email)) {
    console.error("Invalid email address");
    return null;
  }

  // Validate name is not empty
  if (isEmpty(input.name)) {
    console.error("Name cannot be empty");
    return null;
  }

  // Generate username from name
  const username = snakeCase(input.name);

  return {
    name: capitalize(input.name),
    email: toLowerCase(input.email),
    username,
  };
}

// Test it
const user1 = processUser({
  name: "John Doe",
  email: "JOHN@EXAMPLE.COM",
});

if (user1) {
  console.log("User created:", user1);
  // TypeScript knows user1 has: name, email, username properties
  console.log(`Username: ${user1.username}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎓 Type Safety Benefits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("TypeScript provides:");
console.log("✅ Auto-completion in your editor");
console.log("✅ Type checking at compile time");
console.log("✅ Inline documentation");
console.log("✅ Refactoring support");
console.log("✅ Catch errors before runtime");

export {};
