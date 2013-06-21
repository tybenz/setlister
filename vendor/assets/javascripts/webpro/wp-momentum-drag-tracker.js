/**
* wp-momentum-drag-tracker.js - version 0.1 - WebPro Release 0.1
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

(function( $, WebPro, window ) {

// Extend the base DragTrackerDelegate class so that we can simulate drag momentum.
// The idea here is that when the user's mouse or finger goes up, we don't
// dispatch the dragStop call until after any momentum animation finishes.

WebPro.MomentumDragTracker = function( element, options ) {
    options = $.extend( {}, WebPro.MomentumDragTracker.prototype.defaultOptions, options );

    WebPro.DragTrackerDelegate.call( this, element, options );

    var tracker = this;

    // The last set of deltas we dispatched during a drag.

    this._lastDX = 0;
    this._lastDY = 0;

    // The x and y velocities we will use during the
    // momentum animations.

    this._velocityX = 0;
    this._velocityY = 0;

    // The id of the timer or animation-frame-request.

    this._velocityTimer = 0;

    // The function that gets called for each step of the
    // momentum animation.

    this._vtCallback = function() {
            tracker._handleMomentumUpdate();
        };

};

WebPro.inherit( WebPro.MomentumDragTracker, WebPro.DragTrackerDelegate );

$.extend( WebPro.MomentumDragTracker.prototype, {
    defaultOptions: $.extend({}, WebPro.DragTrackerDelegate.prototype.defaultOptions, {
        momentumStart: null,
        momentumStop: null,
        useRequestAnimationFrame: true,
        animationInterval: Math.round( 1000 / 60 ),
        velocityDamper: 0.95,
        minVelocityThreshold: 0.25,
        maxVelocity: 1000
    }),

    // Start the momentum animation.

    _startVelocityTimer: function() {
        this._stopVelocityTimer();

        if ( this.options.useRequestAnimationFrame ) {
            this._velocityTimer = requestAnimationFrame( this._vtCallback );
        } else {
            this._velocityTimer = setTimeout( this._vtCallback, this.options.animationInterval );
        }
    },

    // Stop the momentum animation.

    _stopVelocityTimer: function() {
        if ( this._velocityTimer ) {
            if ( this.options.useRequestAnimationFrame ) {
                cancelAnimationFrame( this._velocityTimer );
            } else {
                clearTimeout( this._velocityTimer );
            }
            this._velocityTimer = 0;
        }
    },

    // Call the base class version of dragUpdate().

    _dispatchDragUpdate: function( dx, dy ) {
        WebPro.MomentumDragTracker.prototype._super.prototype.dragUpdate.call( this, dx, dy );
    },

    // Call the base class version of dragStop().

    _dispatchDragStop: function( dx, dy ) {
        var velocityTimerWasActive = this._velocityTimer != 0;

        this._stopVelocityTimer();

        this._velocityX = 0;
        this._velocityY = 0;

        WebPro.MomentumDragTracker.prototype._super.prototype.dragStop.call( this, dx, dy );

        // If the velocity timer was active we've already
        // dispatched a momentumStart(), so we need to 
        // dispatch a matching momentumStop().

        if ( velocityTimerWasActive ) {
            this.momentumStop( dx, dy );
        }
    },

    // Called at each step of the momentum animation.

    _handleMomentumUpdate: function() {
        // Dampen the velocity, then add it to
        // the last set of offsets we stored.

        var damper = this.options.velocityDamper,
            min = this.options.minVelocityThreshold,
            vx = this._velocityX * damper,
            vy = this._velocityY * damper;

        // Make sure we round small values to zero or we can
        // get into situations where dampened velocity values
        // approach zero, but never quite get there.

        this._velocityX = Math.abs( vx ) < min ? 0 : vx;
        this._velocityY = Math.abs( vy ) < min ? 0 : vy;

        if ( this._velocityX || this._velocityY ) {
            // We stil have some velocity after dampening.
            // trigger a dragUpdate.

            this._lastDX += this._velocityX;
            this._lastDY += this._velocityY;

            this._dispatchDragUpdate( this._lastDX, this._lastDY );

            this._startVelocityTimer();
        } else {
            // There's no more velocity so trigger a dragStop().

            this._dispatchDragStop( this._lastDX, this._lastDY );
        }
    },

    // Override the base _startDrag() method so we can make sure
    // to kill of any momentum animation if the user's mouse or finger
    // touches our drag element.

    _startDrag: function( e, data ) {
        if ( this._velocityTimer ) {
            this._dispatchDragStop( this._lastDX, this._lastDY );
        }

        // Save the event target so we can filter out
        // bogus mousemove events on iOS.

        this._eventTarget = e.target;

        return WebPro.MomentumDragTracker.prototype._super.prototype._startDrag.apply( this, arguments );
    },

    _handleDrag: function( e, data ) {
        // XXX: When using -webkit-overflow-scrolling:touch on iOS devices, the browser
        //      fires random mousemove events targeted at random elements, and each event
        //      has pageX/pageY/clientX/clientY values that are usually zero. Note these
        //      values can be non-zero if the element being tracked or any of its parents
        //      have been previously transformed via the transform CSS3 property. This causes
        //      problems because usually touchevents are targeted at the same element until the
        //      user's finger goes up. Filter out the bogus events for now.

        if ( this._eventTarget != e.target && this.isTouchBasedDrag ) {
            return;
        }

        return WebPro.MomentumDragTracker.prototype._super.prototype._handleDrag.apply( this, arguments );
    },

    momentumStart: function( dx, dy ) {
        // Base class implementation simply calls
        // any callback defined.

        var o = this.options;
        if ( o.momentumStart ) {
            o.momentumStart( this, dx, dy );
        }
    },

    momentumStop: function( dx, dy ) {
        // Base class implementation simply calls
        // any callback defined.

        var o = this.options;
        if ( o.momentumStop ) {
            o.momentumStop( this, dx, dy );
        }
    },

    // Override the base dragStart() method so we can track the last
    // offset values and reset our velocity properties.

    dragStart: function( dx, dy ) {
        WebPro.MomentumDragTracker.prototype._super.prototype.dragStart.call( this, dx, dy );

        this._velocityX = 0;
        this._velocityY = 0;

        this._lastDX = dx;
        this._lastDY = dy;
    },

    // Override the base dragUpdate() method so we can calculate
    // our x and y velocities between drags.

    dragUpdate: function( dx, dy ) {
        var maxVelocity = this.options.maxVelocity;

        this._dispatchDragUpdate( dx, dy );

        var vx = dx - this._lastDX,
            vy = dy - this._lastDY;

        if ( vx < 0 ) {
            vx = Math.max( vx, -maxVelocity );
        } else {
            vx = Math.min( vx, maxVelocity );
        }

        if ( vy < 0 ) {
            vy = Math.max( vy, -maxVelocity );
        } else {
            vy = Math.min( vy, maxVelocity );
        }

        this._velocityX = vx;
        this._velocityY = vy;

        this._lastDX = dx;
        this._lastDY = dy;
    },

    // Override the base dragStop() method so we can kick-off
    // a momentum animation if we have non-zero x/y velocities.
    // If there aren't any velocities, immediately dispatch
    // a real dragStop().

    dragStop: function( dx, dy ) {
        if ( this._velocityX || this._velocityY ) {
            this.momentumStart( dx, dy );
            this._startVelocityTimer();
        } else {
            this._dispatchDragStop( dx, dy );
        }
    },

    // Extend the base class version of _handleDelegateHandOff() so
    // we can prevent any momentum animations when our dragStop() method
    // is called.

    _handleDelegateHandOff: function( evt ) {
        // Zero out our velocity properties so we
        // don't trigger any momentum.

        this._velocityX = 0;
        this._velocityY = 0;

        // Call the base class version so we stop tracking this drag.

        WebPro.MomentumDragTracker.prototype._super.prototype._handleDelegateHandOff.apply( this, arguments );
    },

});

})( jQuery, WebPro, window );
