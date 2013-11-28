'use strict';

/* Directives */


var presentationDirective = angular.module('immersive.directives', []);

presentationDirective.directive('loadImmersive', function ($timeout, $log) {
    //TODO
});

presentationDirective.directive('loadImpress', function ($timeout, $log) {
    function deinitImpress(scope,attrs) {
        $timeout(function () {
            if( $(scope.config.impressSelector).jmpress('initialized') ) {
                $(scope.config.impressSelector).jmpress("deinit");
                scope.interactions.jmpressHasLoaded = false;
                $log.debug('directives: loadImpress(#' + attrs.id + ') > unload');
            }
        });
    }

    function initImpress(scope,attrs) {
        $timeout(function () {

            if(scope.config.impressSelector == undefined) {
                $log.error('directives: loadImpress(#' + attrs.id + ') > initImpress: there seems to be no config, maybe json wrapped with []?');
            }

            if( !$(scope.config.impressSelector).jmpress('initialized') ) {

                $(scope.config.impressSelector).jmpress({
                    containerClass: 'impress-container',
                    areaClass: 'impress-area',
                    canvasClass: 'impress-canvas',
                    keyboard: {
                        use: false
                    },
                    mouse: {
                        clickSelects: false
                    },
                    hash: {
                        use: false,
                        update: false,
                        bindChange: false
                    },
                    afterInit: function (elm, evt) {
                        $log.debug('directives: loadImpress(#' + attrs.id + ')');
                        scope.interactions.jmpressHasLoaded = true;
                    }
                });
            }
        });
    }

    return function (scope, element, attrs) {
        scope.$watch('interactions.angularHasLoaded', function (newVal, oldVal) {
            if (oldVal == false && newVal == true) {
                initImpress(scope,attrs);
            }
            /*if (oldVal == true && newVal == false) {
                deinitImpress(scope,attrs);
            }*/
        });
    }
});

presentationDirective.directive('impressStep', function ($log, $location) {
    function onStart(scope, element, attrs) {
        //Start after page has loaded
        if ('/' + attrs.id == $location.path()) {
            $(scope.config.impressSelector).jmpress('select', element);
        }
    }

    function onClicked(scope, element, attrs) {
        element.on('click', function (evt) {
            if (scope.config.editMode == false) {
                $(scope.config.impressSelector).jmpress('select', element);
                scope.$apply(function () {
                    $location.path(attrs.id).replace();
                    scope.interactions.currentStepId = attrs.id;
                });
            } else {
                if (scope.interactions.setConnectMode != true) {
                    scope.$apply(function () {
                        scope.interactions.setCurrentStep(scope.step.id);
                    });
                }
            }
        });


    }

    function onLocationStart(scope, element, attrs) {
        scope.$on('$locationChangeStart', function (event, newVal, oldVal) {
            if ('/' + attrs.id == $location.path()) {
                $(scope.config.impressSelector).jmpress('select', element);
            }
        });
    }

    function spliceStep(scope, attrs) {
        var step = scope.step;
        scope.interactions.setCurrentStep(scope.config.indexId); //camera will move to index

        if (step.links != undefined && step.links.length > 0) {
            for (var linkKey in step.links) {
                var goToKey = _.findKey(scope.data.steps, {'id': step.links[linkKey]});
                if (goToKey != undefined) {
                    scope.interactions.setCurrentStep(scope.data.steps[goToKey].id);
                    break;
                }
            }
        }

        if ('/' + attrs.id == $location.path()) {
            //$(scope.config.impressSelector).jmpress('goTo', $('#'+scope.interactions.currentStep.id));
            $(scope.config.impressSelector).jmpress('goTo', $('#overview'));
            $location.path('overview').replace();
            scope.interactions.currentStepId = 'overview';
        }
    }

    return function (scope, element, attrs) {
        attrs.$observe('impressStep', function (val) {
            scope.$watch('interactions.jmpressHasLoaded', function (newVal, oldVal) {
                if (oldVal == false && newVal == true) {
                    onStart(scope, element, attrs);
                    $log.debug('directives: impressStep > onStart(#' + attrs.id + ')');
                }
                if (newVal == true) {
                    onLocationStart(scope, element, attrs);
                    onClicked(scope, element, attrs);
                    $log.debug('directives: impressStep > onLocationStart|onClicked(#' + attrs.id + ')');
                }
                /*if (oldVal == true && newVal == false) {
                    spliceStep(scope, attrs);
                }*/
            });
            element.bind("$destroy", function () {
                spliceStep(scope, attrs);
            });
        });
    }
});

