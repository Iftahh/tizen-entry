/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 */

/**
 * Helper class for doing tile distribution and paint callbacks on a predefined area when
 * location to render is being modified.
 */
IsoTiling = function() {

};


/**
 * This method is required to being called every time the tile, outer or inner dimensions are being modified.
 *
 * @param clientWidth {Number} Inner width of container
 * @param clientHeight {Number} Inner height of container
 * @param contentWidth {Number} Outer width of content
 * @param contentHeight {Number} Outer height of content
 * @param tileWidth {Number} Width of each tile to render
 * @param tileHeight {Number} Height of each tile to render
 */
IsoTiling.prototype.setup = function(clientWidth, clientHeight, contentWidth, contentHeight, tileWidth, tileHeight) {

	this.__clientWidth = clientWidth;
	this.__clientHeight = clientHeight;
	this.__contentWidth = contentWidth;
	this.__contentHeight = contentHeight;
	this.__tileWidth = tileWidth;
	this.__tileHeight = tileHeight;

};


/**
 * Renders the given location on the area defined by {@link #setup} by calling
 * `paint(row, column, left, top, width, height, zoom)` as needed.
 *
 * @param left {Number} Left position to render
 * @param top {Number} Top position to render
 * @param zoom {Number} Current zoom level (should be applied to `left` and `top` already)
 * @param paint {Function} Callback method for every tile to paint.
 */
IsoTiling.prototype;
