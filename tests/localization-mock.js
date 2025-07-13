const originalToLocaleString = Number.prototype.toLocaleString

const originalNumberFormat = Intl.NumberFormat;

export function mockLocale(desiredLocale) {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    value: desiredLocale
  });

  Number.prototype.toLocaleString = function (locale, options) {
    return originalToLocaleString.call(this, desiredLocale, options)
  }

  jest.spyOn(Intl, 'NumberFormat').mockImplementation((locale, options) => {
    // If no locale is explicitly provided, use the desiredLocale, otherwise use the explicit locale
    return new originalNumberFormat(locale || desiredLocale, options);
  })
}

export function resetLocale() {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    value: 'en-US'
  });

  Number.prototype.toLocaleString = originalToLocaleString

  Intl.NumberFormat.mockRestore();
}