presentationDirective.directive('impressGoTo', function ($log, $location) {
    return function (scope, element, attrs) {
        element.on('click', function (evt) {
            if (scope.interactions.jmpressHasLoaded == true) {
                $(scope.config.impressSelector).jmpress('goTo', element);
                scope.$apply(function () {
                    $location.path(attrs.impressGoTo).replace();
                    scope.interactions.currentStepId = attrs.impressGoTo;
                });

            }
            $log.debug('directives: impressGoTo > onClick(#' + attrs.impressGoTo + ')');
        });
    }
});

presentationDirective.directive('displayArrows', function ($log, $location, $timeout) {

    function displayArrows(scope, attrs, time) {
        if (attrs.displayArrows == 'hideOthers') {
            $timeout(function () {
                $(scope.config.arrowsSelector).hide(time);
                $(scope.config.arrowsFromSelector + attrs.id).show(time);
            });
        }
        if (attrs.displayArrows == 'hideAll') {
            $timeout(function () {
                $(scope.config.arrowsSelector).hide(time);
            });
        }

    }

    function onStart(scope, attrs) {
        if ('/' + attrs.id == $location.path()) {
            displayArrows(scope, attrs, 0);
            $log.debug('directives: displayArrows > onStart(#' + attrs.id + ',' + attrs.hideArrows + ')');
        }
    }

    function onLocationStart(scope, attrs) {
        scope.$on('$locationChangeStart', function (event, newVal, oldVal) {
            if ('/' + attrs.id == $location.path()) {
                displayArrows(scope, attrs, 1000);
                $log.debug('directives: displayArrows > onLocationStart(#' + attrs.id + ',' + attrs.hideArrows + ')');
            }
        });
    }

    return function (scope, element, attrs) {
        attrs.$observe('displayArrows', function (val) {
            scope.$watch('interactions.jmpressHasLoaded', function (newVal, oldVal) {
                if (oldVal == false && newVal == true) {
                    onStart(scope, attrs);
                }
                if (newVal == true) {
                    onLocationStart(scope, attrs);
                }
                /*if (newVal == false) {
                    onLocationStart(scope, attrs);
                }*/
            });
        });

        scope.$watch('data.arrows', function (newVal, oldVal) {
            if (newVal != oldVal) {
                if (scope.interactions.currentStep != undefined && scope.interactions.currentStep.id == attrs.id) {
                    if ('/' + attrs.id == $location.path()) {
                        displayArrows(scope, attrs, 0);
                    }
                }
            }
        }, true);
    }

});

presentationDirective.directive('displayBackground', function ($log, $location, $timeout) {

    function displayBackground(scope, attrs, time) {
        if (attrs.displayBackground == 'hideOthers') {
            $timeout(function () {
                $(scope.config.backgroundSelector).hide(time);
                $(scope.config.backgroundFromSelector + attrs.id).show(time);
				$(scope.config.stepsSelector + attrs.id).hide(time);
            });
        }
        if (attrs.displayBackground == 'hideAll') {
            $timeout(function () {
                $(scope.config.backgroundSelector).hide(time);
            });
        }

    }

    function onStart(scope, attrs) {
        if ('/' + attrs.id == $location.path()) {
            displayBackground(scope, attrs, 0);
            $log.debug('directives: displayBackground > onStart(#' + attrs.id + ',' + attrs.hideArrows + ')');
        }
    }

    function onLocationStart(scope, attrs) {
        scope.$on('$locationChangeStart', function (event, newVal, oldVal) {
            if ('/' + attrs.id == $location.path()) {
                displayBackground(scope, attrs, 1000);
                $log.debug('directives: displayBackground > onLocationStart(#' + attrs.id + ',' + attrs.hideArrows + ')');
            }
        });
    }

    return function (scope, element, attrs) {
        attrs.$observe('displayBackground', function (val) {
            scope.$watch('interactions.jmpressHasLoaded', function (newVal, oldVal) {
                if (oldVal == false && newVal == true) {
                    onStart(scope, attrs);
                }
                if (newVal == true) {
                    onLocationStart(scope, attrs);
                }
            });
        });
    }

});


