/**
* wp-image-loader.js - version 0.1 - WebPro Release 0.1
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

(function( $, WebPro, window, document, undefined ){

// Each request is assigned a request id to provide a stable sort.
var nextRequestId = 1;

WebPro.ImageLoader = function( options ) {
    WebPro.EventDispatcher.call();

    var self = this;

    this.options = $.extend( {}, this.defaultOptions, options );
    this._currentEntry = null;
    this._queue = [];
    this._needsSort = false;
    this._isRunning = false;

    this._loader = new Image();
    this._loadFunc = function() { self._handleLoad(); };
    this._loadErrorFunc = function() { self._handleError(); };
    this._timeoutFunc = function() {
            self.trigger( "wp-image-loader-timeout", this._currentEntry );
            self._loadNext();
        };
};

WebPro.inherit( WebPro.ImageLoader, WebPro.EventDispatcher );

$.extend( WebPro.ImageLoader.prototype, {
    defaultOptions: {
            createNewImageOnReset: false,
            timeoutInterval: 0
        },

    add: function( url, options ) {
        if ( url ) {
            // The add() method can actually be called with a single URL or an
            // array of URLs. Normalize things so that we are always dealing with
            // an array.

            urls = WebPro.ensureArray( url );
    
            for ( var i = 0; i < urls.length; i++ ) {
                // Push the request into the queue.

                var entry = $.extend( { reqId: nextRequestId++, src: urls[ i ], width: 0, height: 0, priority: 50, callback: null, data: null }, options );
                this._queue.push( entry );

                // We've added a new request to the queue. We'll need to resort
                // the queue by priority when the next request is fired-off.

                this._needsSort = true;

                // Tell our listeners that a new entry has been added to the queue.

                this.trigger( "wp-image-loader-add", entry );
            }

            // If the loader is running, and we aren't waiting for a request,
            // go ahead and load whatever is on the top of the queue.
 
            if ( this._isRunning && !this._currentEntry ) {
                this._loadNext();
            }
        }
    },
    
    start: function() {
        if ( !this._isRunning ) {
            // Set _isRunning to true so that subsequent calls to start() will
            // be ignored.

            this._isRunning = true;

            // Kick-off a request for the first item in our queue.
 
            this._loadNext();

            // Tell our listeners that the loader was started.

            this.trigger( "wp-image-loader-start" );
        }
    },
    
    stop: function() {
        if ( this._isRunning ) {
            // If we're in the midst of attempting to load something,
            // place it back into the queue.

            if ( this._currentEntry ) {
                this._queue.unshift( this._currentEntry );
            }

            // Reset our loader so that any pending requests are killed.

            this._resetLoader();

            // Set _isRunning to false so that a call to start() will
            // actually allow it to kick-start loading.

            this._isRunning = false;

            // Tell our listeners that the loader was stopped.

            this.trigger( "wp-image-loader-stop" );
        }
    },

    clearQueue: function() {
        // If we're running note it so we can restart
        // loader when we're done.

        var isRunning = this._isRunning;

        // Stop any pending requests.

        this.stop();

        // Clear the queue by truncating it with a zero length.

        this._queue.length = 0;

        // If the loader was running, restart it so that it
        // is ready to service any new requests immediately.

        if ( isRunning ) {
            this.start();
        }
    },

    _loadNext: function() {
        // Before we attempt to load the next request in the queue,
        // reset our image loader object so that when we set its src
        // property, a request is actually made.

        this._resetLoader();

        var q = this._queue;

        if ( q.length ) {
            // If the queue needs sorting, sort it now.

            if ( this._needsSort ) {
                q = this._queue = q.sort(function( a, b ) {
                    // Sort by priority. If the priorities
                    // are the same, sort by the request-id.

                    var result = a.priority - b.priority;
                    return result ? result : a.reqId - b.reqId;
                });

                this._needsSort = false;
            }

            // Grab the next request from the queue.

            var entry = q.shift();
            this._currentEntry = entry;

            // Fire-off the load timeout timer.

            if ( this.options.timeoutInterval > 0 ) {
                this.timeoutTimerId = setTimeout( this._timeoutFunc, this.options.timeoutInterval );
            }

            // Fire-off the request.

            var loader = this._loader;
            loader.onload = this._loadFunc;
            loader.onerror = this._loadErrorFunc;
            loader.src = entry.src;
        }
    },

    _resetLoader: function() {
        // We re-use the same image object to load all images.
        // Some image implementations will only trigger a load
        // if you set the src property to something that is
        // different than what its current value is. For this
        // reason, we need to clear the src attribute between
        // requests, just in case the user attempts to reload
        // the same URL in the case of a "retry" when the initial
        // request failed. Before clearing the src property,
        // we set the load and error properties to NULL because
        // some implementations, like Safari, will attempt to load
        // the current document if you set the src to null or an
        // empty string. Un-hooking the load and error handlers
        // prevents us from entering a circular pattern of continuous
        // attempts to load the document, triggering the error handler,
        // which then in turn clears the src, triggering the cycle to
        // start over.

        var loader = this._loader;
        loader.onload = null;
        loader.onerror = null;
        loader.src = null;

        // If the same image object is used to load different URLs,
        // IE9 eventually starts reporting bogus image width/height
        // dimensions. For this reason, we provide an option where
        // the caller can specify that they want a new image object
        // to be used for each request.

        if ( this.options.createNewImageOnReset ) {
            this._loader = new Image();
        }

        // Clear the current entry.

        this._currentEntry = null;

        // Kill any load timeout timer that may be pending.

        if ( this._timeoutTimerId ) {
            clearTimeout( this._timeoutTimerId );
            this._timeoutTimerId = 0;
        }
    },

    _handleLoad: function() {
        var loader = this._loader,
            entry = this._currentEntry;

        // Clear the _currentEntry property here. We don't
        // want a call to stop(), from any callbacks, to
        // re-queue this request.

        this._currentEntry = null;

        // Set the width and height properties for the entry so that
        // listeners can access them when we fire off the success notification.

        entry.width = loader.width;
        entry.height = loader.height;

        // Fire-off any callback associated with this entry.

        if ( entry.callback ) {
            entry.callback( entry.src, entry.width, entry.height, entry.data );
        }

        // Tell listeners that this entry has loaded successfully.

        this.trigger( "wp-image-loader-load-success", entry );

        // Attempt to load the next request in the queue.

        this._loadNext();
    },

    _handleError: function() {
        // Tell listeners the current entry failed to load.

        this.trigger( "wp-image-loader-load-error", this._currentEntry );

        // Attempt to load the next request in the queue.

        this._loadNext();
    }
});

})( jQuery, WebPro, window, document );

