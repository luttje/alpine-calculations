import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

test('scoped calculations are isolated', async () => {
  document.body.innerHTML = `
    <div x-data>
      <div x-calculator-scope>
        <input type="number" x-calculator-source="price" value="5">
        <input type="number" x-calculator-source="quantity" value="2">
        <span id="total1" x-calculator-expression="price * quantity"></span>
      </div>

      <div x-calculator-scope>
        <input type="number" x-calculator-source="price" value="3">
        <input type="number" x-calculator-source="quantity" value="4">
        <span id="total2" x-calculator-expression="price * quantity"></span>
      </div>
    </div>
  `

  await Promise.resolve()

  expect(document.getElementById('total1').textContent).toBe('10')
  expect(document.getElementById('total2').textContent).toBe('12')
})
