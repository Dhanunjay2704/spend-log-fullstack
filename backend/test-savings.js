// Quick test to check date validation
const testDate = new Date('2024-12-31');
const today = new Date();
today.setHours(0, 0, 0, 0);

console.log('Test Date:', testDate);
console.log('Today:', today);
console.log('Is test date in future?', testDate >= today);