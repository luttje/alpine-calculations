import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

test('sumValuesWithId computes correct total', async () => {
  document.body.innerHTML = `
    <div x-data>
      <input type="number" x-calculator-source="item" value="10">
      <input type="number" x-calculator-source="item" value="20">
      <span id="sum" x-calculator-expression="sumValuesWithId('item')"></span>
    </div>
  `

  await Promise.resolve()

  const sum = document.getElementById('sum')
  expect(sum.textContent).toBe('30')
})