presentationDirective.directive('impressLines', function ($location, $log, calculations) {

    function pushLine(scope, fromStep, toStep, line) {
        scope.data.lines.push({
            idFrom: fromStep.id,
            idTo: toStep.id,
            dataX: line.centerX,
            dataY: line.centerY,
            width: line.length,
            dataRotateZ: line.angle
        });
    }

    function drawLinkingLines(scope) {
        var fromStep = scope.step;
        for (var toStepKey in scope.data.steps) {
            var toStep = scope.data.steps[toStepKey];
            if (_.contains(toStep.links, fromStep.id)) {
                var line = calculations.calculateLine(fromStep.dataX, fromStep.dataY, toStep.dataX, toStep.dataY);
                pushLine(scope, fromStep, toStep, line);
                $log.debug('directives: impressLines > drawLinkingLines(#' + fromStep.id + ')|(#' + toStep.id + ')');
            }
        }
    }

    function drawLinkedLines(scope) {
        var fromStep = scope.step;
        for (var i in fromStep.links) {
            var toStepKey = _.findKey(scope.data.steps, {'id': fromStep.links[i]});
            if (toStepKey != -1) {
                var toStep = angular.element(scope.data.steps[toStepKey])[0];
                var line = calculations.calculateLine(fromStep.dataX, fromStep.dataY, toStep.dataX, toStep.dataY);
                pushLine(scope, fromStep, toStep, line);
                $log.debug('directives: impressLines > drawLinkedLines(#' + fromStep.id + ')|(#' + toStep.id + ')');
            }
        }
    }

    function spliceLines(scope) {
        var fromStep = scope.step;
        _.remove(scope.data.lines, function (line) {
            return (line.idFrom == fromStep.id || line.idTo == fromStep.id);
        });
    }

    return function (scope, element, attrs) {
        attrs.$observe('impressLines', function (val) {
            scope.$watch('interactions.jmpressHasLoaded', function (newVal, oldVal) {
                if (oldVal == false && newVal == true) {
                    drawLinkedLines(scope);
                }
                /*if(newVal == false) {
                    spliceLines(scope);
                }*/
            });
            element.bind("$destroy", function () {
                spliceLines(scope);
            });
            scope.$watch('interactions.lineChange', function (newVal, oldVal) {
                if (newVal == true) {
                    scope.interactions.lineChange = false;
                    spliceLines(scope);
                    drawLinkedLines(scope);
                    drawLinkingLines(scope);
                }
            });
        });

        scope.$watch('step', function (newVal, oldVal) {
            if (newVal != oldVal) {
                if (scope.interactions.currentStep != undefined && scope.interactions.currentStep.id == attrs.id) {
                    spliceLines(scope);
                    drawLinkedLines(scope);
                    drawLinkingLines(scope);
                }
            }
        }, true);

        scope.$watch('interactions.stepChange', function (newVal, oldVal) {
            if (newVal != oldVal) {
                if (attrs.id == scope.interactions.stepChange[0] || attrs.id == scope.interactions.stepChange[1]) {
                    spliceLines(scope);
                    drawLinkedLines(scope);
                    drawLinkingLines(scope);
                }
            }
        }, true);

    }
});

