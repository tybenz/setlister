/**
* wp-request-animation-frame.js - version 0.1 - WebPro Release 0.1
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

// This is a polyfill that provides support for requestAnimationFrame() and cancelAnimationFrame() on
// platforms where it is not already supported.

(function( window ) {

if ( !window.requestAnimationFrame ) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame
                                  || window.mozRequestAnimationFrame
                                  || window.oRequestAnimationFrame
                                  || window.msRequestAnimationFrame
                                  || function( callback ) { return window.setTimeout( callback, window.requestAnimationFrame._wpRequestAnimationFrameInterval ); };
}

if ( !window.cancelAnimationFrame ) {
  window.cancelAnimationFrame = window.webkitCancelAnimationFrame
                                  || window.mozCancelAnimationFrame
                                  || window.oCancelAnimationFrame
                                  || window.msCancelAnimationFrame
                                  || function( id ) { return window.clearTimeout( id ); };
}

// Give users a way to adjust the animation interval when setTimeout is used.

window.requestAnimationFrame._wpRequestAnimationFrameInterval = 1000 / 60;

})( window );
