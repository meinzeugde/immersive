'use strict';

/* App Module */

var presentation = angular.module('immersive', [
    'immersive.controllers',
    'immersive.directives',
    'immersive.services',
    'ngRoute',
    'angular.css.injector'
]);

presentation.config(function($rootScopeProvider, $logProvider) {
    $logProvider.debugEnabled(false); //set if $log.debug - messages shoukd be displayed in console
    $rootScopeProvider.digestTtl(5); //set the $digest cycle
});