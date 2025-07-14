(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /**
   * AlpineJS Calculator Plugin
   *
   * A lightweight plugin for dynamic calculations in AlpineJS applications.
   * Provides directives for seamless reactive calculations.
   */

  const ATTRIBUTE_NAME_SCOPE = 'x-calculator-scope';

  /**
   * Configuration settings
   */
  const config = {
    /**
     * Default handler for NaN values.
     */
    handleNaN: value => value,
    /**
     * Default attribute name for locale override
     */
    localeAttribute: 'x-calculator-locale'
  };

  /**
   * Parses a localized number string as a float using the current locale.
   *
   * @param {string} str - The localized number string to parse
   * @param {string} [locale] - Optional locale string (defaults to current locale)
   * @returns {number} The parsed float number or NaN if parsing fails
   */
  function parseLocaleNumber(str, locale) {
    if (typeof str !== 'string') {
      return NaN;
    }

    // Trim whitespace
    str = str.trim();
    if (str === '') {
      return NaN;
    }

    // Get locale-specific formatting info
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1234.5);

    // Extract decimal and group separators from the locale
    const decimalSep = parts.find(part => part.type === 'decimal')?.value || '.';
    const groupSep = parts.find(part => part.type === 'group')?.value || ',';

    // Handle negative numbers
    const isNegative = str.startsWith('-') || str.startsWith('+');
    const sign = str.startsWith('-') ? -1 : 1;
    if (isNegative) {
      str = str.substring(1);
    }
    let cleanStr = str;

    // Escapes special regex characters
    const escapeRegex = /[.*+?^${}()|[\]\\]/g;
    const regexEscape = s => s.replace(escapeRegex, '\\$&');

    // Remove group separators (thousands separators)
    if (groupSep !== decimalSep) {
      // Handle the case where input might have regular spaces but locale uses non-breaking spaces
      // or vice versa. We'll try to remove both the expected separator and common alternatives
      const separatorsToRemove = [groupSep, '\u00A0', ' ', '\u2009', '\u2005'];
      for (const sep of separatorsToRemove) {
        const escapedSep = regexEscape(sep);
        const regex = new RegExp(escapedSep, 'g');
        cleanStr = cleanStr.replace(regex, '');
      }
    }

    // Convert decimal separator to standard dot
    if (decimalSep !== '.') {
      const escapedDecimalSep = regexEscape(decimalSep);

      // Check for multiple decimal separators (invalid)
      const decimalMatches = cleanStr.match(new RegExp(escapedDecimalSep, 'g'));
      if (decimalMatches && decimalMatches.length > 1) {
        return NaN;
      }
      cleanStr = cleanStr.replace(new RegExp(escapedDecimalSep, 'g'), '.');
    } else {
      // For standard dot decimal separator, check for multiple dots
      const dotMatches = cleanStr.match(/\./g);
      if (dotMatches && dotMatches.length > 1) {
        return NaN;
      }
    }

    // Additional validation: empty string after cleaning should be NaN
    if (cleanStr === '' || cleanStr === '.') {
      return NaN;
    }

    // Parse the cleaned string
    const result = parseFloat(cleanStr);
    if (isNaN(result)) {
      return NaN;
    }

    // Validate the result by checking if the cleaned string contains only valid characters
    // Allow scientific notation (e/E) and basic number characters
    if (!/^[0-9]*\.?[0-9]*([eE][+-]?[0-9]+)?$/.test(cleanStr)) {
      return NaN;
    }
    return result * sign;
  }
  function AlpineCalculator(Alpine) {
    // Global registry to track all calculator sources
    const sourceRegistry = new Map();
    const expressionRegistry = new Map();

    /**
     * Retrieves all sources with a specific ID
     *
     * @param {string} id - The source ID to search for
     * @returns {Array} Array of source objects
     */
    const getSourcesById = id => {
      return Array.from(sourceRegistry.values()).filter(source => source.id === id);
    };

    /**
     * Sums all numeric values with a specific ID
     *
     * @param {string} id - The source ID to sum
     * @returns {number} Sum of all values
     */
    const sumValuesWithId = id => {
      return getSourcesById(id).reduce((sum, source) => {
        const value = source.getValue() || 0;
        return sum + value;
      }, 0);
    };

    /**
     * Finds sources within a specific scope element
     *
     * @param {Element} scopeElement - The scope boundary element
     * @param {string} id - The source ID to search for
     * @returns {Array} Array of scoped source objects
     */
    const getScopedSources = (scopeElement, id) => {
      return Array.from(sourceRegistry.values()).filter(source => source.id === id && scopeElement.contains(source.element));
    };

    /**
     * Gets the first scoped value by ID within a scope
     *
     * @param {Element} scopeElement - The scope boundary element
     * @param {string} id - The source ID
     * @returns {number} The first matching value or 0
     */
    const getScopedValue = (scopeElement, id) => {
      const sources = getScopedSources(scopeElement, id);
      return sources.length > 0 ? sources[0].getValue() || 0 : 0;
    };

    /**
     * Traverses up the DOM tree to find the closest scope element
     *
     * @param {Element} element - Starting element
     * @param {string} scopeSelector - CSS selector for scope boundary
     * @returns {Element} The scope element or document
     */
    const findScope = (element, scopeSelector) => {
      if (!scopeSelector) return document;
      let current = element;
      while (current && current !== document) {
        if (current.matches && current.matches(scopeSelector)) {
          return current;
        }
        current = current.parentElement;
      }
      return document;
    };

    /**
     * Creates an evaluation context with utility functions and scoped values
     *
     * @param {Element} scopeElement - The scope boundary element
     * @returns {Object} Context object for expression evaluation
     */
    const createEvaluationContext = scopeElement => {
      const context = {
        sumValuesWithId
      };
      if (scopeElement !== document) {
        // Scoped context: only include sources within this scope
        const scopedSources = Array.from(sourceRegistry.values()).filter(source => scopeElement.contains(source.element));
        const sourceIds = new Set(scopedSources.map(source => source.id));
        sourceIds.forEach(id => {
          context[id] = getScopedValue(scopeElement, id);
        });
      } else {
        // Global context: include all sources
        const allSources = Array.from(sourceRegistry.values());
        const sourceGroups = {};
        allSources.forEach(source => {
          const value = source.getValue() || 0;
          if (!sourceGroups[source.id]) {
            sourceGroups[source.id] = [];
          }
          sourceGroups[source.id].push(value);
        });

        // Add single values directly, arrays for multiple values
        Object.entries(sourceGroups).forEach(([id, values]) => {
          context[id] = values.length === 1 ? values[0] : values;
        });
      }
      return context;
    };

    /**
     * Safely evaluates mathematical expressions with a limited context
     *
     * @param {string} expression - The expression to evaluate
     * @param {Object} context - Variables and functions available to the expression
     * @returns {number} Result of the expression or 0 on error
     */
    const evaluateExpression = (expression, context) => {
      try {
        const func = new Function(...Object.keys(context), `return ${expression}`);
        return func(...Object.values(context));
      } catch (error) {
        console.warn('Calculator expression evaluation error:', error);
        return 0;
      }
    };

    /**
     * Triggers updates for expressions that depend on a source ID
     *
     * @param {string} id - The source ID that changed
     * @param {Element} changedElement - The element that triggered the change
     */
    const triggerUpdatesForId = (id, changedElement = null) => {
      for (const [element, expressionData] of expressionRegistry.entries()) {
        if (expressionData.expression.includes(id)) {
          // Check scope constraints
          if (changedElement && expressionData.scopeElement && expressionData.scopeElement !== document) {
            if (!expressionData.scopeElement.contains(changedElement)) {
              continue;
            }
          }
          expressionData.update();
        }
      }
    };

    /**
     * Triggers global recalculation (used when sources are removed)
     */
    const triggerGlobalRecalculation = () => {
      // Update all expressions
      for (const [element, expressionData] of expressionRegistry.entries()) {
        expressionData.update();
      }
    };

    /**
     * Gets the locale override from an element's attribute
     *
     * @param {Element} element - The element to check for locale override
     * @returns {string|undefined} The locale override or undefined if not set
     */
    const getLocaleOverride = element => {
      // If the element has a locale override attribute, use it
      let localeOverride = element.getAttribute(config.localeAttribute);

      // If it has no locale override, check the scope
      if (!localeOverride && element.hasAttribute(ATTRIBUTE_NAME_SCOPE)) {
        const scopeSelector = element.getAttribute(ATTRIBUTE_NAME_SCOPE);
        const scopeElement = findScope(element, scopeSelector);
        localeOverride = scopeElement.getAttribute(config.localeAttribute);
      }

      // If still no locale override, check the body attribute which will return null if not set
      if (!localeOverride) {
        localeOverride = document.body.getAttribute(config.localeAttribute);
      }
      if (!localeOverride) {
        return undefined;
      }
      return localeOverride;
    };

    /**
     * Extracts numeric value from various element types
     *
     * @param {Element} element - The element to extract value from
     * @returns {string|number} Raw value for parsing
     */
    const extractElementValue = element => {
      let localeOverride = getLocaleOverride(element);
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // In JavaScript, the .value property of an `<input type="number">` will always return
        // a string in the standard format (using a dot as the decimal separator) regardless of
        // the user's locale.
        if (element.type === 'number') {
          return parseFloat(element.value) || 0;
        }

        // For other input types, we must parse the value as a locale string
        return parseLocaleNumber(element.value, localeOverride);
      }
      return parseLocaleNumber(element.textContent, localeOverride);
    };

    /**
     * Updates element content with calculated result
     *
     * @param {Element} element - The element to update
     * @param {*} result - The calculated result
     * @param {number} [decimalPlaces] - Number of decimal places to fix
     */
    const updateElementContent = (element, result, decimalPlaces) => {
      if (isNaN(result)) {
        result = config.handleNaN(result);
      }
      let localeOverride = getLocaleOverride(element);
      let formattedResult = typeof result === 'number' ? decimalPlaces ? result.toLocaleString(localeOverride, {
        minimumFractionDigits: parseInt(decimalPlaces),
        maximumFractionDigits: parseInt(decimalPlaces)
      }) : result.toLocaleString(localeOverride) : result;
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const isNumericInput = element.type === 'number';
        if (isNumericInput) {
          // For numeric inputs we must use en-US notation when setting it
          formattedResult = decimalPlaces ? result.toFixed(parseInt(decimalPlaces)) : result;
        }
        element.value = formattedResult;
      } else {
        element.textContent = formattedResult;
      }
    };

    /**
     * Directive: x-calculator-source
     *
     * Marks elements as calculation sources and tracks their values
     */
    Alpine.directive('calculator-source', (el, {
      expression
    }, {
      cleanup
    }) => {
      const sourceId = expression;

      // Create an object used to interface with the source
      const source = {
        id: sourceId,
        element: el,
        getValue: () => extractElementValue(el)
      };
      sourceRegistry.set(el, source);

      // Trigger global recalculation when new source is registered
      // This ensures expressions that depend on sumValuesWithId get updated
      triggerGlobalRecalculation();

      // Set up event listeners for value changes on this source
      const events = ['input', 'change', 'keyup'];
      const updateHandler = () => triggerUpdatesForId(sourceId, el);
      events.forEach(event => {
        el.addEventListener(event, updateHandler);
      });

      // Cleanup when directive is removed
      cleanup(() => {
        sourceRegistry.delete(el);

        // Detach event listeners
        events.forEach(event => {
          el.removeEventListener(event, updateHandler);
        });

        // Trigger global recalculation after source removal
        // Delay a frame to make sure DOM cleanup is complete
        setTimeout(() => {
          triggerGlobalRecalculation();
        }, 0);
      });
    });

    /**
     * Directive: x-calculator-expression
     *
     * Evaluates expressions and updates element content reactively
     */
    Alpine.directive('calculator-expression', (el, {
      expression
    }, {
      effect,
      cleanup
    }) => {
      let scopeElement = document;

      // Determine scope element so we can isolate the values on which this expression depends
      if (el.hasAttribute(ATTRIBUTE_NAME_SCOPE)) {
        const scopeSelector = el.getAttribute(ATTRIBUTE_NAME_SCOPE);
        scopeElement = scopeSelector ? findScope(el, scopeSelector) : el;
      } else {
        // Traverse parents to find one that limits scope with x-calculator-scope
        let current = el.parentElement;
        while (current && current !== document) {
          if (current.hasAttribute(ATTRIBUTE_NAME_SCOPE)) {
            const scopeSelector = current.getAttribute(ATTRIBUTE_NAME_SCOPE);
            scopeElement = scopeSelector ? findScope(current, scopeSelector) : current;
            break;
          }
          current = current.parentElement;
        }
      }
      const updateExpression = () => {
        const context = createEvaluationContext(scopeElement);
        const result = evaluateExpression(expression, context);

        // Store previous value to detect changes
        const previousValue = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.textContent;

        // Update element content
        updateElementContent(el, result, el.getAttribute('x-calculator-precision'));

        // If this element is also a source and its value changed, trigger cascading updates
        const source = sourceRegistry.get(el);
        if (source) {
          const currentValue = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.textContent;
          if (currentValue !== previousValue) {
            triggerUpdatesForId(source.id, el);
          }
        }
      };

      // Register expression for dependency tracking
      expressionRegistry.set(el, {
        expression,
        update: updateExpression,
        scopeElement
      });

      // Initial calculation
      updateExpression();

      // Set up reactive effect
      effect(updateExpression);

      // Cleanup when directive is removed
      cleanup(() => {
        expressionRegistry.delete(el);
      });
    });

    /**
     * Directive: x-calculator-scope
     *
     * Defines calculation scope boundaries for isolation
     */
    Alpine.directive('calculator-scope', (el, {
      expression
    }, {
      cleanup
    }) => {
      // Store scope selector for reference
      el._calculatorScope = expression;

      // Cleanup when directive is removed
      cleanup(() => {
        delete el._calculatorScope;
      });
    });
    Alpine.calculator = AlpineCalculator;

    // Trigger an event that we're ready
    const event = new CustomEvent('alpine:calculator:ready', {
      detail: {
        calculator: AlpineCalculator
      }
    });
    document.dispatchEvent(event);
  }

  // Configuration function for future extensibility
  AlpineCalculator.configure = (desiredConfig = {}) => {
    if (typeof desiredConfig['handleNaN'] === 'function') {
      // Allow custom handling of NaN values in expressions
      config.handleNaN = desiredConfig.handleNaN;
    }
    if (typeof desiredConfig['localeAttribute'] === 'string') {
      // Allow custom attribute name for locale overrides
      config.localeAttribute = desiredConfig.localeAttribute;
    }
    return AlpineCalculator;
  };

  document.addEventListener('alpine:initializing', () => {
    AlpineCalculator(window.Alpine);
  });

}));
//# sourceMappingURL=alpine-calculations.js.map
