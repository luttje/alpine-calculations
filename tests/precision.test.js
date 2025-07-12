import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

test('x-calculator-precision formats decimals', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input type="number" x-calculator-source="price" value="5.554">
      <span id="precise" x-calculator-expression="price * 1" x-calculator-precision="2"></span>
    </div>
  `

  Alpine.start()
  await Promise.resolve()

  expect(document.getElementById('precise').textContent).toBe('5.55')
})
