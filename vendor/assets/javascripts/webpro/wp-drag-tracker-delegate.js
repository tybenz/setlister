/**
* wp-drag-tracker-delegate.js - version 0.1 - WebPro Release 0.1
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

(function( $, WebPro, window, document, undefined){

// DragTrackerDelegate derives from the base DragTracker class and adds the ability
// to allow users to call a method delegateDrag() which crawls the element ancestor
// hierarchy looking for another tracker delegate that can take over dragging. The
// main use for this would be for implementing things like nested scrollviews that
// cause their parents to scroll when they hit their extremes.

WebPro.DragTrackerDelegate = function( element, options ) {
    options = $.extend( {}, WebPro.DragTrackerDelegate.prototype.defaultOptions, options );

    WebPro.DragTracker.call( this, element, options );

    // We track the event we handled within _startDrag() and _handleDrag() so
    // we can pass it to any delegate that will take over a drag. Note that
    // we don't allow any calls to delegateDrag() once _stopDrag() is called.

    this._lastDragEvent = null;

    // Store this tracker object on the drag element so other tracker
    // delegates can find it.

    $( this.element ).data( this.options.delegatePropertyName, this );

    // Callers are allowed to pass a selector or element
    // for the delegateElement. Make sure we normalize the
    // option value to an element.

    var delegateEle = this.options.delegateElement;
    if ( delegateEle ) {
        this.options.delegateElement = $( delegateEle )[ 0 ];
    }
};

WebPro.inherit( WebPro.DragTrackerDelegate, WebPro.DragTracker );

$.extend( WebPro.DragTrackerDelegate.prototype, {
    defaultOptions: $.extend({}, WebPro.DragTracker.prototype.defaultOptions, {
        // The name of the data property we use to store the tracker
        // on the drag element.

        delegatePropertyName: 'wpDragTrackerDelegate',

        // By default the drag tracker delegates up the ancestor
        // hierarchy for the element it tracks. You can specify
        // different element hierarchy to use by specifying an
        // element or selector via the delegateElement option.

        delegateElement: null,

        // The getDirection() method returns the direction
        // tracked by this drag-tracker. Possible values returned
        // are 'horizontal', 'vertical', and 'both'. Some use cases
        // require tracking in 'both' directions, but for the sake
        // of delegation, the caller may want to control what direction
        // actually gets calculated when getDirection() is called,
        // especially when it comes time to delegate responsibilities.
        // The getDirectionFunc constructor options gives the caller a
        // hook to return the direction on behalf of the tracker.

        getDirectionFunc: null,

        // Before attempting to delegate responsibility to
        // to one of its ancestors, _trackerIsCompatible()
        // gets called to see if it can actually take on
        // the responsibility. In the default implementation,
        // _trackerIsCompatible() compares the directions
        // of both the tracker and the delegate to see if they
        // are compatible. If someone wanted to override this
        // behavior, they can either derive from this class
        // and override _trackerIsCompatible(), or, they could
        // simply instantiate the constructor for this class
        // and pass an alternate compare function to call via
        // the delegateIsCompatibleFunc constructor option.

        delegateIsCompatibleFunc: null
    }),

    // Override the base class version of _startDrag so we can
    // save the last event we processed.

    _startDrag: function( e, data ) {
        this._lastDragEvent = e;
        return WebPro.DragTrackerDelegate.prototype._super.prototype._startDrag.call( this, e, data );
    },
    
    // Override the base class version of _handleDrag so we can
    // save the last event we processed.

    _handleDrag: function( e, data ) {
        this._lastDragEvent = e;
        return WebPro.DragTrackerDelegate.prototype._super.prototype._handleDrag.call( this, e, data );
    },
    
    // Override the base class version of _stopDrag so we can
    // clear our _lastDragEvent property before any stop callbacks
    // are triggered.

    _stopDrag: function( e, data ) {
        this._lastDragEvent = null;
        return WebPro.DragTrackerDelegate.prototype._super.prototype._stopDrag.call( this, e, data );
    },

    // Derived classes should implement this function if they
    // want to be selective of what kind of tracker they hand
    // a drag off to.

    _trackerIsCompatible: function( dt, direction ) {
        var checkFunc = this.options.delegateIsCompatibleFunc;

        if ( checkFunc ) {
            return checkFunc( this, dt, direction );
        }

        // The trackers are compatible if they have the
        // same direction, or the delegate can handle
        // both directions.

        var d1 = direction || this.getDirection(),
            d2 = dt.getDirection();

        return d1 === d2 || d2 === 'both';
    },

    // Walk the parent hierarchy of this tracker's element
    // looking for any ancestor that has a delegate tracker
    // stored on it.

    _findClosestDelegate: function( element, direction ) {
        while ( element ) {
            var pDT = $( element ).data( this.options.delegatePropertyName );
            if ( pDT && this._trackerIsCompatible( pDT, direction ) ) {
                return pDT;
            }
            element = element.parentNode;
        }

        return null;
    },

    // Derived classes will want to extend this method so they can
    // cleanup before or after the drag is stopped.

    _handleDelegateHandOff: function( evt ) {
        this._stopDrag( evt );
        this._lastDragEvent = null;
    },

    // Attempt to delegate the drag up the ancestor hierarchy.
    // Return true if we would a delegate that can handle the
    // rest of the drag, return false otherwise and let the
    // caller decide what to do next.

    delegateDrag: function( direction ) {
        if ( this.dragStarted && this._lastDragEvent ) {
            var dtDelegate = this._findClosestDelegate( this.options.delegateElement || this.element.parentNode, direction ),
                event = this._lastDragEvent;
            if ( dtDelegate ) {
                this._handleDelegateHandOff( event );
                dtDelegate._startDrag( event );
                dtDelegate._handleDrag( event );
                return true;
            }
        }

        return false;
    },

    // Get the direction handled by this drag tracker.

    getDirection: function() {
        var options = this.options,
            func = options.getDirectionFunc;
            ignoreX = options.ignoreX,
            ignoreY = options.ignoreY;

        // If we were given a function to call, use it instead
        // of manually calculating the direction ourselves.

        if ( func ) {
            return func( this );
        }

        // Manually calculate the direction based on our ignoreX/Y flags.

        return ( !ignoreX && !ignoreY ) ? 'both' : ( ignoreX ? 'vertical' : 'horizontal' );
    }
});

})( jQuery, WebPro, window, document );
