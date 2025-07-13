import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

// Force en-US locale for consistent decimal formatting when testing on
// different systems or environments.
const originalToLocaleString = Number.prototype.toLocaleString

beforeEach(() => {
  Number.prototype.toLocaleString = function (locale, options) {
    return originalToLocaleString.call(this, 'en-US', options)
  }
})

afterEach(() => {
  Number.prototype.toLocaleString = originalToLocaleString
})

test('x-calculator-precision formats decimals', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input type="number" x-calculator-source="price" value="5.554">
      <span id="precise" x-calculator-expression="price * 1" x-calculator-precision="2"></span>
    </div>
  `

  await Promise.resolve()

  expect(document.getElementById('precise').textContent).toBe('5.55')
})
