/*! www-kikstand - v0.0.1 - 2014-03-20
 * Copyright (c) 2014 ;
 */
/**
 *  Created by Kikstand, Inc.
 *  Author: Bo Coughlin
 *  Project: Www
 *  File: app.js
 *  Date: 3/18/14
 *  Time: 12:19 PM
 */

angular.module ( 'app', [
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'mgcrea.ngStrap',
    'directives.headsUp',
    'templates.app',
    'templates.common'
] );

angular.module ( 'app' )
    .config ( ['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ) {
    $locationProvider.html5Mode ( true );

    $routeProvider
        .when ( '/', {
        templateUrl : 'home.tpl.html'
    } )
        .otherwise ( {
        redirectTo : '/'
    } );
} ] );

angular.module ( 'app' )
    .controller ( 'AppCtrl', ['$scope', function ( $scope ) {

}] );

angular.module ( 'app' ).controller ( 'HeaderCtrl',
    ['$scope', '$location', function ( $scope, $location ) {
        $scope.location = $location;
        $scope.scroll = 0;

        $scope.home = function () {
            $location.path ( '/' );
        };

    } ] );
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
angular.module('templates.app', ['footer.tpl.html', 'header.tpl.html', 'home.tpl.html']);

angular.module("footer.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("footer.tpl.html",
    "<h1>FOOTER</h1>");
}]);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div ng-controller=\"HeaderCtrl\">\n" +
    "    <!-- Begin Navbar -->\n" +
    "    <header class=\"navbar navbar-default navbar-static-top ks-std-header\" heads-up to-class= 'ks-std-header-shrink' scroll-to=\"50\" role=\"banner\">\n" +
    "        <div class=\"container ks-std-inner\">\n" +
    "            <!-- navbar-header -->\n" +
    "            <div class=\"navbar-header\">\n" +
    "                <button class=\"navbar-toggle\" type=\"button\" data-toggle=\"collapse\"\n" +
    "                        data-target=\".bs-navbar-collapse\">\n" +
    "                    <span class=\"sr-only\">Toggle navigation</span>\n" +
    "                    <span class=\"icon-bar\"> </span>\n" +
    "                    <span class=\"icon-bar\"></span>\n" +
    "                    <span class=\"icon-bar\"></span>\n" +
    "                </button>\n" +
    "                <a class=\"navbar-brand\" ng-click=\"home()\">\n" +
    "                    <img src=\"/static/img/kikstand_typographic.png\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <nav class=\"collapse navbar-collapse\" role=\"navigation\">\n" +
    "                <ul class=\"nav navbar-nav\">\n" +
    "                    <li><a href=\"/\">Projects</a></li>\n" +
    "                </ul>\n" +
    "\n" +
    "            </nav>\n" +
    "        </div>\n" +
    "    </header>\n" +
    "</div>");
}]);

angular.module("home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home.tpl.html",
    "<div class=\"clearfix\"></div>\n" +
    "<main>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "    </section>\n" +
    "    <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "    <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "    <section ui-scrollfix=\"100\">\n" +
    "                <h3 ui-scrollfix=\"-49\"> Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?</h3>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "    <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "        <section>\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "            Pol.The inner master is listening, the playful doer is existing. Why does the ship yell?\n" +
    "        </section>\n" +
    "    Combine caviar, rhubarb and lobster. rinse with aged wasabi and serve warmed with bok choy.\n" +
    "    Enjoy!The therapist synthesises extend which is not crystal.\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "    The moon marks with love, blow the freighter until it rises.Aw, ye black cloud- set sails for treasure!\n" +
    "</main>");
}]);

angular.module('templates.common', []);

