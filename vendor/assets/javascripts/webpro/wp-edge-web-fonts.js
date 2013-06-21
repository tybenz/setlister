/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

// Most of this code was written by jobrandt@adobe.com for
// Edge Code. It has been slightly modified so that it can
// be a bit more generic for integration into WebPro.

(function( $, WebPro, window, document, undefined ) {

    var apiUrlPrefix      = "https://api.typekit.com/edge_internal_v1/",
        appNameInclude    = "", // filled in on init()
        fontUrlPrefix = "//use.edgefonts.net/", // protocol relative
        fontUrlSuffix = ".js",
        fontIncludePrefix = "<script src=\"",
        fontIncludeSuffix = "\"></script>";

    var fontsByClass = {},
        fontsByName  = {},
        fontsBySlug  = {},
        allFonts     = [],
        allSlugs     = [];

    var $picker  = null,
        $results = null;

    var fontClassifications = ["serif", "sans-serif", "slab-serif", "script", "blackletter", "monospaced", "handmade", "decorative"],
        fontRecommendations = ["headings", "paragraphs"];

    var websafeFonts = ["andale mono", "arial", "arial black", "comic sans ms", "courier new", "georgia", "impact", "times new roman", "trebuchet ms", "verdana", "sans-serif", "serif"];

    var SEARCH_HYSTERESIS = 500; // milliseconds
    var lastSearchTimer = null;


    function getWebsafeFonts() {
        return websafeFonts.concat([]); // make a copy
    }

    function getAllFonts() {
        return allFonts.concat([]); // make a copy
    }

    function getAllSlugs() {
        return allSlugs.concat([]); // make a copy
    }

    /**
     * Returns font object matching specified slug or 'undefined' if not found
     *
     * @param {!string} slug - the slug of the desired font
     * @return {object} font object, or undefined if not found
     */
    function getFontBySlug(slug) {
        return fontsBySlug[slug.toLowerCase()];
    }

    /**
     * Returns font object matching specified slug or 'undefined' if not found
     *
     * @param {!string} class - the class of the desired fonts
     * @return {Array} of matching font objects.
     */
    function getFontsByClassification(classification) {
        return fontsByClass[classification.toLowerCase()];
    }

    /**
     * Returns a copy of arr that is a.) all lowercase, b.) sorted lexigraphically,
     * and c.) has all duplicates removed.
     *
     * @param {!Array.<string>}
     * @return {Array.<string>}
     */
    function lowerSortUniqStringArray(arr) {
        var i, last = null, lowerArr = [], result = [];
        // fill up the lowerArr array with lowercase versions of the source array
        for (i = 0; i < arr.length; i++) {
            if (typeof arr[i] === "string") {
                lowerArr.push(arr[i].toLowerCase());
            }
        }

        // sort lowerArr alphabetically
        lowerArr.sort();

        // copy unique elements to result array
        for (i = 0; i < lowerArr.length; i++) {
            if (lowerArr[i] !== last) {
                result.push(lowerArr[i]);
                last = lowerArr[i];
            }
        }

        return result;
    }

    /**
     * Returns a sorted array of all the elements in arr that contain a case-insensitive
     * version of the needle. The array returned is a new array. The original arry is not
     * modified.
     *
     * The results are sorted as follows:
     *   1. All elements with a name that starts with the needle
     *   2. All elements with a word that starts with the needle
     *   3. All elements that contain the needle
     * Within each category, elements are sorted alphabetically
     *
     * TODO: We should eventually move this search algorithm (and probably the lowerSortUniqStringArray)
     * to core brackets code. It would likely be useful for things like Quick Open.
     *
     * @param {!string} needle - the search term
     * @param {Array} arr - the array to filter and sort
     * @param {function} stringGetterFunction - optional function to extract the sort
     *                   term from each element in the array
     * @return {Array.<Object>} Array of font objects that contain the search term.
     */
    function filterAndSortArray(needle, arr, stringGetterFunction) {
        var beginning = [], beginningOfWord = [], contains = [];
        var i, index, currentString;

        var lowerCaseNeedle = needle.toLocaleLowerCase();

        if (!stringGetterFunction) {
            // If a function for getting the string out of each array object
            // isn't provided, just use whatever value is in the array as the string
            stringGetterFunction = function (s) { return String(s); };
        }

        for (i = 0; i < arr.length; i++) {
            currentString = stringGetterFunction(arr[i]).toLocaleLowerCase();
            index = currentString.indexOf(lowerCaseNeedle);
            if (index === 0) {
                beginning.push(arr[i]);
            } else if (index > 0) {
                var previousChar = currentString[index - 1];
                if (!previousChar.isAlpha() && !previousChar.isDigit()) {
                    beginningOfWord.push(arr[i]);
                } else {
                    contains.push(arr[i]);
                }
            }
        }

        return beginning.concat(beginningOfWord).concat(contains);
    }

    function searchByName(needle) {
        if (needle === "") {
            return [];
        } else {
            return filterAndSortArray(needle, allFonts, function (f) { return f.lowerCaseName; });
        }
    }

    function searchBySlug(needle) {
        if (needle === "") {
            return [];
        } else {
            return filterAndSortArray(needle, getAllSlugs());
        }
    }

    /**
     * Generates the script URL for including the specified fonts.
     *
     * @param {!Array} fonts - should be an array of objects, and each object
     *      should have the following properties:
     *        slug - string specifying the unique slug of the font (e.g. "droid-sans")
     *        fvds - array of variant strings (e.g. ["n4", "n7"])
     *        subset - string specifying the subset desired (e.g. "default")
     *
     */
    function createUrl(fonts) {
        var i, j, fontStrings = [], fontString, variations;
        for (i = 0; i < fonts.length; i++) {
            fontString = fonts[i].slug;
            variations = fonts[i].variations;

            if (variations && variations.length) {
                for (j = 0; j < variations.length; j++) {
                  fontString += (j > 0 ? ',' : ':') + variations[j].fvd;
                }
            }

            fontStrings.push(fontString);
        }
        
        return fontUrlPrefix + fontStrings.join(";") + fontUrlSuffix;
    }

    /**
     * Generates the script tag for including the specified fonts.
     *
     * @param {!Array} fonts - should be an array of objects, and each object
     *      should have the following properties:
     *        slug - string specifying the unique slug of the font (e.g. "droid-sans")
     *        fvds - array of variant strings (e.g. ["n4", "n7"])
     *        subset - string specifying the subset desired (e.g. "default")
     *
     */
    function createInclude(fonts) {
        return appNameInclude + fontIncludePrefix + createUrl(fonts) + fontIncludeSuffix;
    }

    function init(opts) {
        var d = $.Deferred();

        opts = opts || {};

        if (opts.newApiUrlPrefix) {
            apiUrlPrefix = opts.newApiUrlPrefix;
        }

        // setup callback function for metadata request
        function organizeFamilies(families) {
            allFonts = families.families;
            var i, j;

            // Clean up the fonts in two ways:
            //   1. give all fonts a locale lowercase name (for searching by name)
            //   2. make sure all slugs are lowercase (should be the case already)
            for (i = 0; i < allFonts.length; i++) {
                allFonts[i].lowerCaseName = allFonts[i].name.toLocaleLowerCase();
                allFonts[i].slug = allFonts[i].slug.toLowerCase();
            }

            // We keep allFonts in alphabetical order by name, so that all other
            // lists will also be in order.
            allFonts.sort(function (a, b) {
                if (a.lowerCaseName < b.lowerCaseName) {
                    return -1;
                } else if (a.lowerCaseName > b.lowerCaseName) {
                    return 1;
                } else { // they're equal
                    return 0;
                }
            });

            // setup the allSlugs array;
            for (i = 0; i < allFonts.length; i++) {
                allSlugs.push(allFonts[i].slug);
            }

            fontsByClass = {};
            fontsByName = {};
            fontsBySlug = {};

            for (i = 0; i < allFonts.length; i++) {
                for (j = 0; j < allFonts[i].classifications.length; j++) {
                    if (!fontsByClass.hasOwnProperty(allFonts[i].classifications[j])) {
                        fontsByClass[allFonts[i].classifications[j]] = [];
                    }
                    fontsByClass[allFonts[i].classifications[j]].push(allFonts[i]);
                }
                for (j = 0; j < allFonts[i].recommended_for.length; j++) {
                    if (!fontsByClass.hasOwnProperty(allFonts[i].recommended_for[j])) {
                        fontsByClass[allFonts[i].recommended_for[j]] = [];
                    }
                    fontsByClass[allFonts[i].recommended_for[j]].push(allFonts[i]);
                }


                fontsByName[allFonts[i].name] = allFonts[i];
                fontsBySlug[allFonts[i].slug] = allFonts[i];
            }
        }

        if (opts.data) {
            organizeFamilies(opts.data);
            d.resolve();
        } else {
            // request font metadata
            $.ajax({
                url: opts.fontsUrl,
                dataType: 'json',
                success: function (data) {
                    organizeFamilies(data);
                    d.resolve();
                },
                error: function () {
                    d.reject("XHR request to 'families' API failed");
                }
            });
        }

        return d.promise();
    }

    WebPro.EdgeWebFonts = {};
    WebPro.EdgeWebFonts.lowerSortUniqStringArray = lowerSortUniqStringArray;
    WebPro.EdgeWebFonts.filterAndSortArray = filterAndSortArray;
    WebPro.EdgeWebFonts.getWebsafeFonts = getWebsafeFonts;
    WebPro.EdgeWebFonts.getAllFonts = getAllFonts;
    WebPro.EdgeWebFonts.getAllSlugs = getAllSlugs;
    WebPro.EdgeWebFonts.getFontBySlug = getFontBySlug;
    WebPro.EdgeWebFonts.getFontsByClassification = getFontsByClassification;
    WebPro.EdgeWebFonts.searchByName = searchByName;
    WebPro.EdgeWebFonts.searchBySlug = searchBySlug;
    WebPro.EdgeWebFonts.createInclude = createInclude;
    WebPro.EdgeWebFonts.createUrl = createUrl;
    WebPro.EdgeWebFonts.init = init;

})( jQuery, WebPro, window, document );
