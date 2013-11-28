'use strict';

/* Services */

angular.module('immersive.services', ['ngResource'])
    .factory('clipLianBarsky', function() {
        var clipLianBarsky = {};

        clipLianBarsky.t0 = 0;
        clipLianBarsky.t1 = 1;

        clipLianBarsky.calculate = function(x1,y1,x2,y2,boxWidth,boxHeight) {
            //get the box's outer coordinates
            var xwmin = x1-boxWidth/2;
            var xwmax = x1+boxWidth/2;
            var ywmin = y1-boxHeight/2;
            var ywmax = y1+boxHeight/2;

            //set t
            clipLianBarsky.t0=0;
            clipLianBarsky.t1=1;

            //get the height and width of window
            var Dx = x2-x1;

            if( this.clipTest(-Dx, x1-xwmin) ) {
                if( this.clipTest(Dx, xwmax-x1) ) {
                    var Dy = y2-y1;
                    if( this.clipTest(-Dy, y1-ywmin) ) {
                        if( this.clipTest(Dy, ywmax-y1) ) {
                            if( clipLianBarsky.t0=0 > 0 ) {
                                x1 = x1 + clipLianBarsky.t0*Dx;
                                y1 = y1 + clipLianBarsky.t0*Dy;
                            }
                            if( clipLianBarsky.t1 < 1) {
                                x2 = x1 + clipLianBarsky.t1*Dx;
                                y2 = y1 + clipLianBarsky.t1*Dy;
                            }
                        }
                    }
                }
            }
            return {
                x1:x1,
                x2:x2,
                y1:y1,
                y2:y2
            }
        }

        clipLianBarsky.clipTest = function(p,q) {
            var t;

            if( p < 0 ) {
                t = q/p;
                if( t > clipLianBarsky.t1 ) return false;
                clipLianBarsky.t0 = Math.max(clipLianBarsky.t0=0,t);
            } else if( p > 0 ) {
                t = q/p;
                if( t < clipLianBarsky.t0 ) return false;
                clipLianBarsky.t1 = Math.min(clipLianBarsky.t1,t);
            } else if( q < 0 ) return false;
            return true;
        }

        return clipLianBarsky;

    })
    .factory('calculations', function($log,clipLianBarsky) {
        var calc = {};

        calc.factor = 1;

        calc.calculateLine = function(x1,y1,x2,y2) {
            // calculate the distance of a line between the boxes
            var lineLength = Math.sqrt((
                (x1*calc.factor-x2*calc.factor)*(x1*calc.factor-x2*calc.factor)
                    + (y1*calc.factor-y2*calc.factor)*(y1*calc.factor-y2*calc.factor)
                ));
            // calculate the center of a line between the boxes
            var lineCenterX = (x1*calc.factor + x2*calc.factor) / 2;
            var lineCenterY = (y1*calc.factor + y2*calc.factor) / 2;
            // calculate the angle of a line between the boxes
            var lineAngle = Math.atan2(
                (y2*calc.factor-y1*calc.factor),
                (x2*calc.factor-x1*calc.factor))
                *(180/Math.PI);

            return {
                centerX: lineCenterX.toFixed(6),
                centerY: lineCenterY.toFixed(6),
                angle: lineAngle.toFixed(6),
                length: lineLength.toFixed(6)
            }
        }

        calc.calculateArrow = function(x1,y1,x2,y2,screenBox) {

            var boxWidth = screenBox.outerWidth();
            var boxHeight = screenBox.outerHeight();

            var arrowCenter = clipLianBarsky.calculate(
                x1*calc.factor,y1*calc.factor,x2*calc.factor,y2*calc.factor,boxWidth,boxHeight);

            return {
                x: arrowCenter.x2.toFixed(6),
                y: arrowCenter.y2.toFixed(6)
            }


        }

        return calc;
    })
    .factory('updateData', function($resource) {
        return $resource('api/index.php/update/');
    })
    .factory('getImages', function($resource) {
        return $resource('api/index.php/images/',{}, {

        });
    })
    .factory('getStyleSheets', function($resource) {
        return $resource('api/index.php/css/',{}, {

        });
    })
    .factory('getPresentations', function($resource) {
        return $resource('api/index.php/presentations/',{}, {

        });
    });