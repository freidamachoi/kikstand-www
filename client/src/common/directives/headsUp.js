/**
 *  Created by Kikstand, Inc.
 *  Author: Bo Coughlin
 *  Project: Www
 *  File: anchorScroll.js
 *  Date: 3/18/14
 *  Time: 4:12 PM
 */

angular.module ( 'directives.headsUp', [] )
    .directive ( 'headsUp', ['$window', '$animate', function ( $window, $animate ) {
    return {
        restrict : 'A',
        scope : {
            scrollTo: '@',
            toClass: '@'
        },
        link : function ( scope, element, attrs ) {
            var _window = angular.element ( $window );
            var getScrollOffset = function () {
                var _w = $window;
                var _scroll = {};

                if ( _w.pageXOffset !== null ) {
                    _scroll = {
                        x : _w.pageXOffset,
                        y : _w.pageYOffset
                    };
                }

                // IE
                var _d = _w.document;
                if ( _d.compatMode === 'CSS1Compat' ) {
                    _scroll = {
                        x : _d.documentElement.scrollLeft,
                        y : _d.documentElement.scrollTop
                    };
                }

                // Quirks mode
                _scroll = {
                    x : _d.body.scrollLeft,
                    y : _d.body.scrollTop
                };

                if ( _scroll.y >= scope.scrollTo ) {
                    element.addClass ( scope.toClass );
                } else {
                    element.removeClass ( scope.toClass );
                }
            };
            _window.on ( 'scroll', scope.$apply.bind ( scope, getScrollOffset ) );
            getScrollOffset();
        }
    };
}] );