# Angular matchMedia Module

Provides an Angular service that returns true if the current screen width matches or false if not. Uses the screen widths from Twitter Bootstrap 3.

## Installation

Include AngularJS on the page and then include this script. If possible, include these scripts in the footer of your site before the closing `</body>` tag.
```html
<script type='text/javascript' src='/static/path/to/angular.min.js'></script>
<script type='text/javascript' src='/static/path/to/angular-match-media/match-media.js'></script>
```

## Usage

Require the `matchMedia` module as a dependency in your app:
```javascript
angular.module('myApp', ['matchMedia'])
```

### In a Controller

Use the service to determine if you should perform certain cpu/network-intensive actions:
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  var data = complicatedChartData;

  if (screensize.is('xs, sm')) {
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

### ngIf Example

In your controller you can create variables that correspond to screen sizes. For example add the following to your controller:
```javascript
angular.module('myApp', ['matchMedia'])
.controller('mainController', ['screenSize', function (screenSize) {
  $scope.desktop = screenSize.is('md,lg');
  $scope.mobile = screenSize.is('xs, sm');
}]);
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

## Todo

* Write tests.
* Add a simple directive wrapper for ng-if.
* Add Grunt tasks.
* Move to bower?
