import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

describe('AlpineJS Calculator Security Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('x-calculator-source values are safely cast to floats', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="text" x-calculator-source="malicious" value="alert('xss')">
        <span id="result" x-calculator-expression="malicious"></span>
      </div>
    `
    await Promise.resolve()

    const result = document.getElementById('result')

    // Malicious string gets cast to NaN, then handled as 0 by parseFloat
    expect(result.textContent).toBe('0')
  })

  test('x-calculator-source with script injection attempts are neutralized', async () => {
    window.vulnerabilityTest = { value: 'original' };

    // User input in source values is safe due to parseFloat()
    const userInput = "5; (globalThis.vulnerabilityTest.value = 'hacked'); 5";

    document.body.innerHTML = `
      <div x-data>
        <input type="text" x-calculator-source="price" value="${userInput}">
        <span id="total" x-calculator-expression="price * 2"></span>
      </div>
    `
    await Promise.resolve()

    const total = document.getElementById('total')

    // Script injection in source value is neutralized by parseFloat
    expect(total.textContent).toBe('10') // parseFloat('5; malicious_code; 5') = 5
    expect(window.vulnerabilityTest.value).toBe('original')
  })

  test('numeric strings in x-calculator-source are properly parsed', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="text" x-calculator-source="price" value="123.45abc">
        <span id="result" x-calculator-expression="price"></span>
      </div>
    `
    await Promise.resolve()

    const result = document.getElementById('result')
    // parseFloat safely extracts numeric portion
    expect(result.textContent).toBe('123.45')
  })

  test('predefined expressions with source values are secure', async () => {
    // This demonstrates the correct, safe way to use the calculator
    document.body.innerHTML = `
      <div x-data>
        <input type="text" x-calculator-source="userPrice" value="alert('safe')">
        <input type="text" x-calculator-source="userQuantity" value="console.log('safe')">
        <span id="result" x-calculator-expression="userPrice * userQuantity + 10"></span>
      </div>
    `
    await Promise.resolve()

    const result = document.getElementById('result')
    // Both inputs contain non-numeric strings, so they become 0
    // Expression: 0 * 0 + 10 = 10
    expect(result.textContent).toBe('10')
  })

  test('sumValuesWithId function works safely with multiple sources', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="item" value="10">
        <input type="number" x-calculator-source="item" value="20">
        <input type="text" x-calculator-source="item" value="malicious_code()">
        <span id="result" x-calculator-expression="sumValuesWithId('item')"></span>
      </div>
    `
    await Promise.resolve()

    const result = document.getElementById('result')
    // 10 + 20 + 0 (malicious_code() becomes 0) = 30
    expect(result.textContent).toBe('30')
  })

  // This is a vulnerability test that demonstrates unsafe usage. We do not support user input in expressions.
  test('VULNERABILITY: x-calculator-expression can access global scope (UNSAFE USAGE)', async () => {
    window.vulnerabilityTest = { value: 'original' };

    // Use comma operator to execute side effects
    const maliciousUserExpression = "(globalThis.vulnerabilityTest.value = 'hacked', price)";

    // You should NEVER allow user input in the expression. Not in whole and not in parts.
    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="price" value="10">
        <span id="result" x-calculator-expression="${maliciousUserExpression}"></span>
      </div>
    `

    await Promise.resolve()

    const result = document.getElementById('result')
    expect(result.textContent).toBe('10')
    expect(window.vulnerabilityTest.value).toBe('hacked')

    delete window.vulnerabilityTest;
  })

  // This is a vulnerability test that demonstrates unsafe usage. We do not support user input in expressions.
  test('VULNERABILITY: x-calculator-expression can access global scope through `this` (UNSAFE USAGE)', async () => {
    window.vulnerabilityTest = { value: 'original' };

    // Try accessing through the function's constructor
    const maliciousUserExpression = "price, (function(){return this})().vulnerabilityTest.value = 'hacked', price";

    // You should NEVER allow user input in the expression. Not in whole and not in parts.
    document.body.innerHTML = `
    <div x-data>
      <input type="number" x-calculator-source="price" value="10">
      <span id="result" x-calculator-expression="${maliciousUserExpression}"></span>
    </div>
  `
    await Promise.resolve()

    const result = document.getElementById('result')
    expect(result.textContent).toBe('10')
    expect(window.vulnerabilityTest.value).toBe('hacked')

    delete window.vulnerabilityTest;
  })
})
