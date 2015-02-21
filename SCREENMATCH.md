# angular-screenmatch
Angular API for calculating screen sizes with matchMedia.
- ngIf style directive
- match on load
- match on change
- match once, then execute function
- create custom rules
- use or extend matchMedia and Bootstrap 3 rules
- window resize event broadcast, with debounce (optional)

##Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using the Directive](#using-the-directive)
  - [In a Controller](#in-a-controller)
  - [How resize events are handled](#how-resize-events-are-handled)
- [Configuration](#configuration)
- [API](#api)

##Installation

#####Install

```html
<script src='/path/to/your/modules/screenmatch.js'></script>
```

You will need to include the [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) for <IE10 support


#####Declare module as a dependency

```javascript
angular.module('yourmodule', ['angular.screenmatch']);
```

#####Inject screenmatch into a Controller

```javascript
angular.controller('YourController', function(screenmatch) {
    screenmatch.once('sm', function () {
        console.log('we logged a match to sm!');
    };
};
```
##Usage

####Using the Directive

The directive is super easy to use.  Just assign a string that you want it to watch, and it will behave like `ngIf`.

```html
<div asm-screen="md, lg">
    <p>I will only appear on medium and large screens!</p>
</div>
```

####In a Controller

Assign a variable to `bind` and then update it on callback, to always reflect the truthiness of the string passed in.  In the following example, `scope.portable` will be True if the screen is xs or sm, else it will be False.

```javascript
scope.portable = screenmatch.bind('xs, sm', function (match) {
    scope.portable = match;
}, scope);
```

You can also use `bind` to conditionally execute code when the screen size changes.  The callback will execute every time the condition changes (not every time the screen resizes).

```javascript
screenmatch.bind('lg', function(match) {
    if (match) {
        startAnimation()
    } else {
        stopAnimation()
    }
}, scope);

```
The third argument `scope` is the scope you want to attach a listener too.  When that scope is destroyed, the listener will deregister.  You can omit the third argument and it will listen on `$rootScope` indefinitely instead. Check out the [section on how resize events are handled for details](#how-resize-events-are-handled).

If you only want to execute some code when a screen size is initially matched, execute it in the callback for `once`. This is great for things like loading data from a backend.

```javascript
screenmatch.once('lg', function () {
    myImgService.get(data);
});
```
`once` attempts to find a match on load and if it fails, registers a listener which will check conditions each time the screen resizes.  The listener is always unregistered once the callback has executed, even if you skip the scope argument.


If you don't care about resize events and just want to check the screen size on load, you can use `is` for a one time binding.

```javascript
var smallScreen = screenmatch.is('sm, xs');
if (smallScreen) {
    smallSpinnerLoad()
}
```

Just remember that `is` will not update if the screen is resized.  It may be more practical to use either `bind` or `once`.

####How resize events are handled
A single event listener is added to `$window` which broadcasts resize events using `$rootScope.$broadcast`.  The broadcast is wrapped in an `$interval` with a configurable debounce setting, to delay firing it when the window resizes. 

This prevents having to bind an event listener to `$window` every time a directive is used or an angular binding is made.  Instead, scope is passed as an argument to `bind` or `once` and a listener is registered using `scope.$on`.  The listener will deregister whenever the scope is destroyed.

To create a permanent listener, the `scope` argument can be omitted from either `bind` or `once` and it will default to listening on `$rootScope`.  Use this sparingly! There is no easy way to deregister these listeners, although `once` will deregister itself if it finds a match.

You can hook into the `$broadcast` event anywhere else in your project by registering your own listener. Again, the listener will deregister when the associated scope is destroyed, or you call `$rootScope.$on` and it will listen indefinitely.

```javascript
scope.$on('screenmatch::resize', function () {
    doMyOwnResizeTask()
});
```

The binding of the `$window` event listener can be prevented during configuration if you don't want to use it.  Doing this will prevent `bind` and `once` from dynamically updating after the initial load.  <b>It is not recommended</b> unless you only want to calculate the screen size on load.  Disabling the event listener will also stop the directive updating dynamically, but it will still work on load.


##Configuration

All of the configuration options are set in the angular module config block by injecting `screenmatchConfigProvider`. If they are not set, the defaults are used.

####Configure Rules

There are several ways to customise the rules used to match against.  

#####Predefined rules.

To use a predefined set of rules, assign a string to `screenmatchConfigProvider.config.rules`. 

```javascript
angular.module('yourmodule')
    .config(function(screenmatchConfigProvider) {
        screenmatchConfigProvider.config.rules = 'matchmedia';
    });
```

There are currently two predefined sets, `bootstrap` for Bootstrap 3, or `matchmedia` for MatchMedia devices.

```javascript
bootstrap : {
    lg: '(min-width: 1200px)',
    md: '(min-width: 992px) and (max-width: 1199px)',
    sm: '(min-width: 768px) and (max-width: 991px)',
    xs: '(max-width: 767px)'
};

matchmedia : {
    print : 'print',
    screen : 'screen',
    phone : '(max-width: 767px)',
    tablet : '(min-width: 768px) and (max-width: 991px)',
    desktop : '(min-width: 992px)',
    portrait : '(orientation: portrait)',
    landscape : '(orientation: landscape)'
};
```

The default is Bootstrap 3.

#####Custom rules

To use a custom set of rules, assign an object instead.  The values must be strings, to match against CSS media queries.

```javascript
.config(function(screenmatchConfigProvider) {
    screenmatchConfigProvider.config.rules = {
        tiny : '(max-width: 320px)',
        phablet : '(min-width: 321px) and (max-width: 991px)',
        standard : '(min-width: 992px) and (max-width: 1280px)',
        big: '(min-width: 1281px)'
    };
});
```

#####Add rules

If you want to add rules to one of the predefined sets, use `screenmatchConfigProvider.config.extrarules`.
Assign a valid object and the rules will be added to whichever set is in use.

```javascript
.config(function(screenmatchConfigProvider) {
    screenmatchConfigProvider.config.extrarules = {
        //added to default bootstrap set
        xl : '(min-width: 1600px)'
    };
});
```

####Configure the resize broadcast

#####Debounce

To set the delay between the window resizing and the broadcast, use `screenmatchConfigProvider.config.debounce`.
Assign an int for a delay in ms. The default is 250.

```javascript
.config(function(screenmatchConfigProvider) {
    screenmatchConfigProvider.config.debounce = 500;
});
```

#####Disable the event listener

To disable binding a `$window` resize event listener, and any related functionality, use `screenmatchConfigProvider.config.nobind`.

```javascript
.config(function(screenmatchConfigProvider) {
    screenmatchConfigProvider.config.nobind = true;
});
```

##API

#####`screenmatch.is(string)`
>Checks a list of values for matchmedia truthiness. Only triggers once, on load.
>
>For resize events, you should use `bind` or `once` instead.
>######argument
>String containing a comma separated list of values to match.
>######returns
>True if any of the values is a match, else False.

#####`screenmatch.bind(string, callback, scope)`
>Watches a list of values for matchmedia truthiness.   Executes a callback if the truthiness changes.
>
>######arguments
>String containing a comma separated list of values to match. 
>
>Callback function to execute.
>
>Scope to register the listener on. Defaults to $rootScope if omitted.
>######returns
>True if any of the values is a match, else False.
>
>Callback also returns True if a match, else False.
 
#####`screenmatch.once(string, callback, scope)`
>Watches a list of values for matchmedia truthiness. 
>Executes a callback when it finds a match, then stops watching. The callback will only execute once.
>
>######arguments
>String containing a comma separated list of values to watch. 
> 
>Callback function to execute.
>
>Scope to register the listener on. Defaults to $rootScope if omitted.
>######returns
>No return value. Callback will only execute on successful match.


####TODO


credits


package w/bower


unit tests

