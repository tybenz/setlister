/**
* wp-form.js - version 0.1 - WebPro Release 0.1
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
    
WebPro.widget( "Widget.Form", WebPro.Widget, {
    _widgetName: "form",

    defaultOptions: {
        validationEvent: "blur",
        errorStateSensitivity: "low",
        ajaxSubmit: true,
        
        fieldWrapperClass: "field",
        
        formErrorClass: "form-error",
        formSubmittedClass: "form-submitted",
        formDeliveredClass: "form-delivered",
        focusClass: "focus",
        notEmptyClass: "not-empty",
        emptyClass: "empty",
        validClass: "valid",
        invalidClass: "invalid",
        requiredClass: "required"
    },

    validationTypes: {
        "always-valid": /.*/,
        
        "email": /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,

        "min-8": /.{8}.*/,
        
        "alpha": /^[A-z\s]+$/,
        
        "numeric": /^[0-9]+$/,
        
        "phone": /^([0-9])?(\s)?(\([0-9]{3}\)|[0-9]{3}(\-)?)(\s)?[0-9]{3}(\s|\-)?[0-9]{4}(\s|\sext|\sx)?(\s)?[0-9]*$/,

        "url": /((([A-Za-z]{3,9}:(?:\/\/)?)?(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/,

        "time": function( $field ) {
            var time = $field.val().replace( /[^0-9:APM]/g, "" );
            if ( time.indexOf( ":" ) != -1 && time.match( /:/ ).length == 1 ) {
                var timeArr = time.split( ":" ),
                    hour = parseInt( timeArr[0] ),
                    minute = parseInt( timeArr[1] );
                    
                if ( hour < 0 || hour > 24 ) {
                    return true;
                }
                
                if ( minute < 0 || minute > 59 ) {
                    return true;
                }
            } else {
                return false;
            }
            $field.val( time );
            return true;
        }
    },
    
    _extractData: function() {
        //shortening variable names
        this.event = this.options.validationEvent;
        this.errorSensitivity = this.options.errorStateSensitivity;
        this.classNames = {
            focus: this.options.focusClass,
            blur: this.options.emptyClass,
            keydown: this.options.notEmptyClass
        };
    },
    
    _attachBehavior: function() {
        var self = this;
        
        this.$element.find( "input, textarea" ).each( function() {
            if ( $( this ).val() != "empty" ) {
                $( this ).removeClass( self.options.emptyClass );
            }
        });
        
        this.$element.find( "." + this.options.fieldWrapperClass ).each( function() {
            var control = $( this ).find( "input, textarea" );
            if ( control.val() != "" ) {
                $( this ).addClass( self.classNames.keydown );
            }
        });
        
        this.$element.on( "focus focusin blur focusout keydown change propertychange", "input, textarea", function(e) {
            var className = self.classNames[ e.type ],
                focus = self.classNames[ "focus" ],
                keydown = self.classNames[ "keydown" ],
                blur = self.classNames[ "blur" ],
                $this = $( this ),
                $field = $this.closest( "." + self.options.fieldWrapperClass );
            
            switch ( e.type ) {
                case "focusin":
                case "focus":
                    $field.addClass( focus ).removeClass( blur );
                    break;
                case "focusout":
                case "blur":
                    $field.removeClass( focus );
                    if ( $this.val() == "" ) {
                        $field.addClass( blur ).removeClass( keydown );
                    }
                    break;
                case "keydown":
                    $field.addClass( className ).removeClass( blur );
                    break;
                case "change":
                case "propertychange":
                    if ( $this.val() != "" ) {
                        $field.addClass( keydown ).removeClass( blur );
                    } else {
                        $field.addClass( blur ).removeClass( keydown );
                    }
                default:
                    break;
            }
        });
        
        switch( this.event ) {
            case "blur":
            case "keyup":
                this.$element.on( this.event, "." + this.options.fieldWrapperClass + " input, ." + this.options.fieldWrapperClass + " textarea", function() {
                    self._validate( $( this ).closest( "." + self.options.fieldWrapperClass ) );
                });
            case "submit":
                this.$element.submit( function(e) {
                    var idx = 0, formValid = true,
                        fieldCount = self.$element.find( "." + self.options.fieldWrapperClass ).length - 1;
                    self.$element.find( "." + self.options.fieldWrapperClass ).each(function( idx ) {
                        formValid = self._validate( $(this) ) ? formValid : false;
                        
                        if ( formValid && idx == fieldCount ) {
                            if ( self.options.ajaxSubmit ) {
                                e.preventDefault();
                                self._submitForm();
                            }    
                        }
                        
                        if ( !formValid ) {
                            e.preventDefault();
                        }
                    });
                });
                break;
            default:
                break;
        }
    },
    
    _submitForm: function() {
        var self = this,
            submitted = this.options.formSubmittedClass,
            delivered = this.options.formDeliveredClass,
            error = this.options.formErrorClass,
            allClasses = submitted + ' ' + delivered + ' ' + error,
            buttons = this.$element.find( "input[type=submit], button" );
        $.ajax({
            url: this.$element.attr( "action" ),
            type: "post",
            data: this.$element.serialize(),
            beforeSend: function() {
                self.$element.removeClass( allClasses );
                self.$element.addClass( submitted );
                self.$element.find( "." + self.options.fieldWrapperClass ).removeClass( self.options.focusClass );
                buttons.attr( "disabled", "disabled" );
            },
            success: function( response ) {
                self.$element.addClass( delivered ).removeClass( submitted );
                self.$element.find( "input:not([type=submit]), textarea" ).each( function() {
                    $( this ).val( "" );
                })
                buttons.removeAttr( "disabled" );
            },
            error: function( response ) {
                self.$element.addClass( error ).removeClass( submitted )
                buttons.removeAttr( "disabled" );
            }
        })
    },
    
    _validate: function( $field, requiredOnly ) {
        var type = $field.attr( "data-type" ) || "always-valid",
            control = $field.find( "input, textarea" ),
            requiredOnly = requiredOnly || false,
            validObj = this.validationTypes[ type ],
            isRequired = $field.attr( "data-required" ) === "true",
            isEmpty = control.val() == "",
            isValid = (validObj instanceof RegExp) ? Boolean( control.val().match( validObj ) ) : validObj( control );
        
        if ( isRequired && isEmpty ) {
            return this._switchState( "required", $field );
        }
        if( !isValid && !requiredOnly ) {
            return this._switchState( "invalid", $field );
        }
        
        return this._switchState( "valid", $field );
    },
    
    _switchState: function( state, $field ) {
        var valid = this.options.validClass,
            invalid = this.options.invalidClass,
            required = this.options.requiredClass,
            allClasses = valid + " " + invalid + " " + required;
            
        $field.removeClass( allClasses );
        if ( state == "required" || state == "invalid" ) {
            if( state == "invalid" ) {
                $field.addClass( invalid );
            } else {
                $field.addClass( required );
                var requiredOnly = true;
            }
            if ( this.errorSensitivity != "low" ) {
                var self = this,
                    event;
                if ( this.errorSensitivity == "high" ) {
                    event = "keyup";
                } else {
                    //medium
                    event = "blur";
                }
                
                if ( !$field.data( "error-state" ) ) {
                    $field.data( "error-state", true );
                    $field.on( event, "input, textarea", function() {
                        self._validate( $field, requiredOnly );
                    });
                }
            }
            return false;
        }
        if ( $field.data( "error-state" ) ) {
            if ( this.errorSensitivity == "high" ) {
                if ( this.event != "keyup" ) {
                    $field.data( "error-state", false ).find( "input, textarea" ).unbind( "keyup" );
                }
            } else if ( this.errorSensitivity == "medium" ) {
                //medium
                if ( this.event != "blur" ) {
                    $field.data( "error-state", false ).find( "input, textarea" ).unbind( "blur" );
                }
            }
        }
        $field.addClass( valid );
        return true;
    }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpForm', WebPro.Widget.Form );
    
})( jQuery, WebPro, window, document );
