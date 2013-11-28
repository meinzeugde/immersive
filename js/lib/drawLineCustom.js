var canvas = {};

canvas.configuration = {
    color : '#222',
    lineWidth : 6, //px
    zIndex : 1,
    dataZ : -10, //px
    arrowZ : 20, //px
    arrowHeight: 10, //px
    arrowWidth: 100, //px
    arrowNextText: '',
    arrowPrevText: '',
    lineLinkLength: 30 //percentage
}

canvas.connect = function(div1,div2) {

    //computed matrix with the coordinates of the upper left point of a box
    var matrix1 = this.getMatrix($(div1).get(0));
    var matrix2 = this.getMatrix($(div2).get(0));
    //calculated center coordinates for a box
    var center1X = matrix1.e + div1.outerWidth()/2;
    var center1Y = matrix1.f + div1.outerHeight()/2;
    var center2X = matrix2.e + div2.outerWidth()/2;
    var center2Y = matrix2.f + div2.outerHeight()/2;
    // calculate the distance of a line between the boxes
    var length = Math.sqrt(((center2X-center1X) * (center2X-center1X)) + ((center2Y-center1Y) * (center2Y-center1Y)));
    // calculate the center of a line between the boxes
    var cx = parseInt((center1X + center2X) / 2);
    var cy = parseInt((center1Y + center2Y) / 2);
    // calculate the angle of a line between the boxes
    var angle = parseInt(Math.atan2((center1Y-center2Y),(center1X-center2X))*(180/Math.PI));


    var margin1, margin2;
    var beta = parseInt(angle);
    if(beta<0) beta = (360-Math.abs(angle));
    if(beta==0 || beta==180) {
        margin1 = (div1.outerWidth()/2)+this.configuration.arrowWidth/2;
        margin2 = (length*(this.configuration.lineLinkLength/100)-div2.outerWidth()/2)-this.configuration.arrowWidth/2;
    } else if(beta==90 || beta==270) {
        margin2 = (div1.outerHeight()/2);
        margin1 = (div2.outerHeight()/2)+this.configuration.arrowWidth/2;
    } else {
        margin1 = (div1.outerHeight()/2*div1.outerWidth()/2)/(div1.outerWidth()/2*Math.sin(beta));
        margin2 = (div2.outerHeight()/2*div2.outerWidth()/2)/(div2.outerWidth()/2*Math.sin(beta));
    }

    margin1 = parseInt(Math.abs(margin1));
    margin2 = parseInt(Math.abs(margin2));

    // make hr
    var htmlLine = ""+
        "<div class='line' style='padding:0px; margin:0px; height:" + this.configuration.lineWidth + "px;" +
        " background-color:" + this.configuration.color + ";" +
        " line-height:1px; position:absolute; width:" + length + "px;" +
        " z-index:" + this.configuration.zIndex + ";" +
        " -webkit-transform-style: preserve-3d; -webkit-transform: translate(-50%, -50%) " +
            "translate3d(" + cx + "px, " + cy + "px, " + this.configuration.dataZ + "px) " +
            "rotateX(0deg) rotateY(0deg) rotateZ(" + angle + "deg) scaleX(1) scaleY(1) scaleZ(1);" +
        " transform-style: preserve-3d; transform: translate(-50%, -50%) " +
        "translate3d(" + cx + "px, " + cy + "px, " + this.configuration.dataZ + "px) " +
        "rotateX(0deg) rotateY(0deg) rotateZ(" + angle + "deg) scaleX(1) scaleY(1) scaleZ(1);'>" +
        "</div>" +
        "";

        $(div1).after(htmlLine).html();

    //calculate the intersection point of line and
    var clip = clipLianBarsky.calculate(center1X,center1Y,center2X,center2Y,div1);

    var point1 = ""+
        "<div class='dot' style='padding:0px; margin:0px; height:10px;background-color:#ff0000;line-height:1px; position:absolute; width:10px;" +
        " z-index:" + this.configuration.zIndex + ";" +
        " -webkit-transform-style: preserve-3d; -webkit-transform: translate(-50%, -50%) " +
        "translate3d(" + clip.x2 + "px, " + clip.y2 + "px, " + 20 + "px) " +
        "rotateX(0deg) rotateY(0deg) rotateZ(" + angle + "deg) scaleX(1) scaleY(1) scaleZ(1);'>" +
        "<a class='line-link' style='height:"+this.configuration.lineWidth+"px;text-align:left;float:left;display:block;margin-top:0px;width:"+this.configuration.lineLinkLength+"%;' href='#"+$(div2).attr('id')+"'>" +
        "</a>" +
        "</div>" +
        "";

        $(div1).append(point1);

    var clip = clipLianBarsky.calculate(center2X,center2Y,center1X,center1Y,div2);

    var point2 = ""+
        "<div class='dot' style='padding:0px; margin:0px; height:10px;background-color:#00ff00;line-height:1px; position:absolute; width:10px;" +
        " z-index:" + this.configuration.zIndex + ";" +
        " -webkit-transform-style: preserve-3d; -webkit-transform: translate(-50%, -50%) " +
        "translate3d(" + clip.x2 + "px, " + clip.y2 + "px, " + 20 + "px) " +
        "rotateX(0deg) rotateY(0deg) rotateZ(" + angle + "deg) scaleX(1) scaleY(1) scaleZ(1);'>" +
        "<a class='line-link' style='height:"+this.configuration.lineWidth+"px;text-align:right;float:right;display:block;margin-top:0px;width:"+this.configuration.lineLinkLength+"%;' href='#"+$(div1).attr('id')+"'>" +
        "</a>" +
        "</div>" +
        "";

    $(div2).append(point2);
}

canvas.getMatrix = function(el) {
    var matrix,
        transforms = {
            'webkitTransform':'-webkit-transform',
            'OTransform':'-o-transform',
            'msTransform':'-ms-transform',
            'MozTransform':'-moz-transform',
            'transform':'transform'
        };

    for (var t in transforms) {
        if (el.style[t] !== undefined) {
            matrix = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
    }

    if (!window.WebKitCSSMatrix && !window.MSCSSMatrix) {

        var reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
        var dummyMatrix = {};

        var match = matrix.match(reMatrix);
        if (match) {
            dummyMatrix.e = parseFloat(match[1]);
            dummyMatrix.f = parseFloat(match[2]);
        }
        return dummyMatrix;
    } else {
        return (matrix !== undefined && matrix.length > 0 && matrix !== "none") ? new WebKitCSSMatrix(matrix) : false;
    }
}

clipLianBarsky = {};

/*http://trevinca.ei.uvigo.es/~formella/doc/ig04/node82.html*/

clipLianBarsky.t0 = 0;
clipLianBarsky.t1 = 1;

clipLianBarsky.calculate = function(x1,y1,x2,y2,div) {
    //get the box's outer coordinates
    var xwmin = x1-div.outerWidth()/2;
    var xwmax = x1+div.outerWidth()/2;
    var ywmin = y1-div.outerHeight()/2;
    var ywmax = y1+div.outerHeight()/2;

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
