import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

test('reacts to input change and updates expression', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input id="qty" type="number" x-calculator-source="qty" value="2">
      <span id="double" x-calculator-expression="qty * 2"></span>
    </div>
  `

  Alpine.start()
  await Promise.resolve()

  const input = document.getElementById('qty')
  const output = document.getElementById('double')

  input.value = '5'
  input.dispatchEvent(new Event('input'))

  await Promise.resolve()

  expect(output.textContent).toBe('10')
})
