/**
* wp-color.js - version 0.1 - WebPro Release 0.1
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
	
WebPro.Color = function( value ) {
    this._r = 0;
    this._g = 0;
    this._b = 0;
    this._a = 1;

    if ( value ) {
        this.setValue( value );
    }
}

WebPro.inherit( WebPro.Color, WebPro.EventDispatcher );

$.extend( WebPro.Color.prototype, {

    setValue: function( value )  {
        if ( typeof value === 'string' ) {
            value = WebPro.Color.parseColorString( value );
        }

        if ( 'h' in value && 's' in value ) {
            if ( 'l' in value ) {
                // HSL
                value = WebPro.Color.convertHSLToRGB( value );
            } else {
                // HSB/HSV
                value = WebPro.Color.convertHSBToRGB( value );
            }
        }

        // At this point, we're assuming value is in RGB.

        this._r = value.r;
        this._g = value.g;
        this._b = value.b;
        this._a = ( 'a' in value ) ? value.a : 1;

        this.trigger( 'color-change',  {
                rgb: this.getRGB(),
                hsb: this.getHSB(),
                hsl: this.getHSL()
            });
    },

    getRGB: function() {
        return {
                r: this._r,
                g: this._g,
                b: this._b,
                a: this._a
            };
    },

    getRGBString: function() {
        var rgb = this.getRGB(),
            hasAlpha = 'a' in rgb && rgb.a != 1;
        return ( hasAlpha ? 'rgba(' : 'rgb(' ) + rgb.r + ',' + rgb.g + ',' + rgb.b + ( hasAlpha ? ',' + rgb.a : '' ) + ')';
    },

    getRGBHexString: function() {
        var rgb = this.getRGB(),
            r = rgb.r.toString( 16 ),
            g = rgb.g.toString( 16 ),
            b = rgb.b.toString( 16 ),
            canShorten = ( r.length === 1 && g.length === 1 && b.length === 1 );

        if ( !canShorten ) {
            r = r.length < 2 ? '0' + r : r;
            g = g.length < 2 ? '0' + g : g;
            b = b.length < 2 ? '0' + b : b;
        }

        return '#' + r + g + b;
    },

    getHSB: function() {
        return WebPro.Color.convertRGBToHSB( this.getRGB() );
    },

    getHSBString: function() {
        var hsb = this.getHSB(),
            hasAlpha = 'a' in hsb && hsb.a != 1;
        return ( hasAlpha ? 'hsba(' : 'hsb(' ) + hsb.h + ',' + hsb.s + ',' + hsb.b + ( hasAlpha ? ',' + hsb.a : '' ) + ')';
    },

    getHSL: function() {
        return WebPro.Color.convertRGBToHSL( this.getRGB() );
    },

    getHSLString: function() {
        var hsl = this.getHSL(),
            hasAlpha = 'a' in hsl && hsl.a != 1;
        return ( hasAlpha ? 'hsla(' : 'hsl(' ) + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%' + ( hasAlpha ? ',' + hsl.a : '' ) + ')';
    },

    toString: function( format ) {
        if ( format === 'hsl' ) {
            return this.getHSLString();
        }
        else if ( format === 'hsb' ) {
            return this.getHSBString();
        }
        return this.getRGBString();
    }
});

// XXX: These are the primary CSS colors keywords. We need
//      to have another file we can include that extends
//      this with the complete set if necessary.
//
//        http://www.w3.org/wiki/CSS3/Color/Extended_color_keywords

WebPro.Color.cssKeywords = {
    black:       { r:   0, g:   0, b:   0, a: 1 },
    cyan:        { r:   0, g: 255, b: 255, a: 1 },
    green:       { r:   0, g: 255, b:   0, a: 1 },
    magenta:     { r: 255, g:   0, b: 255, a: 1 },
    red:         { r: 255, g:   0, b:   0, a: 1 },
    transparent: { r:   0, g:   0, b:   0, a: 0 },
    white:       { r: 255, g: 255, b: 255, a: 1 },
    yellow:      { r: 255, g: 255, b:   0, a: 1 }
};


WebPro.Color.parseColorString = function( value ) {
    var result = { r: 0, g: 0, b: 0, a: 0 }; // transparent

    value = (value || 'transparent').replace( /\s/g, '' );

    if ( value.charAt( 0 ) === '#' ) {
        // RGB Hex String
        if ( value.length === 4 ) {
            // Shortened hex format #rgb. Convert to long form #rrggbb.
            value = '#'
                    + value.charAt( 1 ) + value.charAt( 1 )
                    + value.charAt( 2 ) + value.charAt( 2 )
                    + value.charAt( 3 ) + value.charAt( 3 );
        }

        result = {
                r: parseInt( value.substr( 1, 2), 16),
                g: parseInt( value.substr( 3, 2), 16),
                b: parseInt( value.substr( 5, 2), 16),
                a: 1
            };
    } else if ( value.search( /^[^(]+\(/ ) != -1 ) {
        // rgb/rgba/hsl/hsla Color Space
        var matches = /^([^\(]+)\(([^,]+),([^,]+),([^,\)]+)(?:,([^\)]+))*\)/.exec( value );
        if ( matches ) {
            var colorSpace = matches[ 1 ];

            if ( colorSpace === 'rgb' || colorSpace === 'rgba' ) {
                result = {
                        r: parseInt( matches[ 2 ], 10 ),
                        g: parseInt( matches[ 3 ], 10 ),
                        b: parseInt( matches[ 4 ], 10 )
                    };
            } else if ( colorSpace === 'hsl' || colorSpace === 'hsla' ) {
                result = {
                        h: parseInt( matches[ 2 ], 10 ),
                        s: parseInt( matches[ 3 ], 10 ),
                        l: parseInt( matches[ 4 ], 10 )
                    };
            }

            result.a = ( colorSpace === 'rgba' || colorSpace === 'hsla' ) ? parseFloat( matches[ 5 ], 10 ) : 1;
        }

    } else {
        // CSS Keyword
        result = WebPro.Color.cssKeywords[ value ] || result;
    }

    return result;
};

WebPro.Color.__convertHSBToHSL = function( hsb ) {
    var hsl = {
            h: 0,
            s: 0,
            l: 0,
            a: ( 'a' in hsb ? hsb.a : 1 )
        };

    hsl.h = hsb.h;
    hsl.l = ( 2 - hsb.s ) * hsb.b;
    hsl.s = hsb.s * hsb.b;
    hsl.s /= ( hsl.l <= 1 ) ? ( hsl.l ) : 2 - ( hsl.l );
    hsl.l /= 2;

    hsl.h = Math.round( hsl.h );
    hsl.s = Math.round( hsl.s );
    hsl.l = Math.round( hsl.l );

    return hsl;
};

WebPro.Color.convertHSBToHSL = function( hsb ) {
    var h = hsb.h,
        s = hsb.s / 100,
        b = hsb.b / 100,
        hsl = {
            h: 0,
            s: 0,
            l: 0,
            a: ( 'a' in hsb ? hsb.a : 1 )
        };

    hsl.h = h;
    hsl.l = ( 2 - s ) * b;
    hsl.s = s * b;
    hsl.s /= ( hsl.l <= 1 ) ? ( hsl.l ) : 2 - ( hsl.l );
    hsl.l /= 2;

    hsl.h = Math.round( hsl.h );
    hsl.s = Math.round( hsl.s * 100 );
    hsl.l = Math.round( hsl.l * 100 );

    return hsl;
};

WebPro.Color.convertRGBToHSB = function( rgb ) {
    var min = Math.min( rgb.r, rgb.g, rgb.b ),
        max = Math.max( rgb.r, rgb.g, rgb.b ),
        delta = max - min,
        hsb = {
                h: 0,
                s: 0,
                b: 0,
                a: ( 'a' in rgb ? rgb.a : 1 )
            };

    hsb.b = 100 * max / 255;
    hsb.s = max != 0 ? 100 * delta / max : 0;

    if ( hsb.s != 0 ) {
        if ( rgb.r == max ) {
            hsb.h = ( rgb.g - rgb.b ) / delta;
        } else if (rgb.g == max) {
            hsb.h = 2 + ( rgb.b - rgb.r ) / delta;
        } else {
            hsb.h = 4 + ( rgb.r - rgb.g ) / delta;
        }
    } else {
        hsb.h = -1;
    }

    hsb.h *= 60;

    if ( hsb.h < 0 ) {
        hsb.h += 360;
    }

    hsb.h = Math.round( hsb.h );
    hsb.s = Math.round( hsb.s );
    hsb.b = Math.round( hsb.b );

    return hsb;
};

WebPro.Color.convertHSLToHSB = function( hsl ) {
    var h = hsl.h,
        s = hsl.s / 100,
        l = hsl.l / 100,
        hsb = {
            h: 0,
            s: 0,
            b: 0,
            a: ( 'a' in hsl ? hsl.a : 1 )
        };

    hsb.h = h;
    l *= 2;
    s *= (l <= 1) ? l : 2 - l;
    hsb.b = (l + s) / 2;
    hsb.s = (2 * s) / (l + s);

    hsb.h = Math.round( hsb.h );
    hsb.s = Math.round( hsb.s * 100 );
    hsb.b = Math.round( hsb.b * 100 );

    return hsb;
};

WebPro.Color.convertRGBToHSL = function( rgb ) {
    return WebPro.Color.convertHSBToHSL( WebPro.Color.convertRGBToHSB( rgb ) );
};

WebPro.Color.convertHSBToRGB = function( hsb ) {
    var h = Math.round( hsb.h ),
        s = Math.round( hsb.s * 255 / 100),
        v = Math.round(hsb.b * 255 / 100),
        rgb = {
                r: 0,
                g: 0,
                b: 0,
                a: ( 'a' in hsb ? hsb.a : 1 )
            };

    if(s == 0) {
        rgb.r = rgb.g = rgb.b = v;
    } else {
        var t1 = v,
            t2 = ( 255 - s ) * v / 255,
            t3 = ( t1 - t2 ) * ( h % 60 ) / 60;

        if ( h == 360 ) {
            h = 0;
        }

        if( h < 60 ) {
            rgb.r = t1;
            rgb.b = t2;
            rgb.g = t2 + t3;
        }
        else if ( h < 120 ) {
            rgb.r = t1 - t3;
            rgb.g = t1;
            rgb.b = t2;
        }
        else if ( h < 180 ) {
            rgb.r = t2;
            rgb.g = t1;
            rgb.b = t2 + t3;
        }
        else if ( h < 240 ) {
            rgb.r = t2;
            rgb.g = t1 - t3;
            rgb.b = t1;
        }
        else if ( h < 300 ) {
            rgb.r = t2+t3;
            rgb.g = t2;
            rgb.b = t1;
        }
        else if ( h < 360 ) {
            rgb.r = t1;
            rgb.g = t2;
            rgb.b = t1-t3;
        }
        else {
            rgb.r = 0;
            rgb.g = 0;
            rgb.b = 0;
        }
    }

    rgb.r = Math.round( rgb.r );
    rgb.g = Math.round( rgb.g );
    rgb.b = Math.round( rgb.b );

    return rgb;
};

WebPro.Color.convertHSLToRGB = function( hsl ) {
    return WebPro.Color.convertHSBToRGB( WebPro.Color.convertHSLToHSB( hsl ) );
};


})( jQuery, WebPro, window, document );
