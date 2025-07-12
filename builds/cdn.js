import calculations from '../src/index'

document.addEventListener('alpine:initializing', () => {
  calculations(window.Alpine)
})
