const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateBmi, classifyBmi, shouldLockApp } = require('./profile-utils.js');

test('calculates BMI and rounds to one decimal place', () => {
  assert.equal(calculateBmi(168, 62), 22);
});

test('classifies BMI into user-facing Chinese labels', () => {
  assert.equal(classifyBmi(17.9).label, '偏瘦');
  assert.equal(classifyBmi(22).label, '正常');
  assert.equal(classifyBmi(25.4).label, '超重');
  assert.equal(classifyBmi(29).label, '肥胖');
});

test('locks the main app until a profile is completed', () => {
  assert.equal(shouldLockApp(null), true);
  assert.equal(shouldLockApp({ bmi: '22.0' }), false);
});
