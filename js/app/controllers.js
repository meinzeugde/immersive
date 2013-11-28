'use strict';

/* Controllers */

/**
 * Main Controller
 */
angular.module('immersive.controllers', [])
    .controller('IndexController', function ($scope, $element, $attrs, $location, $interval, $log, $timeout, calculations, updateData, getImages, getStyleSheets, getPresentations, $http, cssInjector) {

        /**
         * set inital objects to work with
         */
        $scope.canvas = {};
        $scope.interactions = {};
        $scope.data = {};
        $scope.init = {};

        /**
         * set the Configuration
         */
        $scope.init.loadConfig = function(path) {
            /**
             * Load Config Data
             * then: load additional data and set interactions
             */
            var t = new Date().getTime();
            if(path == undefined) path='data/config.json';
            $http.get(path+'?'+t).success(function(data) {
                $scope.config = data;
                calculations.factor = data.factor;
                $log.info('controller: configData has loaded (path:'+path+')');
            });

        }

        $scope.data.loadData = function() {
            /**
             * Load image Data
             */
            $scope.data.images = [];
            var gotResponse = false;
            getImages.get({},function(response) {
                if(response.error == "false") {
                    $scope.data.images = response.data;
                    $scope.interactions.successMessage = response.message;
                    gotResponse = true;
                    return false;
                }
                if(response.error == "true") {
                    $scope.interactions.errorMessage = response.message;
                    gotResponse = true;
                    return false;
                } else {
                    $scope.interactions.errorMessage = "Bilder laden...unbekannter Fehler";
                    gotResponse = true;
                    return false;
                }
            },function(response) {
                $scope.interactions.errorMessage = "Bilder laden...unbekannter Fehler";
                gotResponse = true;
            });

            /**
             * Load css Data
             */
            $scope.data.designs = [];
            var gotResponse = false;
            getStyleSheets.get({},function(response) {
                if(response.error == "false") {
                    $scope.interactions.successMessage = response.message;
                    $scope.data.designs = response.data;
                    $scope.interactions.setCurrentTemplate($scope.config.templateData);
                    gotResponse = true;
                    return false;
                }
                if(response.error == "true") {
                    $scope.interactions.errorMessage = response.message;
                    gotResponse = true;
                    return false;
                } else {
                    $scope.interactions.errorMessage = "Design laden...unbekannter Fehler";
                    gotResponse = true;
                    return false;
                }
            },function(response) {
                $scope.interactions.errorMessage = "Design laden...unbekannter Fehler";
                gotResponse = true;
            });

            /**
             * Load presentation Data
             */
            $scope.data.presentations = [];
            var gotResponse = false;
            getPresentations.get({},function(response) {
                if(response.error == "false") {
                    $scope.interactions.successMessage = response.message;
                    $scope.data.presentations = response.data;
                    gotResponse = true;
                    return false;
                }
                if(response.error == "true") {
                    $scope.interactions.errorMessage = response.message;
                    gotResponse = true;
                    return false;
                } else {
                    $scope.interactions.errorMessage = "Präsentationen laden...unbekannter Fehler";
                    gotResponse = true;
                    return false;
                }
            },function(response) {
                $scope.interactions.errorMessage = "Präsentationen laden...unbekannter Fehler";
                gotResponse = true;
            });

            $scope.data.levels = [{'id':'1'},{'id':'2'},{'id':'3'},{'id':'4'},{'id':'5'}];
            $scope.data.fontSizes = [{'id':'small'},{'id':'medium'},{'id':'large'},{'id':'huge'}];

            $scope.interactions.setCurrentStep($scope.config.indexId);
        };

        /**
         * Load presentation from folder "data"
         */
        $scope.canvas.loadPresentation = function(path) {

            $scope.interactions.jmpressHasLoaded = false;
            $scope.interactions.angularHasLoaded = false;
            /**
             * Load Step Data
             * then: load additional data and set interactions
             */
            var t = new Date().getTime();
            if($scope.config.presentationData != undefined && $scope.config.presentationData.trim() != "") path='presentations/'+$scope.config.presentationData+'/data.json';
            if(path == undefined) path='data/presentation.json';
            $http.get(path+'?'+t).success(function(data) {
                $scope.data.steps = data;
                $scope.data.lines = [];
                $scope.data.arrows = [];
                $scope.data.backgrounds = [];
                $log.info('controller: stepData has loaded (path:'+path+')');
            }).error(function(data){
                $log.info('controller: stepData has not loaded (path:'+path+')');
            }).then(function() {
                if($scope.interactions.jmpressHasLoaded == false) {
                    $scope.data.loadData();
                }
            }).then(function() {
                $scope.interactions.angularHasLoaded = true;
            });
        };

        /**
         * set the current Step
         */
        $scope.interactions.setCurrentStep = function (id) {
            /**
             * Set the Selection field for current step
             * used only inside the controller
             */
            var key = _.findKey($scope.data.steps, {'id': id});
            $scope.interactions.currentStep = $scope.data.steps[key];
        };

        /**
         * set the current template
         */
        $scope.interactions.setCurrentTemplate = function (name) {
            if($scope.data.designs[name] != undefined || $scope.data.designs[name] != null) {
                $scope.config.design = $scope.data.designs[name];
                $scope.canvas.loadAdditionalCSS();
                $scope.interactions.successMessage = "Template geladen.";
            } else {
                $scope.interactions.errorMessage = "Offenbar wurde das gewählte Template nicht gefunden.";
            }
        }

        /**
         * choose the next step
         */
        $scope.interactions.setNextStep = function() {
            var currentId = $location.path().substr(1);
            var nextId;
            if(isNaN(currentId) != false) {
                nextId = 1;
            } else {
                var stepKey = _.findKey($scope.data.steps,{'id':parseInt(currentId)});
                var nextKey = parseInt(stepKey)+1;
                if($scope.data.steps[nextKey] != undefined) {
                    nextId = $scope.data.steps[nextKey].id;
                } else {
                    nextId = 'overview';
                }
            }

            $location.path("" + nextId).replace();
            $scope.interactions.currentStepId = nextId;
        };

        /**
         * choose the previous step
         */
        $scope.interactions.setPrevStep = function() {
            var currentId = $location.path().substr(1);
            var prevId;
            if(isNaN(currentId) != false) {
                prevId = $scope.data.steps.length;
            } else {
                var stepKey = _.findKey($scope.data.steps,{'id':parseInt(currentId)});
                var prevId = parseInt(stepKey)-1;
                if($scope.data.steps[prevId] != undefined) {
                    prevId = $scope.data.steps[prevId].id;
                } else {
                    prevId = 'overview';
                }
            }

            $location.path("" + prevId).replace();
            $scope.interactions.currentStepId = prevId;
        };

        /**
         * set all keyboard events
         */
        $scope.interactions.keyboardEvents = function(keys) {
            if($scope.config.editMode) {
                /**
                 * keys only available in editor mode
                 */
                if(keys.keyString == "27" && keys.type == "global"){
                    //Esc
                    $scope.interactions.jmpressHasLoaded = !$scope.interactions.jmpressHasLoaded;
                }
                if(keys.keyString == "38" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-y'];
                    $scope.canvas.moveStep(0.5);
                }
                if(keys.keyString == "40" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+y'];
                    $scope.canvas.moveStep(0.5);
                }
                if(keys.keyString == "37" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-x'];
                    $scope.canvas.moveStep(0.5);
                }
                if(keys.keyString == "39" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+x'];
                    $scope.canvas.moveStep(0.5);
                }
                if(keys.keyString == "Shift+38" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-y'];
                    $scope.canvas.moveStep(5);
                }
                if(keys.keyString == "Shift+40" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+y'];
                    $scope.canvas.moveStep(5);
                }
                if(keys.keyString == "Shift+37" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-x'];
                    $scope.canvas.moveStep(5);
                }
                if(keys.keyString == "Shift+39" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+x'];
                    $scope.canvas.moveStep(5);
                }
                if(keys.keyString == "Alt+38" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-y'];
                    $scope.canvas.moveStep(0.1);
                }
                if(keys.keyString == "Alt+40" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+y'];
                    $scope.canvas.moveStep(0.1);
                }
                if(keys.keyString == "Alt+37" && keys.type == "global"){
                    $scope.interactions.newStepDir=['-x'];
                    $scope.canvas.moveStep(0.1);
                }
                if(keys.keyString == "Alt+39" && keys.type == "global"){
                    $scope.interactions.newStepDir=['+x'];
                    $scope.canvas.moveStep(0.1);
                }
                if(keys.keyString == "Strg+46" && keys.type == "global"){
                    $scope.canvas.deleteStep();
                }
                if(keys.keyString == "Strg+45" && keys.type == "global"){
                    $scope.canvas.newStep();
                }
                if(keys.keyString == "32" && keys.type == "global"){
                    $location.path("" + $scope.interactions.currentStep.id).replace();
                }
                if(keys.keyString == "113" && keys.type == "global"){
                    document.getElementById('editStepText').focus();
                }
                if(keys.keyString == "Strg+13" && keys.type == "input"){
                    document.getElementById('editStepText').blur();
                }
                if(keys.keyString == "Strg+83"){
                    $scope.canvas.savePresentation();
                }
                if(keys.keyString == "Strg+67"){
                    $scope.interactions.setConnectMode = !$scope.interactions.setConnectMode;
                }
            } else {
                /**
                 * keys only available in presentation mode
                 */
                /*if(keys.keyString == "49"){ //1
                 $location.path("1").replace();
                 }*/
            }

            /**
             * keys available in both modes
             */
            if(keys.keyString == "112"){
                if($('.help').size() > 0) {
                    $('.help').remove();
                } else {
                    $scope.interactions.helpMessage = "" +
                        "<table>" +
                        "<tr>" +
                        "<th>Hilfe (allgemein):</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>F1 - Hilfe an/aus</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>F3 - Menü nach oben oder unten</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>F4 - Editor öffnen/schließen</td>" +
                        "</tr>" +
                        "</table>" +
                        "<table>" +
                        "<tr>" +
                        "<th>Hilfe (Präsentation):</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Strg+Pfeil links - zur nächsten Folie</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Strg+Pfeil rechts - zur vorherigen Folie</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Strg+Leertaste - Übersicht aller Folien</td>" +
                        "</tr>" +
                        "</table>" +
                        "<table>" +
                        "<tr>" +
                        "<th>Hilfe (im Editor):</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Alt+Pfeiltasten - gewählte Folie verschieben (0,1 Einheiten)</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Pfeiltasten - gewählte Folie verschieben (0,5 Einheiten)</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>Shift+Pfeiltasten - gewählte Folie verschieben (10 Einheiten)</td>" +
                        "</tr>" +
                        "</table>" +
                        "";
                }
            }
            if(keys.keyString == "114"){
                $scope.config.menuOrientationBottom = !$scope.config.menuOrientationBottom;
                $scope.interactions.infoMessage = "Editor position top/bottom";
            }
            if(keys.keyString == "115"){
                $scope.config.editMode = !$scope.config.editMode;
                $scope.interactions.infoMessage = "Editor on/off";
            }
            if(keys.keyString == "Strg+32"){
                $location.path("overview").replace();
            }
            if(keys.keyString == "Strg+37"){
                $scope.interactions.setPrevStep();
                $scope.interactions.setCurrentStep($scope.interactions.currentStepId);
            }
            if(keys.keyString == "Strg+39"){
                $scope.interactions.setNextStep();
                $scope.interactions.setCurrentStep($scope.interactions.currentStepId);
            }
        };

        /**
         * create a new Step
         */
        $scope.canvas.newStep = function () {
            /**
             * create a new step
             */
             var lastId = _.last($scope.data.steps);

            var id = (lastId != undefined) ? lastId.id + 1 : 1;
            var x = (lastId != undefined) ? $scope.interactions.currentStep.dataX : 0.0;
            var y = (lastId != undefined) ? $scope.interactions.currentStep.dataY : 0.0;
            var level = (lastId != undefined) ? $scope.interactions.currentStep.level + 1 : 1;
            var links  = (lastId != undefined) ? [$scope.interactions.currentStep.id] : [];

            $scope.data.steps.push({
                id: id,
                level: level,
                dataX: x,
                dataY: y,
                text: 'new step ' + id,
                links: links
            });

            $timeout(function () {
                var elem = $('#' + id);
                $($scope.config.impressSelector).jmpress('init', elem);
                $($scope.config.impressSelector + " > div:last-child").append(elem);
                $($scope.config.impressSelector).jmpress('reapply', elem);
                $scope.interactions.setCurrentStep(id);
                $scope.canvas.moveStep(1);
            });
        };

        /**
         * move the current Step
         */
        $scope.canvas.moveStep = function (factor) {
            if ($scope.interactions.currentStep.id != undefined && $scope.interactions.newStepDir != undefined && $scope.interactions.newStepDir.length > 0) {
                for(var i in $scope.interactions.newStepDir) {
                    if ($scope.interactions.newStepDir[i] == '-x') {
                        $scope.interactions.currentStep.dataX -= $scope.config.transformValue/$scope.config.factor*factor;
                    }
                    if ($scope.interactions.newStepDir[i] == '+x') {
                        $scope.interactions.currentStep.dataX += $scope.config.transformValue/$scope.config.factor*factor;
                    }
                    if ($scope.interactions.newStepDir[i] == '-y') {
                        $scope.interactions.currentStep.dataY -= $scope.config.transformValue/$scope.config.factor*factor;
                    }
                    if ($scope.interactions.newStepDir[i] == '+y') {
                        $scope.interactions.currentStep.dataY += $scope.config.transformValue/$scope.config.factor*factor;
                    }
                }
            }
        };

        /**
         * delete the current Step
         */
        $scope.canvas.deleteStep = function () {
            /**
             * delete a step
             */
            var id = $scope.interactions.currentStep.id;

            if (id == 1) {
                alert('index can not be deleted!');
                return false;
            }

            var key = _.findKey($scope.data.steps, {'id': id});

            $timeout(function () {
                $scope.data.steps.splice(key, 1);
            });
        };

        /**
         * Load additional CSS for Design
         */
        $scope.canvas.loadAdditionalCSS = function() {
            if($scope.config.design == null || $scope.config.design == undefined) {
                cssInjector.removeAll();
            } else {
                cssInjector.removeAll();
                for(var i in $scope.config.design.files) {
                    cssInjector.add("templates/"+$scope.config.design.dir+"/css/"+$scope.config.design.files[i].filename);
                }
            }
        };

        /**
         * Save Step data
         */
        $scope.canvas.savePresentation = function() {
            var update = new updateData();
            update.steps = $scope.data.steps;
            var gotResponse = false;

            $scope.interactions.infoMessage = "...saving presentation";

            update.$save(function(response) {
                if(response.error == "false") {
                    $scope.interactions.successMessage = response.message;
                    gotResponse = true;
                    return false;
                }
                if(response.error == "true") {
                    $scope.interactions.errorMessage = response.message;
                    gotResponse = true;
                    return false;
                } else {
                    $scope.interactions.errorMessage = "unbekannter Fehler";
                    gotResponse = true;
                    return false;
                }
            });

            $interval(function() {
                if(gotResponse) return false;
                $scope.interactions.infoMessage = "warte auf Serverantwort...";
            },3000,3);
            $timeout(function() {
                if(gotResponse) return false;
                $scope.interactions.errorMessage = "Server antwortet nicht...Abbruch";
            },12000);

        };

        /**
         * Bring the action!
         */
        $scope.init.loadConfig();
        $scope.$watch('config',function(newVal,oldVal) {
            if(newVal != undefined) {
                $scope.canvas.loadPresentation();
            }
        });

        // For listening to all keypress events
        $scope.$on('interactions.pressedKeys', function(onEvent, keypressEvent) {
            $scope.$apply(function(){
                $scope.interactions.keysPressed = keypressEvent;
                $scope.interactions.keyboardEvents(keypressEvent);
            });
        });

    }); //EOF controller
