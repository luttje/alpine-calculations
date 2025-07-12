import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

test('calculates simple multiplication correctly', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input type="number" x-calculator-source="price" value="10">
      <input type="number" x-calculator-source="quantity" value="3">
      <span id="total" x-calculator-expression="price * quantity"></span>
    </div>
  `

  await Promise.resolve()

  const total = document.getElementById('total')
  expect(total.textContent).toBe('30')
})