presentationDirective.directive('impressArrows', function ($location, $log, calculations) {

    function pushArrow(scope, fromStep, toStep, arrowFrom) {
        scope.data.arrows.push({
            idFrom: fromStep.id,
            idTo: toStep.id,
            level: fromStep.level,
            parentLevel: toStep.level,
            dataX: arrowFrom.x,
            dataY: arrowFrom.y,
            dataRotateZ: 0 //TODO: calculations.lineAngle
        });
    }

    function pushArrows(scope, fromStep, fromStepJQ, toStep, toStepJQ) {
        /**
         * draw arrows on the linking elements
         **/
        var arrowFrom = calculations.calculateArrow(fromStep.dataX, fromStep.dataY, toStep.dataX, toStep.dataY, fromStepJQ);
        pushArrow(scope, fromStep, toStep, arrowFrom);
        /**
         * draw arrows on the linked elements
         **/
        var arrowTo = calculations.calculateArrow(toStep.dataX, toStep.dataY, fromStep.dataX, fromStep.dataY, toStepJQ);
        pushArrow(scope, toStep, fromStep, arrowTo);
    }

    function drawLinkedArrows(scope, fromStepJQ) {
        var fromStep = scope.step;
        for (var i in fromStep.links) {
            var toStepKey = _.findKey(scope.data.steps, {'id': fromStep.links[i]});
            if (toStepKey != -1) {
                var toStep = angular.element(scope.data.steps[toStepKey])[0];
                var toStepJQ = angular.element('#' + toStep.id);
                pushArrows(scope, fromStep, fromStepJQ, toStep, toStepJQ);
                $log.debug('directives: impressArrows > drawLinkedArrows(#' + fromStep.id + ')|(#' + toStep.id + ')');
            }
        }
    }

    function drawLinkingArrows(scope, fromStepJQ) {
        var fromStep = scope.step;
        for (var toStepKey in scope.data.steps) {
            var toStep = scope.data.steps[toStepKey];
            if (_.contains(toStep.links, fromStep.id)) {
                var toStepJQ = angular.element('#' + toStep.id);
                pushArrows(scope, fromStep, fromStepJQ, toStep, toStepJQ);
                $log.debug('directives: impressArrows > drawLinkingArrows(#' + scope.data.steps[toStepKey].id + ')');
            }
        }
    }

    function spliceArrows(scope) {
        _.remove(scope.data.arrows, function (arrow) {
            return (arrow.idFrom == scope.step.id || arrow.idTo == scope.step.id);
        });
    }

    return function (scope, element, attrs) {
        attrs.$observe('impressArrows', function (val) {
            scope.$watch('interactions.jmpressHasLoaded', function (newVal, oldVal) {
                if (oldVal == false && newVal == true) {
                    drawLinkedArrows(scope, angular.element(element));
                }
                /*if(newVal == false) {
                    spliceArrows(scope);
                }*/
            });
            element.bind("$destroy", function () {
                spliceArrows(scope);
            });
        });

        scope.$watch('step', function (newVal, oldVal) {

            if (newVal != oldVal) {
                if (scope.interactions.currentStep != undefined && scope.interactions.currentStep.id == attrs.id) {
                    spliceArrows(scope);
                    drawLinkedArrows(scope, angular.element(element));
                    drawLinkingArrows(scope, angular.element(element));
                }
            }
        }, true);

        scope.$watch('interactions.stepChange', function (newVal, oldVal) {
            if (newVal != oldVal) {
                if (attrs.id == scope.interactions.stepChange[0] || attrs.id == scope.interactions.stepChange[1]) {
                    spliceArrows(scope);
                    drawLinkedArrows(scope, angular.element(element));
                    drawLinkingArrows(scope, angular.element(element));
                }
            }
        }, true);
    }
});

