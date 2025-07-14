import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

describe('Calculator Scope Fallback', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('scoped calculations are isolated when variables exist in scope', async () => {
    document.body.innerHTML = `
      <div x-data>
        <div class="calculator1">
          <input type="number" x-calculator-source="price" value="5">
          <input type="number" x-calculator-source="quantity" value="2">
          <span id="total1" x-calculator-expression="price * quantity" x-calculator-scope=".calculator1"></span>
        </div>

        <div class="calculator2">
          <input type="number" x-calculator-source="price" value="3">
          <input type="number" x-calculator-source="quantity" value="4">
          <span id="total2" x-calculator-expression="price * quantity" x-calculator-scope=".calculator2"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('total1').textContent).toBe('10')
    expect(document.getElementById('total2').textContent).toBe('12')
  })

  test('scoped expression falls back to global when variable not in scope', async () => {
    document.body.innerHTML = `
      <div x-data>
        <!-- Global variable -->
        <input type="number" x-calculator-source="globalTax" value="0.1">

        <div class="row">
          <input type="number" x-calculator-source="price" value="100">
          <!-- This should use local price but global globalTax -->
          <span id="result" x-calculator-expression="price * (1 + globalTax)"  x-calculator-scope=".row"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('110')
  })

  test('multiple scopes can access same global variable', async () => {
    document.body.innerHTML = `
      <div x-data>
        <!-- Global variable -->
        <input type="number" x-calculator-source="discount" value="0.2">

        <div class="scope1">
          <input type="number" x-calculator-source="price" value="50">
          <span id="result1" x-calculator-expression="price * (1 - discount)" x-calculator-scope=".scope1"></span>
        </div>

        <div class="scope2">
          <input type="number" x-calculator-source="price" value="100">
          <span id="result2" x-calculator-expression="price * (1 - discount)" x-calculator-scope=".scope2"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result1').textContent).toBe('40')
    expect(document.getElementById('result2').textContent).toBe('80')
  })

  test('global expression works normally', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="a" value="10">
        <input type="number" x-calculator-source="b" value="5">
        <!-- Global expression - no scope -->
        <span id="result" x-calculator-expression="a + b"></span>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('15')
  })

  test('fallback works with sumValuesWithId function', async () => {
    document.body.innerHTML = `
      <div x-data>
        <!-- Global items -->
        <input type="number" x-calculator-source="item" value="10">
        <input type="number" x-calculator-source="item" value="20">

        <div class="scope">
          <input type="number" x-calculator-source="multiplier" value="2">
          <!-- Should use global sumValuesWithId for 'item' -->
          <span id="result" x-calculator-expression="sumValuesWithId('item') * multiplier" x-calculator-scope=".scope"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('60')
  })

  test('nested scopes work correctly with fallback', async () => {
    document.body.innerHTML = `
      <div x-data>
        <!-- Global variable -->
        <input type="number" x-calculator-source="globalVar" value="1">

        <div class="outer">
          <input type="number" x-calculator-source="outer" value="10">
          <span id="resultOuter" x-calculator-expression="outer + globalVar" x-calculator-scope=".outer"></span>

          <div class="inner">
            <input type="number" x-calculator-source="inner" value="100">
            <!-- Should use local inner, but fall back to global for outer and global -->
            <span id="result" x-calculator-expression="inner + outer + globalVar" x-calculator-scope=".inner"></span>
          </div>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('resultOuter').textContent).toBe('11')
    expect(document.getElementById('result').textContent).toBe('111')
  })

  // TODO: Not yet implemented
  test.failing('changing global variable updates scoped expressions that depend on it', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="globalRate" value="0.1" id="globalInput">

        <div class="scope">
          <input type="number" x-calculator-source="amount" value="100">
          <span id="result" x-calculator-expression="amount * globalRate" x-calculator-scope=".scope"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('10')

    // Change global variable
    const globalInput = document.getElementById('globalInput')
    globalInput.value = '0.2'
    globalInput.dispatchEvent(new Event('input'))

    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('20')
  })

  test('expression returns 0 when a variable is not found anywhere', async () => {
    document.body.innerHTML = `
      <div x-data>
        <div class="scope">
          <input type="number" x-calculator-source="existing" value="10">
          <span id="result" x-calculator-expression="existing + nonExistent" x-calculator-scope=".scope"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    // 10 + ? = 0 evaluates to NaN besides giving a warning
    expect(document.getElementById('result').textContent).toBe("0")
  })

  test('complex expression with mixed scope and global variables', async () => {
    document.body.innerHTML = `
      <div x-data>
        <!-- Global variables -->
        <input type="number" x-calculator-source="globalA" value="5">
        <input type="number" x-calculator-source="globalB" value="3">

        <div class="scope">
          <!-- Local variables -->
          <input type="number" x-calculator-source="localA" value="2">
          <input type="number" x-calculator-source="localB" value="4">

          <!-- Mix of local and global variables -->
          <span id="result" x-calculator-expression="localA * globalA + localB * globalB" x-calculator-scope=".scope"></span>
        </div>
      </div>
    `
    await Promise.resolve()

    // (2 * 5) + (4 * 3) = 10 + 12 = 22
    expect(document.getElementById('result').textContent).toBe('22')
  })
})
