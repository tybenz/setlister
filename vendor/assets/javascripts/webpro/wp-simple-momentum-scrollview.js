/**
* wp-simple-momentum-scrollview.js - version 0.1 - WebPro Release 0.1
*
* Copyright (c) 2013. Adobe Systems Incorporated.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*       * Redistributions of source code must retain the above copyright notice,
*             this list of conditions and the following disclaimer.
*       * Redistributions in binary form must reproduce the above copyright notice,
*             this list of conditions and the following disclaimer in the documentation
*             and/or other materials provided with the distribution.
*       * Neither the name of Adobe Systems Incorporated nor the names of its
*             contributors may be used to endorse or promote products derived from this
*             software without specific prior written permission.
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

(function( $, WebPro, window, document, undefined ) {

WebPro.widget( "Widget.SimpleMomentumScrollView", WebPro.Widget, {
    _widgetName: "scrollview",

    defaultOptions: {
        useTransform: false,
        maxVelocity: 100,
        velocityDamper: 0.95,
        direction: undefined, // 'vertical', 'horizontal', undefined
        delegateElement: null
    },

    _attachBehavior: function() {
        var widget = this,
            options = this.options;

        this.$element.css( 'overflow', 'hidden' );

        this._scrollLeft = 0;
        this._scrollTop = 0;

        this._direction = options.direction || undefined;
        this._directionLock = undefined;
        this.momentumStarted = false;

        this.tracker = new WebPro.MomentumDragTracker( this.$element[ 0 ], {
            startEvent: 'vmousedown',
            updateEvent: 'vmousemove',
            stopEvent: 'vmouseup',
            delegateElement: options.delegateElement,
            maxVelocity: options.maxVelocity,
            velocityDamper: options.velocityDamper,
            dragStart: function( dt, dx, dy ) {
                    return widget._handleDragStart( dx, dy );
                },
            dragUpdate: function( dt, dx, dy ) {
                    return widget._handleDragUpdate( dx, dy );
                },
            dragStop: function( dt, dx, dy ) {
                    return widget._handleDragStop( dx, dy );
                },
            momentumStart: function( dt, dx, dy ) {
                    return widget._handleMomentumStart( dx, dy );
                },
            momentumStop: function( dt, dx, dy ) {
                    return widget._handleMomentumStop( dx, dy );
                }
        });
    },

    scrollLeft: function() {
        return this.options.useTransform ? this._scrollLeft : this.$element[ 0 ].scrollLeft;
    },

    scrollTop: function() {
        return this.options.useTransform ? this._scrollTop : this.$element[ 0 ].scrollTop;
    },

    scrollWidth: function() {
        var width = this.$element[ 0 ].scrollWidth;

/*
        if ( this.options.useTransform ) {
            var w = 0;
            this.$element.children().each(function() {
                    w += this.offsetWidth;
                });
            width = Math.max( w, width );
        }
*/

        return width;
    },

    scrollHeight: function() {
        var height = this.$element[ 0 ].scrollHeight;

/*
        if ( this.options.useTransform ) {
            var h = 0;
            this.$element.children().each(function() {
                    h += this.offsetHeight;
                });
            height = Math.max( h, height );
        }
*/

        return height;
    },

    width: function() {
        return this.$element[ 0 ].offsetWidth;
    },

    height: function() {
        return this.$element[ 0 ].offsetHeight;
    },

    scrollTo: function( x, y ) {
       var scrollElement = this.$element[ 0 ],
           useTransform = this.options.useTransform;

       if ( scrollElement ) {
           var scrollWidth = this.scrollWidth(),
               scrollHeight = this.scrollHeight(),
               innerWidth = this.width(),
               innerHeight = this.height(),
               maxLeft = scrollWidth - innerWidth,
               maxTop = scrollHeight - innerHeight;

           x = ( maxLeft <= 0 || x < 0 ) ? 0 : ( x > maxLeft ? maxLeft : x );
           y = ( maxTop <= 0 || y < 0 ) ? 0 : ( y > maxTop ? maxTop : y );

           this._scrollLeft = x;
           this._scrollTop = y;

           if ( useTransform ) {
               var val = 'translate3d(' + (-x) + 'px,' + (-y) + 'px,0)';
               this.$element.children().css({
                   '-webkit-transform': val,
                   '-moz-transform': val,
                   '-o-transform': val,
                   '-ms-transform': val,
                   'transform': val
               });

               this.$element.trigger( 'scroll' );
           } else {
               scrollElement.scrollLeft = x;
               scrollElement.scrollTop = y;
           }
       }
    },

    _handleDragStart: function( dx, dy ) {
        var ele = this.$element[ 0 ];
        this._scrollStartX = this.scrollLeft();
        this._scrollStartY = this.scrollTop();

        this._directionLock = undefined;
        this.momentumStarted = false;

        this.scrollTo( this._scrollStartX - dx, this._scrollStartY - dy );
        this.$element.trigger( 'scroll-start', { dx: dx, dy: dy } );
    },

    _isWithinAngleThreshold: function( run, rise ) {
        return run && ( Math.abs( Math.atan( rise / run ) ) * ( 180 / Math.PI ) < 30 );
    },

    _handleDragUpdate: function( dx, dy ) {
        var ele = this.$element[ 0 ],
            opts = this.options,
            dir = this._direction,
            dirLock = this._directionLock;

        if ( !dirLock ) {
            var aDX = Math.abs( dx ),
                aDY = Math.abs( dy );
            if ( aDX < 10 && aDY < 10 ) {
                return;
            }

			if ( this._isWithinAngleThreshold( aDX, aDY ) ) {
				dirLock = 'horizontal'; // The user swiped horizontally.
			}
			else if ( this._isWithinAngleThreshold( aDY, aDX ) ) {
				dirLock = 'vertical'; // The user swiped vertically.
			}

            // If we only scroll in one direction, and the user swiped in the
            // opposite direction, delegate the drag.

            if ( dir && dirLock && dir != dirLock ) {
                if ( this.tracker.delegateDrag( dirLock ) ) {
                    // Some other tracker took over the drag so
                    // make sure we dispatch a stop.
    
                    this._handleDragStop( dx, dy );
                    return;
                }
            }

            this._directionLock = dirLock = dir ? dir : ( dirLock ? dirLock : 'n' );
        }

        var x = this._scrollStartX - ( dirLock != 'vertical' ? dx : 0 ),
            y = this._scrollStartY - ( dirLock != 'horizontal' ? dy : 0 );

        this.scrollTo( x, y );

        if ( !this.momentumStarted && ( x !== this.scrollLeft() || y !== this.scrollTop() ) ) {
            // Our attempt to scroll made us hit one of the extremes.
            // Attempt to delegate this drag scroll.

            if ( this.tracker.delegateDrag( dir || 'both' ) ) {
                // Some other tracker took over the drag so
                // make sure we dispatch a stop.

                this._handleDragStop( dx, dy );
                return;
            }
        }
    },

    _handleDragStop: function( dx, dy ) {
        this.momentumStarted = false;
        this.scrollTo( this._scrollStartX - dx, this._scrollStartY - dy );
        this.$element.trigger( 'scroll-stop', { dx: dx, dy: dy } );
    },

    _handleMomentumStart: function( dx, dy ) {
        this.momentumStarted = true;
        this.$element.trigger( 'momentum-start', { dx: dx, dy: dy } );
    },

    _handleMomentumStop: function( dx, dy ) {
        this.momentumStarted = false;
        this.$element.trigger( 'momentum-stop', { dx: dx, dy: dy } );
    }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpSimpleMomentumScrollView', WebPro.Widget.SimpleMomentumScrollView );

})( jQuery, WebPro, window, document );
