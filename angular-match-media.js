(function () {
  'use strict';

  /*
   * Angular matchMedia Module
   * Version 0.4.1
   * Uses Bootstrap 3 breakpoint sizes
   * Exposes service "screenSize" which returns true if breakpoint(s) matches.
   * Includes matchMedia polyfill for backward compatibility.
   * Copyright © 2013-2014 Jack Tarantino.
   **/

  angular.module('matchMedia', []);
  angular.module('angular-match-media', ['matchMedia']);

  angular.module('matchMedia')    
    .provider('screenSize', screenSizeProvider)
    .filter('media', mediaFilter)
    //private
    .run(initializeNgMatchMedia)
    .factory('matchMediaUtils', matchMediaUtilsFactory)
    .factory('matchMediaListenerStore', matchMediaListenerStoreFactory);

  initializeNgMatchMedia.$inject = ['$window'];
  function initializeNgMatchMedia($window) {
    /*! matchMedia() polyfill - Test a CSS media type/query in JS.
     * Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight.
     * Dual MIT/BSD license
     **/

    $window.matchMedia || ($window.matchMedia = function matchMediaPolyfill() {

      // For browsers that support matchMedium api such as IE 9 and webkit
      var styleMedia = $window.styleMedia || window.media,
        document = $window.document;


      // For those that don't support matchMedium
      if (!styleMedia) {
        var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

        style.type = 'text/css';
        style.id = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8
        // 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in $window) && $window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
          matchMedium: function (media) {
            var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

            // 'style.styleSheet' is used by IE <= 8
            // 'style.textContent' for all other browsers
            if (style.styleSheet) {
              style.styleSheet.cssText = text;
            } else {
              style.textContent = text;
            }

            // Test if media query is true or false
            return info.width === '1px';
          }
        };
      }

      return function (media) {
        return {
          matches: styleMedia.matchMedium(media || 'all'),
          media: media || 'all'
        };
      };
    } ());
  }

  // takes a comma-separated list of screen sizes to match.
  // returns true if any of them match.    
  function screenSizeProvider() {
    angular.extend(this, {
      defaultRules: {
        lg: '(min-width: 1200px)',
        md: '(min-width: 992px) and (max-width: 1199px)',
        sm: '(min-width: 768px) and (max-width: 991px)',
        xs: '(max-width: 767px)'
      },

      $get: getScreenSizeProviderService
    });
  }

  getScreenSizeProviderService.$inject = ['$rootScope', '$window', 'matchMediaUtils', 'matchMediaListenerStore'];
  function getScreenSizeProviderService($rootScope, $window, matchMediaUtils, matchMediaListenerStore) {
    var context = this;

    return {
      is: defaultIs,
      get: defaultGet,
      on: defaultOn,
      when: defaultWhen,
      destroy: defaultDestroy,

      rules: context.defaultRules
    }

    function defaultIs(list) {
      var rules = this.rules,
        list = matchMediaUtils.parseMediaList(list);

      return list.some(function (size, index, arr) {
        return $window.matchMedia(rules[size]).matches;
      });
    };

    // Return the actual size (it's string name defined in the rules)
    function defaultGet() {
      var rules = this.rules;

      return Object.keys(rules).filter(function (key) {
        return $window.matchMedia(rules[key]).matches;
      })[0];
    };

    // Executes the callback function on window resize with the match truthiness as the first argument.
    // Returns the current match truthiness.
    // The 'scope' parameter is optional. If it's not passed in, '$rootScope' is used.
    function defaultOn(list, callback, scope) {
      var _self = this;
      
      matchMediaListenerStore.addListener( onResizeHandler );
      onResizeHandler();
      return _self.is(list);

      function onResizeHandler(event) {
        matchMediaUtils.safeApply(callback(_self.is(list)), scope);
      }
    };

    // Executes the callback only when inside of the particular screensize.
    // The 'scope' parameter is optional. If it's not passed in, '$rootScope' is used.
    function defaultWhen(list, callback, scope) {
      var _self = this;

      matchMediaListenerStore.addListener( whenResizeHandler );
      whenResizeHandler(); //run the callback the first time
      return _self.is(list);

      function whenResizeHandler(event) {
        if (!_self.is(list)) return;
        matchMediaUtils.safeApply(callback(_self.is(list)), scope);
      }
    };
    
    function defaultDestroy(){
      matchMediaListenerStore.destroy();      
    }

  }


  mediaFilter.$inject = ['screenSize'];
  function mediaFilter(screenSize) {
    return filterMedia;

    // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
    // have to explicit define this behavior.
    filterMedia.$stateful = true;
    function filterMedia(inputValue, options) {
      var size = screenSize.get(),  // Get actual size
        returnedName;          // Variable for the value being return (either a size/rule name or a group name)

      // Return the size/rule name
      if (!options) return size;

      // Replace placeholder with group name in input value
      if (options.groups) {
        var groupName = Object.keys(options.groups).filter(function (key) {
          return ~options.groups[key].indexOf(size);
        });

        // If no group name is found for size use the size itself
        returnedName = (!returnedName) ? groupName[0] : size;
      }

      // Replace or return size/rule name?
      if (options.replace && typeof options.replace === 'string' && options.replace.length > 0) {
        return inputValue.replace(options.replace, returnedName);
      }

      return returnedName;
    }
  }
  matchMediaListenerStoreFactory.$inject = ['$window', 'matchMediaUtils'];
  function matchMediaListenerStoreFactory($window, matchMediaUtils){
    var listeners = [],
        resizeHandler = matchMediaUtils.debounce(_resizeHandler, 50, true, true);
    
    return {
      addListener: defaultAddListener,
      removeListener: defaultRemoveListener,
      destroy: defaultDestroy
    }
    
    function defaultAddListener(callback){
      $window.addEventListener('resize', resizeHandler, true);
      
      this.addListener = function(callback){
        return listeners.push( callback );       
      }
      
      return this.addListener(callback);
    }
    
    function defaultRemoveListener(reference){
      if( typeof reference === 'number' ){
        if( listeners[reference] ) listeners.splice(reference, 1);
      }
      
      if( typeof reference === 'function' ){
        listeners = listeners.filter(function(value){
        return reference !== value;
      });
      }      
    }
    
    function defaultDestroy(){ 
      listeners = null;
      $window.removeEventListener('resize', resizeHandler);
      this.addListener = defaultAddListener; // if addListener was overwritten outside of this provider, this would undo that overwrite.
    }    
    
    function _resizeHandler(e){
      listeners.forEach(function(v){
        v.apply(null,arguments);
      });
    }
  }

  matchMediaUtilsFactory.$inject = ['$rootScope', '$timeout'];
  function matchMediaUtilsFactory($rootScope, $timeout) {
    return {
      parseMediaList: defaultParseMediaList,
      debounce: defaultDebounce,
      safeApply: defaultSafeApply
    };

    function defaultParseMediaList(list) {          
      // validate that we're getting a string or array.
      if (typeof list !== 'string' && Object.prototype.toString.call(list) === '[object Array]') {
        throw new Error('screenSize requires array or comma-separated list');
      }

      // if it's a string, convert to array.
      if (typeof list === 'string') {
        list = list.split(/\s*,\s*/);
      }

      return list;
    }

    function defaultDebounce(callback, delay, callBeforeDelay, recallable) {
      var _self = this,
        delay = delay || 250,
        callBeforeDelay = callBeforeDelay || false,
        recallable = recallable || false,
        timeout, recall;

      return function () {
        recall = timeout && callBeforeDelay && recallable;

        if (timeout) $timeout.cancel(timeout);
        else if (callBeforeDelay) callback.apply(_self, arguments);

        timeout = $timeout(delayedApply, delay);
      }

      function delayedApply() {
        if (!callBeforeDelay || recall) callback.apply(_self, arguments);
        timeout = recall = null;
      }
    }

    // Executes Angular $apply in a safe way
    function defaultSafeApply(fn, scope) {
      scope = scope || $rootScope;
      var phase = scope.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof (fn) === 'function')) {
          fn();
        }
      } else {
        scope.$apply(fn);
      }
    }
  }

})();
