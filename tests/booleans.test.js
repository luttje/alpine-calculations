import '@testing-library/jest-dom'
import Alpine from 'alpinejs'
import Calculator from '../src/index.js'

Alpine.plugin(Calculator)
window.Alpine = Alpine
Alpine.start()

describe('Calculator Boolean', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('checkboxes return boolean values', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="checkbox" x-calculator-source="isActive" checked>
        <span id="result" x-calculator-expression="isActive ? 'Active' : 'Inactive'"></span>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('Active')

    // Change checkbox state
    document.querySelector('input[type="checkbox"]').checked = false
    document.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change'))

    expect(document.getElementById('result').textContent).toBe('Inactive')
  })

  test('hidden input fields can have yes/no values', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="hidden" x-calculator-source="isConfirmed" value="yes">
        <span id="result" x-calculator-expression="isConfirmed ? 'Confirmed' : 'Not Confirmed'"></span>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('Confirmed')

    // Change hidden input value
    document.querySelector('input[type="hidden"]').value = 'no'
    document.querySelector('input[type="hidden"]').dispatchEvent(new Event('change'))

    expect(document.getElementById('result').textContent).toBe('Not Confirmed')
  })

  test('hidden input fields can have true/false values', async () => {
    document.body.innerHTML = `
      <div x-data>
        <input type="hidden" x-calculator-source="isEnabled" value="true">
        <span id="result" x-calculator-expression="isEnabled ? 'Enabled' : 'Disabled'"></span>
      </div>
    `
    await Promise.resolve()

    expect(document.getElementById('result').textContent).toBe('Enabled')

    // Change hidden input value
    document.querySelector('input[type="hidden"]').value = 'false'
    document.querySelector('input[type="hidden"]').dispatchEvent(new Event('change'))

    expect(document.getElementById('result').textContent).toBe('Disabled')
  })
})