presentationDirective.directive('movable', function ($location, $log) {
    function reapply(scope, element) {
        $(scope.config.impressSelector).jmpress('reapply', element);
    }

    function moveStep(scope, element, attrs, newVal) {
        var elemJQ = angular.element(element);
        if (elemJQ.data('stepData') != undefined) {
            element.data('stepData').x = newVal.dataX * scope.config.factor;
            element.data('stepData').y = newVal.dataY * scope.config.factor;
            reapply(scope, element);
            $log.debug("directives: movable > moveStep(" + attrs.id + "," + newVal.dataX + "," + newVal.dataY + ")");
        }
    }

    return function (scope, element, attrs) {
        attrs.$observe('movable', function (val) {
            scope.$watch('interactions.currentStep', function (newVal, oldVal) {
                if (scope.interactions.currentStep != undefined) {
                    /**
                     * move step
                     */
                    if (attrs.movable == 'step') {
                        if (attrs.id == scope.interactions.currentStep.id) {
                            moveStep(scope, element, attrs, newVal);
                        }
                    }
                }
            }, true);
        });
    }
});

presentationDirective.directive('connectable', function ($log, $timeout) {

    function pushLink(scope, attrs) {
        if (scope.interactions.currentStep.links == undefined) scope.interactions.currentStep.links = [];
        scope.interactions.currentStep.links.push(parseInt(attrs.id));
    }

    function spliceLink(scope, attrs) {
        _.remove(scope.interactions.currentStep.links, function (link) {
            return (link == parseInt(attrs.id));
        });
        _.remove(scope.step.links, function (link) {
            return (link == scope.interactions.currentStep.id);
        });
    }

    function spliceAllLinks(scope,attrs) {
        for(var stepKey in scope.data.steps) {
            _.remove(scope.data.steps[stepKey].links, function (link) {
                return (link == parseInt(attrs.id));
            });
        }
    }

    function beginConnecting(scope, element, attrs) {
        angular.element(element).addClass('connect');
        scope.interactions.currentStep = scope.step;
    }

    function waitForConnecting(scope, element, attrs) {
        var elementJQ = angular.element(element);
        elementJQ.addClass('connectOption').on('click.connectEnd', function (evt) {
            pushLink(scope, attrs);
            endConnecting(scope);
            scope.$apply(function () {
                scope.interactions.setConnectMode = false;
                scope.interactions.stepChange = [parseInt(scope.interactions.currentStep.id), parseInt(attrs.id)];
            });

        });
    }

    function waitForDisconnecting(scope, element, attrs) {
        var elementJQ = angular.element(element);
        elementJQ.addClass('disconnectOption').on('click.disconnectEnd', function (evt) {
            spliceLink(scope, attrs);
            endConnecting(scope);
            scope.$apply(function () {
                scope.interactions.setConnectMode = false;
                scope.interactions.stepChange = [parseInt(scope.interactions.currentStep.id), parseInt(attrs.id)];
            });

        });
    }

    function endConnecting(scope) {
        angular.element(scope.config.stepsSelector).removeClass('connect connectOption disconnectOption').off('click.connectEnd click.disconnectEnd');
    }

    return function (scope, element, attrs) {
        attrs.$observe('connectable', function (val) {
            scope.$watch('interactions.setConnectMode', function (newVal, oldVal) {
                if (newVal == true && scope.interactions.currentStep != undefined) {
                    /**
                     * init connect Mode
                     */
                    if (attrs.id == scope.interactions.currentStep.id) {
                        beginConnecting(scope, element, attrs);
                    } else {
                        if (!_.contains(scope.step.links, parseInt(scope.interactions.currentStep.id)) && !_.contains(scope.interactions.currentStep.links, parseInt(attrs.id))) {
                            waitForConnecting(scope, element, attrs);
                        } else {
                            waitForDisconnecting(scope, element, attrs);
                        }
                    }
                } else {
                    /**
                     * close connect Mode
                     */
                    endConnecting(scope);
                    scope.interactions.setConnectMode = false;
                }
            });
            element.bind("$destroy", function () {
                spliceAllLinks(scope, attrs);
            });
        });
    }
});

