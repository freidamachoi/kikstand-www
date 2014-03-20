/**
 * angular-strap
 * @version v2.0.0-rc.4 - 2014-03-07
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes (olivier@mg-crea.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (window, document, undefined) {
  'use strict';
  // Source: src/module.js
  angular.module('mgcrea.ngStrap', [
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.aside',
    'mgcrea.ngStrap.alert',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.timepicker',
    'mgcrea.ngStrap.navbar',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.dropdown',
    'mgcrea.ngStrap.typeahead',
    'mgcrea.ngStrap.scrollspy',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.tab'
  ]);
  // Source: src/affix/affix.js
  angular.module('mgcrea.ngStrap.affix', ['mgcrea.ngStrap.helpers.dimensions']).provider('$affix', function () {
    var defaults = this.defaults = { offsetTop: 'auto' };
    this.$get = [
      '$window',
      'dimensions',
      function ($window, dimensions) {
        var bodyEl = angular.element($window.document.body);
        function AffixFactory(element, config) {
          var $affix = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          var targetEl = options.target;
          // Initial private vars
          var reset = 'affix affix-top affix-bottom', initialAffixTop = 0, initialOffsetTop = 0, affixed = null, unpin = null;
          var parent = element.parent();
          // Options: custom parent
          if (options.offsetParent) {
            if (options.offsetParent.match(/^\d+$/)) {
              for (var i = 0; i < options.offsetParent * 1 - 1; i++) {
                parent = parent.parent();
              }
            } else {
              parent = angular.element(options.offsetParent);
            }
          }
          // Options: offsets
          var offsetTop = 0;
          if (options.offsetTop) {
            if (options.offsetTop === 'auto') {
              options.offsetTop = '+0';
            }
            if (options.offsetTop.match(/^[-+]\d+$/)) {
              initialAffixTop -= options.offsetTop * 1;
              if (options.offsetParent) {
                offsetTop = dimensions.offset(parent[0]).top + options.offsetTop * 1;
              } else {
                offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + options.offsetTop * 1;
              }
            } else {
              offsetTop = options.offsetTop * 1;
            }
          }
          var offsetBottom = 0;
          if (options.offsetBottom) {
            if (options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
              // add 1 pixel due to rounding problems...
              offsetBottom = getScrollHeight() - (dimensions.offset(parent[0]).top + dimensions.height(parent[0])) + options.offsetBottom * 1 + 1;
            } else {
              offsetBottom = options.offsetBottom * 1;
            }
          }
          $affix.init = function () {
            initialOffsetTop = dimensions.offset(element[0]).top + initialAffixTop;
            // Bind events
            targetEl.on('scroll', this.checkPosition);
            targetEl.on('click', this.checkPositionWithEventLoop);
            // Both of these checkPosition() calls are necessary for the case where
            // the user hits refresh after scrolling to the bottom of the page.
            this.checkPosition();
            this.checkPositionWithEventLoop();
          };
          $affix.destroy = function () {
            // Unbind events
            targetEl.off('scroll', this.checkPosition);
            targetEl.off('click', this.checkPositionWithEventLoop);
          };
          $affix.checkPositionWithEventLoop = function () {
            setTimeout(this.checkPosition, 1);
          };
          $affix.checkPosition = function () {
            // if (!this.$element.is(':visible')) return
            var scrollTop = getScrollTop();
            var position = dimensions.offset(element[0]);
            var elementHeight = dimensions.height(element[0]);
            // Get required affix class according to position
            var affix = getRequiredAffixClass(unpin, position, elementHeight);
            // Did affix status changed this last check?
            if (affixed === affix)
              return;
            affixed = affix;
            // Add proper affix class
            element.removeClass(reset).addClass('affix' + (affix !== 'middle' ? '-' + affix : ''));
            if (affix === 'top') {
              unpin = null;
              element.css('position', options.offsetParent ? '' : 'relative');
              element.css('top', '');
            } else if (affix === 'bottom') {
              if (options.offsetUnpin) {
                unpin = -(options.offsetUnpin * 1);
              } else {
                // Calculate unpin threshold when affixed to bottom.
                // Hopefully the browser scrolls pixel by pixel.
                unpin = position.top - scrollTop;
              }
              element.css('position', options.offsetParent ? '' : 'relative');
              element.css('top', options.offsetParent ? '' : bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop + 'px');
            } else {
              // affix === 'middle'
              unpin = null;
              element.css('position', 'fixed');
              element.css('top', initialAffixTop + 'px');
            }
          };
          // Private methods
          function getRequiredAffixClass(unpin, position, elementHeight) {
            var scrollTop = getScrollTop();
            var scrollHeight = getScrollHeight();
            if (scrollTop <= offsetTop) {
              return 'top';
            } else if (unpin !== null && scrollTop + unpin <= position.top) {
              return 'middle';
            } else if (offsetBottom !== null && position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom) {
              return 'bottom';
            } else {
              return 'middle';
            }
          }
          function getScrollTop() {
            return targetEl[0] === $window ? $window.pageYOffset : targetEl[0] === $window;
          }
          function getScrollHeight() {
            return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
          }
          $affix.init();
          return $affix;
        }
        return AffixFactory;
      }
    ];
  }).directive('bsAffix', [
    '$affix',
    '$window',
    function ($affix, $window) {
      return {
        restrict: 'EAC',
        require: '^?bsAffixTarget',
        link: function postLink(scope, element, attr, affixTarget) {
          var options = {
              scope: scope,
              offsetTop: 'auto',
              target: affixTarget ? affixTarget.$element : angular.element($window)
            };
          angular.forEach([
            'offsetTop',
            'offsetBottom',
            'offsetParent',
            'offsetUnpin'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          var affix = $affix(element, options);
          scope.$on('$destroy', function () {
            options = null;
            affix = null;
          });
        }
      };
    }
  ]).directive('bsAffixTarget', function () {
    return {
      controller: [
        '$element',
        function ($element) {
          this.$element = $element;
        }
      ]
    };
  });
  // Source: src/alert/alert.js
  // @BUG: following snippet won't compile correctly
  // @TODO: submit issue to core
  // '<span ng-if="title"><strong ng-bind="title"></strong>&nbsp;</span><span ng-bind-html="content"></span>' +
  angular.module('mgcrea.ngStrap.alert', []).provider('$alert', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'alert',
        placement: null,
        template: 'alert/alert.tpl.html',
        container: false,
        element: null,
        backdrop: false,
        keyboard: true,
        show: true,
        duration: false,
        type: false
      };
    this.$get = [
      '$modal',
      '$timeout',
      function ($modal, $timeout) {
        function AlertFactory(config) {
          var $alert = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          $alert = $modal(options);
          // Support scope as string options [/*title, content, */type]
          if (options.type) {
            $alert.$scope.type = options.type;
          }
          // Support auto-close duration
          var show = $alert.show;
          if (options.duration) {
            $alert.show = function () {
              show();
              $timeout(function () {
                $alert.hide();
              }, options.duration * 1000);
            };
          }
          return $alert;
        }
        return AlertFactory;
      }
    ];
  }).directive('bsAlert', [
    '$window',
    '$location',
    '$sce',
    '$alert',
    function ($window, $location, $sce, $alert) {
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          // Directive options
          var options = {
              scope: scope,
              element: element,
              show: false
            };
          angular.forEach([
            'template',
            'placement',
            'keyboard',
            'html',
            'container',
            'animation',
            'duration'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Support scope as data-attrs
          angular.forEach([
            'title',
            'content',
            'type'
          ], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = $sce.trustAsHtml(newValue);
            });
          });
          // Support scope as an object
          attr.bsAlert && scope.$watch(attr.bsAlert, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
          }, true);
          // Initialize alert
          var alert = $alert(options);
          // Trigger
          element.on(attr.trigger || 'click', alert.toggle);
          // Garbage collection
          scope.$on('$destroy', function () {
            alert.destroy();
            options = null;
            alert = null;
          });
        }
      };
    }
  ]);
  // Source: src/aside/aside.js
  angular.module('mgcrea.ngStrap.aside', ['mgcrea.ngStrap.modal']).provider('$aside', function () {
    var defaults = this.defaults = {
        animation: 'am-fade-and-slide-right',
        prefixClass: 'aside',
        placement: 'right',
        template: 'aside/aside.tpl.html',
        contentTemplate: false,
        container: false,
        element: null,
        backdrop: true,
        keyboard: true,
        html: false,
        show: true
      };
    this.$get = [
      '$modal',
      function ($modal) {
        function AsideFactory(config) {
          var $aside = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          $aside = $modal(options);
          return $aside;
        }
        return AsideFactory;
      }
    ];
  }).directive('bsAside', [
    '$window',
    '$location',
    '$sce',
    '$aside',
    function ($window, $location, $sce, $aside) {
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          // Directive options
          var options = {
              scope: scope,
              element: element,
              show: false
            };
          angular.forEach([
            'template',
            'contentTemplate',
            'placement',
            'backdrop',
            'keyboard',
            'html',
            'container',
            'animation'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Support scope as data-attrs
          angular.forEach([
            'title',
            'content'
          ], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = $sce.trustAsHtml(newValue);
            });
          });
          // Support scope as an object
          attr.bsAside && scope.$watch(attr.bsAside, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
          }, true);
          // Initialize aside
          var aside = $aside(options);
          // Trigger
          element.on(attr.trigger || 'click', aside.toggle);
          // Garbage collection
          scope.$on('$destroy', function () {
            aside.destroy();
            options = null;
            aside = null;
          });
        }
      };
    }
  ]);
  // Source: src/button/button.js
  angular.module('mgcrea.ngStrap.button', ['ngAnimate']).provider('$button', function () {
    var defaults = this.defaults = {
        activeClass: 'active',
        toggleEvent: 'click'
      };
    this.$get = function () {
      return { defaults: defaults };
    };
  }).directive('bsCheckboxGroup', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function postLink(element, attr) {
        element.attr('data-toggle', 'buttons');
        element.removeAttr('ng-model');
        var children = element[0].querySelectorAll('input[type="checkbox"]');
        angular.forEach(children, function (child) {
          var childEl = angular.element(child);
          childEl.attr('bs-checkbox', '');
          childEl.attr('ng-model', attr.ngModel + '.' + childEl.attr('value'));
        });
      }
    };
  }).directive('bsCheckbox', [
    '$button',
    '$$animateReflow',
    function ($button, $$animateReflow) {
      var defaults = $button.defaults;
      var constantValueRegExp = /^(true|false|\d+)$/;
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          var options = defaults;
          // Support label > input[type="checkbox"]
          var isInput = element[0].nodeName === 'INPUT';
          var activeElement = isInput ? element.parent() : element;
          var trueValue = angular.isDefined(attr.trueValue) ? attr.trueValue : true;
          if (constantValueRegExp.test(attr.trueValue)) {
            trueValue = scope.$eval(attr.trueValue);
          }
          var falseValue = angular.isDefined(attr.falseValue) ? attr.falseValue : false;
          if (constantValueRegExp.test(attr.falseValue)) {
            falseValue = scope.$eval(attr.falseValue);
          }
          // Parse exotic values
          var hasExoticValues = typeof trueValue !== 'boolean' || typeof falseValue !== 'boolean';
          if (hasExoticValues) {
            controller.$parsers.push(function (viewValue) {
              // console.warn('$parser', element.attr('ng-model'), 'viewValue', viewValue);
              return viewValue ? trueValue : falseValue;
            });
            // Fix rendering for exotic values
            scope.$watch(attr.ngModel, function (newValue, oldValue) {
              controller.$render();
            });
          }
          // model -> view
          controller.$render = function () {
            // console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
            var isActive = angular.equals(controller.$modelValue, trueValue);
            $$animateReflow(function () {
              if (isInput)
                element[0].checked = isActive;
              activeElement.toggleClass(options.activeClass, isActive);
            });
          };
          // view -> model
          element.bind(options.toggleEvent, function () {
            scope.$apply(function () {
              // console.warn('!click', element.attr('ng-model'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
              if (!isInput) {
                controller.$setViewValue(!activeElement.hasClass('active'));
              }
              if (!hasExoticValues) {
                controller.$render();
              }
            });
          });
        }
      };
    }
  ]).directive('bsRadioGroup', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function postLink(element, attr) {
        element.attr('data-toggle', 'buttons');
        element.removeAttr('ng-model');
        var children = element[0].querySelectorAll('input[type="radio"]');
        angular.forEach(children, function (child) {
          angular.element(child).attr('bs-radio', '');
          angular.element(child).attr('ng-model', attr.ngModel);
        });
      }
    };
  }).directive('bsRadio', [
    '$button',
    '$$animateReflow',
    function ($button, $$animateReflow) {
      var defaults = $button.defaults;
      var constantValueRegExp = /^(true|false|\d+)$/;
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          var options = defaults;
          // Support `label > input[type="radio"]` markup
          var isInput = element[0].nodeName === 'INPUT';
          var activeElement = isInput ? element.parent() : element;
          var value = constantValueRegExp.test(attr.value) ? scope.$eval(attr.value) : attr.value;
          // model -> view
          controller.$render = function () {
            // console.warn('$render', element.attr('value'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
            var isActive = angular.equals(controller.$modelValue, value);
            $$animateReflow(function () {
              if (isInput)
                element[0].checked = isActive;
              activeElement.toggleClass(options.activeClass, isActive);
            });
          };
          // view -> model
          element.bind(options.toggleEvent, function () {
            scope.$apply(function () {
              // console.warn('!click', element.attr('value'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
              controller.$setViewValue(value);
              controller.$render();
            });
          });
        }
      };
    }
  ]);
  // Source: src/datepicker/datepicker.js
  angular.module('mgcrea.ngStrap.datepicker', [
    'mgcrea.ngStrap.helpers.dateParser',
    'mgcrea.ngStrap.tooltip'
  ]).provider('$datepicker', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'datepicker',
        placement: 'bottom-left',
        template: 'datepicker/datepicker.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        useNative: false,
        dateType: 'date',
        dateFormat: 'shortDate',
        strictFormat: false,
        autoclose: false,
        minDate: -Infinity,
        maxDate: +Infinity,
        startView: 0,
        minView: 0,
        startWeek: 0
      };
    this.$get = [
      '$window',
      '$document',
      '$rootScope',
      '$sce',
      '$locale',
      'dateFilter',
      'datepickerViews',
      '$tooltip',
      function ($window, $document, $rootScope, $sce, $locale, dateFilter, datepickerViews, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        var isTouch = 'createTouch' in $window.document;
        var isNative = /(ip(a|o)d|iphone|android)/gi.test($window.navigator.userAgent);
        if (!defaults.lang)
          defaults.lang = $locale.id;
        function DatepickerFactory(element, controller, config) {
          var $datepicker = $tooltip(element, angular.extend({}, defaults, config));
          var parentScope = config.scope;
          var options = $datepicker.$options;
          var scope = $datepicker.$scope;
          if (options.startView)
            options.startView -= options.minView;
          // View vars
          var pickerViews = datepickerViews($datepicker);
          $datepicker.$views = pickerViews.views;
          var viewDate = pickerViews.viewDate;
          scope.$mode = options.startView;
          var $picker = $datepicker.$views[scope.$mode];
          // Scope methods
          scope.$select = function (date) {
            $datepicker.select(date);
          };
          scope.$selectPane = function (value) {
            $datepicker.$selectPane(value);
          };
          scope.$toggleMode = function () {
            $datepicker.setMode((scope.$mode + 1) % $datepicker.$views.length);
          };
          // Public methods
          $datepicker.update = function (date) {
            // console.warn('$datepicker.update() newValue=%o', date);
            if (angular.isDate(date) && !isNaN(date.getTime())) {
              $datepicker.$date = date;
              $picker.update.call($picker, date);
            }
            // Build only if pristine
            $datepicker.$build(true);
          };
          $datepicker.select = function (date, keep) {
            // console.warn('$datepicker.select', date, scope.$mode);
            if (!angular.isDate(controller.$dateValue))
              controller.$dateValue = new Date(date);
            controller.$dateValue.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            if (!scope.$mode || keep) {
              controller.$setViewValue(controller.$dateValue);
              controller.$render();
              if (options.autoclose && !keep) {
                $datepicker.hide(true);
              }
            } else {
              angular.extend(viewDate, {
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate()
              });
              $datepicker.setMode(scope.$mode - 1);
              $datepicker.$build();
            }
          };
          $datepicker.setMode = function (mode) {
            // console.warn('$datepicker.setMode', mode);
            scope.$mode = mode;
            $picker = $datepicker.$views[scope.$mode];
            $datepicker.$build();
          };
          // Protected methods
          $datepicker.$build = function (pristine) {
            // console.warn('$datepicker.$build() viewDate=%o', viewDate);
            if (pristine === true && $picker.built)
              return;
            if (pristine === false && !$picker.built)
              return;
            $picker.build.call($picker);
          };
          $datepicker.$updateSelected = function () {
            for (var i = 0, l = scope.rows.length; i < l; i++) {
              angular.forEach(scope.rows[i], updateSelected);
            }
          };
          $datepicker.$isSelected = function (date) {
            return $picker.isSelected(date);
          };
          $datepicker.$selectPane = function (value) {
            var steps = $picker.steps;
            var targetDate = new Date(Date.UTC(viewDate.year + (steps.year || 0) * value, viewDate.month + (steps.month || 0) * value, viewDate.date + (steps.day || 0) * value));
            angular.extend(viewDate, {
              year: targetDate.getUTCFullYear(),
              month: targetDate.getUTCMonth(),
              date: targetDate.getUTCDate()
            });
            $datepicker.$build();
          };
          $datepicker.$onMouseDown = function (evt) {
            // Prevent blur on mousedown on .dropdown-menu
            evt.preventDefault();
            evt.stopPropagation();
            // Emulate click for mobile devices
            if (isTouch) {
              var targetEl = angular.element(evt.target);
              if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                targetEl = targetEl.parent();
              }
              targetEl.triggerHandler('click');
            }
          };
          $datepicker.$onKeyDown = function (evt) {
            if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey)
              return;
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.keyCode === 13) {
              if (!scope.$mode) {
                return $datepicker.hide(true);
              } else {
                return scope.$apply(function () {
                  $datepicker.setMode(scope.$mode - 1);
                });
              }
            }
            // Navigate with keyboard
            $picker.onKeyDown(evt);
            parentScope.$digest();
          };
          // Private
          function updateSelected(el) {
            el.selected = $datepicker.$isSelected(el.date);
          }
          function focusElement() {
            element[0].focus();
          }
          // Overrides
          var _init = $datepicker.init;
          $datepicker.init = function () {
            if (isNative && options.useNative) {
              element.prop('type', 'date');
              element.css('-webkit-appearance', 'textfield');
              return;
            } else if (isTouch) {
              element.prop('type', 'text');
              element.attr('readonly', 'true');
              element.on('click', focusElement);
            }
            _init();
          };
          var _destroy = $datepicker.destroy;
          $datepicker.destroy = function () {
            if (isNative && options.useNative) {
              element.off('click', focusElement);
            }
            _destroy();
          };
          var _show = $datepicker.show;
          $datepicker.show = function () {
            _show();
            setTimeout(function () {
              $datepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
              if (options.keyboard) {
                element.on('keydown', $datepicker.$onKeyDown);
              }
            });
          };
          var _hide = $datepicker.hide;
          $datepicker.hide = function (blur) {
            $datepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
            if (options.keyboard) {
              element.off('keydown', $datepicker.$onKeyDown);
            }
            _hide(blur);
          };
          return $datepicker;
        }
        DatepickerFactory.defaults = defaults;
        return DatepickerFactory;
      }
    ];
  }).directive('bsDatepicker', [
    '$window',
    '$parse',
    '$q',
    '$locale',
    'dateFilter',
    '$datepicker',
    '$dateParser',
    '$timeout',
    function ($window, $parse, $q, $locale, dateFilter, $datepicker, $dateParser, $timeout) {
      var defaults = $datepicker.defaults;
      var isNative = /(ip(a|o)d|iphone|android)/gi.test($window.navigator.userAgent);
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = {
              scope: scope,
              controller: controller
            };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template',
            'autoclose',
            'dateType',
            'dateFormat',
            'strictFormat',
            'startWeek',
            'useNative',
            'lang',
            'startView',
            'minView'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Initialize datepicker
          if (isNative && options.useNative)
            options.dateFormat = 'yyyy-MM-dd';
          var datepicker = $datepicker(element, controller, options);
          options = datepicker.$options;
          // Observe attributes for changes
          angular.forEach([
            'minDate',
            'maxDate'
          ], function (key) {
            // console.warn('attr.$observe(%s)', key, attr[key]);
            angular.isDefined(attr[key]) && attr.$observe(key, function (newValue) {
              // console.warn('attr.$observe(%s)=%o', key, newValue);
              if (newValue === 'today') {
                var today = new Date();
                datepicker.$options[key] = +new Date(today.getFullYear(), today.getMonth(), today.getDate() + (key === 'maxDate' ? 1 : 0), 0, 0, 0, key === 'minDate' ? 0 : -1);
              } else if (angular.isString(newValue) && newValue.match(/^".+"$/)) {
                datepicker.$options[key] = +new Date(newValue.substr(1, newValue.length - 2));
              } else {
                datepicker.$options[key] = +new Date(newValue);
              }
              // console.warn(angular.isDate(newValue), newValue);
              // Build only if dirty
              !isNaN(datepicker.$options[key]) && datepicker.$build(false);
            });
          });
          // Watch model for changes
          scope.$watch(attr.ngModel, function (newValue, oldValue) {
            datepicker.update(controller.$dateValue);
          }, true);
          var dateParser = $dateParser({
              format: options.dateFormat,
              lang: options.lang,
              strict: options.strictFormat
            });
          // viewValue -> $parsers -> modelValue
          controller.$parsers.unshift(function (viewValue) {
            // console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
            // Null values should correctly reset the model value & validity
            if (!viewValue) {
              controller.$setValidity('date', true);
              return;
            }
            var parsedDate = dateParser.parse(viewValue, controller.$dateValue);
            if (!parsedDate || isNaN(parsedDate.getTime())) {
              controller.$setValidity('date', false);
            } else {
              var isValid = parsedDate.getTime() >= options.minDate && parsedDate.getTime() <= options.maxDate;
              controller.$setValidity('date', isValid);
              // Only update the model when we have a valid date
              if (isValid)
                controller.$dateValue = parsedDate;
            }
            if (options.dateType === 'string') {
              return dateFilter(viewValue, options.dateFormat);
            } else if (options.dateType === 'number') {
              return controller.$dateValue.getTime();
            } else if (options.dateType === 'iso') {
              return controller.$dateValue.toISOString();
            } else {
              return new Date(controller.$dateValue);
            }
          });
          // modelValue -> $formatters -> viewValue
          controller.$formatters.push(function (modelValue) {
            // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
            if (angular.isUndefined(modelValue) || modelValue === null)
              return;
            var date = angular.isDate(modelValue) ? modelValue : new Date(modelValue);
            // Setup default value?
            // if(isNaN(date.getTime())) {
            //   var today = new Date();
            //   date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            // }
            controller.$dateValue = date;
            return controller.$dateValue;
          });
          // viewValue -> element
          controller.$render = function () {
            // console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
            element.val(!controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.dateFormat));
          };
          // Garbage collection
          scope.$on('$destroy', function () {
            datepicker.destroy();
            options = null;
            datepicker = null;
          });
        }
      };
    }
  ]).provider('datepickerViews', function () {
    var defaults = this.defaults = {
        dayFormat: 'dd',
        daySplit: 7
      };
    // Split array into smaller arrays
    function split(arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    }
    this.$get = [
      '$locale',
      '$sce',
      'dateFilter',
      function ($locale, $sce, dateFilter) {
        return function (picker) {
          var scope = picker.$scope;
          var options = picker.$options;
          var weekDaysMin = $locale.DATETIME_FORMATS.SHORTDAY;
          var weekDaysLabels = weekDaysMin.slice(options.startWeek).concat(weekDaysMin.slice(0, options.startWeek));
          var weekDaysLabelsHtml = $sce.trustAsHtml('<th class="dow text-center">' + weekDaysLabels.join('</th><th class="dow text-center">') + '</th>');
          var startDate = picker.$date || new Date();
          var viewDate = {
              year: startDate.getFullYear(),
              month: startDate.getMonth(),
              date: startDate.getDate()
            };
          var timezoneOffset = startDate.getTimezoneOffset() * 60000;
          var views = [
              {
                format: 'dd',
                split: 7,
                steps: { month: 1 },
                update: function (date, force) {
                  if (!this.built || force || date.getFullYear() !== viewDate.year || date.getMonth() !== viewDate.month) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getDate() !== viewDate.date) {
                    viewDate.date = picker.$date.getDate();
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1);
                  var firstDate = new Date(+firstDayOfMonth - (firstDayOfMonth.getDay() - options.startWeek) * 86400000);
                  var days = [], day;
                  for (var i = 0; i < 42; i++) {
                    // < 7 * 6
                    day = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i);
                    days.push({
                      date: day,
                      label: dateFilter(day, this.format),
                      selected: picker.$date && this.isSelected(day),
                      muted: day.getMonth() !== viewDate.month,
                      disabled: this.isDisabled(day)
                    });
                  }
                  scope.title = dateFilter(firstDayOfMonth, 'MMMM yyyy');
                  scope.labels = weekDaysLabelsHtml;
                  scope.rows = split(days, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth() && date.getDate() === picker.$date.getDate();
                },
                isDisabled: function (date) {
                  return date.getTime() < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualTime = picker.$date.getTime();
                  if (evt.keyCode === 37)
                    picker.select(new Date(actualTime - 1 * 86400000), true);
                  else if (evt.keyCode === 38)
                    picker.select(new Date(actualTime - 7 * 86400000), true);
                  else if (evt.keyCode === 39)
                    picker.select(new Date(actualTime + 1 * 86400000), true);
                  else if (evt.keyCode === 40)
                    picker.select(new Date(actualTime + 7 * 86400000), true);
                }
              },
              {
                name: 'month',
                format: 'MMM',
                split: 4,
                steps: { year: 1 },
                update: function (date, force) {
                  if (!this.built || date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getMonth() !== viewDate.month) {
                    angular.extend(viewDate, {
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstMonth = new Date(viewDate.year, 0, 1);
                  var months = [], month;
                  for (var i = 0; i < 12; i++) {
                    month = new Date(viewDate.year, i, 1);
                    months.push({
                      date: month,
                      label: dateFilter(month, this.format),
                      selected: picker.$isSelected(month),
                      disabled: this.isDisabled(month)
                    });
                  }
                  scope.title = dateFilter(month, 'yyyy');
                  scope.labels = false;
                  scope.rows = split(months, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth();
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  return lastDate < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualMonth = picker.$date.getMonth();
                  if (evt.keyCode === 37)
                    picker.select(picker.$date.setMonth(actualMonth - 1), true);
                  else if (evt.keyCode === 38)
                    picker.select(picker.$date.setMonth(actualMonth - 4), true);
                  else if (evt.keyCode === 39)
                    picker.select(picker.$date.setMonth(actualMonth + 1), true);
                  else if (evt.keyCode === 40)
                    picker.select(picker.$date.setMonth(actualMonth + 4), true);
                }
              },
              {
                name: 'year',
                format: 'yyyy',
                split: 4,
                steps: { year: 12 },
                update: function (date, force) {
                  if (!this.built || force || parseInt(date.getFullYear() / 20, 10) !== parseInt(viewDate.year / 20, 10)) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstYear = viewDate.year - viewDate.year % (this.split * 3);
                  var years = [], year;
                  for (var i = 0; i < 12; i++) {
                    year = new Date(firstYear + i, 0, 1);
                    years.push({
                      date: year,
                      label: dateFilter(year, this.format),
                      selected: picker.$isSelected(year),
                      disabled: this.isDisabled(year)
                    });
                  }
                  scope.title = years[0].label + '-' + years[years.length - 1].label;
                  scope.labels = false;
                  scope.rows = split(years, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear();
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
                  return lastDate < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualYear = picker.$date.getFullYear();
                  if (evt.keyCode === 37)
                    picker.select(picker.$date.setYear(actualYear - 1), true);
                  else if (evt.keyCode === 38)
                    picker.select(picker.$date.setYear(actualYear - 4), true);
                  else if (evt.keyCode === 39)
                    picker.select(picker.$date.setYear(actualYear + 1), true);
                  else if (evt.keyCode === 40)
                    picker.select(picker.$date.setYear(actualYear + 4), true);
                }
              }
            ];
          return {
            views: options.minView ? Array.prototype.slice.call(views, options.minView) : views,
            viewDate: viewDate
          };
        };
      }
    ];
  });
  // Source: src/dropdown/dropdown.js
  angular.module('mgcrea.ngStrap.dropdown', ['mgcrea.ngStrap.tooltip']).provider('$dropdown', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'dropdown',
        placement: 'bottom-left',
        template: 'dropdown/dropdown.tpl.html',
        trigger: 'click',
        container: false,
        keyboard: true,
        html: false,
        delay: 0
      };
    this.$get = [
      '$window',
      '$rootScope',
      '$tooltip',
      function ($window, $rootScope, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        var matchesSelector = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector;
        function DropdownFactory(element, config) {
          var $dropdown = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          var scope = $dropdown.$scope = options.scope && options.scope.$new() || $rootScope.$new();
          $dropdown = $tooltip(element, options);
          // Protected methods
          $dropdown.$onKeyDown = function (evt) {
            if (!/(38|40)/.test(evt.keyCode))
              return;
            evt.preventDefault();
            evt.stopPropagation();
            // Retrieve focused index
            var items = angular.element($dropdown.$element[0].querySelectorAll('li:not(.divider) a'));
            if (!items.length)
              return;
            var index;
            angular.forEach(items, function (el, i) {
              if (matchesSelector && matchesSelector.call(el, ':focus'))
                index = i;
            });
            // Navigate with keyboard
            if (evt.keyCode === 38 && index > 0)
              index--;
            else if (evt.keyCode === 40 && index < items.length - 1)
              index++;
            else if (angular.isUndefined(index))
              index = 0;
            items.eq(index)[0].focus();
          };
          // Overrides
          var show = $dropdown.show;
          $dropdown.show = function () {
            show();
            setTimeout(function () {
              options.keyboard && $dropdown.$element.on('keydown', $dropdown.$onKeyDown);
              bodyEl.on('click', onBodyClick);
            });
          };
          var hide = $dropdown.hide;
          $dropdown.hide = function () {
            options.keyboard && $dropdown.$element.off('keydown', $dropdown.$onKeyDown);
            bodyEl.off('click', onBodyClick);
            hide();
          };
          // Private functions
          function onBodyClick(evt) {
            if (evt.target === element[0])
              return;
            return evt.target !== element[0] && $dropdown.hide();
          }
          return $dropdown;
        }
        return DropdownFactory;
      }
    ];
  }).directive('bsDropdown', [
    '$window',
    '$location',
    '$sce',
    '$dropdown',
    function ($window, $location, $sce, $dropdown) {
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          // Directive options
          var options = { scope: scope };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Support scope as an object
          attr.bsDropdown && scope.$watch(attr.bsDropdown, function (newValue, oldValue) {
            scope.content = newValue;
          }, true);
          // Initialize dropdown
          var dropdown = $dropdown(element, options);
          // Garbage collection
          scope.$on('$destroy', function () {
            dropdown.destroy();
            options = null;
            dropdown = null;
          });
        }
      };
    }
  ]);
  // Source: src/helpers/date-parser.js
  angular.module('mgcrea.ngStrap.helpers.dateParser', []).provider('$dateParser', [
    '$localeProvider',
    function ($localeProvider) {
      var proto = Date.prototype;
      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      var defaults = this.defaults = {
          format: 'shortDate',
          strict: false
        };
      this.$get = [
        '$locale',
        function ($locale) {
          var DateParserFactory = function (config) {
            var options = angular.extend({}, defaults, config);
            var $dateParser = {};
            var regExpMap = {
                'sss': '[0-9]{3}',
                'ss': '[0-5][0-9]',
                's': options.strict ? '[1-5]?[0-9]' : '[0-5][0-9]',
                'mm': '[0-5][0-9]',
                'm': options.strict ? '[1-5]?[0-9]' : '[0-5][0-9]',
                'HH': '[01][0-9]|2[0-3]',
                'H': options.strict ? '[0][1-9]|[1][012]' : '[01][0-9]|2[0-3]',
                'hh': '[0][1-9]|[1][012]',
                'h': options.strict ? '[1-9]|[1][012]' : '[0]?[1-9]|[1][012]',
                'a': 'AM|PM',
                'EEEE': $locale.DATETIME_FORMATS.DAY.join('|'),
                'EEE': $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
                'dd': '[0-2][0-9]{1}|[3][01]{1}',
                'd': options.strict ? '[1-2]?[0-9]{1}|[3][01]{1}' : '[0-2][0-9]{1}|[3][01]{1}',
                'MMMM': $locale.DATETIME_FORMATS.MONTH.join('|'),
                'MMM': $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                'MM': '[0][1-9]|[1][012]',
                'M': options.strict ? '[1-9]|[1][012]' : '[0][1-9]|[1][012]',
                'yyyy': '(?:(?:[1]{1}[0-9]{1}[0-9]{1}[0-9]{1})|(?:[2]{1}[0-9]{3}))(?![[0-9]])',
                'yy': '(?:(?:[0-9]{1}[0-9]{1}))(?![[0-9]])'
              };
            var setFnMap = {
                'sss': proto.setMilliseconds,
                'ss': proto.setSeconds,
                's': proto.setSeconds,
                'mm': proto.setMinutes,
                'm': proto.setMinutes,
                'HH': proto.setHours,
                'H': proto.setHours,
                'hh': proto.setHours,
                'h': proto.setHours,
                'dd': proto.setDate,
                'd': proto.setDate,
                'a': function (value) {
                  var hours = this.getHours();
                  return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
                },
                'MMMM': function (value) {
                  return this.setMonth($locale.DATETIME_FORMATS.MONTH.indexOf(value));
                },
                'MMM': function (value) {
                  return this.setMonth($locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value));
                },
                'MM': function (value) {
                  return this.setMonth(1 * value - 1);
                },
                'M': function (value) {
                  return this.setMonth(1 * value - 1);
                },
                'yyyy': proto.setFullYear,
                'yy': function (value) {
                  return this.setFullYear(2000 + 1 * value);
                },
                'y': proto.setFullYear
              };
            var regex, setMap;
            $dateParser.init = function () {
              $dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
              regex = regExpForFormat($dateParser.$format);
              setMap = setMapForFormat($dateParser.$format);
            };
            $dateParser.isValid = function (date) {
              if (angular.isDate(date))
                return !isNaN(date.getTime());
              return regex.test(date);
            };
            $dateParser.parse = function (value, baseDate) {
              if (angular.isDate(value))
                return value;
              var matches = regex.exec(value);
              if (!matches)
                return false;
              var date = baseDate || new Date(0);
              for (var i = 0; i < matches.length - 1; i++) {
                setMap[i] && setMap[i].call(date, matches[i + 1]);
              }
              return date;
            };
            // Private functions
            function setMapForFormat(format) {
              var keys = Object.keys(setFnMap), i;
              var map = [], sortedMap = [];
              // Map to setFn
              var clonedFormat = format;
              for (i = 0; i < keys.length; i++) {
                if (format.split(keys[i]).length > 1) {
                  var index = clonedFormat.search(keys[i]);
                  format = format.split(keys[i]).join('');
                  if (setFnMap[keys[i]])
                    map[index] = setFnMap[keys[i]];
                }
              }
              // Sort result map
              angular.forEach(map, function (v) {
                sortedMap.push(v);
              });
              return sortedMap;
            }
            function escapeReservedSymbols(text) {
              return text.replace(/\//g, '[\\/]').replace('/-/g', '[-]').replace(/\./g, '[.]').replace(/\\s/g, '[\\s]');
            }
            function regExpForFormat(format) {
              var keys = Object.keys(regExpMap), i;
              var re = format;
              // Abstract replaces to avoid collisions
              for (i = 0; i < keys.length; i++) {
                re = re.split(keys[i]).join('${' + i + '}');
              }
              // Replace abstracted values
              for (i = 0; i < keys.length; i++) {
                re = re.split('${' + i + '}').join('(' + regExpMap[keys[i]] + ')');
              }
              format = escapeReservedSymbols(format);
              return new RegExp('^' + re + '$', ['i']);
            }
            $dateParser.init();
            return $dateParser;
          };
          return DateParserFactory;
        }
      ];
    }
  ]);
  // Source: src/helpers/debounce.js
  angular.module('mgcrea.ngStrap.helpers.debounce', []).constant('debounce', function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function () {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function () {
        var last = new Date() - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate)
            result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow)
        result = func.apply(context, args);
      return result;
    };
  }).constant('throttle', function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function () {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function () {
      var now = new Date();
      if (!previous && options.leading === false)
        previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  });
  // Source: src/helpers/dimensions.js
  angular.module('mgcrea.ngStrap.helpers.dimensions', []).factory('dimensions', [
    '$document',
    '$window',
    function ($document, $window) {
      var jqLite = angular.element;
      var fn = {};
      /**
     * Test the element nodeName
     * @param element
     * @param name
     */
      var nodeName = fn.nodeName = function (element, name) {
          return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
        };
      /**
     * Returns the element computed style
     * @param element
     * @param prop
     * @param extra
     */
      fn.css = function (element, prop, extra) {
        var value;
        if (element.currentStyle) {
          //IE
          value = element.currentStyle[prop];
        } else if (window.getComputedStyle) {
          value = window.getComputedStyle(element)[prop];
        } else {
          value = element.style[prop];
        }
        return extra === true ? parseFloat(value) || 0 : value;
      };
      /**
     * Provides read-only equivalent of jQuery's offset function:
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
      fn.offset = function (element) {
        var boxRect = element.getBoundingClientRect();
        var docElement = element.ownerDocument;
        return {
          width: element.offsetWidth,
          height: element.offsetHeight,
          top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
          left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
        };
      };
      /**
     * Provides read-only equivalent of jQuery's position function
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
      fn.position = function (element) {
        var offsetParentRect = {
            top: 0,
            left: 0
          }, offsetParentElement, offset;
        // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
        if (fn.css(element, 'position') === 'fixed') {
          // We assume that getBoundingClientRect is available when computed position is fixed
          offset = element.getBoundingClientRect();
        } else {
          // Get *real* offsetParentElement
          offsetParentElement = offsetParent(element);
          offset = fn.offset(element);
          // Get correct offsets
          offset = fn.offset(element);
          if (!nodeName(offsetParentElement, 'html')) {
            offsetParentRect = fn.offset(offsetParentElement);
          }
          // Add offsetParent borders
          offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
          offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
        }
        // Subtract parent offsets and element margins
        return {
          width: element.offsetWidth,
          height: element.offsetHeight,
          top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
          left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
        };
      };
      /**
     * Returns the closest, non-statically positioned offsetParent of a given element
     * @required-by fn.position
     * @param element
     */
      var offsetParent = function offsetParentElement(element) {
        var docElement = element.ownerDocument;
        var offsetParent = element.offsetParent || docElement;
        if (nodeName(offsetParent, '#document'))
          return docElement.documentElement;
        while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
          offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docElement.documentElement;
      };
      /**
     * Provides equivalent of jQuery's height function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/height/
     * @param element
     * @param outer
     */
      fn.height = function (element, outer) {
        var value = element.offsetHeight;
        if (outer) {
          value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
        } else {
          value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
        }
        return value;
      };
      /**
     * Provides equivalent of jQuery's height function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/width/
     * @param element
     * @param outer
     */
      fn.width = function (element, outer) {
        var value = element.offsetWidth;
        if (outer) {
          value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
        } else {
          value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
        }
        return value;
      };
      return fn;
    }
  ]);
  // Source: src/helpers/parse-options.js
  angular.module('mgcrea.ngStrap.helpers.parseOptions', []).provider('$parseOptions', function () {
    var defaults = this.defaults = { regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/ };
    this.$get = [
      '$parse',
      '$q',
      function ($parse, $q) {
        function ParseOptionsFactory(attr, config) {
          var $parseOptions = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          $parseOptions.$values = [];
          // Private vars
          var match, displayFn, valueName, keyName, groupByFn, valueFn, valuesFn;
          $parseOptions.init = function () {
            $parseOptions.$match = match = attr.match(options.regexp);
            displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ''), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]);
          };
          $parseOptions.valuesFn = function (scope, controller) {
            return $q.when(valuesFn(scope, controller)).then(function (values) {
              $parseOptions.$values = values ? parseValues(values) : {};
              return $parseOptions.$values;
            });
          };
          // Private functions
          function parseValues(values) {
            return values.map(function (match, index) {
              var locals = {}, label, value;
              locals[valueName] = match;
              label = displayFn(locals);
              value = valueFn(locals) || index;
              return {
                label: label,
                value: value
              };
            });
          }
          $parseOptions.init();
          return $parseOptions;
        }
        return ParseOptionsFactory;
      }
    ];
  });
  // Source: src/modal/modal.js
  angular.module('mgcrea.ngStrap.modal', ['mgcrea.ngStrap.helpers.dimensions']).provider('$modal', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        backdropAnimation: 'am-fade',
        prefixClass: 'modal',
        placement: 'top',
        template: 'modal/modal.tpl.html',
        contentTemplate: false,
        container: false,
        element: null,
        backdrop: true,
        keyboard: true,
        html: false,
        show: true
      };
    this.$get = [
      '$window',
      '$rootScope',
      '$compile',
      '$q',
      '$templateCache',
      '$http',
      '$animate',
      '$timeout',
      'dimensions',
      function ($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, dimensions) {
        var forEach = angular.forEach;
        var trim = String.prototype.trim;
        var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
        var bodyElement = angular.element($window.document.body);
        var htmlReplaceRegExp = /ng-bind="/gi;
        function ModalFactory(config) {
          var $modal = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          $modal.$promise = fetchTemplate(options.template);
          var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
          if (!options.element && !options.container) {
            options.container = 'body';
          }
          // Support scope as string options
          forEach([
            'title',
            'content'
          ], function (key) {
            if (options[key])
              scope[key] = options[key];
          });
          // Provide scope helpers
          scope.$hide = function () {
            scope.$$postDigest(function () {
              $modal.hide();
            });
          };
          scope.$show = function () {
            scope.$$postDigest(function () {
              $modal.show();
            });
          };
          scope.$toggle = function () {
            scope.$$postDigest(function () {
              $modal.toggle();
            });
          };
          // Support contentTemplate option
          if (options.contentTemplate) {
            $modal.$promise = $modal.$promise.then(function (template) {
              var templateEl = angular.element(template);
              return fetchTemplate(options.contentTemplate).then(function (contentTemplate) {
                var contentEl = findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
                // Drop the default footer as you probably don't want it if you use a custom contentTemplate
                if (!config.template)
                  contentEl.next().remove();
                return templateEl[0].outerHTML;
              });
            });
          }
          // Fetch, compile then initialize modal
          var modalLinker, modalElement;
          var backdropElement = angular.element('<div class="' + options.prefixClass + '-backdrop"/>');
          $modal.$promise.then(function (template) {
            if (angular.isObject(template))
              template = template.data;
            if (options.html)
              template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
            template = trim.apply(template);
            modalLinker = $compile(template);
            $modal.init();
          });
          $modal.init = function () {
            // Options: show
            if (options.show) {
              scope.$$postDigest(function () {
                $modal.show();
              });
            }
          };
          $modal.destroy = function () {
            // Remove element
            if (modalElement) {
              modalElement.remove();
              modalElement = null;
            }
            if (backdropElement) {
              backdropElement.remove();
              backdropElement = null;
            }
            // Destroy scope
            scope.$destroy();
          };
          $modal.show = function () {
            var parent = options.container ? findElement(options.container) : null;
            var after = options.container ? null : options.element;
            // Fetch a cloned element linked from template
            modalElement = $modal.$element = modalLinker(scope, function (clonedElement, scope) {
            });
            // Set the initial positioning.
            modalElement.css({ display: 'block' }).addClass(options.placement);
            // Options: animation
            if (options.animation) {
              if (options.backdrop) {
                backdropElement.addClass(options.backdropAnimation);
              }
              modalElement.addClass(options.animation);
            }
            if (options.backdrop) {
              $animate.enter(backdropElement, bodyElement, null, function () {
              });
            }
            $animate.enter(modalElement, parent, after, function () {
            });
            scope.$isShown = true;
            scope.$$phase || scope.$digest();
            // Focus once the enter-animation has started
            // Weird PhantomJS bug hack
            var el = modalElement[0];
            requestAnimationFrame(function () {
              el.focus();
            });
            bodyElement.addClass(options.prefixClass + '-open');
            if (options.animation) {
              bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
            }
            // Bind events
            if (options.backdrop) {
              modalElement.on('click', hideOnBackdropClick);
              backdropElement.on('click', hideOnBackdropClick);
            }
            if (options.keyboard) {
              modalElement.on('keyup', $modal.$onKeyUp);
            }
          };
          $modal.hide = function () {
            $animate.leave(modalElement, function () {
              bodyElement.removeClass(options.prefixClass + '-open');
              if (options.animation) {
                bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
              }
            });
            if (options.backdrop) {
              $animate.leave(backdropElement, function () {
              });
            }
            scope.$isShown = false;
            scope.$$phase || scope.$digest();
            // Unbind events
            if (options.backdrop) {
              modalElement.off('click', hideOnBackdropClick);
              backdropElement.off('click', hideOnBackdropClick);
            }
            if (options.keyboard) {
              modalElement.off('keyup', $modal.$onKeyUp);
            }
          };
          $modal.toggle = function () {
            scope.$isShown ? $modal.hide() : $modal.show();
          };
          $modal.focus = function () {
            modalElement[0].focus();
          };
          // Protected methods
          $modal.$onKeyUp = function (evt) {
            evt.which === 27 && $modal.hide();
          };
          // Private methods
          function hideOnBackdropClick(evt) {
            if (evt.target !== evt.currentTarget)
              return;
            options.backdrop === 'static' ? $modal.focus() : $modal.hide();
          }
          return $modal;
        }
        // Helper functions
        function findElement(query, element) {
          return angular.element((element || document).querySelectorAll(query));
        }
        function fetchTemplate(template) {
          return $q.when($templateCache.get(template) || $http.get(template)).then(function (res) {
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          });
        }
        return ModalFactory;
      }
    ];
  }).directive('bsModal', [
    '$window',
    '$location',
    '$sce',
    '$modal',
    function ($window, $location, $sce, $modal) {
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          // Directive options
          var options = {
              scope: scope,
              element: element,
              show: false
            };
          angular.forEach([
            'template',
            'contentTemplate',
            'placement',
            'backdrop',
            'keyboard',
            'html',
            'container',
            'animation'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Support scope as data-attrs
          angular.forEach([
            'title',
            'content'
          ], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = $sce.trustAsHtml(newValue);
            });
          });
          // Support scope as an object
          attr.bsModal && scope.$watch(attr.bsModal, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
          }, true);
          // Initialize modal
          var modal = $modal(options);
          // Trigger
          element.on(attr.trigger || 'click', modal.toggle);
          // Garbage collection
          scope.$on('$destroy', function () {
            modal.destroy();
            options = null;
            modal = null;
          });
        }
      };
    }
  ]);
  // Source: src/navbar/navbar.js
  angular.module('mgcrea.ngStrap.navbar', []).provider('$navbar', function () {
    var defaults = this.defaults = {
        activeClass: 'active',
        routeAttr: 'data-match-route',
        strict: false
      };
    this.$get = function () {
      return { defaults: defaults };
    };
  }).directive('bsNavbar', [
    '$window',
    '$location',
    '$navbar',
    function ($window, $location, $navbar) {
      var defaults = $navbar.defaults;
      return {
        restrict: 'A',
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = angular.copy(defaults);
          angular.forEach(Object.keys(defaults), function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Watch for the $location
          scope.$watch(function () {
            return $location.path();
          }, function (newValue, oldValue) {
            var liElements = element[0].querySelectorAll('li[' + options.routeAttr + ']');
            angular.forEach(liElements, function (li) {
              var liElement = angular.element(li);
              var pattern = liElement.attr(options.routeAttr).replace('/', '\\/');
              if (options.strict) {
                pattern = '^' + pattern + '$';
              }
              var regexp = new RegExp(pattern, ['i']);
              if (regexp.test(newValue)) {
                liElement.addClass(options.activeClass);
              } else {
                liElement.removeClass(options.activeClass);
              }
            });
          });
        }
      };
    }
  ]);
  // Source: src/popover/popover.js
  angular.module('mgcrea.ngStrap.popover', ['mgcrea.ngStrap.tooltip']).provider('$popover', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        placement: 'right',
        template: 'popover/popover.tpl.html',
        contentTemplate: false,
        trigger: 'click',
        keyboard: true,
        html: false,
        title: '',
        content: '',
        delay: 0,
        container: false
      };
    this.$get = [
      '$tooltip',
      function ($tooltip) {
        function PopoverFactory(element, config) {
          // Common vars
          var options = angular.extend({}, defaults, config);
          var $popover = $tooltip(element, options);
          // Support scope as string options [/*title, */content]
          if (options.content) {
            $popover.$scope.content = options.content;
          }
          return $popover;
        }
        return PopoverFactory;
      }
    ];
  }).directive('bsPopover', [
    '$window',
    '$location',
    '$sce',
    '$popover',
    function ($window, $location, $sce, $popover) {
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr) {
          // Directive options
          var options = { scope: scope };
          angular.forEach([
            'template',
            'contentTemplate',
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Support scope as data-attrs
          angular.forEach([
            'title',
            'content'
          ], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = $sce.trustAsHtml(newValue);
              angular.isDefined(oldValue) && requestAnimationFrame(function () {
                popover && popover.$applyPlacement();
              });
            });
          });
          // Support scope as an object
          attr.bsPopover && scope.$watch(attr.bsPopover, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
            angular.isDefined(oldValue) && requestAnimationFrame(function () {
              popover && popover.$applyPlacement();
            });
          }, true);
          // Initialize popover
          var popover = $popover(element, options);
          // Garbage collection
          scope.$on('$destroy', function () {
            popover.destroy();
            options = null;
            popover = null;
          });
        }
      };
    }
  ]);
  // Source: src/scrollspy/scrollspy.js
  angular.module('mgcrea.ngStrap.scrollspy', [
    'mgcrea.ngStrap.helpers.debounce',
    'mgcrea.ngStrap.helpers.dimensions'
  ]).provider('$scrollspy', function () {
    // Pool of registered spies
    var spies = this.$$spies = {};
    var defaults = this.defaults = {
        debounce: 150,
        throttle: 100,
        offset: 100
      };
    this.$get = [
      '$window',
      '$document',
      '$rootScope',
      'dimensions',
      'debounce',
      'throttle',
      function ($window, $document, $rootScope, dimensions, debounce, throttle) {
        var windowEl = angular.element($window);
        var docEl = angular.element($document.prop('documentElement'));
        var bodyEl = angular.element($window.document.body);
        // Helper functions
        function nodeName(element, name) {
          return element[0].nodeName && element[0].nodeName.toLowerCase() === name.toLowerCase();
        }
        function ScrollSpyFactory(config) {
          // Common vars
          var options = angular.extend({}, defaults, config);
          if (!options.element)
            options.element = bodyEl;
          var isWindowSpy = nodeName(options.element, 'body');
          var scrollEl = isWindowSpy ? windowEl : options.element;
          var scrollId = isWindowSpy ? 'window' : options.id;
          // Use existing spy
          if (spies[scrollId]) {
            spies[scrollId].$$count++;
            return spies[scrollId];
          }
          var $scrollspy = {};
          // Private vars
          var unbindViewContentLoaded, unbindIncludeContentLoaded;
          var trackedElements = $scrollspy.$trackedElements = [];
          var sortedElements = [];
          var activeTarget;
          var debouncedCheckPosition;
          var throttledCheckPosition;
          var debouncedCheckOffsets;
          var viewportHeight;
          var scrollTop;
          $scrollspy.init = function () {
            // Setup internal ref counter
            this.$$count = 1;
            // Bind events
            debouncedCheckPosition = debounce(this.checkPosition, options.debounce);
            throttledCheckPosition = throttle(this.checkPosition, options.throttle);
            scrollEl.on('click', this.checkPositionWithEventLoop);
            windowEl.on('resize', debouncedCheckPosition);
            scrollEl.on('scroll', throttledCheckPosition);
            debouncedCheckOffsets = debounce(this.checkOffsets, options.debounce);
            unbindViewContentLoaded = $rootScope.$on('$viewContentLoaded', debouncedCheckOffsets);
            unbindIncludeContentLoaded = $rootScope.$on('$includeContentLoaded', debouncedCheckOffsets);
            debouncedCheckOffsets();
            // Register spy for reuse
            if (scrollId) {
              spies[scrollId] = $scrollspy;
            }
          };
          $scrollspy.destroy = function () {
            // Check internal ref counter
            this.$$count--;
            if (this.$$count > 0) {
              return;
            }
            // Unbind events
            scrollEl.off('click', this.checkPositionWithEventLoop);
            windowEl.off('resize', debouncedCheckPosition);
            scrollEl.off('scroll', debouncedCheckPosition);
            unbindViewContentLoaded();
            unbindIncludeContentLoaded();
          };
          $scrollspy.checkPosition = function () {
            // Not ready yet
            if (!sortedElements.length)
              return;
            // Calculate the scroll position
            scrollTop = (isWindowSpy ? $window.pageYOffset : scrollEl.prop('scrollTop')) || 0;
            // Calculate the viewport height for use by the components
            viewportHeight = Math.max($window.innerHeight, docEl.prop('clientHeight'));
            // Activate first element if scroll is smaller
            if (scrollTop < sortedElements[0].offsetTop && activeTarget !== sortedElements[0].target) {
              return $scrollspy.$activateElement(sortedElements[0]);
            }
            // Activate proper element
            for (var i = sortedElements.length; i--;) {
              if (angular.isUndefined(sortedElements[i].offsetTop) || sortedElements[i].offsetTop === null)
                continue;
              if (activeTarget === sortedElements[i].target)
                continue;
              if (scrollTop < sortedElements[i].offsetTop)
                continue;
              if (sortedElements[i + 1] && scrollTop > sortedElements[i + 1].offsetTop)
                continue;
              return $scrollspy.$activateElement(sortedElements[i]);
            }
          };
          $scrollspy.checkPositionWithEventLoop = function () {
            setTimeout(this.checkPosition, 1);
          };
          // Protected methods
          $scrollspy.$activateElement = function (element) {
            if (activeTarget) {
              var activeElement = $scrollspy.$getTrackedElement(activeTarget);
              if (activeElement) {
                activeElement.source.removeClass('active');
                if (nodeName(activeElement.source, 'li') && nodeName(activeElement.source.parent().parent(), 'li')) {
                  activeElement.source.parent().parent().removeClass('active');
                }
              }
            }
            activeTarget = element.target;
            element.source.addClass('active');
            if (nodeName(element.source, 'li') && nodeName(element.source.parent().parent(), 'li')) {
              element.source.parent().parent().addClass('active');
            }
          };
          $scrollspy.$getTrackedElement = function (target) {
            return trackedElements.filter(function (obj) {
              return obj.target === target;
            })[0];
          };
          // Track offsets behavior
          $scrollspy.checkOffsets = function () {
            angular.forEach(trackedElements, function (trackedElement) {
              var targetElement = document.querySelector(trackedElement.target);
              trackedElement.offsetTop = targetElement ? dimensions.offset(targetElement).top : null;
              if (options.offset && trackedElement.offsetTop !== null)
                trackedElement.offsetTop -= options.offset * 1;
            });
            sortedElements = trackedElements.filter(function (el) {
              return el.offsetTop !== null;
            }).sort(function (a, b) {
              return a.offsetTop - b.offsetTop;
            });
            debouncedCheckPosition();
          };
          $scrollspy.trackElement = function (target, source) {
            trackedElements.push({
              target: target,
              source: source
            });
          };
          $scrollspy.untrackElement = function (target, source) {
            var toDelete;
            for (var i = trackedElements.length; i--;) {
              if (trackedElements[i].target === target && trackedElements[i].source === source) {
                toDelete = i;
                break;
              }
            }
            trackedElements = trackedElements.splice(toDelete, 1);
          };
          $scrollspy.activate = function (i) {
            trackedElements[i].addClass('active');
          };
          // Initialize plugin
          $scrollspy.init();
          return $scrollspy;
        }
        return ScrollSpyFactory;
      }
    ];
  }).directive('bsScrollspy', [
    '$rootScope',
    'debounce',
    'dimensions',
    '$scrollspy',
    function ($rootScope, debounce, dimensions, $scrollspy) {
      return {
        restrict: 'EAC',
        link: function postLink(scope, element, attr) {
          var options = { scope: scope };
          angular.forEach([
            'offset',
            'target'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          var scrollspy = $scrollspy(options);
          scrollspy.trackElement(options.target, element);
          scope.$on('$destroy', function () {
            scrollspy.untrackElement(options.target, element);
            scrollspy.destroy();
            options = null;
            scrollspy = null;
          });
        }
      };
    }
  ]).directive('bsScrollspyList', [
    '$rootScope',
    'debounce',
    'dimensions',
    '$scrollspy',
    function ($rootScope, debounce, dimensions, $scrollspy) {
      return {
        restrict: 'A',
        compile: function postLink(element, attr) {
          var children = element[0].querySelectorAll('li > a[href]');
          angular.forEach(children, function (child) {
            var childEl = angular.element(child);
            childEl.parent().attr('bs-scrollspy', '').attr('data-target', childEl.attr('href'));
          });
        }
      };
    }
  ]);
  // Source: src/select/select.js
  angular.module('mgcrea.ngStrap.select', [
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.helpers.parseOptions'
  ]).provider('$select', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'select',
        placement: 'bottom-left',
        template: 'select/select.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        multiple: false,
        sort: true,
        caretHtml: '&nbsp;<span class="caret"></span>',
        placeholder: 'Choose among the following...',
        maxLength: 3,
        maxLengthHtml: 'selected'
      };
    this.$get = [
      '$window',
      '$document',
      '$rootScope',
      '$tooltip',
      function ($window, $document, $rootScope, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        var isTouch = 'createTouch' in $window.document;
        function SelectFactory(element, controller, config) {
          var $select = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          $select = $tooltip(element, options);
          var parentScope = config.scope;
          var scope = $select.$scope;
          scope.$matches = [];
          scope.$activeIndex = 0;
          scope.$isMultiple = options.multiple;
          scope.$activate = function (index) {
            scope.$$postDigest(function () {
              $select.activate(index);
            });
          };
          scope.$select = function (index, evt) {
            scope.$$postDigest(function () {
              $select.select(index);
            });
          };
          scope.$isVisible = function () {
            return $select.$isVisible();
          };
          scope.$isActive = function (index) {
            return $select.$isActive(index);
          };
          // Public methods
          $select.update = function (matches) {
            scope.$matches = matches;
            $select.$updateActiveIndex();
          };
          $select.activate = function (index) {
            if (options.multiple) {
              scope.$activeIndex.sort();
              $select.$isActive(index) ? scope.$activeIndex.splice(scope.$activeIndex.indexOf(index), 1) : scope.$activeIndex.push(index);
              if (options.sort)
                scope.$activeIndex.sort();
            } else {
              scope.$activeIndex = index;
            }
            return scope.$activeIndex;
          };
          $select.select = function (index) {
            var value = scope.$matches[index].value;
            $select.activate(index);
            if (options.multiple) {
              controller.$setViewValue(scope.$activeIndex.map(function (index) {
                return scope.$matches[index].value;
              }));
            } else {
              controller.$setViewValue(value);
            }
            controller.$render();
            if (parentScope)
              parentScope.$digest();
            // Hide if single select
            if (!options.multiple) {
              if (options.trigger === 'focus')
                element[0].blur();
              else if ($select.$isShown)
                $select.hide();
            }
            // Emit event
            scope.$emit('$select.select', value, index);
          };
          // Protected methods
          $select.$updateActiveIndex = function () {
            if (controller.$modelValue && scope.$matches.length) {
              if (options.multiple && angular.isArray(controller.$modelValue)) {
                scope.$activeIndex = controller.$modelValue.map(function (value) {
                  return $select.$getIndex(value);
                });
              } else {
                scope.$activeIndex = $select.$getIndex(controller.$modelValue);
              }
            } else if (scope.$activeIndex >= scope.$matches.length) {
              scope.$activeIndex = options.multiple ? [] : 0;
            }
          };
          $select.$isVisible = function () {
            if (!options.minLength || !controller) {
              return scope.$matches.length;
            }
            // minLength support
            return scope.$matches.length && controller.$viewValue.length >= options.minLength;
          };
          $select.$isActive = function (index) {
            if (options.multiple) {
              return scope.$activeIndex.indexOf(index) !== -1;
            } else {
              return scope.$activeIndex === index;
            }
          };
          $select.$getIndex = function (value) {
            var l = scope.$matches.length, i = l;
            if (!l)
              return;
            for (i = l; i--;) {
              if (scope.$matches[i].value === value)
                break;
            }
            if (i < 0)
              return;
            return i;
          };
          $select.$onMouseDown = function (evt) {
            // Prevent blur on mousedown on .dropdown-menu
            evt.preventDefault();
            evt.stopPropagation();
            // Emulate click for mobile devices
            if (isTouch) {
              var targetEl = angular.element(evt.target);
              targetEl.triggerHandler('click');
            }
          };
          $select.$onKeyDown = function (evt) {
            if (!/(38|40|13)/.test(evt.keyCode))
              return;
            evt.preventDefault();
            evt.stopPropagation();
            // Select with enter
            if (evt.keyCode === 13) {
              return $select.select(scope.$activeIndex);
            }
            // Navigate with keyboard
            if (evt.keyCode === 38 && scope.$activeIndex > 0)
              scope.$activeIndex--;
            else if (evt.keyCode === 40 && scope.$activeIndex < scope.$matches.length - 1)
              scope.$activeIndex++;
            else if (angular.isUndefined(scope.$activeIndex))
              scope.$activeIndex = 0;
            scope.$digest();
          };
          // Overrides
          var _show = $select.show;
          $select.show = function () {
            _show();
            if (options.multiple) {
              $select.$element.addClass('select-multiple');
            }
            setTimeout(function () {
              $select.$element.on(isTouch ? 'touchstart' : 'mousedown', $select.$onMouseDown);
              if (options.keyboard) {
                element.on('keydown', $select.$onKeyDown);
              }
            });
          };
          var _hide = $select.hide;
          $select.hide = function () {
            $select.$element.off(isTouch ? 'touchstart' : 'mousedown', $select.$onMouseDown);
            if (options.keyboard) {
              element.off('keydown', $select.$onKeyDown);
            }
            _hide();
          };
          return $select;
        }
        SelectFactory.defaults = defaults;
        return SelectFactory;
      }
    ];
  }).directive('bsSelect', [
    '$window',
    '$parse',
    '$q',
    '$select',
    '$parseOptions',
    function ($window, $parse, $q, $select, $parseOptions) {
      var defaults = $select.defaults;
      return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = { scope: scope };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template',
            'placeholder',
            'multiple',
            'maxLength',
            'maxLengthHtml'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Add support for select markup
          if (element[0].nodeName.toLowerCase() === 'select') {
            var inputEl = element;
            inputEl.css('display', 'none');
            element = angular.element('<button type="button" class="btn btn-default"></button>');
            inputEl.after(element);
          }
          // Build proper ngOptions
          var parsedOptions = $parseOptions(attr.ngOptions);
          // Initialize select
          var select = $select(element, controller, options);
          // Watch ngOptions values before filtering for changes
          var watchedOptions = parsedOptions.$match[7].replace(/\|.+/, '').trim();
          scope.$watch(watchedOptions, function (newValue, oldValue) {
            // console.warn('scope.$watch(%s)', watchedOptions, newValue, oldValue);
            parsedOptions.valuesFn(scope, controller).then(function (values) {
              select.update(values);
              controller.$render();
            });
          }, true);
          // Watch model for changes
          scope.$watch(attr.ngModel, function (newValue, oldValue) {
            // console.warn('scope.$watch(%s)', attr.ngModel, newValue, oldValue);
            select.$updateActiveIndex();
          }, true);
          // Model rendering in view
          controller.$render = function () {
            // console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
            var selected, index;
            if (options.multiple && angular.isArray(controller.$modelValue)) {
              selected = controller.$modelValue.map(function (value) {
                index = select.$getIndex(value);
                return angular.isDefined(index) ? select.$scope.$matches[index].label : false;
              }).filter(angular.isDefined);
              if (selected.length > (options.maxLength || defaults.maxLength)) {
                selected = selected.length + ' ' + (options.maxLengthHtml || defaults.maxLengthHtml);
              } else {
                selected = selected.join(', ');
              }
            } else {
              index = select.$getIndex(controller.$modelValue);
              selected = angular.isDefined(index) ? select.$scope.$matches[index].label : false;
            }
            element.html((selected ? selected : attr.placeholder || defaults.placeholder) + defaults.caretHtml);
          };
          // Garbage collection
          scope.$on('$destroy', function () {
            select.destroy();
            options = null;
            select = null;
          });
        }
      };
    }
  ]);
  // Source: src/tab/tab.js
  angular.module('mgcrea.ngStrap.tab', []).run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('$pane', '{{pane.content}}');
    }
  ]).provider('$tab', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        template: 'tab/tab.tpl.html'
      };
    this.$get = function () {
      return { defaults: defaults };
    };
  }).directive('bsTabs', [
    '$window',
    '$animate',
    '$tab',
    function ($window, $animate, $tab) {
      var defaults = $tab.defaults;
      return {
        restrict: 'EAC',
        scope: true,
        require: '?ngModel',
        templateUrl: function (element, attr) {
          return attr.template || defaults.template;
        },
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = defaults;
          angular.forEach(['animation'], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Require scope as an object
          attr.bsTabs && scope.$watch(attr.bsTabs, function (newValue, oldValue) {
            scope.panes = newValue;
          }, true);
          // Add base class
          element.addClass('tabs');
          // Support animations
          if (options.animation) {
            element.addClass(options.animation);
          }
          scope.active = scope.activePane = 0;
          // view -> model
          scope.setActive = function (index, ev) {
            scope.active = index;
            if (controller) {
              controller.$setViewValue(index);
            }
          };
          // model -> view
          if (controller) {
            controller.$render = function () {
              scope.active = controller.$modelValue * 1;
            };
          }
        }
      };
    }
  ]);
  // Source: src/timepicker/timepicker.js
  angular.module('mgcrea.ngStrap.timepicker', [
    'mgcrea.ngStrap.helpers.dateParser',
    'mgcrea.ngStrap.tooltip'
  ]).provider('$timepicker', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'timepicker',
        placement: 'bottom-left',
        template: 'timepicker/timepicker.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        useNative: true,
        timeType: 'date',
        timeFormat: 'shortTime',
        autoclose: false,
        minTime: -Infinity,
        maxTime: +Infinity,
        length: 5,
        hourStep: 1,
        minuteStep: 5
      };
    this.$get = [
      '$window',
      '$document',
      '$rootScope',
      '$sce',
      '$locale',
      'dateFilter',
      '$tooltip',
      function ($window, $document, $rootScope, $sce, $locale, dateFilter, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        var isTouch = 'createTouch' in $window.document;
        var isNative = /(ip(a|o)d|iphone|android)/gi.test($window.navigator.userAgent);
        if (!defaults.lang)
          defaults.lang = $locale.id;
        function timepickerFactory(element, controller, config) {
          var $timepicker = $tooltip(element, angular.extend({}, defaults, config));
          var parentScope = config.scope;
          var options = $timepicker.$options;
          var scope = $timepicker.$scope;
          // View vars
          var selectedIndex = 0;
          var startDate = controller.$dateValue || new Date();
          var viewDate = {
              hour: startDate.getHours(),
              meridian: startDate.getHours() < 12,
              minute: startDate.getMinutes(),
              second: startDate.getSeconds(),
              millisecond: startDate.getMilliseconds()
            };
          var format = $locale.DATETIME_FORMATS[options.timeFormat] || options.timeFormat;
          var formats = /(h+)[:]?(m+)[ ]?(a?)/i.exec(format).slice(1);
          // Scope methods
          scope.$select = function (date, index) {
            $timepicker.select(date, index);
          };
          scope.$moveIndex = function (value, index) {
            $timepicker.$moveIndex(value, index);
          };
          scope.$switchMeridian = function (date) {
            $timepicker.switchMeridian(date);
          };
          // Public methods
          $timepicker.update = function (date) {
            // console.warn('$timepicker.update() newValue=%o', date);
            if (angular.isDate(date) && !isNaN(date.getTime())) {
              $timepicker.$date = date;
              angular.extend(viewDate, {
                hour: date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds(),
                millisecond: date.getMilliseconds()
              });
              $timepicker.$build();
            } else if (!$timepicker.$isBuilt) {
              $timepicker.$build();
            }
          };
          $timepicker.select = function (date, index, keep) {
            // console.warn('$timepicker.select', date, scope.$mode);
            if (isNaN(controller.$dateValue.getTime()))
              controller.$dateValue = new Date(1970, 0, 1);
            if (!angular.isDate(date))
              date = new Date(date);
            if (index === 0)
              controller.$dateValue.setHours(date.getHours());
            else if (index === 1)
              controller.$dateValue.setMinutes(date.getMinutes());
            controller.$setViewValue(controller.$dateValue);
            controller.$render();
            if (options.autoclose && !keep) {
              $timepicker.hide(true);
            }
          };
          $timepicker.switchMeridian = function (date) {
            var hours = (date || controller.$dateValue).getHours();
            controller.$dateValue.setHours(hours < 12 ? hours + 12 : hours - 12);
            controller.$render();
          };
          // Protected methods
          $timepicker.$build = function () {
            // console.warn('$timepicker.$build() viewDate=%o', viewDate);
            var i, midIndex = scope.midIndex = parseInt(options.length / 2, 10);
            var hours = [], hour;
            for (i = 0; i < options.length; i++) {
              hour = new Date(1970, 0, 1, viewDate.hour - (midIndex - i) * options.hourStep);
              hours.push({
                date: hour,
                label: dateFilter(hour, formats[0]),
                selected: $timepicker.$date && $timepicker.$isSelected(hour, 0),
                disabled: $timepicker.$isDisabled(hour, 0)
              });
            }
            var minutes = [], minute;
            for (i = 0; i < options.length; i++) {
              minute = new Date(1970, 0, 1, 0, viewDate.minute - (midIndex - i) * options.minuteStep);
              minutes.push({
                date: minute,
                label: dateFilter(minute, formats[1]),
                selected: $timepicker.$date && $timepicker.$isSelected(minute, 1),
                disabled: $timepicker.$isDisabled(minute, 1)
              });
            }
            var rows = [];
            for (i = 0; i < options.length; i++) {
              rows.push([
                hours[i],
                minutes[i]
              ]);
            }
            scope.rows = rows;
            scope.showAM = !!formats[2];
            scope.isAM = ($timepicker.$date || hours[midIndex].date).getHours() < 12;
            $timepicker.$isBuilt = true;
          };
          $timepicker.$isSelected = function (date, index) {
            if (!$timepicker.$date)
              return false;
            else if (index === 0) {
              return date.getHours() === $timepicker.$date.getHours();
            } else if (index === 1) {
              return date.getMinutes() === $timepicker.$date.getMinutes();
            }
          };
          $timepicker.$isDisabled = function (date, index) {
            var selectedTime;
            if (index === 0) {
              selectedTime = date.getTime() + viewDate.minute * 60000;
            } else if (index === 1) {
              selectedTime = date.getTime() + viewDate.hour * 3600000;
            }
            return selectedTime < options.minTime || selectedTime > options.maxTime;
          };
          $timepicker.$moveIndex = function (value, index) {
            var targetDate;
            if (index === 0) {
              targetDate = new Date(1970, 0, 1, viewDate.hour + value * options.length, viewDate.minute);
              angular.extend(viewDate, { hour: targetDate.getHours() });
            } else if (index === 1) {
              targetDate = new Date(1970, 0, 1, viewDate.hour, viewDate.minute + value * options.length * 5);
              angular.extend(viewDate, { minute: targetDate.getMinutes() });
            }
            $timepicker.$build();
          };
          $timepicker.$onMouseDown = function (evt) {
            // Prevent blur on mousedown on .dropdown-menu
            if (evt.target.nodeName.toLowerCase() !== 'input')
              evt.preventDefault();
            evt.stopPropagation();
            // Emulate click for mobile devices
            if (isTouch) {
              var targetEl = angular.element(evt.target);
              if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                targetEl = targetEl.parent();
              }
              targetEl.triggerHandler('click');
            }
          };
          $timepicker.$onKeyDown = function (evt) {
            if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey)
              return;
            evt.preventDefault();
            evt.stopPropagation();
            // Close on enter
            if (evt.keyCode === 13)
              return $timepicker.hide(true);
            // Navigate with keyboard
            var newDate = new Date($timepicker.$date);
            var hours = newDate.getHours(), hoursLength = dateFilter(newDate, 'h').length;
            var minutes = newDate.getMinutes(), minutesLength = dateFilter(newDate, 'mm').length;
            var lateralMove = /(37|39)/.test(evt.keyCode);
            var count = 2 + !!formats[2] * 1;
            // Navigate indexes (left, right)
            if (lateralMove) {
              if (evt.keyCode === 37)
                selectedIndex = selectedIndex < 1 ? count - 1 : selectedIndex - 1;
              else if (evt.keyCode === 39)
                selectedIndex = selectedIndex < count - 1 ? selectedIndex + 1 : 0;
            }
            // Update values (up, down)
            if (selectedIndex === 0) {
              if (lateralMove)
                return createSelection(0, hoursLength);
              if (evt.keyCode === 38)
                newDate.setHours(hours - options.hourStep);
              else if (evt.keyCode === 40)
                newDate.setHours(hours + options.hourStep);
            } else if (selectedIndex === 1) {
              if (lateralMove)
                return createSelection(hoursLength + 1, hoursLength + 1 + minutesLength);
              if (evt.keyCode === 38)
                newDate.setMinutes(minutes - options.minuteStep);
              else if (evt.keyCode === 40)
                newDate.setMinutes(minutes + options.minuteStep);
            } else if (selectedIndex === 2) {
              if (lateralMove)
                return createSelection(hoursLength + 1 + minutesLength + 1, hoursLength + 1 + minutesLength + 3);
              $timepicker.switchMeridian();
            }
            $timepicker.select(newDate, selectedIndex, true);
            parentScope.$digest();
          };
          // Private
          function createSelection(start, end) {
            if (element[0].createTextRange) {
              var selRange = element[0].createTextRange();
              selRange.collapse(true);
              selRange.moveStart('character', start);
              selRange.moveEnd('character', end);
              selRange.select();
            } else if (element[0].setSelectionRange) {
              element[0].setSelectionRange(start, end);
            } else if (angular.isUndefined(element[0].selectionStart)) {
              element[0].selectionStart = start;
              element[0].selectionEnd = end;
            }
          }
          function focusElement() {
            element[0].focus();
          }
          // Overrides
          var _init = $timepicker.init;
          $timepicker.init = function () {
            if (isNative && options.useNative) {
              element.prop('type', 'time');
              element.css('-webkit-appearance', 'textfield');
              return;
            } else if (isTouch) {
              element.prop('type', 'text');
              element.attr('readonly', 'true');
              element.on('click', focusElement);
            }
            _init();
          };
          var _destroy = $timepicker.destroy;
          $timepicker.destroy = function () {
            if (isNative && options.useNative) {
              element.off('click', focusElement);
            }
            _destroy();
          };
          var _show = $timepicker.show;
          $timepicker.show = function () {
            _show();
            setTimeout(function () {
              $timepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $timepicker.$onMouseDown);
              if (options.keyboard) {
                element.on('keydown', $timepicker.$onKeyDown);
              }
            });
          };
          var _hide = $timepicker.hide;
          $timepicker.hide = function (blur) {
            $timepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $timepicker.$onMouseDown);
            if (options.keyboard) {
              element.off('keydown', $timepicker.$onKeyDown);
            }
            _hide(blur);
          };
          return $timepicker;
        }
        timepickerFactory.defaults = defaults;
        return timepickerFactory;
      }
    ];
  }).directive('bsTimepicker', [
    '$window',
    '$parse',
    '$q',
    '$locale',
    'dateFilter',
    '$timepicker',
    '$dateParser',
    '$timeout',
    function ($window, $parse, $q, $locale, dateFilter, $timepicker, $dateParser, $timeout) {
      var defaults = $timepicker.defaults;
      var isNative = /(ip(a|o)d|iphone|android)/gi.test($window.navigator.userAgent);
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = {
              scope: scope,
              controller: controller
            };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template',
            'autoclose',
            'timeType',
            'timeFormat',
            'useNative',
            'lang'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Initialize timepicker
          if (isNative && (options.useNative || defaults.useNative))
            options.timeFormat = 'HH:mm';
          var timepicker = $timepicker(element, controller, options);
          options = timepicker.$options;
          // Initialize parser
          var dateParser = $dateParser({
              format: options.timeFormat,
              lang: options.lang
            });
          // Observe attributes for changes
          angular.forEach([
            'minTime',
            'maxTime'
          ], function (key) {
            // console.warn('attr.$observe(%s)', key, attr[key]);
            angular.isDefined(attr[key]) && attr.$observe(key, function (newValue) {
              if (newValue === 'now') {
                timepicker.$options[key] = new Date().setFullYear(1970, 0, 1);
              } else if (angular.isString(newValue) && newValue.match(/^".+"$/)) {
                timepicker.$options[key] = +new Date(newValue.substr(1, newValue.length - 2));
              } else {
                timepicker.$options[key] = dateParser.parse(newValue);
              }
              !isNaN(timepicker.$options[key]) && timepicker.$build();
            });
          });
          // Watch model for changes
          scope.$watch(attr.ngModel, function (newValue, oldValue) {
            // console.warn('scope.$watch(%s)', attr.ngModel, newValue, oldValue, controller.$dateValue);
            timepicker.update(controller.$dateValue);
          }, true);
          // viewValue -> $parsers -> modelValue
          controller.$parsers.unshift(function (viewValue) {
            // console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
            // Null values should correctly reset the model value & validity
            if (!viewValue) {
              controller.$setValidity('date', true);
              return;
            }
            var parsedTime = dateParser.parse(viewValue, controller.$dateValue);
            if (!parsedTime || isNaN(parsedTime.getTime())) {
              controller.$setValidity('date', false);
            } else {
              var isValid = parsedTime.getTime() >= options.minTime && parsedTime.getTime() <= options.maxTime;
              controller.$setValidity('date', isValid);
              // Only update the model when we have a valid date
              if (isValid)
                controller.$dateValue = parsedTime;
            }
            if (options.timeType === 'string') {
              return dateFilter(viewValue, options.timeFormat);
            } else if (options.timeType === 'number') {
              return controller.$dateValue.getTime();
            } else if (options.timeType === 'iso') {
              return controller.$dateValue.toISOString();
            } else {
              return controller.$dateValue;
            }
          });
          // modelValue -> $formatters -> viewValue
          controller.$formatters.push(function (modelValue) {
            // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
            var date = options.timeType === 'string' ? dateParser.parse(modelValue, controller.$dateValue) : new Date(modelValue);
            // Setup default value: next hour?
            // if(isNaN(date.getTime())) date = new Date(new Date().setMinutes(0) + 36e5);
            controller.$dateValue = date;
            return controller.$dateValue;
          });
          // viewValue -> element
          controller.$render = function () {
            // console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
            element.val(isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.timeFormat));
          };
          // Garbage collection
          scope.$on('$destroy', function () {
            timepicker.destroy();
            options = null;
            timepicker = null;
          });
        }
      };
    }
  ]);
  // Source: src/tooltip/tooltip.js
  angular.module('mgcrea.ngStrap.tooltip', [
    'ngAnimate',
    'mgcrea.ngStrap.helpers.dimensions'
  ]).provider('$tooltip', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'tooltip',
        container: false,
        placement: 'top',
        template: 'tooltip/tooltip.tpl.html',
        contentTemplate: false,
        trigger: 'hover focus',
        keyboard: false,
        html: false,
        show: false,
        title: '',
        type: '',
        delay: 0
      };
    this.$get = [
      '$window',
      '$rootScope',
      '$compile',
      '$q',
      '$templateCache',
      '$http',
      '$animate',
      '$timeout',
      'dimensions',
      '$$animateReflow',
      function ($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, dimensions, $$animateReflow) {
        var trim = String.prototype.trim;
        var isTouch = 'createTouch' in $window.document;
        var htmlReplaceRegExp = /ng-bind="/gi;
        function TooltipFactory(element, config) {
          var $tooltip = {};
          // Common vars
          var options = $tooltip.$options = angular.extend({}, defaults, config);
          $tooltip.$promise = fetchTemplate(options.template);
          var scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
          if (options.delay && angular.isString(options.delay)) {
            options.delay = parseFloat(options.delay);
          }
          // Support scope as string options
          if (options.title) {
            $tooltip.$scope.title = options.title;
          }
          // Provide scope helpers
          scope.$hide = function () {
            scope.$$postDigest(function () {
              $tooltip.hide();
            });
          };
          scope.$show = function () {
            scope.$$postDigest(function () {
              $tooltip.show();
            });
          };
          scope.$toggle = function () {
            scope.$$postDigest(function () {
              $tooltip.toggle();
            });
          };
          $tooltip.$isShown = scope.$isShown = false;
          // Private vars
          var timeout, hoverState;
          // Support contentTemplate option
          if (options.contentTemplate) {
            $tooltip.$promise = $tooltip.$promise.then(function (template) {
              var templateEl = angular.element(template);
              return fetchTemplate(options.contentTemplate).then(function (contentTemplate) {
                findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
                return templateEl[0].outerHTML;
              });
            });
          }
          // Fetch, compile then initialize tooltip
          var tipLinker, tipElement, tipTemplate, tipContainer;
          $tooltip.$promise.then(function (template) {
            if (angular.isObject(template))
              template = template.data;
            if (options.html)
              template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
            template = trim.apply(template);
            tipTemplate = template;
            tipLinker = $compile(template);
            $tooltip.init();
          });
          $tooltip.init = function () {
            // Options: delay
            if (options.delay && angular.isNumber(options.delay)) {
              options.delay = {
                show: options.delay,
                hide: options.delay
              };
            }
            // Replace trigger on touch devices ?
            // if(isTouch && options.trigger === defaults.trigger) {
            //   options.trigger.replace(/hover/g, 'click');
            // }
            // Options : container
            if (options.container === 'self') {
              tipContainer = element;
            } else if (options.container) {
              tipContainer = findElement(options.container);
            }
            // Options: trigger
            var triggers = options.trigger.split(' ');
            angular.forEach(triggers, function (trigger) {
              if (trigger === 'click') {
                element.on('click', $tooltip.toggle);
              } else if (trigger !== 'manual') {
                element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
                element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
                trigger !== 'hover' && element.on(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }
            });
            // Options: show
            if (options.show) {
              scope.$$postDigest(function () {
                options.trigger === 'focus' ? element[0].focus() : $tooltip.show();
              });
            }
          };
          $tooltip.destroy = function () {
            // Unbind events
            var triggers = options.trigger.split(' ');
            for (var i = triggers.length; i--;) {
              var trigger = triggers[i];
              if (trigger === 'click') {
                element.off('click', $tooltip.toggle);
              } else if (trigger !== 'manual') {
                element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
                element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
                trigger !== 'hover' && element.off(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }
            }
            // Remove element
            if (tipElement) {
              tipElement.remove();
              tipElement = null;
            }
            // Destroy scope
            scope.$destroy();
          };
          $tooltip.enter = function () {
            clearTimeout(timeout);
            hoverState = 'in';
            if (!options.delay || !options.delay.show) {
              return $tooltip.show();
            }
            timeout = setTimeout(function () {
              if (hoverState === 'in')
                $tooltip.show();
            }, options.delay.show);
          };
          $tooltip.show = function () {
            var parent = options.container ? tipContainer : null;
            var after = options.container ? null : element;
            // Remove any existing tipElement
            if (tipElement)
              tipElement.remove();
            // Fetch a cloned element linked from template
            tipElement = $tooltip.$element = tipLinker(scope, function (clonedElement, scope) {
            });
            // Set the initial positioning.
            tipElement.css({
              top: '0px',
              left: '0px',
              display: 'block'
            }).addClass(options.placement);
            // Options: animation
            if (options.animation)
              tipElement.addClass(options.animation);
            // Options: type
            if (options.type)
              tipElement.addClass(options.prefixClass + '-' + options.type);
            $animate.enter(tipElement, parent, after, function () {
            });
            $tooltip.$isShown = scope.$isShown = true;
            scope.$$phase || scope.$digest();
            $$animateReflow($tooltip.$applyPlacement);
            // Bind events
            if (options.keyboard) {
              if (options.trigger !== 'focus') {
                $tooltip.focus();
                tipElement.on('keyup', $tooltip.$onKeyUp);
              } else {
                element.on('keyup', $tooltip.$onFocusKeyUp);
              }
            }
          };
          $tooltip.leave = function () {
            clearTimeout(timeout);
            hoverState = 'out';
            if (!options.delay || !options.delay.hide) {
              return $tooltip.hide();
            }
            timeout = setTimeout(function () {
              if (hoverState === 'out') {
                $tooltip.hide();
              }
            }, options.delay.hide);
          };
          $tooltip.hide = function (blur) {
            if (!$tooltip.$isShown)
              return;
            $animate.leave(tipElement, function () {
              tipElement = null;
            });
            $tooltip.$isShown = scope.$isShown = false;
            scope.$$phase || scope.$digest();
            // Unbind events
            if (options.keyboard) {
              tipElement.off('keyup', $tooltip.$onKeyUp);
            }
            // Allow to blur the input when hidden, like when pressing enter key
            if (blur && options.trigger === 'focus') {
              return element[0].blur();
            }
          };
          $tooltip.toggle = function () {
            $tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
          };
          $tooltip.focus = function () {
            tipElement[0].focus();
          };
          // Protected methods
          $tooltip.$applyPlacement = function () {
            if (!tipElement)
              return;
            // Get the position of the tooltip element.
            var elementPosition = getPosition();
            // Get the height and width of the tooltip so we can center it.
            var tipWidth = tipElement.prop('offsetWidth'), tipHeight = tipElement.prop('offsetHeight');
            // Get the tooltip's top and left coordinates to center it with this directive.
            var tipPosition = getCalculatedOffset(options.placement, elementPosition, tipWidth, tipHeight);
            // Now set the calculated positioning.
            tipPosition.top += 'px';
            tipPosition.left += 'px';
            tipElement.css(tipPosition);
          };
          $tooltip.$onKeyUp = function (evt) {
            evt.which === 27 && $tooltip.hide();
          };
          $tooltip.$onFocusKeyUp = function (evt) {
            evt.which === 27 && element[0].blur();
          };
          $tooltip.$onFocusElementMouseDown = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            // Some browsers do not auto-focus buttons (eg. Safari)
            $tooltip.$isShown ? element[0].blur() : element[0].focus();
          };
          // Private methods
          function getPosition() {
            if (options.container === 'body') {
              return dimensions.offset(element[0]);
            } else {
              return dimensions.position(element[0]);
            }
          }
          function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
            var offset;
            var split = placement.split('-');
            switch (split[0]) {
            case 'right':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left + position.width
              };
              break;
            case 'bottom':
              offset = {
                top: position.top + position.height,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;
            case 'left':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left - actualWidth
              };
              break;
            default:
              offset = {
                top: position.top - actualHeight,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;
            }
            if (!split[1]) {
              return offset;
            }
            // Add support for corners @todo css
            if (split[0] === 'top' || split[0] === 'bottom') {
              switch (split[1]) {
              case 'left':
                offset.left = position.left;
                break;
              case 'right':
                offset.left = position.left + position.width - actualWidth;
              }
            } else if (split[0] === 'left' || split[0] === 'right') {
              switch (split[1]) {
              case 'top':
                offset.top = position.top - actualHeight;
                break;
              case 'bottom':
                offset.top = position.top + position.height;
              }
            }
            return offset;
          }
          return $tooltip;
        }
        // Helper functions
        function findElement(query, element) {
          return angular.element((element || document).querySelectorAll(query));
        }
        function fetchTemplate(template) {
          return $q.when($templateCache.get(template) || $http.get(template)).then(function (res) {
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          });
        }
        return TooltipFactory;
      }
    ];
  }).directive('bsTooltip', [
    '$window',
    '$location',
    '$sce',
    '$tooltip',
    '$$animateReflow',
    function ($window, $location, $sce, $tooltip, $$animateReflow) {
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          // Directive options
          var options = { scope: scope };
          angular.forEach([
            'template',
            'contentTemplate',
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'type'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Observe scope attributes for change
          angular.forEach(['title'], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = $sce.trustAsHtml(newValue);
              angular.isDefined(oldValue) && $$animateReflow(function () {
                tooltip && tooltip.$applyPlacement();
              });
            });
          });
          // Support scope as an object
          attr.bsTooltip && scope.$watch(attr.bsTooltip, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
            angular.isDefined(oldValue) && $$animateReflow(function () {
              tooltip && tooltip.$applyPlacement();
            });
          }, true);
          // Initialize popover
          var tooltip = $tooltip(element, options);
          // Garbage collection
          scope.$on('$destroy', function () {
            tooltip.destroy();
            options = null;
            tooltip = null;
          });
        }
      };
    }
  ]);
  // Source: src/typeahead/typeahead.js
  angular.module('mgcrea.ngStrap.typeahead', [
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.helpers.parseOptions'
  ]).provider('$typeahead', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'typeahead',
        placement: 'bottom-left',
        template: 'typeahead/typeahead.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        minLength: 1,
        filter: 'filter',
        limit: 6
      };
    this.$get = [
      '$window',
      '$rootScope',
      '$tooltip',
      function ($window, $rootScope, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        function TypeaheadFactory(element, config) {
          var $typeahead = {};
          // Common vars
          var options = angular.extend({}, defaults, config);
          var controller = options.controller;
          $typeahead = $tooltip(element, options);
          var parentScope = config.scope;
          var scope = $typeahead.$scope;
          scope.$matches = [];
          scope.$activeIndex = 0;
          scope.$activate = function (index) {
            scope.$$postDigest(function () {
              $typeahead.activate(index);
            });
          };
          scope.$select = function (index, evt) {
            scope.$$postDigest(function () {
              $typeahead.select(index);
            });
          };
          scope.$isVisible = function () {
            return $typeahead.$isVisible();
          };
          // Public methods
          $typeahead.update = function (matches) {
            scope.$matches = matches;
            if (scope.$activeIndex >= matches.length) {
              scope.$activeIndex = 0;
            }
          };
          $typeahead.activate = function (index) {
            scope.$activeIndex = index;
          };
          $typeahead.select = function (index) {
            var value = scope.$matches[index].value;
            if (controller) {
              controller.$setViewValue(value);
              controller.$render();
              if (parentScope)
                parentScope.$digest();
            }
            if (options.trigger === 'focus')
              element[0].blur();
            else if ($typeahead.$isShown)
              $typeahead.hide();
            scope.$activeIndex = 0;
            // Emit event
            scope.$emit('$typeahead.select', value, index);
          };
          // Protected methods
          $typeahead.$isVisible = function () {
            if (!options.minLength || !controller) {
              return !!scope.$matches.length;
            }
            // minLength support
            return scope.$matches.length && angular.isString(controller.$viewValue) && controller.$viewValue.length >= options.minLength;
          };
          $typeahead.$onMouseDown = function (evt) {
            // Prevent blur on mousedown
            evt.preventDefault();
            evt.stopPropagation();
          };
          $typeahead.$onKeyDown = function (evt) {
            if (!/(38|40|13)/.test(evt.keyCode))
              return;
            evt.preventDefault();
            evt.stopPropagation();
            // Select with enter
            if (evt.keyCode === 13) {
              return $typeahead.select(scope.$activeIndex);
            }
            // Navigate with keyboard
            if (evt.keyCode === 38 && scope.$activeIndex > 0)
              scope.$activeIndex--;
            else if (evt.keyCode === 40 && scope.$activeIndex < scope.$matches.length - 1)
              scope.$activeIndex++;
            else if (angular.isUndefined(scope.$activeIndex))
              scope.$activeIndex = 0;
            scope.$digest();
          };
          // Overrides
          var show = $typeahead.show;
          $typeahead.show = function () {
            show();
            setTimeout(function () {
              $typeahead.$element.on('mousedown', $typeahead.$onMouseDown);
              if (options.keyboard) {
                element.on('keydown', $typeahead.$onKeyDown);
              }
            });
          };
          var hide = $typeahead.hide;
          $typeahead.hide = function () {
            $typeahead.$element.off('mousedown', $typeahead.$onMouseDown);
            if (options.keyboard) {
              element.off('keydown', $typeahead.$onKeyDown);
            }
            hide();
          };
          return $typeahead;
        }
        TypeaheadFactory.defaults = defaults;
        return TypeaheadFactory;
      }
    ];
  }).directive('bsTypeahead', [
    '$window',
    '$parse',
    '$q',
    '$typeahead',
    '$parseOptions',
    function ($window, $parse, $q, $typeahead, $parseOptions) {
      var defaults = $typeahead.defaults;
      return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          // Directive options
          var options = {
              scope: scope,
              controller: controller
            };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template',
            'filter',
            'limit',
            'minLength'
          ], function (key) {
            if (angular.isDefined(attr[key]))
              options[key] = attr[key];
          });
          // Build proper ngOptions
          var filter = options.filter || defaults.filter;
          var limit = options.limit || defaults.limit;
          var ngOptions = attr.ngOptions;
          if (filter)
            ngOptions += ' | ' + filter + ':$viewValue';
          if (limit)
            ngOptions += ' | limitTo:' + limit;
          var parsedOptions = $parseOptions(ngOptions);
          // Initialize typeahead
          var typeahead = $typeahead(element, options);
          // Watch model for changes
          scope.$watch(attr.ngModel, function (newValue, oldValue) {
            parsedOptions.valuesFn(scope, controller).then(function (values) {
              if (values.length > limit)
                values = values.slice(0, limit);
              // if(matches.length === 1 && matches[0].value === newValue) return;
              typeahead.update(values);
            });
          });
          // Garbage collection
          scope.$on('$destroy', function () {
            typeahead.destroy();
            options = null;
            typeahead = null;
          });
        }
      };
    }
  ]);
}(window, document));
/**
 * angular-strap
 * @version v2.0.0-rc.4 - 2014-03-07
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes (olivier@mg-crea.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
!function(a,b){"use strict";angular.module("mgcrea.ngStrap",["mgcrea.ngStrap.modal","mgcrea.ngStrap.aside","mgcrea.ngStrap.alert","mgcrea.ngStrap.button","mgcrea.ngStrap.select","mgcrea.ngStrap.datepicker","mgcrea.ngStrap.timepicker","mgcrea.ngStrap.navbar","mgcrea.ngStrap.tooltip","mgcrea.ngStrap.popover","mgcrea.ngStrap.dropdown","mgcrea.ngStrap.typeahead","mgcrea.ngStrap.scrollspy","mgcrea.ngStrap.affix","mgcrea.ngStrap.tab"]),angular.module("mgcrea.ngStrap.affix",["mgcrea.ngStrap.helpers.dimensions"]).provider("$affix",function(){var a=this.defaults={offsetTop:"auto"};this.$get=["$window","dimensions",function(b,c){function d(d,f){function g(a,b,c){var d=h(),e=i();return t>=d?"top":null!==a&&d+a<=b.top?"middle":null!==u&&b.top+c+n>=e-u?"bottom":"middle"}function h(){return l[0]===b?b.pageYOffset:l[0]===b}function i(){return l[0]===b?b.document.body.scrollHeight:l[0].scrollHeight}var j={},k=angular.extend({},a,f),l=k.target,m="affix affix-top affix-bottom",n=0,o=0,p=null,q=null,r=d.parent();if(k.offsetParent)if(k.offsetParent.match(/^\d+$/))for(var s=0;s<1*k.offsetParent-1;s++)r=r.parent();else r=angular.element(k.offsetParent);var t=0;k.offsetTop&&("auto"===k.offsetTop&&(k.offsetTop="+0"),k.offsetTop.match(/^[-+]\d+$/)?(n-=1*k.offsetTop,t=k.offsetParent?c.offset(r[0]).top+1*k.offsetTop:c.offset(d[0]).top-c.css(d[0],"marginTop",!0)+1*k.offsetTop):t=1*k.offsetTop);var u=0;return k.offsetBottom&&(u=k.offsetParent&&k.offsetBottom.match(/^[-+]\d+$/)?i()-(c.offset(r[0]).top+c.height(r[0]))+1*k.offsetBottom+1:1*k.offsetBottom),j.init=function(){o=c.offset(d[0]).top+n,l.on("scroll",this.checkPosition),l.on("click",this.checkPositionWithEventLoop),this.checkPosition(),this.checkPositionWithEventLoop()},j.destroy=function(){l.off("scroll",this.checkPosition),l.off("click",this.checkPositionWithEventLoop)},j.checkPositionWithEventLoop=function(){setTimeout(this.checkPosition,1)},j.checkPosition=function(){var a=h(),b=c.offset(d[0]),f=c.height(d[0]),i=g(q,b,f);p!==i&&(p=i,d.removeClass(m).addClass("affix"+("middle"!==i?"-"+i:"")),"top"===i?(q=null,d.css("position",k.offsetParent?"":"relative"),d.css("top","")):"bottom"===i?(q=k.offsetUnpin?-(1*k.offsetUnpin):b.top-a,d.css("position",k.offsetParent?"":"relative"),d.css("top",k.offsetParent?"":e[0].offsetHeight-u-f-o+"px")):(q=null,d.css("position","fixed"),d.css("top",n+"px")))},j.init(),j}var e=angular.element(b.document.body);return d}]}).directive("bsAffix",["$affix","$window",function(a,b){return{restrict:"EAC",require:"^?bsAffixTarget",link:function(c,d,e,f){var g={scope:c,offsetTop:"auto",target:f?f.$element:angular.element(b)};angular.forEach(["offsetTop","offsetBottom","offsetParent","offsetUnpin"],function(a){angular.isDefined(e[a])&&(g[a]=e[a])});var h=a(d,g);c.$on("$destroy",function(){g=null,h=null})}}}]).directive("bsAffixTarget",function(){return{controller:["$element",function(a){this.$element=a}]}}),angular.module("mgcrea.ngStrap.alert",[]).provider("$alert",function(){var a=this.defaults={animation:"am-fade",prefixClass:"alert",placement:null,template:"alert/alert.tpl.html",container:!1,element:null,backdrop:!1,keyboard:!0,show:!0,duration:!1,type:!1};this.$get=["$modal","$timeout",function(b,c){function d(d){var e={},f=angular.extend({},a,d);e=b(f),f.type&&(e.$scope.type=f.type);var g=e.show;return f.duration&&(e.show=function(){g(),c(function(){e.hide()},1e3*f.duration)}),e}return d}]}).directive("bsAlert",["$window","$location","$sce","$alert",function(a,b,c,d){a.requestAnimationFrame||a.setTimeout;return{restrict:"EAC",scope:!0,link:function(a,b,e){var f={scope:a,element:b,show:!1};angular.forEach(["template","placement","keyboard","html","container","animation","duration"],function(a){angular.isDefined(e[a])&&(f[a]=e[a])}),angular.forEach(["title","content","type"],function(b){e[b]&&e.$observe(b,function(d){a[b]=c.trustAsHtml(d)})}),e.bsAlert&&a.$watch(e.bsAlert,function(b){angular.isObject(b)?angular.extend(a,b):a.content=b},!0);var g=d(f);b.on(e.trigger||"click",g.toggle),a.$on("$destroy",function(){g.destroy(),f=null,g=null})}}}]),angular.module("mgcrea.ngStrap.aside",["mgcrea.ngStrap.modal"]).provider("$aside",function(){var a=this.defaults={animation:"am-fade-and-slide-right",prefixClass:"aside",placement:"right",template:"aside/aside.tpl.html",contentTemplate:!1,container:!1,element:null,backdrop:!0,keyboard:!0,html:!1,show:!0};this.$get=["$modal",function(b){function c(c){var d={},e=angular.extend({},a,c);return d=b(e)}return c}]}).directive("bsAside",["$window","$location","$sce","$aside",function(a,b,c,d){a.requestAnimationFrame||a.setTimeout;return{restrict:"EAC",scope:!0,link:function(a,b,e){var f={scope:a,element:b,show:!1};angular.forEach(["template","contentTemplate","placement","backdrop","keyboard","html","container","animation"],function(a){angular.isDefined(e[a])&&(f[a]=e[a])}),angular.forEach(["title","content"],function(b){e[b]&&e.$observe(b,function(d){a[b]=c.trustAsHtml(d)})}),e.bsAside&&a.$watch(e.bsAside,function(b){angular.isObject(b)?angular.extend(a,b):a.content=b},!0);var g=d(f);b.on(e.trigger||"click",g.toggle),a.$on("$destroy",function(){g.destroy(),f=null,g=null})}}}]),angular.module("mgcrea.ngStrap.button",["ngAnimate"]).provider("$button",function(){var a=this.defaults={activeClass:"active",toggleEvent:"click"};this.$get=function(){return{defaults:a}}}).directive("bsCheckboxGroup",function(){return{restrict:"A",require:"ngModel",compile:function(a,b){a.attr("data-toggle","buttons"),a.removeAttr("ng-model");var c=a[0].querySelectorAll('input[type="checkbox"]');angular.forEach(c,function(a){var c=angular.element(a);c.attr("bs-checkbox",""),c.attr("ng-model",b.ngModel+"."+c.attr("value"))})}}}).directive("bsCheckbox",["$button","$$animateReflow",function(a,b){var c=a.defaults,d=/^(true|false|\d+)$/;return{restrict:"A",require:"ngModel",link:function(a,e,f,g){var h=c,i="INPUT"===e[0].nodeName,j=i?e.parent():e,k=angular.isDefined(f.trueValue)?f.trueValue:!0;d.test(f.trueValue)&&(k=a.$eval(f.trueValue));var l=angular.isDefined(f.falseValue)?f.falseValue:!1;d.test(f.falseValue)&&(l=a.$eval(f.falseValue));var m="boolean"!=typeof k||"boolean"!=typeof l;m&&(g.$parsers.push(function(a){return a?k:l}),a.$watch(f.ngModel,function(){g.$render()})),g.$render=function(){var a=angular.equals(g.$modelValue,k);b(function(){i&&(e[0].checked=a),j.toggleClass(h.activeClass,a)})},e.bind(h.toggleEvent,function(){a.$apply(function(){i||g.$setViewValue(!j.hasClass("active")),m||g.$render()})})}}}]).directive("bsRadioGroup",function(){return{restrict:"A",require:"ngModel",compile:function(a,b){a.attr("data-toggle","buttons"),a.removeAttr("ng-model");var c=a[0].querySelectorAll('input[type="radio"]');angular.forEach(c,function(a){angular.element(a).attr("bs-radio",""),angular.element(a).attr("ng-model",b.ngModel)})}}}).directive("bsRadio",["$button","$$animateReflow",function(a,b){var c=a.defaults,d=/^(true|false|\d+)$/;return{restrict:"A",require:"ngModel",link:function(a,e,f,g){var h=c,i="INPUT"===e[0].nodeName,j=i?e.parent():e,k=d.test(f.value)?a.$eval(f.value):f.value;g.$render=function(){var a=angular.equals(g.$modelValue,k);b(function(){i&&(e[0].checked=a),j.toggleClass(h.activeClass,a)})},e.bind(h.toggleEvent,function(){a.$apply(function(){g.$setViewValue(k),g.$render()})})}}}]),angular.module("mgcrea.ngStrap.datepicker",["mgcrea.ngStrap.helpers.dateParser","mgcrea.ngStrap.tooltip"]).provider("$datepicker",function(){var a=this.defaults={animation:"am-fade",prefixClass:"datepicker",placement:"bottom-left",template:"datepicker/datepicker.tpl.html",trigger:"focus",container:!1,keyboard:!0,html:!1,delay:0,useNative:!1,dateType:"date",dateFormat:"shortDate",strictFormat:!1,autoclose:!1,minDate:-1/0,maxDate:+1/0,startView:0,minView:0,startWeek:0};this.$get=["$window","$document","$rootScope","$sce","$locale","dateFilter","datepickerViews","$tooltip",function(b,c,d,e,f,g,h,i){function j(b,c,d){function e(a){a.selected=g.$isSelected(a.date)}function f(){b[0].focus()}var g=i(b,angular.extend({},a,d)),j=d.scope,m=g.$options,n=g.$scope;m.startView&&(m.startView-=m.minView);var o=h(g);g.$views=o.views;var p=o.viewDate;n.$mode=m.startView;var q=g.$views[n.$mode];n.$select=function(a){g.select(a)},n.$selectPane=function(a){g.$selectPane(a)},n.$toggleMode=function(){g.setMode((n.$mode+1)%g.$views.length)},g.update=function(a){angular.isDate(a)&&!isNaN(a.getTime())&&(g.$date=a,q.update.call(q,a)),g.$build(!0)},g.select=function(a,b){angular.isDate(c.$dateValue)||(c.$dateValue=new Date(a)),c.$dateValue.setFullYear(a.getFullYear(),a.getMonth(),a.getDate()),!n.$mode||b?(c.$setViewValue(c.$dateValue),c.$render(),m.autoclose&&!b&&g.hide(!0)):(angular.extend(p,{year:a.getFullYear(),month:a.getMonth(),date:a.getDate()}),g.setMode(n.$mode-1),g.$build())},g.setMode=function(a){n.$mode=a,q=g.$views[n.$mode],g.$build()},g.$build=function(a){a===!0&&q.built||(a!==!1||q.built)&&q.build.call(q)},g.$updateSelected=function(){for(var a=0,b=n.rows.length;b>a;a++)angular.forEach(n.rows[a],e)},g.$isSelected=function(a){return q.isSelected(a)},g.$selectPane=function(a){var b=q.steps,c=new Date(Date.UTC(p.year+(b.year||0)*a,p.month+(b.month||0)*a,p.date+(b.day||0)*a));angular.extend(p,{year:c.getUTCFullYear(),month:c.getUTCMonth(),date:c.getUTCDate()}),g.$build()},g.$onMouseDown=function(a){if(a.preventDefault(),a.stopPropagation(),k){var b=angular.element(a.target);"button"!==b[0].nodeName.toLowerCase()&&(b=b.parent()),b.triggerHandler("click")}},g.$onKeyDown=function(a){if(/(38|37|39|40|13)/.test(a.keyCode)&&!a.shiftKey&&!a.altKey){if(a.preventDefault(),a.stopPropagation(),13===a.keyCode)return n.$mode?n.$apply(function(){g.setMode(n.$mode-1)}):g.hide(!0);q.onKeyDown(a),j.$digest()}};var r=g.init;g.init=function(){return l&&m.useNative?(b.prop("type","date"),void b.css("-webkit-appearance","textfield")):(k&&(b.prop("type","text"),b.attr("readonly","true"),b.on("click",f)),void r())};var s=g.destroy;g.destroy=function(){l&&m.useNative&&b.off("click",f),s()};var t=g.show;g.show=function(){t(),setTimeout(function(){g.$element.on(k?"touchstart":"mousedown",g.$onMouseDown),m.keyboard&&b.on("keydown",g.$onKeyDown)})};var u=g.hide;return g.hide=function(a){g.$element.off(k?"touchstart":"mousedown",g.$onMouseDown),m.keyboard&&b.off("keydown",g.$onKeyDown),u(a)},g}var k=(angular.element(b.document.body),"createTouch"in b.document),l=/(ip(a|o)d|iphone|android)/gi.test(b.navigator.userAgent);return a.lang||(a.lang=f.id),j.defaults=a,j}]}).directive("bsDatepicker",["$window","$parse","$q","$locale","dateFilter","$datepicker","$dateParser","$timeout",function(a,b,c,d,e,f,g){{var h=(f.defaults,/(ip(a|o)d|iphone|android)/gi.test(a.navigator.userAgent));a.requestAnimationFrame||a.setTimeout}return{restrict:"EAC",require:"ngModel",link:function(a,b,c,d){var i={scope:a,controller:d};angular.forEach(["placement","container","delay","trigger","keyboard","html","animation","template","autoclose","dateType","dateFormat","strictFormat","startWeek","useNative","lang","startView","minView"],function(a){angular.isDefined(c[a])&&(i[a]=c[a])}),h&&i.useNative&&(i.dateFormat="yyyy-MM-dd");var j=f(b,d,i);i=j.$options,angular.forEach(["minDate","maxDate"],function(a){angular.isDefined(c[a])&&c.$observe(a,function(b){if("today"===b){var c=new Date;j.$options[a]=+new Date(c.getFullYear(),c.getMonth(),c.getDate()+("maxDate"===a?1:0),0,0,0,"minDate"===a?0:-1)}else j.$options[a]=angular.isString(b)&&b.match(/^".+"$/)?+new Date(b.substr(1,b.length-2)):+new Date(b);!isNaN(j.$options[a])&&j.$build(!1)})}),a.$watch(c.ngModel,function(){j.update(d.$dateValue)},!0);var k=g({format:i.dateFormat,lang:i.lang,strict:i.strictFormat});d.$parsers.unshift(function(a){if(!a)return void d.$setValidity("date",!0);var b=k.parse(a,d.$dateValue);if(!b||isNaN(b.getTime()))d.$setValidity("date",!1);else{var c=b.getTime()>=i.minDate&&b.getTime()<=i.maxDate;d.$setValidity("date",c),c&&(d.$dateValue=b)}return"string"===i.dateType?e(a,i.dateFormat):"number"===i.dateType?d.$dateValue.getTime():"iso"===i.dateType?d.$dateValue.toISOString():new Date(d.$dateValue)}),d.$formatters.push(function(a){if(!angular.isUndefined(a)&&null!==a){var b=angular.isDate(a)?a:new Date(a);return d.$dateValue=b,d.$dateValue}}),d.$render=function(){b.val(!d.$dateValue||isNaN(d.$dateValue.getTime())?"":e(d.$dateValue,i.dateFormat))},a.$on("$destroy",function(){j.destroy(),i=null,j=null})}}}]).provider("datepickerViews",function(){function a(a,b){for(var c=[];a.length>0;)c.push(a.splice(0,b));return c}this.defaults={dayFormat:"dd",daySplit:7};this.$get=["$locale","$sce","dateFilter",function(b,c,d){return function(e){var f=e.$scope,g=e.$options,h=b.DATETIME_FORMATS.SHORTDAY,i=h.slice(g.startWeek).concat(h.slice(0,g.startWeek)),j=c.trustAsHtml('<th class="dow text-center">'+i.join('</th><th class="dow text-center">')+"</th>"),k=e.$date||new Date,l={year:k.getFullYear(),month:k.getMonth(),date:k.getDate()},m=(6e4*k.getTimezoneOffset(),[{format:"dd",split:7,steps:{month:1},update:function(a,b){!this.built||b||a.getFullYear()!==l.year||a.getMonth()!==l.month?(angular.extend(l,{year:e.$date.getFullYear(),month:e.$date.getMonth(),date:e.$date.getDate()}),e.$build()):a.getDate()!==l.date&&(l.date=e.$date.getDate(),e.$updateSelected())},build:function(){for(var b,c=new Date(l.year,l.month,1),h=new Date(+c-864e5*(c.getDay()-g.startWeek)),i=[],k=0;42>k;k++)b=new Date(h.getFullYear(),h.getMonth(),h.getDate()+k),i.push({date:b,label:d(b,this.format),selected:e.$date&&this.isSelected(b),muted:b.getMonth()!==l.month,disabled:this.isDisabled(b)});f.title=d(c,"MMMM yyyy"),f.labels=j,f.rows=a(i,this.split),this.built=!0},isSelected:function(a){return e.$date&&a.getFullYear()===e.$date.getFullYear()&&a.getMonth()===e.$date.getMonth()&&a.getDate()===e.$date.getDate()},isDisabled:function(a){return a.getTime()<g.minDate||a.getTime()>g.maxDate},onKeyDown:function(a){var b=e.$date.getTime();37===a.keyCode?e.select(new Date(b-864e5),!0):38===a.keyCode?e.select(new Date(b-6048e5),!0):39===a.keyCode?e.select(new Date(b+864e5),!0):40===a.keyCode&&e.select(new Date(b+6048e5),!0)}},{name:"month",format:"MMM",split:4,steps:{year:1},update:function(a){this.built&&a.getFullYear()===l.year?a.getMonth()!==l.month&&(angular.extend(l,{month:e.$date.getMonth(),date:e.$date.getDate()}),e.$updateSelected()):(angular.extend(l,{year:e.$date.getFullYear(),month:e.$date.getMonth(),date:e.$date.getDate()}),e.$build())},build:function(){for(var b,c=(new Date(l.year,0,1),[]),g=0;12>g;g++)b=new Date(l.year,g,1),c.push({date:b,label:d(b,this.format),selected:e.$isSelected(b),disabled:this.isDisabled(b)});f.title=d(b,"yyyy"),f.labels=!1,f.rows=a(c,this.split),this.built=!0},isSelected:function(a){return e.$date&&a.getFullYear()===e.$date.getFullYear()&&a.getMonth()===e.$date.getMonth()},isDisabled:function(a){var b=+new Date(a.getFullYear(),a.getMonth()+1,0);return b<g.minDate||a.getTime()>g.maxDate},onKeyDown:function(a){var b=e.$date.getMonth();37===a.keyCode?e.select(e.$date.setMonth(b-1),!0):38===a.keyCode?e.select(e.$date.setMonth(b-4),!0):39===a.keyCode?e.select(e.$date.setMonth(b+1),!0):40===a.keyCode&&e.select(e.$date.setMonth(b+4),!0)}},{name:"year",format:"yyyy",split:4,steps:{year:12},update:function(a,b){!this.built||b||parseInt(a.getFullYear()/20,10)!==parseInt(l.year/20,10)?(angular.extend(l,{year:e.$date.getFullYear(),month:e.$date.getMonth(),date:e.$date.getDate()}),e.$build()):a.getFullYear()!==l.year&&(angular.extend(l,{year:e.$date.getFullYear(),month:e.$date.getMonth(),date:e.$date.getDate()}),e.$updateSelected())},build:function(){for(var b,c=l.year-l.year%(3*this.split),g=[],h=0;12>h;h++)b=new Date(c+h,0,1),g.push({date:b,label:d(b,this.format),selected:e.$isSelected(b),disabled:this.isDisabled(b)});f.title=g[0].label+"-"+g[g.length-1].label,f.labels=!1,f.rows=a(g,this.split),this.built=!0},isSelected:function(a){return e.$date&&a.getFullYear()===e.$date.getFullYear()},isDisabled:function(a){var b=+new Date(a.getFullYear()+1,0,0);return b<g.minDate||a.getTime()>g.maxDate},onKeyDown:function(a){var b=e.$date.getFullYear();37===a.keyCode?e.select(e.$date.setYear(b-1),!0):38===a.keyCode?e.select(e.$date.setYear(b-4),!0):39===a.keyCode?e.select(e.$date.setYear(b+1),!0):40===a.keyCode&&e.select(e.$date.setYear(b+4),!0)}}]);return{views:g.minView?Array.prototype.slice.call(m,g.minView):m,viewDate:l}}}]}),angular.module("mgcrea.ngStrap.dropdown",["mgcrea.ngStrap.tooltip"]).provider("$dropdown",function(){var a=this.defaults={animation:"am-fade",prefixClass:"dropdown",placement:"bottom-left",template:"dropdown/dropdown.tpl.html",trigger:"click",container:!1,keyboard:!0,html:!1,delay:0};this.$get=["$window","$rootScope","$tooltip",function(b,c,d){function e(b,e){function h(a){return a.target!==b[0]?a.target!==b[0]&&i.hide():void 0}{var i={},j=angular.extend({},a,e);i.$scope=j.scope&&j.scope.$new()||c.$new()}i=d(b,j),i.$onKeyDown=function(a){if(/(38|40)/.test(a.keyCode)){a.preventDefault(),a.stopPropagation();var b=angular.element(i.$element[0].querySelectorAll("li:not(.divider) a"));if(b.length){var c;angular.forEach(b,function(a,b){g&&g.call(a,":focus")&&(c=b)}),38===a.keyCode&&c>0?c--:40===a.keyCode&&c<b.length-1?c++:angular.isUndefined(c)&&(c=0),b.eq(c)[0].focus()}}};var k=i.show;i.show=function(){k(),setTimeout(function(){j.keyboard&&i.$element.on("keydown",i.$onKeyDown),f.on("click",h)})};var l=i.hide;return i.hide=function(){j.keyboard&&i.$element.off("keydown",i.$onKeyDown),f.off("click",h),l()},i}var f=angular.element(b.document.body),g=Element.prototype.matchesSelector||Element.prototype.webkitMatchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector;return e}]}).directive("bsDropdown",["$window","$location","$sce","$dropdown",function(a,b,c,d){return{restrict:"EAC",scope:!0,link:function(a,b,c){var e={scope:a};angular.forEach(["placement","container","delay","trigger","keyboard","html","animation","template"],function(a){angular.isDefined(c[a])&&(e[a]=c[a])}),c.bsDropdown&&a.$watch(c.bsDropdown,function(b){a.content=b},!0);var f=d(b,e);a.$on("$destroy",function(){f.destroy(),e=null,f=null})}}}]),angular.module("mgcrea.ngStrap.helpers.dateParser",[]).provider("$dateParser",["$localeProvider",function(){var a=Date.prototype,b=this.defaults={format:"shortDate",strict:!1};this.$get=["$locale",function(c){var d=function(d){function e(a){var b,c=Object.keys(m),d=[],e=[],f=a;for(b=0;b<c.length;b++)if(a.split(c[b]).length>1){var g=f.search(c[b]);a=a.split(c[b]).join(""),m[c[b]]&&(d[g]=m[c[b]])}return angular.forEach(d,function(a){e.push(a)}),e}function f(a){return a.replace(/\//g,"[\\/]").replace("/-/g","[-]").replace(/\./g,"[.]").replace(/\\s/g,"[\\s]")}function g(a){var b,c=Object.keys(l),d=a;for(b=0;b<c.length;b++)d=d.split(c[b]).join("${"+b+"}");for(b=0;b<c.length;b++)d=d.split("${"+b+"}").join("("+l[c[b]]+")");return a=f(a),new RegExp("^"+d+"$",["i"])}var h,i,j=angular.extend({},b,d),k={},l={sss:"[0-9]{3}",ss:"[0-5][0-9]",s:j.strict?"[1-5]?[0-9]":"[0-5][0-9]",mm:"[0-5][0-9]",m:j.strict?"[1-5]?[0-9]":"[0-5][0-9]",HH:"[01][0-9]|2[0-3]",H:j.strict?"[0][1-9]|[1][012]":"[01][0-9]|2[0-3]",hh:"[0][1-9]|[1][012]",h:j.strict?"[1-9]|[1][012]":"[0]?[1-9]|[1][012]",a:"AM|PM",EEEE:c.DATETIME_FORMATS.DAY.join("|"),EEE:c.DATETIME_FORMATS.SHORTDAY.join("|"),dd:"[0-2][0-9]{1}|[3][01]{1}",d:j.strict?"[1-2]?[0-9]{1}|[3][01]{1}":"[0-2][0-9]{1}|[3][01]{1}",MMMM:c.DATETIME_FORMATS.MONTH.join("|"),MMM:c.DATETIME_FORMATS.SHORTMONTH.join("|"),MM:"[0][1-9]|[1][012]",M:j.strict?"[1-9]|[1][012]":"[0][1-9]|[1][012]",yyyy:"(?:(?:[1]{1}[0-9]{1}[0-9]{1}[0-9]{1})|(?:[2]{1}[0-9]{3}))(?![[0-9]])",yy:"(?:(?:[0-9]{1}[0-9]{1}))(?![[0-9]])"},m={sss:a.setMilliseconds,ss:a.setSeconds,s:a.setSeconds,mm:a.setMinutes,m:a.setMinutes,HH:a.setHours,H:a.setHours,hh:a.setHours,h:a.setHours,dd:a.setDate,d:a.setDate,a:function(a){var b=this.getHours();return this.setHours(a.match(/pm/i)?b+12:b)},MMMM:function(a){return this.setMonth(c.DATETIME_FORMATS.MONTH.indexOf(a))},MMM:function(a){return this.setMonth(c.DATETIME_FORMATS.SHORTMONTH.indexOf(a))},MM:function(a){return this.setMonth(1*a-1)},M:function(a){return this.setMonth(1*a-1)},yyyy:a.setFullYear,yy:function(a){return this.setFullYear(2e3+1*a)},y:a.setFullYear};return k.init=function(){k.$format=c.DATETIME_FORMATS[j.format]||j.format,h=g(k.$format),i=e(k.$format)},k.isValid=function(a){return angular.isDate(a)?!isNaN(a.getTime()):h.test(a)},k.parse=function(a,b){if(angular.isDate(a))return a;var c=h.exec(a);if(!c)return!1;for(var d=b||new Date(0),e=0;e<c.length-1;e++)i[e]&&i[e].call(d,c[e+1]);return d},k.init(),k};return d}]}]),angular.module("mgcrea.ngStrap.helpers.debounce",[]).constant("debounce",function(a,b,c){var d,e,f,g,h;return function(){f=this,e=arguments,g=new Date;var i=function(){var j=new Date-g;b>j?d=setTimeout(i,b-j):(d=null,c||(h=a.apply(f,e)))},j=c&&!d;return d||(d=setTimeout(i,b)),j&&(h=a.apply(f,e)),h}}).constant("throttle",function(a,b,c){var d,e,f,g=null,h=0;c||(c={});var i=function(){h=c.leading===!1?0:new Date,g=null,f=a.apply(d,e)};return function(){var j=new Date;h||c.leading!==!1||(h=j);var k=b-(j-h);return d=this,e=arguments,0>=k?(clearTimeout(g),g=null,h=j,f=a.apply(d,e)):g||c.trailing===!1||(g=setTimeout(i,k)),f}}),angular.module("mgcrea.ngStrap.helpers.dimensions",[]).factory("dimensions",["$document","$window",function(){var b=(angular.element,{}),c=b.nodeName=function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()};b.css=function(b,c,d){var e;return e=b.currentStyle?b.currentStyle[c]:a.getComputedStyle?a.getComputedStyle(b)[c]:b.style[c],d===!0?parseFloat(e)||0:e},b.offset=function(b){var c=b.getBoundingClientRect(),d=b.ownerDocument;return{width:b.offsetWidth,height:b.offsetHeight,top:c.top+(a.pageYOffset||d.documentElement.scrollTop)-(d.documentElement.clientTop||0),left:c.left+(a.pageXOffset||d.documentElement.scrollLeft)-(d.documentElement.clientLeft||0)}},b.position=function(a){var e,f,g={top:0,left:0};return"fixed"===b.css(a,"position")?f=a.getBoundingClientRect():(e=d(a),f=b.offset(a),f=b.offset(a),c(e,"html")||(g=b.offset(e)),g.top+=b.css(e,"borderTopWidth",!0),g.left+=b.css(e,"borderLeftWidth",!0)),{width:a.offsetWidth,height:a.offsetHeight,top:f.top-g.top-b.css(a,"marginTop",!0),left:f.left-g.left-b.css(a,"marginLeft",!0)}};var d=function(a){var d=a.ownerDocument,e=a.offsetParent||d;if(c(e,"#document"))return d.documentElement;for(;e&&!c(e,"html")&&"static"===b.css(e,"position");)e=e.offsetParent;return e||d.documentElement};return b.height=function(a,c){var d=a.offsetHeight;return c?d+=b.css(a,"marginTop",!0)+b.css(a,"marginBottom",!0):d-=b.css(a,"paddingTop",!0)+b.css(a,"paddingBottom",!0)+b.css(a,"borderTopWidth",!0)+b.css(a,"borderBottomWidth",!0),d},b.width=function(a,c){var d=a.offsetWidth;return c?d+=b.css(a,"marginLeft",!0)+b.css(a,"marginRight",!0):d-=b.css(a,"paddingLeft",!0)+b.css(a,"paddingRight",!0)+b.css(a,"borderLeftWidth",!0)+b.css(a,"borderRightWidth",!0),d},b}]),angular.module("mgcrea.ngStrap.helpers.parseOptions",[]).provider("$parseOptions",function(){var a=this.defaults={regexp:/^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/};this.$get=["$parse","$q",function(b,c){function d(d,e){function f(a){return a.map(function(a,b){var c,d,e={};return e[k]=a,c=j(e),d=n(e)||b,{label:c,value:d}})}var g={},h=angular.extend({},a,e);g.$values=[];var i,j,k,l,m,n,o;return g.init=function(){g.$match=i=d.match(h.regexp),j=b(i[2]||i[1]),k=i[4]||i[6],l=i[5],m=b(i[3]||""),n=b(i[2]?i[1]:k),o=b(i[7])},g.valuesFn=function(a,b){return c.when(o(a,b)).then(function(a){return g.$values=a?f(a):{},g.$values})},g.init(),g}return d}]}),angular.module("mgcrea.ngStrap.modal",["mgcrea.ngStrap.helpers.dimensions"]).provider("$modal",function(){var a=this.defaults={animation:"am-fade",backdropAnimation:"am-fade",prefixClass:"modal",placement:"top",template:"modal/modal.tpl.html",contentTemplate:!1,container:!1,element:null,backdrop:!0,keyboard:!0,html:!1,show:!0};this.$get=["$window","$rootScope","$compile","$q","$templateCache","$http","$animate","$timeout","dimensions",function(c,d,e,f,g,h,i){function j(b){function c(a){a.target===a.currentTarget&&("static"===g.backdrop?f.focus():f.hide())}var f={},g=angular.extend({},a,b);f.$promise=l(g.template);var h=f.$scope=g.scope&&g.scope.$new()||d.$new();g.element||g.container||(g.container="body"),m(["title","content"],function(a){g[a]&&(h[a]=g[a])}),h.$hide=function(){h.$$postDigest(function(){f.hide()})},h.$show=function(){h.$$postDigest(function(){f.show()})},h.$toggle=function(){h.$$postDigest(function(){f.toggle()})},g.contentTemplate&&(f.$promise=f.$promise.then(function(a){var c=angular.element(a);return l(g.contentTemplate).then(function(a){var d=k('[ng-bind="content"]',c[0]).removeAttr("ng-bind").html(a);return b.template||d.next().remove(),c[0].outerHTML})}));var j,r,s=angular.element('<div class="'+g.prefixClass+'-backdrop"/>');return f.$promise.then(function(a){angular.isObject(a)&&(a=a.data),g.html&&(a=a.replace(q,'ng-bind-html="')),a=n.apply(a),j=e(a),f.init()}),f.init=function(){g.show&&h.$$postDigest(function(){f.show()})},f.destroy=function(){r&&(r.remove(),r=null),s&&(s.remove(),s=null),h.$destroy()},f.show=function(){var a=g.container?k(g.container):null,b=g.container?null:g.element;r=f.$element=j(h,function(){}),r.css({display:"block"}).addClass(g.placement),g.animation&&(g.backdrop&&s.addClass(g.backdropAnimation),r.addClass(g.animation)),g.backdrop&&i.enter(s,p,null,function(){}),i.enter(r,a,b,function(){}),h.$isShown=!0,h.$$phase||h.$digest();var d=r[0];o(function(){d.focus()}),p.addClass(g.prefixClass+"-open"),g.animation&&p.addClass(g.prefixClass+"-with-"+g.animation),g.backdrop&&(r.on("click",c),s.on("click",c)),g.keyboard&&r.on("keyup",f.$onKeyUp)},f.hide=function(){i.leave(r,function(){p.removeClass(g.prefixClass+"-open"),g.animation&&p.addClass(g.prefixClass+"-with-"+g.animation)}),g.backdrop&&i.leave(s,function(){}),h.$isShown=!1,h.$$phase||h.$digest(),g.backdrop&&(r.off("click",c),s.off("click",c)),g.keyboard&&r.off("keyup",f.$onKeyUp)},f.toggle=function(){h.$isShown?f.hide():f.show()},f.focus=function(){r[0].focus()},f.$onKeyUp=function(a){27===a.which&&f.hide()},f}function k(a,c){return angular.element((c||b).querySelectorAll(a))}function l(a){return f.when(g.get(a)||h.get(a)).then(function(b){return angular.isObject(b)?(g.put(a,b.data),b.data):b})}var m=angular.forEach,n=String.prototype.trim,o=c.requestAnimationFrame||c.setTimeout,p=angular.element(c.document.body),q=/ng-bind="/gi;return j}]}).directive("bsModal",["$window","$location","$sce","$modal",function(a,b,c,d){return{restrict:"EAC",scope:!0,link:function(a,b,e){var f={scope:a,element:b,show:!1};angular.forEach(["template","contentTemplate","placement","backdrop","keyboard","html","container","animation"],function(a){angular.isDefined(e[a])&&(f[a]=e[a])}),angular.forEach(["title","content"],function(b){e[b]&&e.$observe(b,function(d){a[b]=c.trustAsHtml(d)})}),e.bsModal&&a.$watch(e.bsModal,function(b){angular.isObject(b)?angular.extend(a,b):a.content=b},!0);var g=d(f);b.on(e.trigger||"click",g.toggle),a.$on("$destroy",function(){g.destroy(),f=null,g=null})}}}]),angular.module("mgcrea.ngStrap.navbar",[]).provider("$navbar",function(){var a=this.defaults={activeClass:"active",routeAttr:"data-match-route",strict:!1};this.$get=function(){return{defaults:a}}}).directive("bsNavbar",["$window","$location","$navbar",function(a,b,c){var d=c.defaults;return{restrict:"A",link:function(a,c,e){var f=angular.copy(d);angular.forEach(Object.keys(d),function(a){angular.isDefined(e[a])&&(f[a]=e[a])}),a.$watch(function(){return b.path()},function(a){var b=c[0].querySelectorAll("li["+f.routeAttr+"]");angular.forEach(b,function(b){var c=angular.element(b),d=c.attr(f.routeAttr).replace("/","\\/");f.strict&&(d="^"+d+"$");var e=new RegExp(d,["i"]);e.test(a)?c.addClass(f.activeClass):c.removeClass(f.activeClass)})})}}}]),angular.module("mgcrea.ngStrap.popover",["mgcrea.ngStrap.tooltip"]).provider("$popover",function(){var a=this.defaults={animation:"am-fade",placement:"right",template:"popover/popover.tpl.html",contentTemplate:!1,trigger:"click",keyboard:!0,html:!1,title:"",content:"",delay:0,container:!1};this.$get=["$tooltip",function(b){function c(c,d){var e=angular.extend({},a,d),f=b(c,e);return e.content&&(f.$scope.content=e.content),f}return c}]}).directive("bsPopover",["$window","$location","$sce","$popover",function(a,b,c,d){var e=a.requestAnimationFrame||a.setTimeout;return{restrict:"EAC",scope:!0,link:function(a,b,f){var g={scope:a};angular.forEach(["template","contentTemplate","placement","container","delay","trigger","keyboard","html","animation"],function(a){angular.isDefined(f[a])&&(g[a]=f[a])}),angular.forEach(["title","content"],function(b){f[b]&&f.$observe(b,function(d,f){a[b]=c.trustAsHtml(d),angular.isDefined(f)&&e(function(){h&&h.$applyPlacement()})})}),f.bsPopover&&a.$watch(f.bsPopover,function(b,c){angular.isObject(b)?angular.extend(a,b):a.content=b,angular.isDefined(c)&&e(function(){h&&h.$applyPlacement()})},!0);var h=d(b,g);a.$on("$destroy",function(){h.destroy(),g=null,h=null})}}}]),angular.module("mgcrea.ngStrap.scrollspy",["mgcrea.ngStrap.helpers.debounce","mgcrea.ngStrap.helpers.dimensions"]).provider("$scrollspy",function(){var a=this.$$spies={},c=this.defaults={debounce:150,throttle:100,offset:100};this.$get=["$window","$document","$rootScope","dimensions","debounce","throttle",function(d,e,f,g,h,i){function j(a,b){return a[0].nodeName&&a[0].nodeName.toLowerCase()===b.toLowerCase()}function k(e){var k=angular.extend({},c,e);k.element||(k.element=n);var o=j(k.element,"body"),p=o?l:k.element,q=o?"window":k.id;if(a[q])return a[q].$$count++,a[q];var r,s,t,u,v,w,x,y,z={},A=z.$trackedElements=[],B=[];return z.init=function(){this.$$count=1,u=h(this.checkPosition,k.debounce),v=i(this.checkPosition,k.throttle),p.on("click",this.checkPositionWithEventLoop),l.on("resize",u),p.on("scroll",v),w=h(this.checkOffsets,k.debounce),r=f.$on("$viewContentLoaded",w),s=f.$on("$includeContentLoaded",w),w(),q&&(a[q]=z)},z.destroy=function(){this.$$count--,this.$$count>0||(p.off("click",this.checkPositionWithEventLoop),l.off("resize",u),p.off("scroll",u),r(),s())},z.checkPosition=function(){if(B.length){if(y=(o?d.pageYOffset:p.prop("scrollTop"))||0,x=Math.max(d.innerHeight,m.prop("clientHeight")),y<B[0].offsetTop&&t!==B[0].target)return z.$activateElement(B[0]);for(var a=B.length;a--;)if(!angular.isUndefined(B[a].offsetTop)&&null!==B[a].offsetTop&&t!==B[a].target&&!(y<B[a].offsetTop||B[a+1]&&y>B[a+1].offsetTop))return z.$activateElement(B[a])}},z.checkPositionWithEventLoop=function(){setTimeout(this.checkPosition,1)},z.$activateElement=function(a){if(t){var b=z.$getTrackedElement(t);b&&(b.source.removeClass("active"),j(b.source,"li")&&j(b.source.parent().parent(),"li")&&b.source.parent().parent().removeClass("active"))}t=a.target,a.source.addClass("active"),j(a.source,"li")&&j(a.source.parent().parent(),"li")&&a.source.parent().parent().addClass("active")},z.$getTrackedElement=function(a){return A.filter(function(b){return b.target===a})[0]},z.checkOffsets=function(){angular.forEach(A,function(a){var c=b.querySelector(a.target);a.offsetTop=c?g.offset(c).top:null,k.offset&&null!==a.offsetTop&&(a.offsetTop-=1*k.offset)}),B=A.filter(function(a){return null!==a.offsetTop}).sort(function(a,b){return a.offsetTop-b.offsetTop}),u()},z.trackElement=function(a,b){A.push({target:a,source:b})},z.untrackElement=function(a,b){for(var c,d=A.length;d--;)if(A[d].target===a&&A[d].source===b){c=d;break}A=A.splice(c,1)},z.activate=function(a){A[a].addClass("active")},z.init(),z}var l=angular.element(d),m=angular.element(e.prop("documentElement")),n=angular.element(d.document.body);return k}]}).directive("bsScrollspy",["$rootScope","debounce","dimensions","$scrollspy",function(a,b,c,d){return{restrict:"EAC",link:function(a,b,c){var e={scope:a};
angular.forEach(["offset","target"],function(a){angular.isDefined(c[a])&&(e[a]=c[a])});var f=d(e);f.trackElement(e.target,b),a.$on("$destroy",function(){f.untrackElement(e.target,b),f.destroy(),e=null,f=null})}}}]).directive("bsScrollspyList",["$rootScope","debounce","dimensions","$scrollspy",function(){return{restrict:"A",compile:function(a){var b=a[0].querySelectorAll("li > a[href]");angular.forEach(b,function(a){var b=angular.element(a);b.parent().attr("bs-scrollspy","").attr("data-target",b.attr("href"))})}}}]),angular.module("mgcrea.ngStrap.select",["mgcrea.ngStrap.tooltip","mgcrea.ngStrap.helpers.parseOptions"]).provider("$select",function(){var a=this.defaults={animation:"am-fade",prefixClass:"select",placement:"bottom-left",template:"select/select.tpl.html",trigger:"focus",container:!1,keyboard:!0,html:!1,delay:0,multiple:!1,sort:!0,caretHtml:'&nbsp;<span class="caret"></span>',placeholder:"Choose among the following...",maxLength:3,maxLengthHtml:"selected"};this.$get=["$window","$document","$rootScope","$tooltip",function(b,c,d,e){function f(b,c,d){var f={},h=angular.extend({},a,d);f=e(b,h);var i=d.scope,j=f.$scope;j.$matches=[],j.$activeIndex=0,j.$isMultiple=h.multiple,j.$activate=function(a){j.$$postDigest(function(){f.activate(a)})},j.$select=function(a){j.$$postDigest(function(){f.select(a)})},j.$isVisible=function(){return f.$isVisible()},j.$isActive=function(a){return f.$isActive(a)},f.update=function(a){j.$matches=a,f.$updateActiveIndex()},f.activate=function(a){return h.multiple?(j.$activeIndex.sort(),f.$isActive(a)?j.$activeIndex.splice(j.$activeIndex.indexOf(a),1):j.$activeIndex.push(a),h.sort&&j.$activeIndex.sort()):j.$activeIndex=a,j.$activeIndex},f.select=function(a){var d=j.$matches[a].value;f.activate(a),c.$setViewValue(h.multiple?j.$activeIndex.map(function(a){return j.$matches[a].value}):d),c.$render(),i&&i.$digest(),h.multiple||("focus"===h.trigger?b[0].blur():f.$isShown&&f.hide()),j.$emit("$select.select",d,a)},f.$updateActiveIndex=function(){c.$modelValue&&j.$matches.length?j.$activeIndex=h.multiple&&angular.isArray(c.$modelValue)?c.$modelValue.map(function(a){return f.$getIndex(a)}):f.$getIndex(c.$modelValue):j.$activeIndex>=j.$matches.length&&(j.$activeIndex=h.multiple?[]:0)},f.$isVisible=function(){return h.minLength&&c?j.$matches.length&&c.$viewValue.length>=h.minLength:j.$matches.length},f.$isActive=function(a){return h.multiple?-1!==j.$activeIndex.indexOf(a):j.$activeIndex===a},f.$getIndex=function(a){var b=j.$matches.length,c=b;if(b){for(c=b;c--&&j.$matches[c].value!==a;);if(!(0>c))return c}},f.$onMouseDown=function(a){if(a.preventDefault(),a.stopPropagation(),g){var b=angular.element(a.target);b.triggerHandler("click")}},f.$onKeyDown=function(a){if(/(38|40|13)/.test(a.keyCode)){if(a.preventDefault(),a.stopPropagation(),13===a.keyCode)return f.select(j.$activeIndex);38===a.keyCode&&j.$activeIndex>0?j.$activeIndex--:40===a.keyCode&&j.$activeIndex<j.$matches.length-1?j.$activeIndex++:angular.isUndefined(j.$activeIndex)&&(j.$activeIndex=0),j.$digest()}};var k=f.show;f.show=function(){k(),h.multiple&&f.$element.addClass("select-multiple"),setTimeout(function(){f.$element.on(g?"touchstart":"mousedown",f.$onMouseDown),h.keyboard&&b.on("keydown",f.$onKeyDown)})};var l=f.hide;return f.hide=function(){f.$element.off(g?"touchstart":"mousedown",f.$onMouseDown),h.keyboard&&b.off("keydown",f.$onKeyDown),l()},f}var g=(angular.element(b.document.body),"createTouch"in b.document);return f.defaults=a,f}]}).directive("bsSelect",["$window","$parse","$q","$select","$parseOptions",function(a,b,c,d,e){var f=d.defaults;return{restrict:"EAC",require:"ngModel",link:function(a,b,c,g){var h={scope:a};if(angular.forEach(["placement","container","delay","trigger","keyboard","html","animation","template","placeholder","multiple","maxLength","maxLengthHtml"],function(a){angular.isDefined(c[a])&&(h[a]=c[a])}),"select"===b[0].nodeName.toLowerCase()){var i=b;i.css("display","none"),b=angular.element('<button type="button" class="btn btn-default"></button>'),i.after(b)}var j=e(c.ngOptions),k=d(b,g,h),l=j.$match[7].replace(/\|.+/,"").trim();a.$watch(l,function(){j.valuesFn(a,g).then(function(a){k.update(a),g.$render()})},!0),a.$watch(c.ngModel,function(){k.$updateActiveIndex()},!0),g.$render=function(){var a,d;h.multiple&&angular.isArray(g.$modelValue)?(a=g.$modelValue.map(function(a){return d=k.$getIndex(a),angular.isDefined(d)?k.$scope.$matches[d].label:!1}).filter(angular.isDefined),a=a.length>(h.maxLength||f.maxLength)?a.length+" "+(h.maxLengthHtml||f.maxLengthHtml):a.join(", ")):(d=k.$getIndex(g.$modelValue),a=angular.isDefined(d)?k.$scope.$matches[d].label:!1),b.html((a?a:c.placeholder||f.placeholder)+f.caretHtml)},a.$on("$destroy",function(){k.destroy(),h=null,k=null})}}}]),angular.module("mgcrea.ngStrap.tab",[]).run(["$templateCache",function(a){a.put("$pane","{{pane.content}}")}]).provider("$tab",function(){var a=this.defaults={animation:"am-fade",template:"tab/tab.tpl.html"};this.$get=function(){return{defaults:a}}}).directive("bsTabs",["$window","$animate","$tab",function(a,b,c){var d=c.defaults;return{restrict:"EAC",scope:!0,require:"?ngModel",templateUrl:function(a,b){return b.template||d.template},link:function(a,b,c,e){var f=d;angular.forEach(["animation"],function(a){angular.isDefined(c[a])&&(f[a]=c[a])}),c.bsTabs&&a.$watch(c.bsTabs,function(b){a.panes=b},!0),b.addClass("tabs"),f.animation&&b.addClass(f.animation),a.active=a.activePane=0,a.setActive=function(b){a.active=b,e&&e.$setViewValue(b)},e&&(e.$render=function(){a.active=1*e.$modelValue})}}}]),angular.module("mgcrea.ngStrap.timepicker",["mgcrea.ngStrap.helpers.dateParser","mgcrea.ngStrap.tooltip"]).provider("$timepicker",function(){var a=this.defaults={animation:"am-fade",prefixClass:"timepicker",placement:"bottom-left",template:"timepicker/timepicker.tpl.html",trigger:"focus",container:!1,keyboard:!0,html:!1,delay:0,useNative:!0,timeType:"date",timeFormat:"shortTime",autoclose:!1,minTime:-1/0,maxTime:+1/0,length:5,hourStep:1,minuteStep:5};this.$get=["$window","$document","$rootScope","$sce","$locale","dateFilter","$tooltip",function(b,c,d,e,f,g,h){function i(b,c,d){function e(a,c){if(b[0].createTextRange){var d=b[0].createTextRange();d.collapse(!0),d.moveStart("character",a),d.moveEnd("character",c),d.select()}else b[0].setSelectionRange?b[0].setSelectionRange(a,c):angular.isUndefined(b[0].selectionStart)&&(b[0].selectionStart=a,b[0].selectionEnd=c)}function i(){b[0].focus()}var l=h(b,angular.extend({},a,d)),m=d.scope,n=l.$options,o=l.$scope,p=0,q=c.$dateValue||new Date,r={hour:q.getHours(),meridian:q.getHours()<12,minute:q.getMinutes(),second:q.getSeconds(),millisecond:q.getMilliseconds()},s=f.DATETIME_FORMATS[n.timeFormat]||n.timeFormat,t=/(h+)[:]?(m+)[ ]?(a?)/i.exec(s).slice(1);o.$select=function(a,b){l.select(a,b)},o.$moveIndex=function(a,b){l.$moveIndex(a,b)},o.$switchMeridian=function(a){l.switchMeridian(a)},l.update=function(a){angular.isDate(a)&&!isNaN(a.getTime())?(l.$date=a,angular.extend(r,{hour:a.getHours(),minute:a.getMinutes(),second:a.getSeconds(),millisecond:a.getMilliseconds()}),l.$build()):l.$isBuilt||l.$build()},l.select=function(a,b,d){isNaN(c.$dateValue.getTime())&&(c.$dateValue=new Date(1970,0,1)),angular.isDate(a)||(a=new Date(a)),0===b?c.$dateValue.setHours(a.getHours()):1===b&&c.$dateValue.setMinutes(a.getMinutes()),c.$setViewValue(c.$dateValue),c.$render(),n.autoclose&&!d&&l.hide(!0)},l.switchMeridian=function(a){var b=(a||c.$dateValue).getHours();c.$dateValue.setHours(12>b?b+12:b-12),c.$render()},l.$build=function(){var a,b,c=o.midIndex=parseInt(n.length/2,10),d=[];for(a=0;a<n.length;a++)b=new Date(1970,0,1,r.hour-(c-a)*n.hourStep),d.push({date:b,label:g(b,t[0]),selected:l.$date&&l.$isSelected(b,0),disabled:l.$isDisabled(b,0)});var e,f=[];for(a=0;a<n.length;a++)e=new Date(1970,0,1,0,r.minute-(c-a)*n.minuteStep),f.push({date:e,label:g(e,t[1]),selected:l.$date&&l.$isSelected(e,1),disabled:l.$isDisabled(e,1)});var h=[];for(a=0;a<n.length;a++)h.push([d[a],f[a]]);o.rows=h,o.showAM=!!t[2],o.isAM=(l.$date||d[c].date).getHours()<12,l.$isBuilt=!0},l.$isSelected=function(a,b){return l.$date?0===b?a.getHours()===l.$date.getHours():1===b?a.getMinutes()===l.$date.getMinutes():void 0:!1},l.$isDisabled=function(a,b){var c;return 0===b?c=a.getTime()+6e4*r.minute:1===b&&(c=a.getTime()+36e5*r.hour),c<n.minTime||c>n.maxTime},l.$moveIndex=function(a,b){var c;0===b?(c=new Date(1970,0,1,r.hour+a*n.length,r.minute),angular.extend(r,{hour:c.getHours()})):1===b&&(c=new Date(1970,0,1,r.hour,r.minute+a*n.length*5),angular.extend(r,{minute:c.getMinutes()})),l.$build()},l.$onMouseDown=function(a){if("input"!==a.target.nodeName.toLowerCase()&&a.preventDefault(),a.stopPropagation(),j){var b=angular.element(a.target);"button"!==b[0].nodeName.toLowerCase()&&(b=b.parent()),b.triggerHandler("click")}},l.$onKeyDown=function(a){if(/(38|37|39|40|13)/.test(a.keyCode)&&!a.shiftKey&&!a.altKey){if(a.preventDefault(),a.stopPropagation(),13===a.keyCode)return l.hide(!0);var b=new Date(l.$date),c=b.getHours(),d=g(b,"h").length,f=b.getMinutes(),h=g(b,"mm").length,i=/(37|39)/.test(a.keyCode),j=2+1*!!t[2];if(i&&(37===a.keyCode?p=1>p?j-1:p-1:39===a.keyCode&&(p=j-1>p?p+1:0)),0===p){if(i)return e(0,d);38===a.keyCode?b.setHours(c-n.hourStep):40===a.keyCode&&b.setHours(c+n.hourStep)}else if(1===p){if(i)return e(d+1,d+1+h);38===a.keyCode?b.setMinutes(f-n.minuteStep):40===a.keyCode&&b.setMinutes(f+n.minuteStep)}else if(2===p){if(i)return e(d+1+h+1,d+1+h+3);l.switchMeridian()}l.select(b,p,!0),m.$digest()}};var u=l.init;l.init=function(){return k&&n.useNative?(b.prop("type","time"),void b.css("-webkit-appearance","textfield")):(j&&(b.prop("type","text"),b.attr("readonly","true"),b.on("click",i)),void u())};var v=l.destroy;l.destroy=function(){k&&n.useNative&&b.off("click",i),v()};var w=l.show;l.show=function(){w(),setTimeout(function(){l.$element.on(j?"touchstart":"mousedown",l.$onMouseDown),n.keyboard&&b.on("keydown",l.$onKeyDown)})};var x=l.hide;return l.hide=function(a){l.$element.off(j?"touchstart":"mousedown",l.$onMouseDown),n.keyboard&&b.off("keydown",l.$onKeyDown),x(a)},l}var j=(angular.element(b.document.body),"createTouch"in b.document),k=/(ip(a|o)d|iphone|android)/gi.test(b.navigator.userAgent);return a.lang||(a.lang=f.id),i.defaults=a,i}]}).directive("bsTimepicker",["$window","$parse","$q","$locale","dateFilter","$timepicker","$dateParser","$timeout",function(a,b,c,d,e,f,g){{var h=f.defaults,i=/(ip(a|o)d|iphone|android)/gi.test(a.navigator.userAgent);a.requestAnimationFrame||a.setTimeout}return{restrict:"EAC",require:"ngModel",link:function(a,b,c,d){var j={scope:a,controller:d};angular.forEach(["placement","container","delay","trigger","keyboard","html","animation","template","autoclose","timeType","timeFormat","useNative","lang"],function(a){angular.isDefined(c[a])&&(j[a]=c[a])}),i&&(j.useNative||h.useNative)&&(j.timeFormat="HH:mm");var k=f(b,d,j);j=k.$options;var l=g({format:j.timeFormat,lang:j.lang});angular.forEach(["minTime","maxTime"],function(a){angular.isDefined(c[a])&&c.$observe(a,function(b){k.$options[a]="now"===b?(new Date).setFullYear(1970,0,1):angular.isString(b)&&b.match(/^".+"$/)?+new Date(b.substr(1,b.length-2)):l.parse(b),!isNaN(k.$options[a])&&k.$build()})}),a.$watch(c.ngModel,function(){k.update(d.$dateValue)},!0),d.$parsers.unshift(function(a){if(!a)return void d.$setValidity("date",!0);var b=l.parse(a,d.$dateValue);if(!b||isNaN(b.getTime()))d.$setValidity("date",!1);else{var c=b.getTime()>=j.minTime&&b.getTime()<=j.maxTime;d.$setValidity("date",c),c&&(d.$dateValue=b)}return"string"===j.timeType?e(a,j.timeFormat):"number"===j.timeType?d.$dateValue.getTime():"iso"===j.timeType?d.$dateValue.toISOString():d.$dateValue}),d.$formatters.push(function(a){var b="string"===j.timeType?l.parse(a,d.$dateValue):new Date(a);return d.$dateValue=b,d.$dateValue}),d.$render=function(){b.val(isNaN(d.$dateValue.getTime())?"":e(d.$dateValue,j.timeFormat))},a.$on("$destroy",function(){k.destroy(),j=null,k=null})}}}]),angular.module("mgcrea.ngStrap.tooltip",["ngAnimate","mgcrea.ngStrap.helpers.dimensions"]).provider("$tooltip",function(){var a=this.defaults={animation:"am-fade",prefixClass:"tooltip",container:!1,placement:"top",template:"tooltip/tooltip.tpl.html",contentTemplate:!1,trigger:"hover focus",keyboard:!1,html:!1,show:!1,title:"",type:"",delay:0};this.$get=["$window","$rootScope","$compile","$q","$templateCache","$http","$animate","$timeout","dimensions","$$animateReflow",function(c,d,e,f,g,h,i,j,k,l){function m(b,c){function f(){return"body"===j.container?k.offset(b[0]):k.position(b[0])}function g(a,b,c,d){var e,f=a.split("-");switch(f[0]){case"right":e={top:b.top+b.height/2-d/2,left:b.left+b.width};break;case"bottom":e={top:b.top+b.height,left:b.left+b.width/2-c/2};break;case"left":e={top:b.top+b.height/2-d/2,left:b.left-c};break;default:e={top:b.top-d,left:b.left+b.width/2-c/2}}if(!f[1])return e;if("top"===f[0]||"bottom"===f[0])switch(f[1]){case"left":e.left=b.left;break;case"right":e.left=b.left+b.width-c}else if("left"===f[0]||"right"===f[0])switch(f[1]){case"top":e.top=b.top-d;break;case"bottom":e.top=b.top+b.height}return e}var h={},j=h.$options=angular.extend({},a,c);h.$promise=o(j.template);var m=h.$scope=j.scope&&j.scope.$new()||d.$new();j.delay&&angular.isString(j.delay)&&(j.delay=parseFloat(j.delay)),j.title&&(h.$scope.title=j.title),m.$hide=function(){m.$$postDigest(function(){h.hide()})},m.$show=function(){m.$$postDigest(function(){h.show()})},m.$toggle=function(){m.$$postDigest(function(){h.toggle()})},h.$isShown=m.$isShown=!1;var s,t;j.contentTemplate&&(h.$promise=h.$promise.then(function(a){var b=angular.element(a);return o(j.contentTemplate).then(function(a){return n('[ng-bind="content"]',b[0]).removeAttr("ng-bind").html(a),b[0].outerHTML})}));var u,v,w,x;return h.$promise.then(function(a){angular.isObject(a)&&(a=a.data),j.html&&(a=a.replace(r,'ng-bind-html="')),a=p.apply(a),w=a,u=e(a),h.init()}),h.init=function(){j.delay&&angular.isNumber(j.delay)&&(j.delay={show:j.delay,hide:j.delay}),"self"===j.container?x=b:j.container&&(x=n(j.container));var a=j.trigger.split(" ");angular.forEach(a,function(a){"click"===a?b.on("click",h.toggle):"manual"!==a&&(b.on("hover"===a?"mouseenter":"focus",h.enter),b.on("hover"===a?"mouseleave":"blur",h.leave),"hover"!==a&&b.on(q?"touchstart":"mousedown",h.$onFocusElementMouseDown))}),j.show&&m.$$postDigest(function(){"focus"===j.trigger?b[0].focus():h.show()})},h.destroy=function(){for(var a=j.trigger.split(" "),c=a.length;c--;){var d=a[c];"click"===d?b.off("click",h.toggle):"manual"!==d&&(b.off("hover"===d?"mouseenter":"focus",h.enter),b.off("hover"===d?"mouseleave":"blur",h.leave),"hover"!==d&&b.off(q?"touchstart":"mousedown",h.$onFocusElementMouseDown))}v&&(v.remove(),v=null),m.$destroy()},h.enter=function(){return clearTimeout(s),t="in",j.delay&&j.delay.show?void(s=setTimeout(function(){"in"===t&&h.show()},j.delay.show)):h.show()},h.show=function(){var a=j.container?x:null,c=j.container?null:b;v&&v.remove(),v=h.$element=u(m,function(){}),v.css({top:"0px",left:"0px",display:"block"}).addClass(j.placement),j.animation&&v.addClass(j.animation),j.type&&v.addClass(j.prefixClass+"-"+j.type),i.enter(v,a,c,function(){}),h.$isShown=m.$isShown=!0,m.$$phase||m.$digest(),l(h.$applyPlacement),j.keyboard&&("focus"!==j.trigger?(h.focus(),v.on("keyup",h.$onKeyUp)):b.on("keyup",h.$onFocusKeyUp))},h.leave=function(){return clearTimeout(s),t="out",j.delay&&j.delay.hide?void(s=setTimeout(function(){"out"===t&&h.hide()},j.delay.hide)):h.hide()},h.hide=function(a){return h.$isShown?(i.leave(v,function(){v=null}),h.$isShown=m.$isShown=!1,m.$$phase||m.$digest(),j.keyboard&&v.off("keyup",h.$onKeyUp),a&&"focus"===j.trigger?b[0].blur():void 0):void 0},h.toggle=function(){h.$isShown?h.leave():h.enter()},h.focus=function(){v[0].focus()},h.$applyPlacement=function(){if(v){var a=f(),b=v.prop("offsetWidth"),c=v.prop("offsetHeight"),d=g(j.placement,a,b,c);d.top+="px",d.left+="px",v.css(d)}},h.$onKeyUp=function(a){27===a.which&&h.hide()},h.$onFocusKeyUp=function(a){27===a.which&&b[0].blur()},h.$onFocusElementMouseDown=function(a){a.preventDefault(),a.stopPropagation(),h.$isShown?b[0].blur():b[0].focus()},h}function n(a,c){return angular.element((c||b).querySelectorAll(a))}function o(a){return f.when(g.get(a)||h.get(a)).then(function(b){return angular.isObject(b)?(g.put(a,b.data),b.data):b})}var p=String.prototype.trim,q="createTouch"in c.document,r=/ng-bind="/gi;return m}]}).directive("bsTooltip",["$window","$location","$sce","$tooltip","$$animateReflow",function(a,b,c,d,e){return{restrict:"EAC",scope:!0,link:function(a,b,f){var g={scope:a};angular.forEach(["template","contentTemplate","placement","container","delay","trigger","keyboard","html","animation","type"],function(a){angular.isDefined(f[a])&&(g[a]=f[a])}),angular.forEach(["title"],function(b){f[b]&&f.$observe(b,function(d,f){a[b]=c.trustAsHtml(d),angular.isDefined(f)&&e(function(){h&&h.$applyPlacement()})})}),f.bsTooltip&&a.$watch(f.bsTooltip,function(b,c){angular.isObject(b)?angular.extend(a,b):a.content=b,angular.isDefined(c)&&e(function(){h&&h.$applyPlacement()})},!0);var h=d(b,g);a.$on("$destroy",function(){h.destroy(),g=null,h=null})}}}]),angular.module("mgcrea.ngStrap.typeahead",["mgcrea.ngStrap.tooltip","mgcrea.ngStrap.helpers.parseOptions"]).provider("$typeahead",function(){var a=this.defaults={animation:"am-fade",prefixClass:"typeahead",placement:"bottom-left",template:"typeahead/typeahead.tpl.html",trigger:"focus",container:!1,keyboard:!0,html:!1,delay:0,minLength:1,filter:"filter",limit:6};this.$get=["$window","$rootScope","$tooltip",function(b,c,d){function e(b,c){var e={},f=angular.extend({},a,c),g=f.controller;e=d(b,f);var h=c.scope,i=e.$scope;i.$matches=[],i.$activeIndex=0,i.$activate=function(a){i.$$postDigest(function(){e.activate(a)})},i.$select=function(a){i.$$postDigest(function(){e.select(a)})},i.$isVisible=function(){return e.$isVisible()},e.update=function(a){i.$matches=a,i.$activeIndex>=a.length&&(i.$activeIndex=0)},e.activate=function(a){i.$activeIndex=a},e.select=function(a){var c=i.$matches[a].value;g&&(g.$setViewValue(c),g.$render(),h&&h.$digest()),"focus"===f.trigger?b[0].blur():e.$isShown&&e.hide(),i.$activeIndex=0,i.$emit("$typeahead.select",c,a)},e.$isVisible=function(){return f.minLength&&g?i.$matches.length&&angular.isString(g.$viewValue)&&g.$viewValue.length>=f.minLength:!!i.$matches.length},e.$onMouseDown=function(a){a.preventDefault(),a.stopPropagation()},e.$onKeyDown=function(a){if(/(38|40|13)/.test(a.keyCode)){if(a.preventDefault(),a.stopPropagation(),13===a.keyCode)return e.select(i.$activeIndex);38===a.keyCode&&i.$activeIndex>0?i.$activeIndex--:40===a.keyCode&&i.$activeIndex<i.$matches.length-1?i.$activeIndex++:angular.isUndefined(i.$activeIndex)&&(i.$activeIndex=0),i.$digest()}};var j=e.show;e.show=function(){j(),setTimeout(function(){e.$element.on("mousedown",e.$onMouseDown),f.keyboard&&b.on("keydown",e.$onKeyDown)})};var k=e.hide;return e.hide=function(){e.$element.off("mousedown",e.$onMouseDown),f.keyboard&&b.off("keydown",e.$onKeyDown),k()},e}angular.element(b.document.body);return e.defaults=a,e}]}).directive("bsTypeahead",["$window","$parse","$q","$typeahead","$parseOptions",function(a,b,c,d,e){var f=d.defaults;return{restrict:"EAC",require:"ngModel",link:function(a,b,c,g){var h={scope:a,controller:g};angular.forEach(["placement","container","delay","trigger","keyboard","html","animation","template","filter","limit","minLength"],function(a){angular.isDefined(c[a])&&(h[a]=c[a])});var i=h.filter||f.filter,j=h.limit||f.limit,k=c.ngOptions;i&&(k+=" | "+i+":$viewValue"),j&&(k+=" | limitTo:"+j);var l=e(k),m=d(b,h);a.$watch(c.ngModel,function(){l.valuesFn(a,g).then(function(a){a.length>j&&(a=a.slice(0,j)),m.update(a)})}),a.$on("$destroy",function(){m.destroy(),h=null,m=null})}}}])}(window,document),function(){"use strict";angular.module("mgcrea.ngStrap.alert").run(["$templateCache",function(a){a.put("alert/alert.tpl.html",'<div class="alert alert-dismissable" tabindex="-1" ng-class="[type ? \'alert-\' + type : null]"><button type="button" class="close" ng-click="$hide()">&times;</button> <strong ng-bind="title"></strong>&nbsp;<span ng-bind-html="content"></span></div>')}]),angular.module("mgcrea.ngStrap.aside").run(["$templateCache",function(a){a.put("aside/aside.tpl.html",'<div class="aside" tabindex="-1" role="dialog"><div class="aside-dialog"><div class="aside-content"><div class="aside-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="aside-title" ng-bind="title"></h4></div><div class="aside-body" ng-bind="content"></div><div class="aside-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>')}]),angular.module("mgcrea.ngStrap.datepicker").run(["$templateCache",function(a){a.put("datepicker/datepicker.tpl.html",'<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode" style="max-width: 320px"><table style="table-layout: fixed; height: 100%; width: 100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$selectPane(-1)"><i class="glyphicon glyphicon-chevron-left"></i></button></th><th colspan="{{ rows[0].length - 2 }}"><button tabindex="-1" type="button" class="btn btn-default btn-block text-strong" ng-click="$toggleMode()"><strong style="text-transform: capitalize" ng-bind="title"></strong></button></th><th><button tabindex="-1" type="button" class="btn btn-default pull-right" ng-click="$selectPane(+1)"><i class="glyphicon glyphicon-chevron-right"></i></button></th></tr><tr ng-show="labels" ng-bind-html="labels"></tr></thead><tbody><tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%"><td class="text-center" ng-repeat="(j, el) in row"><button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled"><span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span></button></td></tr></tbody></table></div>')}]),angular.module("mgcrea.ngStrap.dropdown").run(["$templateCache",function(a){a.put("dropdown/dropdown.tpl.html",'<ul tabindex="-1" class="dropdown-menu" role="menu"><li role="presentation" ng-class="{divider: item.divider}" ng-repeat="item in content"><a role="menuitem" tabindex="-1" ng-href="{{item.href}}" ng-if="!item.divider && item.href" ng-bind="item.text"></a> <a role="menuitem" tabindex="-1" href="javascript:void(0)" ng-if="!item.divider && item.click" ng-click="$eval(item.click);$hide()" ng-bind="item.text"></a></li></ul>')}]),angular.module("mgcrea.ngStrap.modal").run(["$templateCache",function(a){a.put("modal/modal.tpl.html",'<div class="modal" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="modal-title" ng-bind="title"></h4></div><div class="modal-body" ng-bind="content"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>')}]),angular.module("mgcrea.ngStrap.popover").run(["$templateCache",function(a){a.put("popover/popover.tpl.html",'<div class="popover"><div class="arrow"></div><h3 class="popover-title" ng-bind="title" ng-show="title"></h3><div class="popover-content" ng-bind="content"></div></div>')}]),angular.module("mgcrea.ngStrap.select").run(["$templateCache",function(a){a.put("select/select.tpl.html",'<ul tabindex="-1" class="select dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $isActive($index)}"><a style="cursor: default" role="menuitem" tabindex="-1" ng-click="$select($index, $event)"><span ng-bind="match.label"></span> <i class="glyphicon glyphicon-ok pull-right" ng-if="$isMultiple && $isActive($index)"></i></a></li></ul>')}]),angular.module("mgcrea.ngStrap.tab").run(["$templateCache",function(a){a.put("tab/tab.tpl.html",'<ul class="nav nav-tabs"><li ng-repeat="pane in panes" ng-class="{active: $index == active}"><a data-toggle="tab" ng-click="setActive($index, $event)" data-index="{{$index}}">{{pane.title}}</a></li></ul><div class="tab-content"><div ng-repeat="pane in panes" class="tab-pane" ng-class="[$index == active ? \'active\' : \'\']" ng-include="pane.template || \'$pane\'"></div></div>')}]),angular.module("mgcrea.ngStrap.timepicker").run(["$templateCache",function(a){a.put("timepicker/timepicker.tpl.html",'<div class="dropdown-menu timepicker" style="min-width: 0px;width: auto"><table height="100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 0)"><i class="glyphicon glyphicon-chevron-up"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 1)"><i class="glyphicon glyphicon-chevron-up"></i></button></th></tr></thead><tbody><tr ng-repeat="(i, row) in rows"><td class="text-center"><button tabindex="-1" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[0].selected}" ng-click="$select(row[0].date, 0)" ng-disabled="row[0].disabled"><span ng-class="{\'text-muted\': row[0].muted}" ng-bind="row[0].label"></span></button></td><td><span ng-bind="i == midIndex ? \':\' : \' \'"></span></td><td class="text-center"><button tabindex="-1" ng-if="row[1].date" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[1].selected}" ng-click="$select(row[1].date, 1)" ng-disabled="row[1].disabled"><span ng-class="{\'text-muted\': row[1].muted}" ng-bind="row[1].label"></span></button></td><td ng-if="showAM">&nbsp;</td><td ng-if="showAM"><button tabindex="-1" ng-show="i == midIndex - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !!isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">AM</button> <button tabindex="-1" ng-show="i == midIndex + 1 - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">PM</button></td></tr></tbody><tfoot><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 0)"><i class="glyphicon glyphicon-chevron-down"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 1)"><i class="glyphicon glyphicon-chevron-down"></i></button></th></tr></tfoot></table></div>')}]),angular.module("mgcrea.ngStrap.tooltip").run(["$templateCache",function(a){a.put("tooltip/tooltip.tpl.html",'<div class="tooltip in" ng-show="title"><div class="tooltip-arrow"></div><div class="tooltip-inner" ng-bind="title"></div></div>')}]),angular.module("mgcrea.ngStrap.typeahead").run(["$templateCache",function(a){a.put("typeahead/typeahead.tpl.html",'<ul tabindex="-1" class="typeahead dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $index == $activeIndex}"><a role="menuitem" tabindex="-1" ng-click="$select($index, $event)" ng-bind="match.label"></a></li></ul>')}])}(window,document);
//# sourceMappingURL=angular-strap.min.map
/**
 * angular-strap
 * @version v2.0.0-rc.4 - 2014-03-07
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes (olivier@mg-crea.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';
// Source: dist/modules/alert.tpl.js
angular.module('mgcrea.ngStrap.alert').run(['$templateCache', function($templateCache) {
$templateCache.put('alert/alert.tpl.html',
    "<div class=\"alert alert-dismissable\" tabindex=\"-1\" ng-class=\"[type ? 'alert-' + type : null]\"><button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button> <strong ng-bind=\"title\"></strong>&nbsp;<span ng-bind-html=\"content\"></span></div>"
  );

}]);

// Source: dist/modules/aside.tpl.js
angular.module('mgcrea.ngStrap.aside').run(['$templateCache', function($templateCache) {
$templateCache.put('aside/aside.tpl.html',
    "<div class=\"aside\" tabindex=\"-1\" role=\"dialog\"><div class=\"aside-dialog\"><div class=\"aside-content\"><div class=\"aside-header\" ng-show=\"title\"><button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button><h4 class=\"aside-title\" ng-bind=\"title\"></h4></div><div class=\"aside-body\" ng-bind=\"content\"></div><div class=\"aside-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button></div></div></div></div>"
  );

}]);

// Source: dist/modules/datepicker.tpl.js
angular.module('mgcrea.ngStrap.datepicker').run(['$templateCache', function($templateCache) {
$templateCache.put('datepicker/datepicker.tpl.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\" style=\"max-width: 320px\"><table style=\"table-layout: fixed; height: 100%; width: 100%\"><thead><tr class=\"text-center\"><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$selectPane(-1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th><th colspan=\"{{ rows[0].length - 2 }}\"><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default btn-block text-strong\" ng-click=\"$toggleMode()\"><strong style=\"text-transform: capitalize\" ng-bind=\"title\"></strong></button></th><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-right\" ng-click=\"$selectPane(+1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th></tr><tr ng-show=\"labels\" ng-bind-html=\"labels\"></tr></thead><tbody><tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"><td class=\"text-center\" ng-repeat=\"(j, el) in row\"><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default\" style=\"width: 100%\" ng-class=\"{'btn-primary': el.selected}\" ng-click=\"$select(el.date)\" ng-disabled=\"el.disabled\"><span ng-class=\"{'text-muted': el.muted}\" ng-bind=\"el.label\"></span></button></td></tr></tbody></table></div>"
  );

}]);

// Source: dist/modules/dropdown.tpl.js
angular.module('mgcrea.ngStrap.dropdown').run(['$templateCache', function($templateCache) {
$templateCache.put('dropdown/dropdown.tpl.html',
    "<ul tabindex=\"-1\" class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" ng-class=\"{divider: item.divider}\" ng-repeat=\"item in content\"><a role=\"menuitem\" tabindex=\"-1\" ng-href=\"{{item.href}}\" ng-if=\"!item.divider && item.href\" ng-bind=\"item.text\"></a> <a role=\"menuitem\" tabindex=\"-1\" href=\"javascript:void(0)\" ng-if=\"!item.divider && item.click\" ng-click=\"$eval(item.click);$hide()\" ng-bind=\"item.text\"></a></li></ul>"
  );

}]);

// Source: dist/modules/modal.tpl.js
angular.module('mgcrea.ngStrap.modal').run(['$templateCache', function($templateCache) {
$templateCache.put('modal/modal.tpl.html',
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\" ng-show=\"title\"><button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button><h4 class=\"modal-title\" ng-bind=\"title\"></h4></div><div class=\"modal-body\" ng-bind=\"content\"></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button></div></div></div></div>"
  );

}]);

// Source: dist/modules/popover.tpl.js
angular.module('mgcrea.ngStrap.popover').run(['$templateCache', function($templateCache) {
$templateCache.put('popover/popover.tpl.html',
    "<div class=\"popover\"><div class=\"arrow\"></div><h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3><div class=\"popover-content\" ng-bind=\"content\"></div></div>"
  );

}]);

// Source: dist/modules/select.tpl.js
angular.module('mgcrea.ngStrap.select').run(['$templateCache', function($templateCache) {
$templateCache.put('select/select.tpl.html',
    "<ul tabindex=\"-1\" class=\"select dropdown-menu\" ng-show=\"$isVisible()\" role=\"select\"><li role=\"presentation\" ng-repeat=\"match in $matches\" ng-class=\"{active: $isActive($index)}\"><a style=\"cursor: default\" role=\"menuitem\" tabindex=\"-1\" ng-click=\"$select($index, $event)\"><span ng-bind=\"match.label\"></span> <i class=\"glyphicon glyphicon-ok pull-right\" ng-if=\"$isMultiple && $isActive($index)\"></i></a></li></ul>"
  );

}]);

// Source: dist/modules/tab.tpl.js
angular.module('mgcrea.ngStrap.tab').run(['$templateCache', function($templateCache) {
$templateCache.put('tab/tab.tpl.html',
    "<ul class=\"nav nav-tabs\"><li ng-repeat=\"pane in panes\" ng-class=\"{active: $index == active}\"><a data-toggle=\"tab\" ng-click=\"setActive($index, $event)\" data-index=\"{{$index}}\">{{pane.title}}</a></li></ul><div class=\"tab-content\"><div ng-repeat=\"pane in panes\" class=\"tab-pane\" ng-class=\"[$index == active ? 'active' : '']\" ng-include=\"pane.template || '$pane'\"></div></div>"
  );

}]);

// Source: dist/modules/timepicker.tpl.js
angular.module('mgcrea.ngStrap.timepicker').run(['$templateCache', function($templateCache) {
$templateCache.put('timepicker/timepicker.tpl.html',
    "<div class=\"dropdown-menu timepicker\" style=\"min-width: 0px;width: auto\"><table height=\"100%\"><thead><tr class=\"text-center\"><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$moveIndex(-1, 0)\"><i class=\"glyphicon glyphicon-chevron-up\"></i></button></th><th>&nbsp;</th><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$moveIndex(-1, 1)\"><i class=\"glyphicon glyphicon-chevron-up\"></i></button></th></tr></thead><tbody><tr ng-repeat=\"(i, row) in rows\"><td class=\"text-center\"><button tabindex=\"-1\" style=\"width: 100%\" type=\"button\" class=\"btn btn-default\" ng-class=\"{'btn-primary': row[0].selected}\" ng-click=\"$select(row[0].date, 0)\" ng-disabled=\"row[0].disabled\"><span ng-class=\"{'text-muted': row[0].muted}\" ng-bind=\"row[0].label\"></span></button></td><td><span ng-bind=\"i == midIndex ? ':' : ' '\"></span></td><td class=\"text-center\"><button tabindex=\"-1\" ng-if=\"row[1].date\" style=\"width: 100%\" type=\"button\" class=\"btn btn-default\" ng-class=\"{'btn-primary': row[1].selected}\" ng-click=\"$select(row[1].date, 1)\" ng-disabled=\"row[1].disabled\"><span ng-class=\"{'text-muted': row[1].muted}\" ng-bind=\"row[1].label\"></span></button></td><td ng-if=\"showAM\">&nbsp;</td><td ng-if=\"showAM\"><button tabindex=\"-1\" ng-show=\"i == midIndex - !isAM * 1\" style=\"width: 100%\" type=\"button\" ng-class=\"{'btn-primary': !!isAM}\" class=\"btn btn-default\" ng-click=\"$switchMeridian()\" ng-disabled=\"el.disabled\">AM</button> <button tabindex=\"-1\" ng-show=\"i == midIndex + 1 - !isAM * 1\" style=\"width: 100%\" type=\"button\" ng-class=\"{'btn-primary': !isAM}\" class=\"btn btn-default\" ng-click=\"$switchMeridian()\" ng-disabled=\"el.disabled\">PM</button></td></tr></tbody><tfoot><tr class=\"text-center\"><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$moveIndex(1, 0)\"><i class=\"glyphicon glyphicon-chevron-down\"></i></button></th><th>&nbsp;</th><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$moveIndex(1, 1)\"><i class=\"glyphicon glyphicon-chevron-down\"></i></button></th></tr></tfoot></table></div>"
  );

}]);

// Source: dist/modules/tooltip.tpl.js
angular.module('mgcrea.ngStrap.tooltip').run(['$templateCache', function($templateCache) {
$templateCache.put('tooltip/tooltip.tpl.html',
    "<div class=\"tooltip in\" ng-show=\"title\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\" ng-bind=\"title\"></div></div>"
  );

}]);

// Source: dist/modules/typeahead.tpl.js
angular.module('mgcrea.ngStrap.typeahead').run(['$templateCache', function($templateCache) {
$templateCache.put('typeahead/typeahead.tpl.html',
    "<ul tabindex=\"-1\" class=\"typeahead dropdown-menu\" ng-show=\"$isVisible()\" role=\"select\"><li role=\"presentation\" ng-repeat=\"match in $matches\" ng-class=\"{active: $index == $activeIndex}\"><a role=\"menuitem\" tabindex=\"-1\" ng-click=\"$select($index, $event)\" ng-bind=\"match.label\"></a></li></ul>"
  );

}]);

})(window, document);

/**
 * angular-strap
 * @version v2.0.0-rc.4 - 2014-03-07
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes (olivier@mg-crea.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
!function(){"use strict";angular.module("mgcrea.ngStrap.alert").run(["$templateCache",function(a){a.put("alert/alert.tpl.html",'<div class="alert alert-dismissable" tabindex="-1" ng-class="[type ? \'alert-\' + type : null]"><button type="button" class="close" ng-click="$hide()">&times;</button> <strong ng-bind="title"></strong>&nbsp;<span ng-bind-html="content"></span></div>')}]),angular.module("mgcrea.ngStrap.aside").run(["$templateCache",function(a){a.put("aside/aside.tpl.html",'<div class="aside" tabindex="-1" role="dialog"><div class="aside-dialog"><div class="aside-content"><div class="aside-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="aside-title" ng-bind="title"></h4></div><div class="aside-body" ng-bind="content"></div><div class="aside-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>')}]),angular.module("mgcrea.ngStrap.datepicker").run(["$templateCache",function(a){a.put("datepicker/datepicker.tpl.html",'<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode" style="max-width: 320px"><table style="table-layout: fixed; height: 100%; width: 100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$selectPane(-1)"><i class="glyphicon glyphicon-chevron-left"></i></button></th><th colspan="{{ rows[0].length - 2 }}"><button tabindex="-1" type="button" class="btn btn-default btn-block text-strong" ng-click="$toggleMode()"><strong style="text-transform: capitalize" ng-bind="title"></strong></button></th><th><button tabindex="-1" type="button" class="btn btn-default pull-right" ng-click="$selectPane(+1)"><i class="glyphicon glyphicon-chevron-right"></i></button></th></tr><tr ng-show="labels" ng-bind-html="labels"></tr></thead><tbody><tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%"><td class="text-center" ng-repeat="(j, el) in row"><button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled"><span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span></button></td></tr></tbody></table></div>')}]),angular.module("mgcrea.ngStrap.dropdown").run(["$templateCache",function(a){a.put("dropdown/dropdown.tpl.html",'<ul tabindex="-1" class="dropdown-menu" role="menu"><li role="presentation" ng-class="{divider: item.divider}" ng-repeat="item in content"><a role="menuitem" tabindex="-1" ng-href="{{item.href}}" ng-if="!item.divider && item.href" ng-bind="item.text"></a> <a role="menuitem" tabindex="-1" href="javascript:void(0)" ng-if="!item.divider && item.click" ng-click="$eval(item.click);$hide()" ng-bind="item.text"></a></li></ul>')}]),angular.module("mgcrea.ngStrap.modal").run(["$templateCache",function(a){a.put("modal/modal.tpl.html",'<div class="modal" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="modal-title" ng-bind="title"></h4></div><div class="modal-body" ng-bind="content"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>')}]),angular.module("mgcrea.ngStrap.popover").run(["$templateCache",function(a){a.put("popover/popover.tpl.html",'<div class="popover"><div class="arrow"></div><h3 class="popover-title" ng-bind="title" ng-show="title"></h3><div class="popover-content" ng-bind="content"></div></div>')}]),angular.module("mgcrea.ngStrap.select").run(["$templateCache",function(a){a.put("select/select.tpl.html",'<ul tabindex="-1" class="select dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $isActive($index)}"><a style="cursor: default" role="menuitem" tabindex="-1" ng-click="$select($index, $event)"><span ng-bind="match.label"></span> <i class="glyphicon glyphicon-ok pull-right" ng-if="$isMultiple && $isActive($index)"></i></a></li></ul>')}]),angular.module("mgcrea.ngStrap.tab").run(["$templateCache",function(a){a.put("tab/tab.tpl.html",'<ul class="nav nav-tabs"><li ng-repeat="pane in panes" ng-class="{active: $index == active}"><a data-toggle="tab" ng-click="setActive($index, $event)" data-index="{{$index}}">{{pane.title}}</a></li></ul><div class="tab-content"><div ng-repeat="pane in panes" class="tab-pane" ng-class="[$index == active ? \'active\' : \'\']" ng-include="pane.template || \'$pane\'"></div></div>')}]),angular.module("mgcrea.ngStrap.timepicker").run(["$templateCache",function(a){a.put("timepicker/timepicker.tpl.html",'<div class="dropdown-menu timepicker" style="min-width: 0px;width: auto"><table height="100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 0)"><i class="glyphicon glyphicon-chevron-up"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 1)"><i class="glyphicon glyphicon-chevron-up"></i></button></th></tr></thead><tbody><tr ng-repeat="(i, row) in rows"><td class="text-center"><button tabindex="-1" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[0].selected}" ng-click="$select(row[0].date, 0)" ng-disabled="row[0].disabled"><span ng-class="{\'text-muted\': row[0].muted}" ng-bind="row[0].label"></span></button></td><td><span ng-bind="i == midIndex ? \':\' : \' \'"></span></td><td class="text-center"><button tabindex="-1" ng-if="row[1].date" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[1].selected}" ng-click="$select(row[1].date, 1)" ng-disabled="row[1].disabled"><span ng-class="{\'text-muted\': row[1].muted}" ng-bind="row[1].label"></span></button></td><td ng-if="showAM">&nbsp;</td><td ng-if="showAM"><button tabindex="-1" ng-show="i == midIndex - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !!isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">AM</button> <button tabindex="-1" ng-show="i == midIndex + 1 - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">PM</button></td></tr></tbody><tfoot><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 0)"><i class="glyphicon glyphicon-chevron-down"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 1)"><i class="glyphicon glyphicon-chevron-down"></i></button></th></tr></tfoot></table></div>')}]),angular.module("mgcrea.ngStrap.tooltip").run(["$templateCache",function(a){a.put("tooltip/tooltip.tpl.html",'<div class="tooltip in" ng-show="title"><div class="tooltip-arrow"></div><div class="tooltip-inner" ng-bind="title"></div></div>')}]),angular.module("mgcrea.ngStrap.typeahead").run(["$templateCache",function(a){a.put("typeahead/typeahead.tpl.html",'<ul tabindex="-1" class="typeahead dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $index == $activeIndex}"><a role="menuitem" tabindex="-1" ng-click="$select($index, $event)" ng-bind="match.label"></a></li></ul>')}])}(window,document);
//# sourceMappingURL=angular-strap.tpl.min.map