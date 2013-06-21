/**
* wp-disclosure-widget.js - version 0.1 - WebPro Release 0.1
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

// A Disclosure widget is a composite widget that connects
// a set of tabs with a set of panels.

WebPro.widget( "Widget.Disclosure", WebPro.Widget, {
    defaultOptions: {
        widgetClassName:                  "wp-disclosure-panels",
        tabClassName:                         "wp-disclosure-panels-tab",
        tabHoverClassName:            "wp-disclosure-panels-tab-hover",
        tabDownClassName:             "wp-disclosure-panels-tab-down",
        panelClassName:                   "wp-disclosure-panels-panel",
        tabActiveClassName:       "wp-disclosure-panels-tab-active",
        panelActiveClassName: "wp-disclosure-panels-panel-active",
        defaultIndex:                         0,
        toggleStateEnabled:       false
    },

    _attachBehavior: function() {
        var root = this.$element[ 0 ],
            rclass = this.options.widgetClassName,
            $tabs = WebPro.scopedFind( root, "." + this.options.tabClassName, rclass, root ),
            $panels = WebPro.scopedFind( root, "." + this.options.panelClassName, rclass, root );

        this.tabs = new WebPro.Widget.TabGroup( $tabs, {
                            hoverClass:                         this.options.tabHoverClassName,
                            downClass:                              this.options.tabDownClassName,
                            checkedClass:                   this.options.tabActiveClassName
                        });

        this.panels = new WebPro.Widget.PanelGroup( $panels, {
                            panelClass:                         this.options.panelClassName,
                            activeClass:                        this.options.panelActiveClassName,
                            defaultIndex:                   this.options.defaultIndex,
                            toggleStateEnabled: this.options.toggleStateEnabled
                        });

        this.panels.addTabGroup( this.tabs );
    }
});

// A TabbedPanels widget is basically a disclosure widget, but we declare a formal
// widget so that it uses a different set of class names, and allows users to set
// default plugins that are specific to just accordions.

WebPro.widget( "Widget.TabbedPanels", WebPro.Widget.Disclosure, {
    defaultOptions: {
        widgetClassName:                  "wp-tabbed-panels-panels",
        tabClassName:                         "wp-tabbed-panels-panels-tab",
        tabHoverClassName:            "wp-tabbed-panels-panels-tab-hover",
        tabDownClassName:             "wp-tabbed-panels-panels-tab-down",
        tabActiveClassName:       "wp-tabbed-panels-panels-tab-active",
        panelClassName:                   "wp-tabbed-panels-panels-panel",
        panelActiveClassName: "wp-tabbed-panels-panels-panel-active",
        toggleStateEnabled:       false
    }
});

// An Accordion is basically a disclosure widget, but we declare a formal
// widget so that it uses a different set of class names, and allows
// users to set default plugins that are specific to just accordions.

WebPro.widget( "Widget.Accordion", WebPro.Widget.Disclosure, {
    defaultOptions: {
        widgetClassName:                  "wp-accordion",
        tabClassName:                         "wp-accordion-tab",
        tabHoverClassName:            "wp-accordion-tab-hover",
        tabDownClassName:             "wp-accordion-tab-down",
        tabActiveClassName:       "wp-accordion-tab-active",
        panelClassName:                   "wp-accordion-panel",
        panelActiveClassName: "wp-accordion-panel-active",
        toggleStateEnabled:       false
    }
});

})( jQuery, WebPro, window, document );

