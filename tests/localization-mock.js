const originalToLocaleString = Number.prototype.toLocaleString

export function mockLocale(desiredLocale) {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    value: desiredLocale
  });

  Number.prototype.toLocaleString = function (locale, options) {
    return originalToLocaleString.call(this, desiredLocale, options)
  }
}

export function resetLocale() {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    value: 'en-US'
  });
  Number.prototype.toLocaleString = originalToLocaleString
}
