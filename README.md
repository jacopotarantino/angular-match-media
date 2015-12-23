# Angular matchMedia Module

Provides an Angular service that returns true if the current screen width matches or false if not. Uses the screen widths predefined in Twitter Bootstrap 3 or a customized size you define. There is a staic method `is` which checks for a match on page load and a dynamic method `on` which checks for a match and updates the value on window resize.

## Installation

Download the component via bower:
```bash
bower install --save angular-media-queries
```

Include AngularJS on the page and then include this script. If possible, include these scripts in the footer of your site before the closing `</body>` tag.
```html
<script type='text/javascript' src='/static/path/to/angular.min.js'></script>
<script type='text/javascript' src='/static/path/to/angular-media-queries/match-media.js'></script>
```

## Usage

Require the `matchMedia` module as a dependency in your app:
```javascript
angular.module('myApp', ['matchMedia'])
```

### In a Controller

#### Is
Use the service's `is` method to determine if the screensize matches the given string/array.
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  var data = complicatedChartData;

  //Determine to either perform cpu/network-intensive actions(desktop) or retrieve a small static image(mobile). 
  if (screenSize.is('xs, sm')) {
    // it's a mobile device so fetch a small image
    $http.post('/imageGenerator', data)
    .success(function (response) {
      document.querySelector('.chart').src = response.chartUrl;
    });
  }
  else {
    // it's a desktop size so do the complicated calculations and render that
    document.querySelector('.chart')
    .appendCanvas()
    .parseData()
    .renderCrazyChart();
  }
}]);
```

#### On
The callback fed to `.on` will execute on every window resize and takes the truthiness of the media query as its first argument.
Be careful using this method as `resize` events fire often and can bog down your application if not handled properly.
 - Executes the callback function on window resize with the match truthiness as the first argument.
 - Returns the current match truthiness.
 - Passing $scope as a third parameter is optional, when not passed it will use $rootScope

```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  $scope.isMobile = screenSize.on('xs, sm', function(isMatch){
    $scope.isMobile = isMatch;
  });
}]);
```

#### When
If you only want the callback to fire while in the correct screensize, use the `when` method.
Be careful using this method as `resize` events fire often and can bog down your application if not handled properly.
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {

    // Will fire as long as the screen is size between 768px and 991px
    screenSize.when('sm', function() {
        console.log('Your screen size at the moment is between 768px and 991px.');
    });
}]);
```

#### OnChange
The callback fed to `.onChange` will execute on every window resize and takes the truthiness of the media query as its first argument.
Be careful using this method as `resize` events fire often and can bog down your application if not handled properly.
 - Executes the callback function ONLY when the match differs from previous match.
 - Returns the current match truthiness.
 - The 'scope' parameter is required for cleanup reasons (destroy event).

```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  $scope.isMobile = screenSize.onChange('xs, sm', function(isMatch){
    $scope.isMobile = isMatch;
  });
}]);
```

#### isRetina
This will return a boolean to indicate if the current screen is hi-def/retina.
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  $scope.isRetina = screenSize.isRetina;
}]);
```

### Filter

Operate on string values with the filter: Have the placeholder sign % replaced by the actual media query rule name.

#### Example:
```html
    <div> {{'Your screen size is: ' | media }} "</div>
```

#### Example with replace:
```html
    <div ng-include="'/views/_partials/_team_%.html' | media:{ replace: '%' }"></div>
```

#### Extended example:
```html
    <div ng-include="'/views/_partials/_team_%.html' | media:{ replace: '%', groups: { mobile:['ti','xs','sm'], desktop:['md','lg'] } }"></div>
```

### ngIf Example

In your controller you can create variables that correspond to screen sizes. For example add the following to your controller:
```javascript
// Using static method `is`
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  $scope.desktop = screenSize.is('md, lg');
  $scope.mobile = screenSize.is('xs, sm');
}]);

// Using dynamic method `on`, which will set the variables initially and then update the variable on window resize
$scope.desktop = screenSize.on('md, lg', function(match){
    $scope.desktop = match;
});
$scope.mobile = screenSize.on('xs, sm', function(match){
    $scope.mobile = match;
});
```

Then in your HTML you can show or hide content using ngIf or similar directives that take an Angular expression:
```javascript
<img ng-if='desktop' ng-src='http://example.com/path/to/giant/image.jpg'>
```
This particular example is great for only loading large, unnecessary images on desktop computers.

Note: It's important if you plan on using screensize.is() in directives to assign its return value to a scoped variable. If you don't, it will only be evaluated once and will not update if the window is resized or if a mobile device is turned sideways.

### Custom Screen Sizes or Media Queries

You can access and therefore customize the media queries or create your own:
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  screenSize.rules = {
    retina: 'only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)',
    superJumbo: '(min-width: 2000px)',

  };

  if (screenSize.is('retina')) {
    // switch out regular images for hi-dpi ones
  }

  if (screenSize.is('superJumbo')) {
    // do something for enormous screens
  }
}]);
```

## License

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/deed.en_US.

## Contributors

* Module roughly based on https://github.com/chrismatheson/ngMediaFilter
* Polyfill from https://github.com/paulirish/matchMedia.js/
* @jacopotarantino
* @thatmarvin
* Matthias Max @bitflowertweets

## Todo

* Write tests.
* Add a simple directive wrapper for ng-if.
* Add Grunt tasks.
