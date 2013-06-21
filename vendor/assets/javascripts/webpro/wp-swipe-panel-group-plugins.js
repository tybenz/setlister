/**
* wp-swipe-panel-group-plugins.js - version 0.1 - WebPro Release 0.1
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

// dynamicPanelsPlugin
//
// A plugin for extending a panel group with functionality
// that allows for new panels to be dynamically inserted,
// moved, or removed.
//

WebPro.Widget.SwipePanelGroup.dynamicPanelsPlugin = {
    defaultOptions: {
    },

    initialize: function( widget, options ) {
        var plugin = this;

        // Extend the options with our defaults.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Add some utility methods to this widget that
        // allows us to insert, re-order, or remove panels.

        widget.insertPanelBefore = function( panel, reference ) {
                return plugin._insertPanelBefore( widget, panel, reference );
            };

        widget.movePanelBefore = function( panel, reference ) {
                return plugin._movePanelBefore( widget, panel, reference );
            };

        widget.removePanel = function( panel ) {
                return plugin._removePanel( widget, panel );
            };

        widget.bind( 'attach-behavior', function() {
                return plugin._attachBehavior( widget );
            });
    },

    _attachBehavior: function( widget ) {
        var plugin = this;

        widget.bind( 'wp-panel-show', function( e, data ) {
                return plugin._deletePanel( widget );
            });
    },

    _resetActiveTracking: function( widget, panel, reference ) {
        // After we've inserted/removed a new panel, we
        // need to reset the $element collection so
        // that it contains our new panel.

        var clip = widget.$clip[ 0 ],
            opts = widget.options;

        widget.$element = WebPro.scopedFind( clip, '.' + opts.panelClass, opts.widgetClass, clip );

        // The index of the active element may have changed
        // so update activeIndex.

        widget.activeIndex = widget._getElementIndex( widget.activeElement );

        // Set up the before and after panels just in case
        // the panel we just inserted precedes or follows
        // the active element.

        widget._setUpBeforeAndAfterPanels();
    },

    _insertPanelBefore: function( widget, panel, reference ) {
        var plugin = this,
            $panel = $( panel );

        widget.trigger( 'wp-before-insert-panel', { panel: panel, reference: reference } );

        // If a reference panel was given, insert
        // the new panel before it. Otherwise, insert
        // the panel at the very end.

        if ( reference ) {
            $panel.insertBefore( $( reference ) );
        } else {
            $panel.appendTo( widget.$view );
        }

        // Once we've inserted our new panel, make sure we
        // reset the widget's internal bookkeeping.

        plugin._resetActiveTracking( widget );

        widget.trigger( 'wp-insert-panel', { panel: panel, reference: reference } );
    },

    _movePanelBefore: function( widget, panel, reference ) {
        // XXX: TBD
    },

    _removePanel: function( widget, panel ) {
        var plugin = this,
            activeIndex = widget.activeIndex;

        panel = $( panel )[ 0 ];

        widget.trigger( 'wp-before-remove-panel', { panel: panel } );

        widget._dppPanelToDelete = panel;

        if ( panel === widget.activeElement ) {
            // The panel we are about to remove is the
            // currently visible panel. Add a removed class
            // to the panel element to initiate any removal
            // animation it may have.

            $( panel ).addClass( 'removed' );

            // Transition to another panel. The
            // actual removal will happen when the
            // transition is complete.

            widget.showPanel( activeIndex + ( activeIndex != ( widget.$element.length - 1 )  ? 1 : -1 ) );
        } else {
            // The panel is not the currently active one,
            // so go ahead and delete it now.

            plugin._deletePanel( widget );
        }
    },

    _deletePanel: function( widget ) {
        var plugin = this,
            panel = widget._dppPanelToDelete;

        if ( panel ) {
            $( panel ).remove();
            plugin._resetActiveTracking( widget );
            widget._dppPanelToDelete = null;
            widget.trigger( 'wp-remove-panel', { panel: panel } );
        }
    }
};


// backgroundChangePlugin
//
// A plugin for animating color and image/element backgrounds behind
// a set of swipe panels.
//
// COLOR CHANGES
//
// To animate background color changes, leave the background
// of the panels transparent. The plugin will by default search
// for a common parent for the panels, which by default is
// chosen by the constructor option parentSelector, which has
// a initialn value of '.wp-swipe-panel-group'. Users can override
// this value with their own filter selector, or can pass an
// element directly via the parentElement constructor option.
// This parent element will provide the color background for
// the panels.
//
// Next, place a @data-background-color attribute on each panel
// element to indicate what color to use for that panel. The format
// of the attribute can be either of the following:
//
//     <div data-background-color="rgba(255,0,255,1)">
//
//       - or -
//
//     <div data-background-color="255,0,255,1">
//
// If only a few of the panels in the group will have a unique
// color, you can specify a default color to use for all others
// on the common parent. When transitioning to a panel with no
// data-background-color attribute specified, the plugin will
// use any color value specified on the common parent as the
// value to transition to.
//
//
// IMAGE/ELEMENT CHANGES
//
// The plugin can be used to animate a fade in/out of an image
// or element as the panel transitions in and out of view. To
// specify what element to fade, specify an @data-background
// attribute on the panel element. The value of the attribute
// should be a CSS selector that uniquely identifies an element
// in the document.
//
//     <div data-background="#photo-background-1">
//
// Note that this means that the plugin can control the fade of
// an element that is completely outside of the panel. Most folks
// will use it to transition between image backgrounds of panels,
// hence the name of the attribute, but you can also use it to
// show/hide elements within a slideshow panel that may be beside
// the set of swipe panels.
//
//
// BACKGROUND IMAGE PANNING
//
// The plugin is capable of adjusting the position of a background
// image on the common parent. This is commonly used to provide a
// pan/parallax effect as the user swipes through the panels. To
// use this, simply make the background of all of the panels transparent
// and then place a background image on the common parent specified
// by the parentSelector or parentElement constructor options.
//
// Specify the position the background image should be in when
// each panel is shown by placing an @data-image-position attribute
// on each panel element. The value should be two comma separated
// numbers that represent the x and y value of the position.
//
//    <div data-image-position="50,100">
//
// Note that the number values values indicate pixels.
//

WebPro.Widget.SwipePanelGroup.backgroundChangePlugin = {
    defaultOptions: {
        parentSelector: '.wp-swipe-panel-group',
        parentElement: null
    },

    initialize: function( widget, options ) {
        var plugin = this;

        // Add our default options to the options
        // object that was passed to us.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Listen for the attach-behavior notification
        // from the widget so we know when to attach our
        // plugin behaviors.

        widget.bind( 'attach-behavior', function() {
                plugin._attachBehavior( widget );
            });
    },

    _attachBehavior: function( widget ) {
        // The 'this' variable in this method is the actual
        // plugin. Use a variable called plugin throughout
        // this method to avoid confusion with the 'this'
        // variable in callback functions defined in this
        // method, which in most cases will be a reference
        // to some DOM node.

        var plugin = this,
            options = widget.options;

        // Find the ancestor element whose background
        // color will be changed.

        if ( options.parentElement ) {
            widget._$bccpParent = $( options.parentElement );
        } else {
            widget._$bccpParent = widget.$element.closest( options.parentSelector );
        }

        // Now iterate over the panels of the widget, as well as the
        // parent calculated above, and extract any background plugin
        // specific attributes on the elements theselves.

        widget.$element.add( widget._$bccpParent ).each( function() {
                var $this = $( this );

                // Look for background color morphing attributes.

                var rgba = $this.data( 'backgroundColor' );
                if ( rgba ) {
                    $this.data( 'color-array', plugin._colorStringToRGBA( rgba ) );
                }

                // Look for background image/element position shifting attributes.

                var selector = $this.data( 'background' );
                if ( selector ) {
                    $this.data( 'background', $( selector ) );
                }

                // Look for background image morphing attributes.

                var pos = $this.data( 'imagePosition' );
                if ( pos ) {
                    $this.data( 'position-array', plugin._integerListToArray( pos ) );
                }
            });

        // Override the widget's _handleDragStart() method
        // so we can tell when a drag has started.

        var _handleDragStart = widget._handleDragStart;

        widget._handleDragStart = function( dx, dy ) {
                widget._bccpDragging = true;
                widget._bccpLastDestIndex = widget.activeIndex;
                return _handleDragStart.apply( widget, arguments );
            };

        // Override the widget's _handleDragStop() method
        // so we can tell when a drag has ended.

        var _handleDragStop = widget._handleDragStop;

        widget._handleDragStop = function( dx, dy ) {
                var result = _handleDragStop.apply( widget, arguments );
                widget._bccpDragging = true;
                return result;
            };

        // Override the widget's showPanel() method so
        // we can tell when the current panel is changed
        // programatically.

        var _showPanel = widget.showPanel;

        widget.showPanel = function( indexOrEle ) {
              var result = _showPanel.apply( widget, arguments );
              plugin._handlePositionChange( widget, widget.activeIndex, widget._snapIndex, 1 );
              return result;
            };

        // Override the widget's _setViewPosition() method
        // so we can update any background properties this
        // plugin manages as the user drags their finger
        // onscreen during the swipe.

        var _setViewPosition = widget._setViewPosition;

        widget._setViewPosition = function( position ) {
                // Call the original version of this method so that
                // it can do the actual view positioning.

                var result = _setViewPosition.apply( widget, arguments ),

                    // Cache some values in a local variable
                    // since we'll be referring to them several
                    // times below.

                    numPanels = widget.$element.length,
                    lastIndex = numPanels - 1,

                    // Cache the index of the active panel. The destIndex
                    // will be the index of the panel the user is swiping
                    // into view. Initially they are the same index to
                    // indicate no swipe has happened yet.

                    activeIndex = widget.activeIndex,
                    destIndex = activeIndex,

                    // The percentage variable represents the percentage
                    // of the destination panel that is visible. Initially
                    // the value is zero, which basically means the destination
                    // panel is not visible at all, since the active panel
                    // is fully visible.
                    
                    percentage = 0;

                // If position is non-zero, it means the user has initiated a swipe.
                // If we're not trying to swipe past the first/last panel, calculate
                // what the destination panel is and its percentage of visibility.

                if ( position && ( activeIndex || position < 0 ) && ( activeIndex != lastIndex || position > 0 ) ) {
                    var length = widget._isHorizontal ? widget.$clip.width() : widget.$clip.height();

                    // During a drag the _snapIndex is typically set to the
                    // activeIndex. If they differ, this method may be getting
                    // called after the user released their finger. Make sure
                    // we set the destIndex to whatever we are going to snap to.
                    // If activeIndex and _snapIndex are the same, calculate the
                    // destIndex manually based on the direction of the specified
                    // position.

                    if ( activeIndex != widget._snapIndex ) {
                        destIndex = widget._snapIndex;
                    } else {
                        destIndex = position < 0  ? activeIndex + 1 : activeIndex - 1;
                    }

                    // The percentage is calculated by simply getting the absolute
                    // value of the active panels' position over the length of the
                    // clip view, in the dimension the SwipePanelGroup travels.

                    percentage = Math.abs( position ) / length;
                }

                // Now that we've calculated the destination panel and its
                // percentage, call _handlePositionChange to apply any transitional
                // behaviors

                plugin._handlePositionChange( widget, widget.activeIndex, destIndex, percentage );

                return result;
            };
    },

    _handlePositionChange: function( widget, activeIndex, destIndex, percentage ) {
        var numPanels = widget.$element.length,
            lastIndex = numPanels - 1,
            $active = widget.$element.eq( activeIndex ),
            aColor = $active.data( 'color-array' ) || widget._$bccpParent.data( 'color-array' ),
            aPosition = $active.data( 'position-array' );

        // If activeIndex != destIndex, we are transitioning
        // towards a different panel.

        if ( activeIndex != destIndex ) {
            var $dest = widget.$element.eq( destIndex ),
                dColor = $dest.data( 'color-array' ) || widget._$bccpParent.data( 'color-array' ),
                dPosition = $dest.data( 'position-array' );

            // Morph between the active and dest panel background colors.

            dColor = dColor || aColor || [0,0,0,0];

            if ( dColor ) {
                aColor = aColor || dColor || [0,0,0,0];

                widget._$bccpParent.css( 'backgroundColor', 'rgba('
                    + Math.round( aColor[ 0 ] + ( ( dColor[ 0 ] - aColor[ 0 ] ) * percentage ) ) + ','
                    + Math.round( aColor[ 1 ] + ( ( dColor[ 1 ] - aColor[ 1 ] ) * percentage ) ) + ','
                    + Math.round( aColor[ 2 ] + ( ( dColor[ 2 ] - aColor[ 2 ] ) * percentage ) ) + ','
                    + Math.round( aColor[ 3 ] + ( ( dColor[ 3 ] - aColor[ 3 ] ) * percentage ) ) + ')');
            }

            // If the active and dest panels share an image background,
            // apply any position shift that is specified.

            if ( dPosition ) {
                widget._$bccpParent.css( 'backgroundPosition',
                    + Math.round( aPosition[ 0 ] + ( ( dPosition[ 0 ] - aPosition[ 0 ] ) * percentage ) ) + 'px '
                    + Math.round( aPosition[ 1 ] + ( ( dPosition[ 1 ] - aPosition[ 1 ] ) * percentage ) ) + 'px' );
            }

            // If the active and/or destination panels have specified
            // background elements, fade them in/out now.

            this._setBackgroundOpacity( widget, destIndex, percentage );
            this._setBackgroundOpacity( widget, activeIndex, 1 - percentage );

            // If the user is dragging and has switched drag direction
            // the destination panel we are manipulating may have changed.
            // If this is the case, make sure the previous destination panel
            // we were manipulating gets its background image hidden.

            if ( widget._bccpDragging
                    && activeIndex != widget._bccpLastDestIndex
                    && destIndex != widget._bccpLastDestIndex ) {
                this._setBackgroundOpacity( widget, widget._bccpLastDestIndex, 0 );
            }

            widget._bccpLastDestIndex = destIndex;
        } else {
            // We're snapping back to the original active panel.
            // If specified, morph the backgorund-color back to the active panels
            // background color.

            if ( aColor ) {
                widget._$bccpParent.css( 'backgroundColor', 'rgba('
                    + aColor[ 0 ] + ','
                    + aColor[ 1 ] + ','
                    + aColor[ 2 ] + ','
                    + aColor[ 3 ] + ')');
            }

            // If specified, reset the position of the shared background image
            // to where the active panel thinks it should be.

            if ( aPosition ) {
                widget._$bccpParent.css( 'backgroundPosition', + aPosition[ 0 ] + 'px ' + aPosition[ 1 ] + 'px' );
            }

            // If we're snapping back to the active panel, make sure
            // its background image/element is fully visible.

            this._setBackgroundOpacity( widget, activeIndex, 1 );

            // Make sure any destination panel we were previously
            // managing gets hidden.

            if ( widget._bccpDragging && activeIndex != widget._bccpLastDestIndex ) {
                this._setBackgroundOpacity( widget, widget._bccpLastDestIndex, 0 );
            }

            widget._bccpLastDestIndex = activeIndex;
        }
    },

    // Check if the panel at the given index has an associated
    // background image/element. If so, set its opacity to the
    // value specified.

    _setBackgroundOpacity: function( widget, index, opacity ) {
        var $ele = widget.$element.eq( index ),
            $bgEle = $ele.data( 'background' );

        if ( $bgEle ) {
            $bgEle.css( 'opacity', opacity );
        }
    },

    // Turn a string of comma separated integers
    // into an array of numbers.

    _integerListToArray: function( str ) {
        var arr = [];
        if ( str ) {
            arr = str.split( /\s*,\s*/g );
            for ( var i = 0; i < arr.length; i++ ) {
                arr[ i ] = parseInt( arr[ i ], 10 );
            }
        }
        return arr;
    },

    // Turn a string of RGBA values into an array
    // of color components.

    _colorStringToRGBA: function( str ) {
        // XXX: Note this isn't a very robust color string
        //      conversion. It currently only supports
        //      'rgba(r,g,b,a)' and 'r,g,b,a' formatted strings.

        return this._integerListToArray( ( str || '0,0,0,0' ).replace(/rgba?\(|\s+|\)/g, '') );
    }
};

})( jQuery, WebPro, window, document );
