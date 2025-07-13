import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'
import { mockLocale, resetLocale } from './localization-mock.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

describe('Calculator Localization', () => {
  beforeEach(() => {
    mockLocale('en-US')
  })

  afterEach(() => {
    resetLocale()

    document.body.innerHTML = ''
  })

  test('displays numbers with nl-NL locale formatting in display elements', async () => {
    mockLocale('nl-NL')

    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="price" value="1234.56">
        <span id="display" x-calculator-expression="price * 1" x-calculator-precision="2"></span>
      </div>
    `

    await Promise.resolve()

    // In nl-NL: thousands separator is period, decimal separator is comma
    expect(document.querySelector('[x-calculator-source]').value).toBe("1234.56")
    expect(document.getElementById('display').textContent).toBe('1.234,56')
  })

  test('numeric inputs receive standard format regardless of locale', async () => {
    mockLocale('nl-NL')

    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="price" value="1234.56">
        <input type="number" id="target" x-calculator-expression="price * 1.25" x-calculator-precision="2">
      </div>
    `

    await Promise.resolve()

    // Numeric inputs 'value' should always get standard format, not locale-specific
    expect(document.getElementById('target').value).toBe('1543.20')
  })

  test('handles large numbers with different locale thousands separators', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="amount" value="1000000">
        <span id="display" x-calculator-expression="amount * 1.5" x-calculator-precision="0"></span>
        <input type="number" id="numericTarget" x-calculator-expression="amount * 1.5" x-calculator-precision="0">
      </div>
    `

    await Promise.resolve()

    // Display element gets US formatting (comma thousands separator)
    expect(document.getElementById('display').textContent).toBe('1,500,000')

    // Numeric input gets standard format (no thousands separator)
    expect(document.getElementById('numericTarget').value).toBe('1500000')
  })

  test('handles locale-formatted numbers in input fields correctly', async () => {
    mockLocale('nl-NL')

    document.body.innerHTML = `
    <div x-data>
      <input type="text" id="source" x-calculator-source="price" value="1.366,45">
      <span id="display" x-calculator-expression="price * 2" x-calculator-precision="2"></span>
    </div>
  `

    await Promise.resolve()

    // The display should show the correct calculation: 1366.45 * 2 = 2732.90
    expect(document.getElementById('display').textContent).toBe('2.732,90')
  })

  test('handles various locale number formats correctly', async () => {
    mockLocale('de-DE')

    document.body.innerHTML = `
    <div x-data>
      <input type="text" id="source1" x-calculator-source="price1" value="1.234,56">
      <input type="text" id="source2" x-calculator-source="price2" value="5.678,90">
      <span id="sum" x-calculator-expression="price1 + price2" x-calculator-precision="2"></span>
    </div>
  `

    await Promise.resolve()

    // Should correctly parse and sum: 1234.56 + 5678.90 = 6913.46, then format as:
    expect(document.getElementById('sum').textContent).toBe('6.913,46')
  })

  test('handles decimal precision with fr-FR locale', async () => {
    mockLocale('fr-FR')

    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="price" value="123.456">
        <span id="display" x-calculator-expression="price * 2" x-calculator-precision="3"></span>
        <input type="number" id="numericTarget" x-calculator-expression="price * 2" x-calculator-precision="3">
      </div>
    `

    await Promise.resolve()

    // Display element gets French formatting (comma as decimal separator)
    expect(document.getElementById('display').textContent).toBe('246,912')

    // Numeric input gets standard format (period as decimal separator)
    expect(document.getElementById('numericTarget').value).toBe('246.912')
  })

  test('textarea elements receive locale-formatted values', async () => {
    mockLocale('nl-NL')

    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="value" value="9876.54">
        <textarea id="textareaTarget" x-calculator-expression="value * 1.1" x-calculator-precision="2"></textarea>
      </div>
    `

    await Promise.resolve()

    // Textarea should receive locale-formatted values
    expect(document.getElementById('textareaTarget').value).toBe('10.864,19')
  })

  test('handles zero decimal places with locale formatting', async () => {
    mockLocale('de-DE')

    document.body.innerHTML = `
      <div x-data>
        <input type="number" x-calculator-source="amount" value="1234.789">
        <span id="display" x-calculator-expression="amount * 2" x-calculator-precision="0"></span>
        <input type="number" id="numericTarget" x-calculator-expression="amount * 2" x-calculator-precision="0">
      </div>
    `

    await Promise.resolve()

    // Display element gets German formatting with no decimal places
    expect(document.getElementById('display').textContent).toBe('2.470')

    // Numeric input gets standard format with no decimal places
    expect(document.getElementById('numericTarget').value).toBe('2470')
  })
})
