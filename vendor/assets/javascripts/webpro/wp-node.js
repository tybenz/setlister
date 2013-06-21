/**
* wp-node.js - version 0.1 - WebPro Release 0.1
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


// A component class that mimics the DOM Node API for the purposes of
// maintaining object relationships as a tree.

var WebPro = WebPro || {};

(function( WebPro, window ) {

WebPro.Node = function() {
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

var proto = WebPro.Node.prototype;

proto.removeChild = function( child ) {
    if ( child.parentNode === this ) {
        var p = child.previousSibling,
            n = child.nextSibling;

        if ( this.firstChild === child ) {
            this.firstChild = n;
        }

        if ( this.lastChild === child ) {
            this.lastChild = p;
        }

        if ( p ) {
            p.nextSibling = n;
        }

        if ( n ) {
            n.previousSibling = p;
        }

        child.parentNode = child.previousSibling = child.nextSibling = null;
    }

    return child;
};

proto.appendChild = function( child ) {
    if ( child && ( child.parentNode !== this || child !== this.lastChild ) ) {
        var lc = this.lastChild;
        if ( child.parentNode ) {
            child.parentNode.removeChild( child );
        }

        if ( !lc ) {
            this.firstChild = child;
        } else {
            lc.nextSibling = child;
            child.previousSibling = lc;
        }

        this.lastChild = child;
        child.parentNode = this;
    }

    return child;
};

proto.insertBefore = function( child, ref ) {
    if ( child && child !== ref ) {
        if ( child.parentNode ) {
            child.parentNode.removeChild( child );
        }

        if ( !ref ) {
            this.appendChild( child );
        } else {
            if ( this.firstChild === ref ) {
                this.firstChild = child;
            }

            var p = ref.previousSibling;
            child.previousSibling = p;
            child.nextSibling = ref;
            ref.previousSibling = child;
            if ( p ) {
                p.nextSibling = child;
            }
            child.parentNode = this;
        }
    }

    return child;
};

proto.insertAfter = function( child, ref ) {
    return this.insertBefore( child, ( ref && ref.nextSibling ) || null );
};

proto.childNodes = function() {
    var nodes = [], c = this.firstChild;
    while ( c ) {
        nodes.push( c );
        c = c.nextSibling;
    }
    return nodes;
};

})(WebPro, window);

