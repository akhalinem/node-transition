import { generateDatabase } from "./db-generator.js";
import { findById } from "./db-parser.js";
import { streamFindById } from "./streamed-db-parser.js";
import {buildIndex,findByIdWithIndex} from './db-indexing.js'

generateDatabase("users.db", [
    { id: 1, age: 28, name: "Alice Johnson", salary: 70000, active: true },
    { id: 2, age: 34, name: "Bob Smith", salary: 85000, active: false },
    { id: 3, age: 22, name: "Charlie Brown", salary: 50000, active: true },
    { id: 4, age: 45, name: "Diana Prince", salary: 95000, active: true },
    { id: 5, age: 30, name: "Ethan Hunt", salary: 80000, active: false },
    { id: 6, age: 29, name: "Fiona Glenanne", salary: 72000, active: true },
    { id: 7, age: 41, name: "George Clooney", salary: 110000, active: false },
    { id: 8, age: 36, name: "Hannah Montana", salary: 78000, active: true },
    { id: 9, age: 27, name: "Ian Fleming", salary: 69000, active: true },
    { id: 10, age: 33, name: "Jane Doe", salary: 83000, active: false },
]);

await buildIndex('users.db', 'users.idx')

console.time("Synchronous Parse Time");
await findById("users.db", 5);
console.timeEnd("Synchronous Parse Time");

console.time("Streamed Parse Time");
await streamFindById("users.db", 5);
console.timeEnd("Streamed Parse Time");

console.time("Indexed Find Time");
await findByIdWithIndex('users.db', 'users.idx', 5);
console.timeEnd("Indexed Find Time");