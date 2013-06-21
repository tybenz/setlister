/**
* wp-panel-group.js - version 0.1 - WebPro Release 0.1
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

WebPro.widget( "Widget.PanelGroup", WebPro.Widget, {
    _widgetName: "panel-group",

    defaultOptions: {
        defaultIndex: 0,
        panelClass: "wp-panel",
        activeClass: "wp-panel-active",
        toggleStateEnabled: false,
        tabGroups: null
    },

    _setUp: function() {
        var self = this;

        this.tabGroups = [];
        this._tabCallback = function( e, data) {
            self._handleTabSelect( e, data );
        };

        this.showLock = 0;
        this.tabDriver = null;

        return WebPro.Widget.PanelGroup.prototype._super.prototype._setUp.apply( this, arguments );
    },

    _attachBehavior: function() {
        var self = this;

        this.activeElement = null;
        this.activeIndex = -1;

        this.$element.addClass( this.options.panelClass );

        // If a defaultIndex is specified, check the
        // corresponding button.

        var defaultIndex = this.options.defaultIndex;
        if ( typeof defaultIndex === "number" && defaultIndex >= 0 ) {
            this.showPanel( defaultIndex );
        }

        this.addTabGroup( this.options.tabGroups );
    },

    _getElementIndex: function( ele ) {
        return ele ? $.inArray( ele, this.$element.get() ) : -1;
    },

    _getElementByIndex: function( index ) {
        return this.$element.eq( index )[ 0 ];
    },
    
    _getElement: function( indexOrEle ) {
        return ( typeof indexOrEle === "number" ) ? this._getElementByIndex( indexOrEle ) : indexOrEle;
    },

    showPanel: function( indexOrEle ) {
        if ( !this.showLock ) {
            ++this.showLock;

            var ele = this._getElement( indexOrEle ),
                activeEle = this.activeElement,
                activeClass = this.options.activeClass;
            if ( ele ) {
                if ( ele !== activeEle ) {
                    var data = { panel: ele, panelIndex: this._getElementIndex( ele ) };

                    this.trigger( "wp-panel-before-show", data );

                    if ( activeEle ) {
                        this.hidePanel( activeEle );
                    }
                    $( ele ).addClass( activeClass );
                    this.activeElement = ele;
                    this.activeIndex = this._getElementIndex( ele );
    
                    var groups = this.tabGroups;
                    for ( var i = 0; i < groups.length; i++ ) {
                        var tg = groups[ i ];
                        if ( tg !== this.tabDriver ) {
                            tg.selectTab( this.activeIndex );
                        }
                    }

                    this.trigger( "wp-panel-show", data );
                } else if ( this.options.toggleStateEnabled ) {
                    this.hidePanel( ele );
                }
            }

            --this.showLock;
        }
    },

    hidePanel: function( indexOrEle ) {
        var ele = ( typeof indexOrEle === "number" ) ? this.$element.eq( indexOrEle )[ 0 ] : indexOrEle;
        if ( ele ) {
            var data = { panel: ele, panelIndex: this._getElementIndex( ele ) };

            this.trigger( "wp-panel-before-hide", data );

            $( ele ).removeClass( this.options.activeClass );
            if ( ele === this.activeElement ) {
                this.activeElement = null;
                this.activeIndex = -1;
            }

            this.trigger( "wp-panel-hide", data );
        }
    },

    _handleTabSelect: function( e, data ) {
        if ( !this.showLock ) {
            this.tabDriver = e.target;
            this.showPanel( data.tabIndex );
            this.tabDriver = null;
        }
    },

    addTabGroup: function( tabGroup ) {
        if ( tabGroup ) {
            tabGroup = WebPro.ensureArray( tabGroup );
            var len = tabGroup.length;
            for ( var i = 0; i < len; i++ ) {
                var tg = tabGroup[ i ];
                if ( $.inArray( this.tabGroups, tg ) === -1 ) {
                    this.tabGroups.push( tg );
                    tg.selectTab( this.activeIndex );
                    tg.bind( "wp-tab-select", this._tabCallback );
                }
            }
        }
    },

    removeTabGroup: function( tabGroup ) {
        tabGroup = WebPro.ensureArray( tabGroup );

        var len = tabGroup.length;

        for ( var i = 0; i < len; i++ ) {
            var tg = tabGroup[ i ]
                sets = this.tabGroups,
                loc = $.inArray( sets, tg );
            if ( loc !== -1 ) {
                sets.splice( loc, 1 );
            }
        }
    }
});


// Add a convenience method to the jQuery Collection prototype,
// that applies our RadioGroup behavior to all the elements in the collection.

WebPro.addMultiElementWidgetConstructorAsjQueryPlugin( 'wpPanelGroup', WebPro.Widget.PanelGroup );

})( jQuery, WebPro, window, document );

