# AngularJS matchMediaLight Module

Provides an AngularJS service that sets and updates `$matchMedia` in `$rootScope` with the following information:

```js
$matchMedia = {
  size: "xs|sm|md|lg", // Current size of the screen
  retina: true|false, // Whether we're on high-DPI display
  print: true|false, // Whether we're printing
  dark: true|false // Whether we're in dark mode
}
```

Notably features are:

* Automatic setup (you only need to load the AngularJS module)
* Automatically sets and updates `$matchMedia` in `$rootScope`
* Properly detects print events and synchronizes AngularJS
* Reports light-dark color schemes

This project improves on jacopotarantino's excellent [angular-match-media](https://github.com/jacopotarantino/angular-match-media) library in various ways:

* Improved performance (code doesn't rely on `resize` events)
* Encourages developer to follow AngularJS's native functions (use `$watch` rather than specific functions)
* Properly detects screen resizes on print
* Loses compatibility with ancient browsers (pre-2014)

## Installation

Add `"angular-media-queries": "github:sentrysoftware/angular-match-media#v1.0.0"` to your `package.json`, and then run `npm i`.

Include `match-media-light.js` in your HTML, after AngularJS:

```html
<script type='text/javascript' src='...your-path-to/node_modules/angular-media-queries/match-media-light.js'></script>
```

## Usage

Require the `matchMediaLight` module as a dependency in your AngularJS application:

```js
// My AngularJS module declaration
var myApp = angular.module('myApp', ['matchMediaLight']);
```

And that's it, `$matchMedia` is now available in `$rootScope`, i.e. everywhere in your `myApp` AngularJS application!

### In HTML templates

In your HTML templates, you can then use:

```html
This is the current media type: {{ $matchMedia.size }} <br>
Theme is: {{ $matchMedia.dark ? 'dark' : 'light' }}
```

which will output:

```
This is the current media type: lg
Theme is: light
```

For example, you can dynamically add classes to the `<body>` element, depending on the size of the screen, to control the CSS:

```html
<body ng-class="'size-' + $matchMedia.size'>">
```

```css
body.size-xs h3 div {
  display: none;
}

body.size-sm {
  font-size: 10px;
}
```

### In a Controller

Simply inject `$rootScope` in your controller to access `$matchMedia` directly, or use `$watch('$matchMedia', myCallBack)` to react to media changes, as in the example below:

```js
angular.module('myApp', ['matchMediaLight']).controller('myController', ['$rootScope', function($rootScope) {
  console.log('Screen size is ' + $rootScope.$matchMedia.size);

  $rootScope.$watch('$matchMedia', function(media) {
    console.log('New size: ' + media.size);
    console.log('Retina: ' + media.retina);
    console.log('Dark: ' + media.dark);
    console.log('Print: ' + media.print);
  }, true);
}]);
```

### Custom Screen Sizes or Media Queries

By default, `$matchMedia.size` matches with Bootstrap 3.x screen sizes: `xs`, `sm`, `md`, and `lg`. You can customize the screen size categories (add or remove), and change the breakpoints.

This must be done during the initialization of your AngularJS module, with as in the example below:

```js
angular.module("myApp").config(["mediaWatcher", function(mediaWatcher) {
  // Add a `xl` size category for extra-large screens
  mediaWatcher.setRules({
    xl: "(min-width: 1980px)",
    lg: "(min-width: 1200px) and (max-width: 1979px)",
    md: "(min-width: 992px) and (max-width: 1199px)",
    sm: "(min-width: 768px) and (max-width: 991px)",
    xs: "(max-width: 767px)"
  });
}]);
```

## License

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/deed.en_US.

## Contributing

Please read our [contributor guide](https://sentrysoftware.org/contributing.html).
