import { capitalize, camelCase } from 'string-utils/case';
import { isEmail } from 'string-utils/validation';

console.log('Testing ESM imports...');

console.assert(capitalize('hello') === 'Hello');
console.assert(camelCase('hello-world') === 'helloWorld');
console.assert(isEmail('test@example.com') === true);

console.log('✅ All ESM tests passed!');