# Alpine Calculations

Easily collect values and perform calculations in Alpine.js. Personally, I use this to perform calculations on
FilamentPHP forms, but it can be used in any environment where Alpine.js is used.

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/luttje/alpine-calculations?label=version&style=flat-square)
![Build size Brotli](https://img.badgesize.io/luttje/alpine-calculations/main/dist/alpine-calculations.js.svg?compression=gzip&style=flat-square&color=green)

> [!NOTE]
> This plugin is a proof-of-concept. I have not yet decided if I will continue maintaining this plugin, but I will keep it available
> for now.
> AlpineJS can already do all this with `x-model` and `x-effect`, but the main goal for me was to see if I could make the
> front-end for calculations in FilamentPHP cleaner and more readable.

## About

This plugin adds simple directives that work together to create dynamic calculations that automatically update when values change.

## Installation

### NPM

```bash
npm install alpine-calculations
```

Enable the directives attributes in your project by registering the plugin with Alpine.

```js
import Alpine from 'alpinejs'
import Calculations from 'alpine-calculations'

Alpine.plugin(Calculations)

window.Alpine = Alpine
window.Alpine.start()
```

## Usage

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

> [!WARNING]
> This example isn't yet tested, but it should give you an idea of how to use the plugin in a FilamentPHP form and why it might be useful.

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
                        ->money()
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

## Core Directives

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

This directive creates boundaries for calculations, useful when you have repeating sections that should calculate independently.

## Advanced Features

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

## Configuration

You can customize how `NaN` values are handled by configuring the plugin before starting Alpine.js:

```javascript
import AlpineCalculator from 'alpine-calculations';

Alpine.plugin(
    AlpineCalculator.configure({
        handleNaN: () => 'N/A' // Return 'N/A' instead of NaN for invalid calculations
    })
);

Alpine.start();
```
