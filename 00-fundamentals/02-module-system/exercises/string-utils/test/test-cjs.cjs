const { capitalize, camelCase } = require('string-utils/case');
const { isEmail } = require('string-utils/validation');

console.log('Testing CommonJS imports...');

console.assert(capitalize('hello') === 'Hello');
console.assert(camelCase('hello-world') === 'helloWorld');
console.assert(isEmail('test@example.com') === true);

console.log('✅ All CommonJS tests passed!');