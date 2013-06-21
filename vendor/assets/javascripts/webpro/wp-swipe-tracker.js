/**
* wp-swipe-tracker.js - version 0.1 - WebPro Release 0.1
*
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*       * Redistributions of source code must retain the above copyright notice,
*             this list of conditions and the following disclaimer.
*       * Redistributions in binary form must reproduce the above copyright notice,
*             this list of conditions and the following disclaimer in the documentation
*             and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
* INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
* CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
* ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

(function( $, WebPro, window ) {

    WebPro.SwipeTracker = function( element, options ) {
        options = $.extend( {}, WebPro.DragTracker.prototype.defaultOptions, WebPro.SwipeTracker.prototype.defaultOptions, options );
        WebPro.DragTracker.call( this, $( element ), options );
        this.$element = $( element );
        this.events = options.swipeEvents;
        this.globalSwipeEvent = this.options.globalSwipeEvent;
    };

    WebPro.inherit( WebPro.SwipeTracker, WebPro.DragTracker );

    $.extend(WebPro.SwipeTracker.prototype, {
        defaultOptions: {
            swipeEvents: null,
            angleThreshold: 10,
            displayTracker: false,
            globalSwipeEvent: 'wp-swipe',
            startEvent: 'vmousedown',
            updateEvent: 'vmousemove',
            stopEvent: 'vmouseup'
        },
        dragStart: function( dx, dy ) {
            if ( this.options.displayTracker ) {
                this.$tracker = $( '<div style="background-color: cyan;border-radius: 20px; width: 40px; height: 40px; position: absolute;box-shadow: 0 0 5px 5px cyan"></div>' );
                $( 'body' ).append( this.$tracker );
                this.$tracker.css({
                    left: this.startX - 20,
                    top: this.startY - 20
                });
            }
        },
        dragUpdate: function( dx, dy ) {
            if ( this.options.displayTracker ) {
                this.$tracker.css({
                    left: this.startX + dx - 20,
                    top: this.startY + dy - 20
                });
            }
        },
        dragStop: function( dx, dy ) {
            if ( this.options.displayTracker ) {
                this.$tracker.remove();
            }
            this.$element.trigger( this.globalSwipeEvent );
            var startX = this.startX,
                startY = this.startY,
                totalWidth = this.$element.width(),
                totalHeight = this.$element.height(),
                angle = Math.abs( Math.atan2( -dy, dx ) * ( 180 / Math.PI ) ),
                angleThreshold = this.options.angleThreshold,
                yThreshold, xThreshold, top, left, bottom, right,
                event, x, y, width, height;

            for ( event in this.events ) {
                params = this.events[ event ];
                x = params.halign;
                y = params.valign;
                width = params.width || totalWidth;
                height = params.height || totalHeight;
                xThreshold = params.xThreshold;
                yThreshold = params.yThreshold;

                switch ( x ) {
                    case "left":
                    case "center":
                    case "right":
                        x = WebPro.getAlignmentAdjustment( x, totalWidth, width );
                        break;
                    default:
                        x = x || 0;
                        break;
                }

                switch ( y ) {
                    case "top":
                    case "center":
                    case "bottom":
                        y = WebPro.getAlignmentAdjustment( y, totalHeight, height );
                        break;
                    default:
                        y = y || 0;
                        break;
                }
                left = x;
                top = y;
                right = left + ( width || totalWidth );
                bottom = top + ( height || totalHeight );
                correctDirection = xThreshold && ( xThreshold < 0 && dx < xThreshold && angle > ( 180 - angleThreshold ) || xThreshold > 0 && dx > xThreshold && angle < angleThreshold ) ||
                    yThreshold && angle < ( 90 + angleThreshold ) && angle > ( 80 - angleThreshold ) && ( yThreshold < 0 && dy < yThreshold || yThreshold > 0 && dy > yThreshold );
                insideRegion = startX < right && startX > left && startY > top && startY < bottom;
                if ( insideRegion && correctDirection ) {
                    this.$element.trigger( event );
                }
            }
        }
    });

})( jQuery, WebPro, window );
