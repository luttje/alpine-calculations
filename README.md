# Alpine Calculations

Easily collect values and perform calculations in [Alpine.js](https://alpinejs.dev/). Personally, I use this to perform calculations on
FilamentPHP forms, but it can be used in any environment where Alpine.js is used.

[![NPM Version](https://img.shields.io/npm/v/alpine-calculations)](https://www.npmjs.com/package/alpine-calculations)
[![Run tests](https://github.com/luttje/alpine-calculations/actions/workflows/tests.yml/badge.svg)](https://github.com/luttje/alpine-calculations/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/luttje/alpine-calculations/badge.svg?branch=main)](https://coveralls.io/github/luttje/alpine-calculations?branch=main)

> [!NOTE]
> This plugin is a proof-of-concept. I have not yet decided if I will continue maintaining this plugin, but I will keep it available
> for now.
> Alpine.js can already do all this with `x-model` and `x-effect`, but the main goal for me was to see if I could make the
> front-end for calculations in FilamentPHP cleaner and more readable.

## 💽 Installation

You can install this plugin in your project using either a CDN or NPM.

### CDN

Include the following script in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/alpine-calculations/dist/alpine-calculations.js" defer></script>
```

### NPM

```bash
npm install alpine-calculations
```

Enable the directives attributes in your project by registering the plugin with Alpine.js.

```js
import Alpine from 'alpinejs'
import Calculations from 'alpine-calculations'

Alpine.plugin(Calculations)

window.Alpine = Alpine
window.Alpine.start()
```

## 🛠️ Usage

[&raquo; See `examples/repeater.html` for a detailed example](examples/repeater.html)

To perform calculations, let's work with a simple example of a calculator that computes the total price based on a price and quantity input:

```html
<div x-data="{}">
    <h3>Simple Calculator</h3>
    
    <label>Price: 
        <input type="number" x-calculator-source="price" value="10">
    </label>
    
    <label>Quantity: 
        <input type="number" x-calculator-source="quantity" value="2">
    </label>
    
    <p>Total: $<span x-calculator-expression="price * quantity"></span></p>
</div>
```

> [!WARNING]
> This plugin uses `new Function()` to evaluate expressions, which is safe when expressions are static and developer-controlled, but becomes a security risk when user input is involved.
>
> Take note that the plugin is designed so that:
>
> - **Source values**: are automatically sanitized and may contain user content
> - **Expression content**: must always be developer-controlled and never contain user content
> - **User input in expressions**: are never supported!
>
> ### ❌ UNSAFE: Dynamic Expression Building
>
> **NEVER** concatenate user input into `x-calculator-expression`:
>
> ```html
> <!-- DANGEROUS: Don't do this -->
> <span x-calculator-expression="price + ${userInput}"></span>
> 
> <!-- DANGEROUS: Don't do this -->
> <span x-calculator-expression="price * getMultiplier('${userSelection}')"></span>
> ```
>
> ### ❌ UNSAFE: Server-Side Expression Generation
>
> **NEVER** build expressions from user input on the server:
>
> ```html
> <!-- DANGEROUS: Don't do this -->
> <span x-calculator-expression="<?php echo $baseExpression . $userFormula; ?>"></span>
> ```

### Using sumValuesWithId() Function

When you have multiple elements with the same source identifier, you can sum them up:

```html
<div x-data="{}">
    <h3>Multiple Items</h3>
    
    <div>Item 1: <input type="number" x-calculator-source="item_price" value="10"></div>
    <div>Item 2: <input type="number" x-calculator-source="item_price" value="15"></div>
    <div>Item 3: <input type="number" x-calculator-source="item_price" value="20"></div>
    
    <h4>Total: $<span x-calculator-expression="sumValuesWithId('item_price')"></span></h4>
</div>
```

*The price behind `Total: $` will automatically update as you change the values in the input fields. When opening the page it would show `Total: $45`.*

### Using this in FilamentPHP

You can use this plugin in FilamentPHP forms to perform calculations on form fields. For example, you can create a form that calculates
the total price based on multiple items in a repeater field:

Load it in your AppServiceProvider:

```php
use Filament\Support\Facades\FilamentAsset;
use Filament\Support\Assets\Js;

class AppServiceProvider extends ServiceProvider
{
    // ...

    public function boot(): void
    {
        FilamentAsset::register([
            Js::make('alpine-calculations', 'https://cdn.jsdelivr.net/npm/alpine-calculations/dist/alpine-calculations.js')
                ->core(),
        ]);
    }
}
```

Then implement it in your form:

```php
public function form(Form $form): Form
{
    return $form
        ->schema([
            Forms\Components\Repeater::make('items')
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->required(),
                    Forms\Components\TextInput::make('price')
                        ->numeric()
                        ->required()
                        ->extraInputAttributes([
                            'x-calculator-source' => 'price',
                        ]),
                ])
                ->columns(2),
            Forms\Components\TextInput::make('total')
                ->label('Total Price')
                ->readOnly()
                ->dehydrated(false)
                ->extraInputAttributes([
                    'x-calculator-expression' => 'sumValuesWithId("price")',
                ]),
        ]);
}
```

## 📚 Attribute Explanations

### 1. `x-calculator-source`

**Purpose**: Marks elements as data sources for calculations

**Usage**: `x-calculator-source="identifier"`

This directive tells the plugin to track the value of an element and make it available to calculations using the specified identifier.

**Example**:

```html
<input type="number" x-calculator-source="price" value="10">
<input type="number" x-calculator-source="quantity" value="2">
```

### 2. `x-calculator-expression`

**Purpose**: Evaluates mathematical expressions and displays results

**Usage**: `x-calculator-expression="mathematical_expression"`

This directive calculates the result of an expression and displays it in the element. The expression can reference any source identifiers.

**Example**:

```html
<span x-calculator-expression="price * quantity"></span>
```

### 3. `x-calculator-scope`

**Purpose**: Limits calculations to specific sections of your page

**Usage**: `x-calculator-scope` or `x-calculator-scope="css_selector"`

This attribute demarcates boundaries for calculations, useful when you have repeating sections that should calculate independently.

### 4. `x-calculator-precision`

**Purpose**: Controls the number of decimal places in calculations

**Usage**: `x-calculator-precision="number_of_decimal_places"`

This attribute specifies how many decimal places to show in the result of a calculation. It can be applied to any element with `x-calculator-expression`.

### 5. `x-calculator-locale`

**Purpose**: Sets the locale for number formatting

**Usage**: `x-calculator-locale="locale_string"`

This plugin will look for the `x-calculator-locale` attribute on the scope or body to determine the locale for number formatting. If not set, it defaults to whatever the user's browser setting is. This will affect how numbers are parsed and formatted from `input` elements of type `text` and non-input elements.

To override the number formatting locale, you can set the `x-calculator-locale` attribute on:

1. The element with `x-calculator-source` or `x-calculator-expression`
2. The source element's scope described with `x-calculator-scope`
3. On the `<body>` tag.

The plugin checks these in order and uses the first one it finds. If none are found, it defaults to whatever the user's browser setting is (through `new Intl.NumberFormat().resolvedOptions().locale`).

```html
<body x-calculator-locale="en-US">
```

*The value should be a valid locale string, such as `en-US`, `fr-FR`, etc.*

> [!NOTE]
> Dynamically changing the locale attribute value is not yet supported.

You can change the name of the attribute used for localization in [the plugin configuration](#-configuration).

## 🐦‍🔥 Advanced Features

### Scoped Calculations

Use `x-calculator-scope` to create independent calculation areas:

```html
<div x-data="{}">
    <h3>Multiple Calculators</h3>
    
    <!-- Calculator 1 -->
    <div x-calculator-scope class="calculator">
        <h4>Calculator 1</h4>
        <input type="number" x-calculator-source="price" value="10">
        x
        <input type="number" x-calculator-source="quantity" value="2">
        <p>Total: <span x-calculator-expression="price * quantity"></span></p>
    </div>
    
    <!-- Calculator 2 -->
    <div x-calculator-scope class="calculator">
        <h4>Calculator 2</h4>
        <input type="number" x-calculator-source="price" value="5">
        x
        <input type="number" x-calculator-source="quantity" value="3">
        <p>Total: <span x-calculator-expression="price * quantity"></span></p>
    </div>
</div>
```

### Number Formatting

Use `x-calculator-precision` to control decimal places, for example to show tax with two decimal places:

```html
<div x-data="{}">
    <input type="number" x-calculator-source="price" value="10.99" step="0.01">
    <input type="number" x-calculator-source="tax_rate" value="0.08" step="0.01">
    
    <p>Tax: $<span x-calculator-expression="price * tax_rate" x-calculator-precision="2"></span></p>
</div>
```

## 🧩 Configuration

You can configure the plugin to change its behavior globally when initializing Alpine.js:

```javascript
import AlpineCalculator from 'alpine-calculations';

Alpine.plugin(
    AlpineCalculator.configure({
        handleNaN: () => 'N/A' // Return 'N/A' instead of NaN for invalid calculations
    })
);

Alpine.start();
```

### Handling NaN Values

You can set a custom handler for `NaN` values that may occur during calculations:

```javascript
AlpineCalculator.configure({
    handleNaN: () => 'N/A' // Return 'N/A' instead of NaN for invalid calculations
})
```

### Localization Attribute

You can change what the number formatting localization attribute is by configuring the plugin:

```javascript
AlpineCalculator.configure({
    localeAttribute: 'x-lang' // Change it to match your project's conventions
});
```
