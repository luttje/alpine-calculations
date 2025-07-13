import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'
import { mockLocale, resetLocale } from './localization-mock.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

beforeEach(() => {
  mockLocale('en-US')
})

afterEach(() => {
  resetLocale()
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
