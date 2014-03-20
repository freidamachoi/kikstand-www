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