/**
* wp-slider2d.js - version 0.1 - WebPro Release 0.1
*
* Copyright (c) 2012. Adobe Systems Incorporated.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*   * Redistributions of source code must retain the above copyright notice,
*     this list of conditions and the following disclaimer.
*   * Redistributions in binary form must reproduce the above copyright notice,
*     this list of conditions and the following disclaimer in the documentation
*     and/or other materials provided with the distribution.
*   * Neither the name of Adobe Systems Incorporated nor the names of its
*     contributors may be used to endorse or promote products derived from this
*     software without specific prior written permission.
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

WebPro.widget( "Widget.Slider2d", WebPro.Widget, {
    _widgetName: "slider2d",

    defaultOptions: {
        trackClassName: 'wp-slider-track',
        thumbClassName: 'wp-slider-thumb',
        ignoreY: true,
        ignoreX: false
    },

    _attachBehavior: function() {
        var self = this,
            opts = this.options;
        
        this.$track = this.$element.find( '.' + opts.trackClassName );
        this.$thumb = this.$element.find( '.' + opts.thumbClassName );    

        var trackWidth = Math.round( this.$track.width() ),
            trackHeight = Math.round( this.$track.height() ),
            thumbWidth = Math.round( this.$thumb.width() ),
            thumbX = parseInt( this.$thumb.css( "left" ) ) || 0,
            thumbY = parseInt( this.$thumb.css( "top" ) ) || 0,
            thumbPercentX = thumbX / trackWidth,
            thumbPercentY = thumbY / trackHeight;

        this.percentage = { x: thumbPercentX, y: thumbPercentY };
        this.position = { x: thumbX, y: thumbY };

        this._resetConstraints();

        this.tracker = new  WebPro.DragTracker( this.$thumb[ 0 ], {
            dragStart: function( dt, dx, dy ) { self._handleDragStart( dx, dy ); },
            dragUpdate: function( dt, dx, dy ) { self._handleDragUpdate( dx, dy ); },
            dragStop: function( dt, dx, dy ) { self._handleDragStop( dx, dy ); }
        });
    },

    _handleDragStart: function( dx, dy ) {
        this._resetConstraints();
        this._startPos = {
            x: this.position.x,
            y: this.position.y
        };
        this.trigger( 'wp-slider-drag-start', { position: this.position, percentage: this.percentage } );
    },

    _handleDragUpdate: function( dx, dy ) {
        if ( this.options.ignoreY ) {
            this.setPositionByPixel( this._startPos.x + dx, this._startPos.y );
        } else if ( this.options.ignoreX ) {
            this.setPositionByPixel( this._startPos.x, this._startPos.y + dy );
        } else {
            this.setPositionByPixel( this._startPos.x + dx, this._startPos.y + dy );
        }
    },

    _handleDragStop: function( dx, dy ) {
        this._startPos = { x: 0, y: 0 };
        this.trigger( 'wp-slider-drag-stop', { position: this.position, percentage: this.percentage } );
    },

    _resetConstraints: function() {
        var trackWidth = this.$track.width(),
            trackHeight = this.$track.height(),
            thumbWidth = this.$thumb.outerWidth(),
            thumbHeight = this.$thumb.outerHeight();

        this.maxPos = {
            x: trackWidth - thumbWidth,
            y: trackHeight - thumbHeight
        };

        // Clip values.

        this.maxPos.x = this.maxPos.x < 0 ? 0 : this.maxPos.x;
        this.maxPos.y = this.maxPos.y < 0 ? 0 : this.maxPos.y;

        // Reset the thumb based on our new width.

        this.setPositionByPixel( this.percentage.x * this.maxPos.x, this.percentage.y * this.maxPos.y );
    },

    setPositionByPixel: function( posX, posY )
    {
        // Clip the value we were given to our pixel range.

        posX = Math.round( posX || 0 );
        posX = posX < 0 ? 0 : ( posX > this.maxPos.x ? this.maxPos.x : posX );
        
        posY = Math.round( posY || 0 );
        posY = posY < 0 ? 0 : ( posY > this.maxPos.y ? this.maxPos.y : posY );

        this._setThumbPosition( posX, posY );
    },

    setPositionByPercentage: function( percentX, percentY ) {
        this.percentage.x = percentX < 0 ? 0 : ( percentX < 1 ? percentX : 1 );
        this.percentage.y = percentY < 0 ? 0 : ( percentY < 1 ? percentY : 1 );
        this._setThumbPosition( Math.round( this.percentage.x * this.maxPos.x ), Math.round( this.percentage.y * this.maxPos.y ) );
    },

    getPosition: function() {
        return this.position;
    },

    getPositionAsPercentage: function() {
        return this.percentage;
    },

    _setThumbPosition: function( posX, posY ) {
        var maxX = this.maxPos.x,
            maxY = this.maxPos.y;

        // Clip the position values.

        posX = posX < 0 ? 0 : ( posX > maxX ? maxX : posX );
        posY = posY < 0 ? 0 : ( posY > maxY ? maxY : posY );

        this.position = {
            x: posX,
            y: posY
        };

        this.percentage = {
            x: maxX ? posX / maxX : 0,
            y: maxY ? posY / maxY : 0,
        };

        this.$thumb.css({
            left: posX + 'px',
            top: posY + 'px'
        });
        
        this.update();
    },

    update: function() {
        this._update();
        if ( this.options.ignoreY ) {
            this.trigger( 'wp-slider-update', { position: this.position.x, percentage: this.percentage.x } );
        } else if ( this.options.ignoreX ) {
            this.trigger( 'wp-slider-update', { position: this.position.y, percentage: this.percentage.y } );
        } else {
            this.trigger( 'wp-slider-update', {
                    positionX: this.position.x,
                    positionY: this.position.y,
                    percentageX: this.percentage.x,
                    percentageY: this.percentage.y
                });
        }
    },

    _update: function() {
        // Stub function to be used by derived class.
    }
});

// Add a convenience method to the jQuery Collection prototype,
// that applies our Slider2d behavior to all the elements in the collection.

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpSlider2d', WebPro.Widget.Slider2d );

})( jQuery, WebPro, window, document );

