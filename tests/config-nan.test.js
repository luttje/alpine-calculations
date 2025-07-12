import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(
  Calculator.configure({
    handleNaN: () => 'Invalid'
  })
)
window.Alpine = Alpine
Alpine.start()

test('handles NaN with custom function', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input type="text" x-calculator-source="val" value="0">
      <span id="nanCheck" x-calculator-expression="0 / val"></span>
    </div>
  `
  await Promise.resolve()

  expect(document.getElementById('nanCheck').textContent).toBe('Invalid')
})
