(function( $, WebPro, window, document, undefined ) {

// CanvasOverlaySlider2d
//
// A specialized slider that injects a canvas into
// the track element of the slider and manages its
// sizing as the sliders dimensions grow/shrink.

function CanvasOverlaySlider2d( element, options )
{
    WebPro.Widget.Slider2d.call( this, element, options );
}

WebPro.inherit( CanvasOverlaySlider2d, WebPro.Widget.Slider2d );

$.extend( CanvasOverlaySlider2d.prototype, {
    _transformMarkup: function() {
        CanvasOverlaySlider2d.prototype._super.prototype._transformMarkup.apply( this, arguments );

        this.$canvasOverlay = this.$element.find( '.canvas-overlay' );
        this.$canvas = $( '<canvas></canvas>' );
        this.$canvas.appendTo( this.$canvasOverlay );
    },

    _resetConstraints: function() {
        CanvasOverlaySlider2d.prototype._super.prototype._resetConstraints.apply( this, arguments );

        var overlay = this.$canvasOverlay,
            canvas = this.$canvas[ 0 ],
            width = overlay.innerWidth(),
            height = overlay.innerHeight();

        // Force the canvas to be as large as its container.

        canvas.width = width > 0 ? width : 0;
        canvas.height = height > 0 ? height : 0;

        this.render();
    },

    render: function() {
        // Provided by the derived class.
    }
});


// Hue Slider
//
// A slider with the complete hue spectrum
// drawn inside of the slider track.

function HueSlider( element, options )
{
    CanvasOverlaySlider2d.apply( this, arguments );
}

WebPro.inherit( HueSlider, CanvasOverlaySlider2d );

$.extend( HueSlider.prototype, {
    render: function() {
        var canvas = this.$canvas[ 0 ],
            gc = canvas.getContext( '2d' ),
            width = canvas.width,
            height = canvas.height,
            isVertical = this.options.hueSliderDirection === 'vertical',
            totalLoops = isVertical ? height : width;
            angleIncr = 360 / totalLoops,
            angle = 360;

        for ( var i = 0; i < totalLoops; i++ ) {
            gc.save();
            gc.beginPath();
            if ( isVertical ) {
              gc.moveTo( 0, i );
              gc.lineTo( width, i );
            } else {
              gc.moveTo( i, 0 );
              gc.lineTo( i, height );
            }
            gc.strokeStyle = 'hsl(' + angle + ',100%,50%)';
            gc.stroke();
            gc.restore();
            angle -= angleIncr;
        }
    }
});

// AlphaSlider
//
// A slider that displays a gradient that goes from
// zero to full opacity of a specific color in the
// slider track.

function AlphaSlider( element, options )
{
    options = $.extend( {}, this.defaultOptions, options );
    
    this._color = new WebPro.Color( options.color );

    CanvasOverlaySlider2d.apply( this, arguments );
}

WebPro.inherit( AlphaSlider, CanvasOverlaySlider2d );

$.extend( AlphaSlider.prototype, {
    defaultOptions: {
        color: 'black'
    },

    render: function() {
        var canvas = this.$canvas[ 0 ],
            gc = canvas.getContext( '2d' ),
            width = canvas.width,
            height = canvas.height,
            isVertical = this.options.hueSliderDirection === 'vertical',
            gradient = gc.createLinearGradient( 0, 0, isVertical ? 0 : width, isVertical ? height : 0 );

        var transparentRGB = this._color.getRGB();

        transparentRGB.a = 0;
        gradient.addColorStop( 0, ( new WebPro.Color( transparentRGB ) ).getRGBString() );
        gradient.addColorStop( 1, this._color.getRGBString() );

        gc.clearRect( 0, 0, width, height );
        gc.fillStyle = gradient;
        gc.fillRect( 0, 0, width, height );
    },

    setColor: function( color ) {
        this._color.setValue( color );
        this.render();
    }
});

WebPro.widget( 'Widget.HSBColorPicker', WebPro.Widget, {
    _widgetName: 'hsbcolorpicker',
    
    defaultOptions: {
        saturationClass: 'wp-colorpicker-saturation',
        saturationViewClass: 'wp-colorpicker-saturation-view',
        saturationThumbClass: 'wp-colorpicker-saturation-thumb',

        hueClass: 'wp-colorpicker-hue',
        hueViewClass: 'wp-colorpicker-hue-view',
        hueThumbClass: 'wp-colorpicker-hue-thumb',

        opacityClass: 'wp-colorpicker-opacity',
        opacityViewClass: 'wp-colorpicker-opacity-view',
        opacityThumbClass: 'wp-colorpicker-opacity-thumb',

        hueSliderDirection: 'vertical',
        alphaSliderDirection: 'horizontal'
    },
    
    _setValue: function( h, s, b, a ) {
        if ( !this._blockSetValue ) {
            this._hue = h;
            this._saturation = s;
            this._brightness = b;
            this._alpha = a;

            // Set our internal color variable
            // so we can trigger a color-change
            // event.

            this._color.setValue({
                    h: this._hue,
                    s: this._saturation,
                    b: this._brightness,
                    a: this._alpha
                });
        }
    },

    setValue: function( value ) {
        var hsb = ( new WebPro.Color( value ) ).getHSB() ;
        this._setValue( hsb.h, hsb.s, hsb.b, hsb.a );
        this._syncControls();
    },

    _attachBehavior: function() {
        var self = this,
            opts = this.options;

        this._blockSetValue = false;

        // We use a Color object to generate a color-change
        // event with the same color data dispatched by a
        // Color object.

        this._color = new WebPro.Color( 'black' );

        this._color.bind( 'color-change', function( e, data ) {
                self.trigger( 'color-change', data );
            });

        // Color objects store color internally as RGB
        // values. Unfortunately there isn't necessarily a
        // a one to one translation of RGB to HSB due to
        // the fact that white and black can have several
        // representations in the HSB space. For this reason,
        // we need to track _hue, etc, ourselves so that as
        // the user drags the saturation/brightness into
        // white or black, that we can get back the original
        // hue that was used as they drag away from white/black.

        var black = this._color.getHSB();

        this._hue = black.h;
        this._saturation = black.s;
        this._brightness = black.b;
        this._alpha = black.a;

        // Attach the 2d slider behavior to the
        // saturation element.

        this.$saturation = this.$element.find( '.' + opts.saturationClass );
        this.$saturationView = this.$saturation.find( '.' + opts.saturationViewClass );
        
        this.saturationSlider = new WebPro.Widget.Slider2d( this.$saturation, {
            trackClassName: opts.saturationViewClass,
            thumbClassName: opts.saturationThumbClass,
            ignoreY: false
        });
        
        $( this.saturationSlider ).on( 'wp-slider-update', function( evt, data ) {
            var s = self._saturation,
                b = self._brightness;

            if ( data.percentageX >= 0 ) {
                s = Math.round( data.percentageX * 100 );
            }
            if ( data.percentageY >= 0 ) {
                b = Math.round( 100 - data.percentageY * 100 );
            }

            self._setValue( self._hue, s, b, self._alpha );

            self._syncAlphaView();
        });

        // Attach the slider behavior to the hue element.

        this.$hue = this.$element.find( '.' + opts.hueClass );
        
        this.hueSlider = new HueSlider( this.$hue, {
            trackClassName: opts.hueViewClass,
            thumbClassName: opts.hueThumbClass,
            ignoreY: opts.hueSliderDirection === 'horizontal',
            ignoreX: opts.hueSliderDirection === 'vertical'
        });
        
        $( this.hueSlider ).on( 'wp-slider-update', function( evt, data ) {
            var  h = 360 - data.percentage * 360;

            self._setValue( h, self._saturation, self._brightness, self._alpha );

            // Update the saturation view.

            self._syncSaturationView();
            self._syncAlphaView();
        });

        // Attach a slider behavior to the opacity element.

        this.$opacity = this.$element.find( '.' + opts.opacityClass );

        this.alphaSlider = new AlphaSlider( this.$opacity, {
            trackClassName: opts.opacityViewClass,
            thumbClassName: opts.opacityThumbClass,
            ignoreY: opts.alphaSliderDirection === 'horizontal',
            ignoreX: opts.alphaSliderDirection === 'vertical'
        });
        
        $( this.alphaSlider ).on( 'wp-slider-update', function( evt, data ) {
            self._setValue( self._hue, self._saturation, self._brightness, data.percentage );
        });
    },

    _ready: function() {
        // Make sure we sync the controls to our initial
        // HSB values.

        this._syncControls();
    },

    _syncSaturationView: function() {
        this.$saturationView.css( 'background-color', 'hsl(' + this._hue + ',100%,50%)' );
    },

    _syncAlphaView: function() {
        this.alphaSlider.setColor({
                h: this._hue,
                s: this._saturation,
                b: this._brightness
            });
    },

    _syncControls: function() {
        var options = this.options;

        this._blockSetValue = true;

        // XXX: This is a temporary workaround for the problem where
        //      the color picker may have been initialized while it
        //      or its ancestor was display:none. We reset our constraints
        //      so the max values of the sliders get calculated properly

        this.saturationSlider._resetConstraints();
        this.hueSlider._resetConstraints();
        this.alphaSlider._resetConstraints();

        // Set the values of the color picker controls.

        this.saturationSlider.setPositionByPercentage( this._saturation / 100, 1 - this._brightness / 100 );

        var isVertical = options.hueSliderDirection === 'vertical',
            value = 1 - this._hue / 360,
            x = isVertical ? 0 : value,
            y = isVertical ? value : 0;

        this.hueSlider.setPositionByPercentage( x, y );

        isVertical = options.alphaSliderDirection === 'vertical';
        x = isVertical ? 0 : this._alpha;
        y = isVertical ? this._alpha : 0;

        this.alphaSlider.setPositionByPercentage( x, y );

        this._syncSaturationView();
        this._syncAlphaView();

        this._blockSetValue = false;
    }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpHSBColorPicker', WebPro.Widget.HSBColorPicker );
	
})( jQuery, WebPro, window, document );
