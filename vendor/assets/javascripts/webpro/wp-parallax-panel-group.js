/**
* wp-parallax-panel-group.js - version 0.1 - WebPro Release 0.1
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

var parallaxClassDict = {
        'parallax-1':  {
                h: .2,
                v: 0 
            },
        'parallax-2':  {
                h: .4,
                v: 0
            },
        'parallax-3':  {
                h: .8,
                v: 0
            },
        'parallax-4':  {
                h: 1.6,
                v: 0
            },
        'parallax-5':  {
                h: 3.2,
                v: 0
            },
        'parallax-v-1':  {
                h: 0, 
                v: .2
            },
        'parallax-v-2':  {
                h: 0,
                v: .4
            },
        'parallax-v-3':  {
                h: 0,
                v: .8
            },
        'parallax-v-4':  {
                h: 0,
                v: 1.6
            },
        'parallax-v-5':  {
                h: 0,
                v: 3.2
            }
    };

WebPro.widget( 'Widget.ParallaxPanelGroup', WebPro.Widget.PanelGroup, {
    _widgetName: 'parallax-panel-group',

    defaultOptions: {
            defaultIndex:  0,
            direction:     'horizontal', // 'horizontal' || 'vertical'
            snapDuration:  1000, // msecs
            animateClass:  'wp-animate',
            widgetClass:   'wp-parallax-panel-group',
            viewClass:     'wp-parallax-panel-group-view',
            panelClass:    'wp-parallax-panel-group-panel',
            classDict:     null
        },

    _setUp: function( element, options ) {
        var options = $.extend( {}, this.defaultOptions, options );

        // Merge any class dictionary the caller gave us with our defaults.

        options.classDict = $.extend( {}, parallaxClassDict, options.classDict );

        // The first arg of the PanelGroup widget is actually a selector or collection
        // of panel elements. In our case, our first arg is actually the top-level element
        // of the widget which serves as the clip for a scrollview.

        this.$clip = $( element );

        // Find the panels for our widget and then pass them on to our base class constructor.

        var clip = this.$clip[ 0 ],
            $panels = WebPro.scopedFind( clip, '.' + options.panelClass, options.widgetClass, clip );

        // Find the view class we'll use to move the panels around on screen.

        this.$view = WebPro.scopedFind( clip, '.' + options.viewClass, options.widgetClass, clip );

        // Our base class will trigger a showPanel before we can attach
        // our behavior, so we need a means of blocking this initial
        // showPanel call until we're ready.

        this._blockShowPanel = true;

        return WebPro.Widget.ParallaxPanelGroup.prototype._super.prototype._setUp.call( this, $panels, options );
    },

    _attachBehavior: function() {
        WebPro.Widget.ParallaxPanelGroup.prototype._super.prototype._attachBehavior.apply( this, arguments );

        var widget = this,
            $panels = this.$element,
            options = this.options;

        this._isHorizontal = this.options.direction === 'horizontal';
        this.items = [];
        this._animScrollStartOffset = 0;
        this._animScrollDistance = 0;
        this._blockShowPanel = false;

        this._scrollProp = this._isHorizontal ? 'scrollLeft' : 'scrollTop';
        this._offsetProp = this._isHorizontal ? 'offsetLeft' : 'offsetTop';
        this._panelOffsetProp = this._isHorizontal ? 'left' : 'top';

        this._animator = new WebPro.Animator(function( easingConst ) {
                                    widget.$clip[ 0 ][ widget._scrollProp ] = widget._animScrollStartOffset + ( easingConst * widget._animScrollDistance );
                                },
                                {
                                    duration: 1000,
                                    easing: 'ease-out'
                                });

        $panels.each( function() {

                var panel = this,
                    $panel = $( panel ),
                    panelOffset = { left: panel.offsetLeft, top: panel.offsetTop },
                    dict = options.classDict,
                    className;

                for ( className in dict ) {
                    var data = dict[ className ],
                        $items = WebPro.scopedFind( panel, '.' + className, options.panelClass, panel );
                    $items.each(function() {
                            widget.items.push({
                                    ele: this,
                                    classData: data,
                                    panelOffset: panelOffset
                                });

                            widget._updateElementParallaxPosition( this, 0, panelOffset[ widget._panelOffsetProp ], data);
                        });
                }
            });

        this.$clip
            .on( 'scroll', function( e ) {
                    widget._handleScroll();
                })
            .on( 'scroll-start', function( e ) {
                    widget._handleScrollStart();
                })
            .on( 'momentum-stop', function( e ) {
                    widget._handleMomentumStop();
                });
    },

    _ready: function() {
        this.showPanel( this.options.defaultIndex );
    },

    _handleScroll: function() {
        var widget = this,
            scrollEle = this.$clip[ 0 ],
            scrollOffset = scrollEle[ this._scrollProp ],
            items = this.items,
            numItems = items.length;

        for ( var i = 0; i < numItems; i++ ) {
            var item = items[ i ];
            widget._updateElementParallaxPosition( item.ele, scrollOffset, item.panelOffset[ this._panelOffsetProp ], item.classData );
        }
    },

    _handleScrollStart: function() {
        this._animator.stop();
    },

    _handleMomentumStop: function() {
        this._snapToClosestPanel();
    },

    _snapToClosestPanel: function() {
        var $panels = this.$element,
            numPanels = $panels.length,
            scrollEle = this.$clip[ 0 ],
            offsetProp = this._offsetProp,
            scrollOffset = scrollEle[ this._scrollProp ],
            panelIndex = 0,
            scrollToOffset = 0,
            scrollToDist = -1;

        for ( var i = 0; i <  numPanels; i++ ) {
            var panel = $panels[ i ],
                offset = panel[ offsetProp ],
                dist = offset - scrollOffset;

            if ( Math.abs( dist ) < Math.abs( scrollToDist ) || scrollToDist === -1 ) {
                scrollToDist = dist;
                panelIndex = i;
            }
        }

        this.showPanel( panelIndex );
    },

    showPanel: function( indexOrEle ) {
        if ( this._blockShowPanel ) {
            return;
        }

        var panelEle = ( typeof indexOrEle === 'number' ) ?  this._getElement( indexOrEle ) : indexOrEle;
    
        if ( panelEle && panelEle !== this.activeElement ) {
            var oldOffset = this.$clip[ 0 ][ this._scrollProp ],
                newOffset = panelEle[ this._offsetProp ];

            this._animator.stop();
            this._animScrollStartOffset = oldOffset;
            this._animScrollDistance = newOffset - oldOffset;
            this._animator.start();
        }
    },

    _updateElementParallaxPosition: function( ele, scrollOffset, panelOffset, data ) {
        var dist = panelOffset - scrollOffset,
            tx = dist * data.h,
            ty = dist * data.v;

        WebPro.setElementTransform( ele, 'translate3d(' + tx + 'px,' + ty + 'px,0)' );
    }
});

WebPro.Widget.ParallaxPanelGroup.parallaxClassDict = parallaxClassDict;

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpParallaxPanelGroup', WebPro.Widget.ParallaxPanelGroup );

})( jQuery, WebPro, window, document );
