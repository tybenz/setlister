/**
* wp-swipe-panel-group.js - version 0.1 - WebPro Release 0.1
*
* Copyright (c) 2012. Adobe Systems Incorporated.
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

(function( $, WebPro, window, document, undefined){

function SwipePanelGroupDragTracker( element, options )
{
    options = $.extend( {}, SwipePanelGroupDragTracker.prototype.defaultOptions, options );

    WebPro.DragTrackerDelegate.call( this, element, options );
}

WebPro.inherit( SwipePanelGroupDragTracker, WebPro.DragTrackerDelegate );

$.extend( SwipePanelGroupDragTracker.prototype, {
    defaultOptions: $.extend({}, WebPro.DragTrackerDelegate.prototype.defaultOptions, {
        angleThreshold: 30,     // angle less than or equal to 90 degrees
        direction: 'horizontal' // horizontal || vertical
    }),

    _startDrag: function( e, data ) {
        this._isNativeScroller = $( e.target ).closest( '.scrollable' ).length != 0;
        this._eventTarget = e.target;

        // The default implementation of _startDrag() always
        // returns false to the caller which results in the
        // event getting preventDefault() and stopPropagation()
        // getting called on it. We don't want to do this all
        // the time because it breaks native scroll regions. 
        
        SwipePanelGroupDragTracker.prototype._super.prototype._startDrag.call( this, e, data );

        // XXX: Note that returning false here has some implications!
        //      Specifically, it prevents click events from being dispatched
        //      on WebKit based platforms. This breaks link clicking and
        //      form input behaviors. To fix this, we would have to allow
        //      the default behavior and propagation to occur and conditionally
        //      do a preventDefault() in the _stopDrag() method based on value
        //      of this.dragStarted. The only reason we don't do this today is
        //      because we need to figure out how to prevent scrolling of the
        //      browser view in the opposite direction, not handled by the
        //      SwipePanelGroup.

        return this._isNativeScroller;
    },

    _handleDrag: function( e, data ) {
        // XXX: When using -webkit-overflow-scrolling:touch on iOS devices, the browser
        //      fires random mousemove events targeted at random elements, and each event
        //      has pageX/pageY/clientX/clientY values that are usually zero. Note these
        //      values can be non-zero if the element being tracked or any of its parents
        //      have been previously transformed via the transform CSS3 property. This causes
        //      problems because usually touchevents are targeted at the same element until the
        //      user's finger goes up. Filter out the bogus events for now.

        if ( e.target !== this._eventTarget && this.isTouchBasedDrag ) {
            return;
        }
 
        // The default implementation of _handleDrag() always returns
        // false to the caller which breaks native scroll regions. What
        // we really want to do, is prevent scrolling until we can figure
        // out if this is a drag we want to actually deal with.

        var dx = e.pageX - this.startX,
            dy = e.pageY - this.startY,
            o = this.options;

        if ( !this.dragStarted ) {
            // If a drag hasn't been started yet, check to see if we've
            // exceeded the drag threshold. If so, then check to see if
            // the angle of the drag is within the angle of tolerance from
            // the axis (horizontal or vertical) we are dragging along.

            var aDX = Math.abs( dx ),
                aDY = Math.abs( dy );

            if ( aDX >= o.dragThreshold || aDY >= o.dragThreshold ) {
                var angle = 360,
                    isHorizontal = o.direction === 'horizontal',
                    rise = isHorizontal ? aDY : aDX,
                    run =  isHorizontal ? aDX : aDY;

                if ( run > 0 ) {
                    angle =  Math.abs( Math.atan( rise / run ) ) * ( 180 / Math.PI );
                }

                if ( angle > o.angleThreshold ) {
                    // The drag exceeds our angle threshold. If the
                    // drag started in a native scrolling view, un-register
                    // our handlers so the scrolling view can take over handling
                    // of the drag events.

                    if ( this._isNativeScroller ) {
                        this._removeDragHandlers();
                    }

                    // If the drag wasn't started in a native scrolling view,
                    // we need to return false so that the current panel
                    // eats this event.

                    return this._isNativeScroller;
                }
            }
        }

        return SwipePanelGroupDragTracker.prototype._super.prototype._handleDrag.call( this, e, data );
    },

    _stopDrag: function( e, data ) {
        return SwipePanelGroupDragTracker.prototype._super.prototype._stopDrag.call( this, e, data );
    },

    getDirection: function() {
        return this.options.direction;
    }
});

WebPro.widget( 'Widget.SwipePanelGroup', WebPro.Widget.PanelGroup, {
    _widgetName: 'swipe-panel-group',

    defaultOptions: {
            defaultIndex:  0,
            direction:     'horizontal', // 'horizontal' || 'vertical'
            duration:      200, // msecs
            animateWithJS: false,
            easing:        'ease-out',
            animateClass:  'wp-animate',
            widgetClass:   'wp-swipe-panel-group',
            viewClass:     'wp-swipe-panel-group-view',
            panelClass:    'wp-swipe-panel-group-panel',
            previousClass: 'wp-previous',
            nextClass:     'wp-next',
            delegateElement: null
        },

    _setUp: function( element, options ) {
        var options = $.extend( {}, this.defaultOptions, options );

        // The first arg of the PanelGroup widget is actually a selector or collection
        // of panel elements. In our case, our first arg is actually the top-level element
        // of the widget which serves as the clip.

        this.$clip = $( element );

        // Find the panels for our widget and then pass them on to our base class constructor.

        var clip = this.$clip[ 0 ],
            $panels = WebPro.scopedFind( clip, '.' + options.panelClass, options.widgetClass, clip );

        // Find the view class we'll use to move the panels around on screen.

        this.$view = WebPro.scopedFind( clip, '.' + options.viewClass, options.widgetClass, clip );

        this._blockShowPanel = true;

        return WebPro.Widget.SwipePanelGroup.prototype._super.prototype._setUp.call( this, $panels, options );
    },

    _attachBehavior: function() {
        WebPro.Widget.SwipePanelGroup.prototype._super.prototype._attachBehavior.apply( this, arguments );

        var widget = this;

        this._blockShowPanel = false;
        this._position = 0;
        this._startPosition = 0;
        this._snapPosition = 0;
        this._lastDelta = 0;
        this._tracker = new SwipePanelGroupDragTracker( this.$clip[ 0 ], {
                direction: this.options.direction,
                startEvent: 'vmousedown',
                updateEvent: 'vmousemove',
                stopEvent: 'vmouseup',
                delegateElement: this.options.delegateElement,
                dragStart: function( dt, dx, dy ) {
                        return widget._handleDragStart( dx, dy );
                    },
                dragUpdate: function( dt, dx, dy ) {
                        return widget._handleDragUpdate( dx, dy );
                    },
                dragStop: function( dt, dx, dy ) {
                        return widget._handleDragStop( dx, dy );
                    }
            });
        this._isHorizontal = this.options.direction !== 'vertical';

        this._animationInProgress = false;
        this._animator = null;
        this._animationCompleteCB = function( e ) {
                return widget._handleTransitionEnd( e );
            };

        if ( this.options.animateWithJS ) {
            this._animStartPos = 0;
            this._animDistance = 0;
            this._animator = new WebPro.Animator(function( easingConst ) {
                    widget._setViewPosition( widget._animStartPos + ( ( widget._animDistance * easingConst ) ) );
                },
                {
                    easing: this.options.easing,
                    duration: this.options.duration,
                    complete: this._animationCompleteCB
                });
        } else {
            this.$view.on( 'webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', this._animationCompleteCB );
        }
    },

    _ready: function() {
        this._postShowPanel( this.options.defaultIndex );
    },

    _setUpBeforeAndAfterPanels: function() {
        var options = this.options,
            $clip = this.$clip,
            $panels = this.$element,
            curIndex = this.activeIndex,
            beforeIndex = curIndex - 1,
            afterIndex = curIndex + 1,
            $beforeEle = beforeIndex >= 0 ? $panels.eq( beforeIndex ) : $(),
            $currentEle = $panels.eq( curIndex ),
            $afterEle = afterIndex < $panels.length ? $panels.eq( afterIndex ) : $();

        // Remove the animate class so that transitions aren't used
        // when we reposition the next set of panels.

        this.$clip.removeClass( options.animateClass );

        // Hide the old set of views that were visible.

        $panels.removeClass(
                options.activeClass
                + ' ' + options.previousClass
                + ' ' + options.nextClass
            );

        // Reset the position of the view so that it is at zero.

        this._setViewPosition( 0 );

        // Make the active panel and the panels before and
        // after it, visible.

        $beforeEle.addClass( options.previousClass );
        $currentEle.addClass( options.activeClass );
        $afterEle.addClass( options.nextClass );
    },

    _setElementPosition: function( ele, position, options ) {
        var x = this._isHorizontal ? position : 0,
            y = this._isHorizontal ? 0 : position,
            opts = $.extend( { unit: 'px' }, options );

        WebPro.setElementTransform( ele, 'translate3d(' + x + opts.unit + ',' + y + opts.unit + ',0)');
    },

    _setViewPosition: function( position ) {
        this._position = position;
        this._setElementPosition( this.$view, position );
    },

    _updateSnapPosition: function( delta ) {
        var length = this._isHorizontal ? this.$clip.width() : this.$clip.height(),
            lastDelta = this._lastDelta;

        if ( lastDelta <= 0 && delta <= lastDelta ) {
            this._snapPosition = -length;
        } else if ( lastDelta >= 0 && delta >= lastDelta ) {
            this._snapPosition = length;
        } else {
            this._snapPosition = 0;
        }

        // If the user is trying to swipe past the first or last panel
        // make sure we snap back.

        var panelIndex = this.activeIndex;
        if ( ( panelIndex === 0 && this._snapPosition > 0 )
                || ( ( panelIndex + 1 ) === this.$element.length && this._snapPosition < 0 ) ) {
            this._snapPosition = 0;
        }
    },

    _postShowPanel: function( indexOrEle ) {
        // Call the base class showPanel() method so the
        // activeIndex and activeElement get updated.

        WebPro.Widget.SwipePanelGroup.prototype._super.prototype.showPanel.apply( this, arguments );

        // Make sure the panels before and after the
        // activeElement are in place.

        this._setUpBeforeAndAfterPanels();
    },

    showPanel: function( indexOrEle ) {
        if ( this._blockShowPanel ) {
            return;
        }

        if ( typeof indexOrEle != 'number' ) {
            indexOrEle = this._getElementIndex( indexOrEle );
        }
    
        if ( indexOrEle > -1 && indexOrEle !== this.activeIndex ) {
            var length = this._isHorizontal ? this.$clip.width() : this.$clip.height(),
                swipeLeft = indexOrEle > this.activeIndex,
                position = swipeLeft ? -length : length,
                className = swipeLeft ? this.options.nextClass : this.options.previousClass;
;
            this._snapIndex = indexOrEle;

            this.$element.removeClass( className );
            $( this._getElement( indexOrEle) ).addClass( className );

            this._animatePanels( position );
        }
    },

    _handleTransitionEnd: function( e ) {
        this._postShowPanel( this._snapIndex );
        this._animationInProgress = false;
    },

    _handleDragStart: function( dx, dy ) {
        if ( this._animationInProgress ) {
            if ( this.options.animateWithJS ) {
                this._animator.stop();
            }

            this._handleTransitionEnd();
        }

        this.$clip.removeClass( this.options.animateClass );
        this._lastDelta = 0;
        this._startPosition = this._position;
        this._snapPosition = 0;
        this._snapIndex = this.activeIndex;
        this._handleDragUpdate( dx, dy );
    },

    _handleDragUpdate: function( dx, dy ) {
        var delta = this._isHorizontal ? dx : dy,
            currentPanelIndex = this.activeIndex;

        // If the user is trying to swipe before the first panel,
        // or after the last panel compress the distance by 60%.

        if ( ( currentPanelIndex === 0 && delta > 0 ) || ( ( currentPanelIndex + 1 ) >= this.$element.length && delta < 0 ) ) {
            // At this point we know we want to attempt to delegate the
            // current drag, but we're not sure if any ancestor can take
            // over. We need to temporarily zero out the snap position
            // to make sure we stay on the current panel if the drag
            // is actually delegated.

            var snap = this._snapPosition;
            this._snapPosition = 0;

            if ( this._tracker.delegateDrag() ) {
                // Some other tracker took over the drag so
                // make sure we dispatch a stop.

                //this._handleDragStop( dx, dy );
                this._animationInProgress = false;
                return;
            }

            // The delegate failed, so restore the snap position.

            this._snapPosition = snap;

            // We're going to overshoot our bounds, so compress
            // the the distance.

            delta *= .4;
        }

        this._updateSnapPosition( delta );
        this._setViewPosition( this._startPosition + delta );

        this._lastDelta = delta;
    },

    _animatePanels: function( position ) {
        var startPosition = this._position;

        this._animationInProgress = true;

        if ( this.options.animateWithJS ) {
            this._animator.stop();
            this._animStartPos = this._position;
            this._animDistance = position - this._position;
            this._animator.start();
        } else {
            this.$clip.addClass( this.options.animateClass );
            this._setViewPosition( position );
        }
    },

    _handleDragStop: function( dx, dy ) {
        this._snapIndex = this.activeIndex;

        if ( this._snapPosition > 0 ) {
            --this._snapIndex;
        }
        else if ( this._snapPosition < 0 ) {
            ++this._snapIndex;
        }

        this._animatePanels( this._snapPosition );
    },
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpSwipePanelGroup', WebPro.Widget.SwipePanelGroup );

})( jQuery, WebPro, window, document );
