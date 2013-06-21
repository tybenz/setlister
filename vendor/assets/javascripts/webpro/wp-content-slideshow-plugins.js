/**
* wp-content-slideshow-plugins.js - version 0.1 - WebPro Release 0.1
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


//////////////////// Fading Transition Plugin ////////////////////


WebPro.Widget.ContentSlideShow.fadingTransitionPlugin = {
    defaultOptions: {
        transitionDuration: 500
    },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Hook into the point in time immediately after
        // the slideshow attaches it's behaviors, so
        // we can attach our own behaviors.

        slideshow.bind( "attach-behavior", function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( slideshow ) {
        var plugin = this,
            slides = slideshow.slides,
            slideEles = slides.$element,
            activeIndex = slides.activeIndex;

        // Attach some listeners to the slideshow's internal
        // panel-group widget that manages which slide is showing.
        // We want to know whenever it hides or shows a slide so
        // we can fire off a transition for them.

        slides
            .bind( "wp-panel-show", function( e, data ) {
                plugin.handleShowSlide( slideshow, data );
            })
            .bind( "wp-panel-hide", function( e, data ) {
                plugin.handleHideSlide( slideshow, data );
            });

        // Make sure all slides, except the initial one,
        //      start off hidden.

        for ( var i = 0; i < slideEles.length; i++ ) {
            if ( i !== activeIndex ) {
                slideEles[ i ].style.display = "none";
            }
        }
    },

    handleShowSlide: function( slideshow, slideInfo ) {
        $( slideInfo.panel )

            // Force any animation running for the given slide
            // to jump to its end. This allows any callbacks
            // registered on the animation to fire.

            .stop( false, true )

            // Kick off a fade-in animation.

            .fadeIn( slideshow.options.transitionDuration );
    },

    handleHideSlide: function( slideshow, slideInfo ) {
        $( slideInfo.panel )

            // Force any animation running for the given slide
            // to jump to its end. This allows any callbacks
            // registered on the animation to fire.

            .stop( false, true )

            // Kick off a fade-out animation.

            .fadeOut( slideshow.options.transitionDuration );
    }
};


//////////////////// Filmstrip Transition Plugin ////////////////////


WebPro.Widget.ContentSlideShow.filmstripTransitionPlugin = {
    defaultOptions: {
        transitionDuration: 500,
        transitionStyle:            "horizontal" // "horizontal" || "vertical"
    },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Hook into the point in time immediately after
        // the slideshow attaches it's behaviors, so
        // we can attach our own behaviors.

        slideshow.bind( "attach-behavior", function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( slideshow ) {
        var plugin = this,
            opts = slideshow.options,
            isHorz = ( opts.transitionStyle === "horizontal" ),
            slides = slideshow.slides,
            $slideEles = slides.$element,
            $clip = slideshow._findWidgetElements( "." + opts.clipClassName ),
            $view = slideshow._findWidgetElements( "." + opts.viewClassName ),
            clipWidth = $clip.width(),
            clipHeight = $clip.height(),
            offsetSize = isHorz ? clipWidth : clipHeight,
            offset = 0,
            viewProps = {
                    top: "0",
                    left: "0"
                };

        // We position the view relative to the clip so make sure
        // the clip has a positioning context on it.

        if ( $clip.css( "position" ) !== "absolute" ) {
            $clip.css( "position", "relative" );
        }

        // Make sure the view can be positioned.

        if ( $view.css( "position" ) !== "absolute" ) {
            viewProps[ "position" ] = "relative";
        }

        slideshow._fstp$Clip = $clip;
        slideshow._fstp$View = $view;
        slideshow._fstpStyleProp = isHorz ? "left" : "top";
        slideshow._fstpStylePropZero = isHorz ? "top" : "left";

        // Attach some listeners to the slideshow's internal
        // panel-group widget that manages which slide is showing.
        // We want to know whenever it hides or shows a slide so
        // we can fire off a transition for them.

        slides
            .bind( "wp-panel-show", function( e, data ) {
                plugin._goToSlide( slideshow, data.panel );
            });

        // We need to know whenever a previous/next request is
        // made so that we can perform a wrap-around transition
        // if necessary.

        slideshow._fstpRequestType = null;

        slideshow
            .bind( "wp-slideshow-before-previous wp-slideshow-before-next", function( e ) {
                slideshow._fstpRequestType = e.type.replace( /.*-/, "" );
                slideshow._fstpOldActiveIndex = slideshow.slides.activeIndex;
            })
            .bind( "wp-slideshow-previous wp-slideshow-next", function( e ) {
                slideshow._fstpRequestType = null;
                slideshow._fstpOldActiveIndex = -1;
            });

        // Position each slide within the slides-container
        // to give the appearance of a film-strip.

        var prop = slideshow._fstpStyleProp,
            propZero = slideshow._fstpStylePropZero;

        for ( var i = 0; i < $slideEles.length; i++ ) {
            var style = $slideEles[ i ].style;

            style[ propZero ] =       "0";
            style[ prop ]             =       offset + "px";
            style[ "margin" ] =       "0";
            style[ "position" ] = "absolute";

            offset += offsetSize;
        }

        viewProps[ isHorz ? "width"      : "height" ] = offset + "px";
        viewProps[ isHorz ? "height" : "width"      ] = ( isHorz ? clipHeight : clipWidth ) + "px";

        // If there is no active element, position the view offscreen.

        if ( !slides.activeElement ) {
            viewProps[ prop ] = ( isHorz ? clipWidth : clipHeight ) + "px";
            viewProps[ propZero ] = "0";
        }

        // We need to make sure that the view has overflow:visible to accomodate
        // the wrap-around scenario where we temporarily place a slide before the first
        // or after the last slide.

        viewProps[ "overflow" ] = "visible";

        $view.css( viewProps );
        
        plugin._goToSlide( slideshow, slides.activeElement );
    },

    _goToSlide: function( slideshow, slideEle ) {
        if ( slideshow ) {
            var $slide = $( slideEle),
                $view = slideshow._fstp$View,
                prop = slideshow._fstpStyleProp,
                offsetEdge = ( prop === "left" ) ? "offsetLeft" : "offsetTop",
                offsetDimension =      ( prop === "left" ) ? "offsetWidth" : "offsetHeight",
                viewOffset = slideEle ? -slideEle[ offsetEdge ] : slideshow._fstp$Clip[ 0 ][ offsetDimension ],
                props = {};
    
            props[ prop ] = viewOffset + "px";

            // Check to see if we should do a wrap-around animation.

            var reqType = slideshow._fstpRequestType,
                oldActiveIndex = slideshow._fstpOldActiveIndex;

            if ( reqType && oldActiveIndex !== -1 ) {
                var activeIndex = slideshow.slides.activeIndex,
                    lastIndex = slideshow.slides.$element.length - 1;

                if ( activeIndex !== oldActiveIndex ) {
                    var posChange = 0;

                    // Verify the oldActiveIndex and current activeIndex
                    // against the request type, just in case there is some
                    // slide randomizer plugin in effect. We really only want
                    // to wrap-around when going from start-to-end or end-to-start.

                    if ( reqType === "previous" && oldActiveIndex === 0 && activeIndex === lastIndex ) {
                        // Calculate the offset that positions the last slide before the first slide.

                        posChange = -slideEle[ offsetDimension ];
                    } else if ( reqType === "next" && oldActiveIndex === lastIndex && activeIndex === 0 ) {
                        // Calculate the offset that positions the 1st slide after the last slide.

                        var prevSlide = slideshow.slides.$element[ oldActiveIndex ];
                        posChange = prevSlide[ offsetEdge ] + prevSlide[ offsetDimension ];
                    }

                    if ( posChange ) {
                        // Update our animation props object so that we animate to
                        // the new wrap-around position for the current slide.

                        props[ prop ] = -posChange + "px";

                        // Move the current slide now. We will reset it back to its original
                        // position after our transition animation.

                        $slide.css( prop, posChange + "px" );
                    }
                }
            }

            $view
    
                // Force any animation running for the given slide
                // to jump to its end. This allows any callbacks
                // registered on the animation to fire.
    
                .stop( false, true )
    
                // Kick off an animation that scrolls the filmstrip.
    
                .animate( props, slideshow.options.transitionDuration, function() {
                    if ( posChange ) {
                        // We just completed a wrap-around animation, move the slide we
                        // just transitioned to, back to its original position.

                        $slide.css( prop, -viewOffset + "px" );

                        // Now re-position the view so that it is displaying the
                        // current slide in its new position.

                        $view.css( prop, viewOffset + "px" );
                    }
                });
        }
    }
};


//////////////////// Image Include Plugin ////////////////////


WebPro.Widget.ContentSlideShow.slideImageIncludePlugin = {
    defaultOptions: {
            imageIncludeClassName: "wp-slideshow-slide-image-include",
            slideLoadingClassName: "wp-slideshow-slide-loading"
        },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // Resolve the options for this widget. The idea here is that we only want to override props
        // that aren't already specified in the options we were      given. We then write back the merged
        // results into the original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Create an image loader and store it on the slideshow.

        slideshow._cssilLoader = new WebPro.ImageLoader();

        // Listen for the slideshow's attach-behavior notification so
        // we can hook in our own behaviors.

        slideshow.bind( "attach-behavior", function() {
            plugin._attachBehavior( slideshow );
        });
    },

    _attachBehavior: function( slideshow ) {
        var plugin = this,
            loader = slideshow._cssilLoader,

            // Find the slides within the slideshow.

            $slides = slideshow._findWidgetElements( "." + slideshow.options.slideClassName ),
            count = $slides.length,

            // Find the image-include elements within the slideshow.

            imageIncludeSelector = "." + slideshow.options.imageIncludeClassName,

            // We'll place this class name on every slide so we can show
            // a loading indicator.

            slideLoadingClassName = slideshow.options.slideLoadingClassName,

            callback = function( src, w, h, data ) { plugin._handleImageLoad( slideshow, src, w, h, data ); };

        for ( var i = 0; i < count; i++ ) {
            var $slide = $slides.eq( i ),
                $ele = $slide.find( imageIncludeSelector );
                ele = $ele[ 0 ];

            if ( ele ) {
                // Grab the href off the link. If this isn't a link then check
                // for a data-src attribute.

                var src = ele.href || $ele.data( "src" );
                if ( src ) {
        
                        // Stuff any include data attribute values into the
                        // data object we are going to pass to the image-loader.
                        // When the image actually loads, we'll use this data to
                        // set attributes on the image element we create to replace
                        // the actual include element.
        
                    var data = {
                                id: $ele.data( "id" ) || "",
                                width: $ele.data( "width" ),
                                height: $ele.data( "height" ),
                                $ele: $ele,
                                $slide: $slide
                            };
    
                    // Hide the include link.
    
                    ele.style.visibility = "hidden";
    
                    // Add a request for this image to our image-loader.
        
                    loader.add( src, { callback: callback, data: data } );

                    // Mark the slide as loading.

                    $slide.addClass( slideLoadingClassName );
                }
            }
        }

        // The slideshow is all done initializing, so kick-off
        // any image-include requests.

        slideshow._cssilLoader.start();
    },

    _handleImageLoad: function( slideshow, src, w, h, data ) {
        data.$ele.replaceWith('<img id="' + ( data.id || '' ) + '" src="' + src + '" width="' + ( data.width || w ) + '" height="' + ( data.height || h ) + '">');
        data.$slide.removeClass( slideshow.options.slideLoadingClassName );
    }
};


//////////////////// Play Once Plugin ////////////////////


WebPro.Widget.ContentSlideShow.playOncePlugin = {
    defaultOptions: {
            playOnce: false
        },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // When the slideshow play-mode is started, we track
        // the number of slides that are within the slideshow.

        slideshow._plpNumSlides = 0;

        // When the slideshow play-mode is started, we start
        // tracking the number of slides that are shown. Once
        // our count is equivalent to the number of slides,
        // play-mode is stopped. We do it this way because we
        // can't just rely on a sequential visit to each slide
        // due to the use of the play-shuffle plugin.

        slideshow._plpSlideCount = 0;

        // Listen for the slideshow's attach-behavior notification so
        // we can hook in our own behaviors.

        slideshow.bind( "attach-behavior", function() {
            plugin._attachBehavior( slideshow );
        });
    },

    _attachBehavior: function( slideshow ) {
        // Boolean value that determines whether or not our play-count
        // is enabled or not.

        var enabled = false;

        // Attach a play handler so that we can turn on play-count tracking.

        slideshow.bind( 'wp-slideshow-play', function( e, data ) {
            // If the slideshow doesn't loop forever, then
            // go ahead and turn on our play-count tracking.

            if ( slideshow.options.playOnce ) {
                // Initialize the slidecount.
        
                slideshow._plpSlideCount = 1;
        
                // Cache the number of slides we need to see
                // before we call stop.
        
                slideshow._plpNumSlides = slideshow.slides.$element.length;
    
                // Turn on our play-count tracking.
    
                enabled = true;
            }
        });

        // Attach a stop handler so that we can turn off play-count tracking.

        slideshow.bind( 'wp-slideshow-stop', function( e, data ) {
            // Turn off our play-count tracking.

            enabled = false;
        });

        // Attach a show handler on the slides so that we can count the
        // number of slides that are shown during play-mode.

        slideshow.slides.bind( 'wp-panel-show',function() {
            // We stop the slideshow when the play-count feature is enabled,and
            // our play-count reaches the number of slides within the slideshow.
            // We also stop the slideshow if a slide is told to show and it was
            // *NOT* triggered by the slideshow timer. This would indicate that
            // a user gesture caused a change in the current slide being shown.s

            if ( enabled && ( !slideshow._ssTimerTriggered || ++slideshow._plpSlideCount >= slideshow._plpNumSlides ) ) {
                enabled = false;
                slideshow.stop();
            }
        });
    }
};

//////////////////// Shuffle Play Plugin ////////////////////


WebPro.Widget.ContentSlideShow.shufflePlayPlugin = {
    defaultOptions: {
            randomDefaultIndex: true
        },

    initialize: function( slideshow, options ) {
        var plugin = this;


        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // This is an array that we use to randomize slide indexes.
        // We use an array as opposed to calulating a random index on
        // the fly when next() is called, to make sure that we actually
        // display *every* slide before we cycle.

        slideshow._shuffleArray = [];

        // After we randomize the slide indexes, we create a quick
        // lookup dictionary that tells us what the next shuffle
        // order index should be for any slide.

        slideshow._shuffleNextDict = {};

        // We override the slideshow's _next() method so that we can
        // randomize the next slide when the slideshow is playing. We
        // tuck away the original _next() method so that we can call it
        // if we aren't in slideshow play mode.

        slideshow._realNext = slideshow._next;
        slideshow._next = function() { plugin._handleNext( slideshow ); };

        // We keep track of the number of slides that have been played
        // in slideshow mode. When this count reaches the slide count,
        // we re-shuffle again.

        slideshow._shufflePlayCount = 0;

        // Every time the slideshow is played, we want to reshuffle the
        // slide play order.

        slideshow.bind( 'wp-slideshow-before-play', function( e, data ) {
            return plugin._reshuffle( slideshow );
        });

        // We want to generate a random default slide index if the user
        // has not specified a default index. The actual index will be
        // generated just before the behavior attachment phase.

        if ( options.randomDefaultIndex && typeof options.defaultIndex === 'undefined' ) {
            slideshow.bind( 'before-attach-behavior', function( e ) {
                // Because we are being invoked before the the slideshow widget's
                // attachBehavior() method, we have to manually search for the slide
                // elements ourselves.

                var numSlides = slideshow._findWidgetElements( "." + slideshow.options.slideClassName ).length,

                    // Generate a random integer between 0 and the last slide index.

                    i = Math.floor( Math.random() * numSlides );

                // Set the default index to the random index we just calculated.
                // Make sure to clip the value of the random index so that it
                // is always within the valid range.

                slideshow.options.defaultIndex = i >= numSlides ? numSlides - 1 : i;
            });
        }
    },

    _fisherYatesArrayShuffle: function( arr ) {
        if ( arr && arr.length ) {
            var i = arr.length;
            while ( --i ) {
                var j = Math.floor( Math.random() * ( i + 1 ) ),
                    tmp = arr[ j ];
                arr[ j ] = arr[ i ];
                arr[ i ] = tmp;
            }
        }
    },

    _reshuffle: function( slideshow ) {
        var arr = slideshow._shuffleArray,
            dict = {},
            numSlides = slideshow.slides.$element.length;

        if ( arr.length !== numSlides ) {
            // The size of our shuffle array has to match
            // the number of slides. If there is a mismatch,
            // re-initialize the shuffle array.
    
            arr.length = 0;
            for ( var i = 0; i < numSlides; i++ ) {
                arr[ i ] = i;
            }
        }

        // Shuffle the values in the array.

        this._fisherYatesArrayShuffle( arr );

        // Now build up a dictionary that given a slide index,
        // tells us what the 'next' slide in our shuffle order
        // would be.

        for ( var i = 0; i < numSlides; i++ ) {
            dict[ arr[ i ] ] = arr[ ( i + 1 )      % numSlides ];
        }

        slideshow._shuffleNextDict = dict;
        slideshow._shufflePlayCount = 0;
    },

    _handleNext: function( slideshow ) {
        if ( slideshow.isPlaying() ) {
            // The slideshow is in play mode, lookup the next slide to
            // go to based on the current active index and call the slideshow's
            // goTo() method.

            slideshow._goTo( slideshow._shuffleNextDict[ slideshow.slides.activeIndex ] || 0 );

            // If we've seen all the slides, re-shuffle the indexes so we get
            // a different order for the next cycle.

            if ( ++slideshow._shufflePlayCount >= slideshow.slides.$element.length ) {
                this._reshuffle( slideshow );
            }

        } else {
            // The slideshow isn't playing so just call the slideshow's
            // original next method.

            slideshow._realNext();
        }
    }
};


//////////////////// Toggle Play Plugin ////////////////////


WebPro.Widget.ContentSlideShow.togglePlayPlugin = {
    defaultOptions: {
        },

    initialize: function( slideshow, options ) {
        // Add a listener on the slideshow so that we can prevent
        // a play() request if necessary.

        slideshow.bind( 'wp-slideshow-before-play', function( e, data ) {
            if ( slideshow.isPlaying() ) {
                slideshow.stop();
                e.preventDefault();
            }
        });

        // The default implementation of the content-slideshow places a
        // playing class on the slideshow element itself whenever the slideshow
        // mode is turned on. Some folks may want this class to go directly
        // on the play button instead of relying on a contextual selector.
        // Listen for a successful play/stop request and add/remove the
        // playing class directly on the play button element.

        slideshow.bind( 'wp-slideshow-play', function( e, data ) {
            if ( slideshow.$playBtn ) {
                slideshow.$playBtn.addClass( slideshow.options.playingClassName );
            }
        });

        slideshow.bind( 'wp-slideshow-stop', function( e, data ) {
            if ( slideshow.$playBtn ) {
                slideshow.$playBtn.removeClass( slideshow.options.playingClassName );
            }
        });
    }
};


//////////////////// Swipe Plugin ////////////////////


WebPro.Widget.ContentSlideShow.swipePlugin = {

    defaultOptions: {
        swipeEvents: {
            'wp-swipe-slideshow-prev': {
                xThreshold: 60
            },
            'wp-swipe-slideshow-next': {
                xThreshold: -60
            }
        }
    },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        slideshow.swipeTracker = new WebPro.SwipeTracker( slideshow.$element, {
            angleThreshold: 20,
            swipeEvents: options.swipeEvents
        });
        $( slideshow ).on( 'attach-behavior', function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( ss ) {
        $( 'body' ).on( 'wp-swipe-slideshow-next', function() {
            ss.next();
        });
        $( 'body' ).on( 'wp-swipe-slideshow-prev', function() {
            ss.previous();
        });
    }

};


//////////////////// Next Prev Plugin ////////////////////


WebPro.Widget.ContentSlideShow.nextPrevPlugin = {

    defaultOptions: {
        nextClassName: 'wp-slideshow-next',
        prevClassName: 'wp-slideshow-prev'
    },

    initialize: function( slideshow, options ) {
        var plugin = this;

        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        $( slideshow ).on( 'attach-behavior', function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( ss ) {
        var plugin = this,
            $view = ss.$element.find( '.' + ss.options.viewClassName ),
            $slides = ss.slides.$element,
            oldIndex = ss.slides.activeIndex;

        $( ss.slides ).on( 'wp-panel-before-show', function( evt, data ) {
            var activeIndex = data.panelIndex,
                slideCount = $slides.length,
                nextEvent = activeIndex - oldIndex == 1 || ( activeIndex - oldIndex ) == ( 1 - slideCount ),
                $next = $slides.eq( ( activeIndex + 1 ) % slideCount ),
                $prev = $slides.eq( ( activeIndex - 1 ) % slideCount );
            $slides.removeClass( ss.options.nextClassName + ' ' + ss.options.prevClassName );
            $view.removeClass( ss.options.nextClassName + ' ' + ss.options.prevClassName );
            if ( nextEvent ) {
                $next.addClass( ss.options.nextClassName );
                $prev.addClass( ss.options.prevClassName );
                $view.addClass( ss.options.nextClassName );
            } else {
                $prev.addClass( ss.options.nextClassName );
                $next.addClass( ss.options.prevClassName );
                $view.addClass( ss.options.prevClassName );
            }
            oldIndex = activeIndex;
        });
    }

};


//////////////////// View Dimension Plugin ////////////////////


WebPro.Widget.ContentSlideShow.viewDimensionPlugin = {

    defaultOptions: {
        viewDimension: 'width'
    },

    initialize: function( slideshow, options ) {
        var plugin = this;
        this.loader = new WebPro.ImageLoader();
        this.options = $.extend( {}, this.defaultOptions, options, slideshow.defaultOptions );
        $( slideshow ).on( 'attach-behavior', function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( slideshow ) {
        var plugin = this,
            $images = slideshow.slides.$element.find( 'img' );
        this.imageCount = $images.length;
        this.loadedCount = 0;
        $images.each( function() {
            $( this ).load( function() {
                plugin.imageLoaded( slideshow );
            });
        });
    },

    imageLoaded: function( slideshow ) {
        if ( this.loadedCount < this.imageCount - 1 ) {
            this.loadedCount++;
            return;
        }
        this.adjustDimension( slideshow );
    },

    adjustDimension: function( slideshow ) {
        var $view = slideshow.$element.find( '.' + this.options.viewClassName ),
            $slides = $view.find( '.' + this.options.slideClassName );
        if ( this.options.viewDimension == 'width' ) {
            var totalWidth = 0;
            $slides.each( function() {
                totalWidth += $( this ).outerWidth();
            });
            $view.width( totalWidth );
        } else {
            var totalHeight = 0;
            $slides.each( function() {
                totalHeight += $( this ).outerHeight();
            });
            $view.height( totalHeight );
        }
    }

};


//////////////////// Carousel Plugin ////////////////////


WebPro.Widget.ContentSlideShow.carouselPlugin = {

    defaultOptions: {
        imageThreshold: 3
    },

    initialize: function( slideshow, options ) {
        // require nextPrevPlugin
        var nextPrev = WebPro.Widget.ContentSlideShow.nextPrevPlugin;
        nextPrev.initialize( slideshow, options );

        var plugin = this;

        // The idea here is that we only want to override props
        // that aren't already specified in the options we were
        // given. We then write back the merged results into the
        // original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        $( slideshow ).on( 'attach-behavior', function() {
            plugin.attachBehavior( slideshow );
        });
    },

    attachBehavior: function( slideshow ) {
        var opts = slideshow.options,
            $view = slideshow.$element.find( '.' + opts.viewClassName ),
            $slides = slideshow.slides.$element,
            slideCount = $slides.length,
            $slide, oldIndex = 0;

        if ( slideCount < opts.imageThreshold ) {
            // duplicate slides
        } else {
            // initialize slides
            for ( var i = 0; i < Math.floor( ( opts.imageThreshold - 1 ) / 2 ); i++ ) {
                $slide = $view.find( '.' + opts.slideClassName + ':eq(' + ( slideCount - 1 ) + ')' );
                $slide.remove();
                $view.prepend( $slide );
            }
        }

        slideshow._cpssIsAnimating = false;

        slideshow.$element.find( '.' + opts.viewClassName ).on( 'webkitAnimationEnd oAnimationEnd msAnimationEnd animationend', function( evt ) {
            var $this = $( this ),
                nextEvent = $this.hasClass( opts.nextClassName ),
                prevEvent = $this.hasClass( opts.prevClassName );
            if ( $this[0] == evt.target ) {
                if ( nextEvent ) {
                    $slide = $view.find( '.' + opts.slideClassName + ':eq(0)' );
                    $slide.remove();
                    $view.append( $slide );
                    $view.removeClass( opts.nextClassName );
                    slideshow._cpssIsAnimating = false;
                } else if ( prevEvent ) {
                    $slide = $view.find( '.' + opts.slideClassName + ':eq(' + ( slideCount - 1 ) + ')' );
                    $slide.remove();
                    $view.prepend( $slide );
                    $view.removeClass( opts.prevClassName );
                    slideshow._cpssIsAnimating = false;
                }
            }
        });
        $( slideshow.slides ).on( 'wp-panel-before-show', function( evt, data ) {
            $slides.removeClass( 'wp-slideshow-constant-large wp-slideshow-constant-small' );
        });

        // We want to know any time the slideshow is asked to
        // navigate to a different slide.

        slideshow.bind( 'wp-slideshow-before-first wp-slideshow-before-last wp-slideshow-before-previous wp-slideshow-before-next wp-slideshow-before-goTo', function( evt, data ) {
            // If we're animating, we want to block any requests
            // to move on to the next slide until we're done.

            if ( slideshow._cpssIsAnimating ) {
                // Calling prevent default on the event prevents
                // the slideshow from navigating.

                evt.preventDefault();
            } else {
                // Set our animation flag. It will get turned off in our
                // animation end handler.

                slideshow._cpssIsAnimating = true;
            }
        });
    }

};


//////////////////// Disable Thumbs Plugin ////////////////////


WebPro.Widget.ContentSlideShow.disableThumbsPlugin = {

    initialize: function( slideshow, options ) {
        var plugin = this;
        this.options = $.extend( {}, slideshow.DefaultOptions, options );
        slideshow.bind( 'attach-behavior', function() {
            if ( plugin.options.thumbsDisabled ) {
                slideshow.tabs.disabled( true );
            }
        });
    }

};


})( jQuery, WebPro, window, document );