presentationDirective.directive('keypressEvents', function ($document, $rootScope, $log, $timeout) {

    /**
     * globally sets keys, which behave normally like browser-intended
     * @returns {Array}
     */
    function getForbiddenKeys() {
        return [
            32 //space
            ,37,38,39,40 //arrowKeys
            ,45 //insert
            ,46 //delete
            ,83 //s
            ,113 //F2
        ]
    }

    function getAllowedKeys() {
        return [
            116 //F5
            ,122 //F11
            ,123 //F12
        ]
    }

    function getForbiddenCtrlKeysForInput() {
        return [
             13 //enter
            ,83 //s
        ]
    }

    function broadcastKeyObject(type,e) {
        if(e.type == "keydown") {
            var keysPressed = '';
            if(e.ctrlKey == true) keysPressed = keysPressed + "Strg+";
            if(e.shiftKey == true) keysPressed = keysPressed + "Shift+";
            if(e.altKey == true) keysPressed = keysPressed + "Alt+";
            keysPressed = keysPressed + e.which;

            $rootScope.$broadcast('interactions.pressedKeys', {
                key: e.which,
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                evt: e,
                keyString: keysPressed,
                type: type
            });

            if(type == 'input') {
                $log.debug('directive keypressEvents(input) > ' + keysPressed);
            }

            if(type == 'global') {
                $log.debug('directive keypressEvents(global) > ' + keysPressed);
            }

        }
    }

    //tribute goes to: http://stackoverflow.com/a/19412163
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            scope.interactions.activeInput = false;

            if(attrs.keypressEvents == 'input') {
                element.on('focus', function (evt) {
                    scope.interactions.activeInput = true;
                    element.bind('keydown.input', function(e) {
                        if(e.type == "keydown" && e.ctrlKey && _.contains(getForbiddenCtrlKeysForInput(),e.which)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        broadcastKeyObject('input',e);
                    });
                });
                element.on('blur', function() {
                    scope.interactions.activeInput = false;
                    element.unbind('keydown.input');
                });
            }

            if(attrs.keypressEvents == 'global') {
                $log.debug('directive keypressEvents > element.onGlobal');
                $document.bind('keydown.global', function(e) {
                    if(scope.interactions.activeInput != true) {
                        if(e.type == "keydown" && !_.contains(getAllowedKeys(),e.which)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        broadcastKeyObject('global',e);
                    }
                });
            }


        }
    }
});

presentationDirective.directive('showMessage', function ($document, $log, $timeout) {
    return function(scope, element, attrs) {
        if(attrs.showMessage == 'info' || attrs.showMessage == 'all') {
            scope.$watch('interactions.infoMessage',function(newVal,oldVal) {
                if(newVal != undefined) {
                    var p = $('<p>').html(scope.interactions.infoMessage).addClass("info");
                    element.append(p);
                    p.hide(3000,function() {
                        $(this).remove()
                    });
                    scope.interactions.infoMessage = undefined;
                }
            });
        }
        if(attrs.showMessage == 'error' || attrs.showMessage == 'all') {
            scope.$watch('interactions.errorMessage',function(newVal,oldVal) {
                if(newVal != undefined) {
                    var p = $('<p>').html(scope.interactions.errorMessage).addClass("error");
                    element.append(p);
                    p.hide(10000,function() {
                        $(this).remove()
                    });
                    scope.interactions.errorMessage = undefined;
                }
            });
        }
        if(attrs.showMessage == 'success' || attrs.showMessage == 'all') {
            scope.$watch('interactions.successMessage',function(newVal,oldVal) {
                if(newVal != undefined) {
                    var p = $('<p>').html(scope.interactions.successMessage).addClass("success");
                    element.append(p);
                    p.hide(3000,function() {
                        $(this).remove()
                    });
                    scope.interactions.successMessage = undefined;
                }
            });
        }
        if(attrs.showMessage == 'help' || attrs.showMessage == 'all') {
            scope.$watch('interactions.helpMessage',function(newVal,oldVal) {
                if(newVal != undefined) {
                    $('.help').remove();
                    var p = $('<p>').html(scope.interactions.helpMessage).addClass("help");
                    element.append(p);
                    p.click(function(){
                        $(this).hide(1000,function() {
                            $(this).remove();
                        });
                    });
                    scope.interactions.helpMessage = undefined;
                }
            });
        }
    }

});
