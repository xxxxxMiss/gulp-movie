'use strict';

/**
 * core js
 * other js must be dependend on it
 * @param  {[type]} ){} [description]
 * @return {[type]}       [description]
 */
var pui = function () {
	// 非贪婪匹配
	var translateRE = /translate(?:3d)?\((.+?)\)/;
	var translateMatrixRE = /matrix(3d)?\((.+?)\)/;
	var pui = function pui() {};

	pui.createEl = function (nodeName, classes) {
		var node = document.createElement(nodeName);
		classes && (node.className = classes);
		return node;
	};
	/**
  * 将第二个对象的属性合并到第一个对象
  * @return {[type]} [description]
  */
	pui.extend = function (src, target) {
		for (var prop in target) {
			src[prop] = target[prop];
		}
		return src;
	};
	/**
  * 返回一个fragment
  * @param  {[type]} str [description]
  * @return {[type]}     [description]
  */
	pui.str2Node = function (str) {
		var temp = document.createElement('div'),
		    fragment = document.createDocumentFragment();
		temp.innerHTML = str;
		this.covert2Arr(temp.children).forEach(function (v) {
			fragment.appendChild(v);
		});
		return fragment;
	};
	/**
  * [将一个类数组, 数组，字符串转化为数组]
  * @param  {[type]} arrayLike [类数组或单个dom节点]
  * @return {[type]}           [description]
  */
	pui.covert2Arr = function (arrayLike) {
		var al = null;
		if (!arrayLike) return [];
		if (arrayLike.nodeType && arrayLike.nodeType === 1) {
			arrayLike = [arrayLike];
		}
		al = arrayLike || [];
		return Array.from ? Array.from(al) : [].slice.call(al);
	};

	/**
  * 以下的3个方法（removeClass, addClass, 
  * hasClass）基于classList实现，当然可以使用正则来实现
  */
	pui.removeClass = function (arrayLike, classes) {
		var arr = this.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(function (v) {
			classArr.forEach(function (value) {
				return v.classList.remove(value);
			});
		});
	};

	pui.addClass = function (arrayLike, classes) {
		var arr = this.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(function (v) {
			classArr.forEach(function (value) {
				return v.classList.add(value);
			});
		});
	};

	pui.hasClass = function (elem, className) {
		if (!this.isEleNode(elem)) return false;
		var classes = elem.className.split(' ');
		if (!~classes.indexOf(className)) {
			return false;
		}
		return true;
	};

	pui.toggleClass = function (node, classes) {
		var _this = this;

		if (!this.isEleNode(node)) return false;

		classes = classes.split(' ');
		classes.forEach(function (v) {
			if (node.classList.contains(v)) {
				_this.removeClass(node, v);
			} else {
				_this.addClass(node, v);
			}
		});
	};

	/**
  * 判断一个对象是否是元素节点
  * @param  {[type]}  node [description]
  * @return {Boolean}      [description]
  */
	pui.isEleNode = function (node) {
		if (node === undefined) {
			return false;
		}
		if (node.nodeType && node.nodeType === 1) {
			return true;
		}
	};

	pui.parseTranslate = function (translateString, position) {
		var result = translateString.match(translateRE || '');
		if (!result || !result[1]) {
			result = ['', '0,0,0'];
		}
		result = result[1].split(",");
		result = {
			x: parseFloat(result[0]),
			y: parseFloat(result[1]),
			z: parseFloat(result[2])
		};
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};

	pui.parseTranslateMatrix = function (translateString, position) {
		var matrix = translateString.match(translateMatrixRE);
		var is3D = matrix && matrix[1];
		if (matrix) {
			matrix = matrix[2].split(",");
			if (is3D === "3d") matrix = matrix.slice(12, 15);else {
				matrix.push(0);
				matrix = matrix.slice(4, 7);
			}
		} else {
			matrix = [0, 0, 0];
		}
		var result = {
			x: parseFloat(matrix[0]),
			y: parseFloat(matrix[1]),
			z: parseFloat(matrix[2])
		};
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};

	pui.getStyles = function (elem, property) {
		// CSSStyleDeclaration
		var styles = elem.ownerDocument.defaultView.getComputedStyle(elem, null);
		if (property) {
			return styles.getPropertyValue(property) || styles[property];
		}
		return styles;
	};
	/**
  * 获取元素的视口坐标
  * @param  {[type]} elem     [description]
  * @param  {[type]} property [description]
  * @return {[type]}          [description]
  */
	pui.gbcr = function (elem, property) {
		if (!this.isEleNode(elem)) return;
		var o = elem.getBoundingClientRect();
		if (property) {
			return o[property];
		}
		return o;
	};

	pui.observe = function (elem, callback) {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var moSupport = !!MutationObserver,
		    mo = null,
		    options = {
			childList: true,
			attributes: true,
			subtree: true
		};

		if (moSupport) {
			mo = new MutationObserver(callback);
			mo.observe(elem, options);
		}
	};

	return pui;
}();
"use strict";

(function (pui) {

	/**
  * 按照道理应该提供一张足够大的图片，这样模糊效果才会好
  * 因为绘制的canvas是根据原图片大小来的
  * 精确计算无法达到缩放比例，故直接放大很大比例，超出隐藏
  * @param  {[type]} option [description]
  * @return {[type]}        [description]
  */
	pui.blurImage = function (option) {
		var srcImageId = option.srcImageId,
		    // 图片id
		canvasId = option.canvasId,
		    //画布id
		blur = option.blur,
		    //模糊程度
		topContainerId = option.topContainerId,
		    // 包含图片的最外层的元素id

		canvas = document.getElementById(canvasId),
		    srcImage = document.getElementById(srcImageId),
		    topContainer = document.getElementById(topContainerId).getBoundingClientRect(),
		    topContainerW = topContainer.width,
		    topContainerH = topContainer.height;

		srcImage.addEventListener('load', function () {
			handleImage();
		}, false);

		function handleImage() {
			var imgNaturalW = srcImage.naturalWidth,
			    imgNaturalH = srcImage.naturalHeight,
			    scaleY = Math.floor(topContainerH / imgNaturalH) + 1;

			canvas.style.webkitTransform = "scaleX(20) scaleY(" + scaleY + ")";

			stackBlurImage(srcImageId, canvasId, blur, false);
		}
		handleImage();

		// 返回最外层容器的宽高，因为下面的定位需要用到这个高度
		return {
			width: topContainerW,
			height: topContainerH
		};
	};

	/*
 StackBlur - a fast almost Gaussian Blur For Canvas
 */

	var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

	var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

	function stackBlurImage(imageID, canvasID, radius, blurAlphaChannel) {
		var img = document.getElementById(imageID);
		var w = img.naturalWidth;
		var h = img.naturalHeight;

		var canvas = document.getElementById(canvasID);

		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		canvas.width = w;
		canvas.height = h;

		var context = canvas.getContext("2d");
		context.clearRect(0, 0, w, h);
		context.drawImage(img, 0, 0);

		if (isNaN(radius) || radius < 1) return;

		if (blurAlphaChannel) stackBlurCanvasRGBA(canvasID, 0, 0, w, h, radius);else stackBlurCanvasRGB(canvasID, 0, 0, w, h, radius);
	}

	function stackBlurCanvasRGBA(id, top_x, top_y, width, height, radius) {
		if (isNaN(radius) || radius < 1) return;
		radius |= 0;

		var canvas = document.getElementById(id);
		var context = canvas.getContext("2d");
		var imageData;

		try {
			try {
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {

				// NOTE: this part is supposedly only needed if you want to work with local files
				// so it might be okay to remove the whole try/catch block and just use
				// imageData = context.getImageData( top_x, top_y, width, height );
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
					imageData = context.getImageData(top_x, top_y, width, height);
				} catch (e) {
					console.log("Cannot access local image");
					//throw new Error("unable to access local image data: " + e);
					return;
				}
			}
		} catch (e) {
			console.log("Cannot access image");
			//throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1 = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1 = radius + 1;
		var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

		var stackStart = new BlurStack();
		var stack = stackStart;
		for (i = 1; i < div; i++) {
			stack = stack.next = new BlurStack();
			if (i == radiusPlus1) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];

		for (y = 0; y < height; y++) {
			r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

			r_out_sum = radiusPlus1 * (pr = pixels[yi]);
			g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
			b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
			a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}

			for (i = 1; i < radiusPlus1; i++) {
				p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
				r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
				b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
				a_sum += (stack.a = pa = pixels[p + 3]) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;

				stack = stack.next;
			}

			stackIn = stackStart;
			stackOut = stackEnd;
			for (x = 0; x < width; x++) {
				pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
				if (pa != 0) {
					pa = 255 / pa;
					pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
					pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
					pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
				} else {
					pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
				}

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;

				p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

				r_in_sum += stackIn.r = pixels[p];
				g_in_sum += stackIn.g = pixels[p + 1];
				b_in_sum += stackIn.b = pixels[p + 2];
				a_in_sum += stackIn.a = pixels[p + 3];

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				a_sum += a_in_sum;

				stackIn = stackIn.next;

				r_out_sum += pr = stackOut.r;
				g_out_sum += pg = stackOut.g;
				b_out_sum += pb = stackOut.b;
				a_out_sum += pa = stackOut.a;

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}

		for (x = 0; x < width; x++) {
			g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * (pr = pixels[yi]);
			g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
			b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
			a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}

			yp = width;

			for (i = 1; i <= radius; i++) {
				yi = yp + x << 2;

				r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
				b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
				a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;

				stack = stack.next;

				if (i < heightMinus1) {
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for (y = 0; y < height; y++) {
				p = yi << 2;
				pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
				if (pa > 0) {
					pa = 255 / pa;
					pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
					pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
					pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
				} else {
					pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
				}

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;

				p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

				r_sum += r_in_sum += stackIn.r = pixels[p];
				g_sum += g_in_sum += stackIn.g = pixels[p + 1];
				b_sum += b_in_sum += stackIn.b = pixels[p + 2];
				a_sum += a_in_sum += stackIn.a = pixels[p + 3];

				stackIn = stackIn.next;

				r_out_sum += pr = stackOut.r;
				g_out_sum += pg = stackOut.g;
				b_out_sum += pb = stackOut.b;
				a_out_sum += pa = stackOut.a;

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;

				stackOut = stackOut.next;

				yi += width;
			}
		}

		context.putImageData(imageData, top_x, top_y);
	}

	function stackBlurCanvasRGB(id, top_x, top_y, width, height, radius) {
		if (isNaN(radius) || radius < 1) return;
		radius |= 0;

		var canvas = document.getElementById(id);
		var context = canvas.getContext("2d");
		var imageData;

		try {
			try {
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {

				// NOTE: this part is supposedly only needed if you want to work with local files
				// so it might be okay to remove the whole try/catch block and just use
				// imageData = context.getImageData( top_x, top_y, width, height );
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
					imageData = context.getImageData(top_x, top_y, width, height);
				} catch (e) {
					console.log("Cannot access local image");
					//throw new Error("unable to access local image data: " + e);
					return;
				}
			}
		} catch (e) {
			console.log("Cannot access image");
			//throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1 = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1 = radius + 1;
		var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

		var stackStart = new BlurStack();
		var stack = stackStart;
		for (i = 1; i < div; i++) {
			stack = stack.next = new BlurStack();
			if (i == radiusPlus1) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];

		for (y = 0; y < height; y++) {
			r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

			r_out_sum = radiusPlus1 * (pr = pixels[yi]);
			g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
			b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			for (i = 1; i < radiusPlus1; i++) {
				p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
				r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
				b_sum += (stack.b = pb = pixels[p + 2]) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;
			}

			stackIn = stackStart;
			stackOut = stackEnd;
			for (x = 0; x < width; x++) {
				pixels[yi] = r_sum * mul_sum >> shg_sum;
				pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
				pixels[yi + 2] = b_sum * mul_sum >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

				r_in_sum += stackIn.r = pixels[p];
				g_in_sum += stackIn.g = pixels[p + 1];
				b_in_sum += stackIn.b = pixels[p + 2];

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;

				stackIn = stackIn.next;

				r_out_sum += pr = stackOut.r;
				g_out_sum += pg = stackOut.g;
				b_out_sum += pb = stackOut.b;

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}

		for (x = 0; x < width; x++) {
			g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * (pr = pixels[yi]);
			g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
			b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			yp = width;

			for (i = 1; i <= radius; i++) {
				yi = yp + x << 2;

				r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
				b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;

				if (i < heightMinus1) {
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for (y = 0; y < height; y++) {
				p = yi << 2;
				pixels[p] = r_sum * mul_sum >> shg_sum;
				pixels[p + 1] = g_sum * mul_sum >> shg_sum;
				pixels[p + 2] = b_sum * mul_sum >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

				r_sum += r_in_sum += stackIn.r = pixels[p];
				g_sum += g_in_sum += stackIn.g = pixels[p + 1];
				b_sum += b_in_sum += stackIn.b = pixels[p + 2];

				stackIn = stackIn.next;

				r_out_sum += pr = stackOut.r;
				g_out_sum += pg = stackOut.g;
				b_out_sum += pb = stackOut.b;

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += width;
			}
		}

		context.putImageData(imageData, top_x, top_y);
	}

	function BlurStack() {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.next = null;
	}
})(pui);
'use strict';

(function (pui) {
	if (typeof window.Map === 'undefined') {
		var _Map = function _Map() {
			var o = {};
			this.set = function (key, value) {
				o[key] = value;
			};
			this.get = function (key) {
				return o[key];
			};
		};

		window.Map = window.Map || _Map;
	}
	var map = new Map();
	var cache = {
		setData: function setData(key, jsonArr) {
			map.set(key, jsonArr);
		},
		getData: function getData(key) {
			return map.get(key);
		},
		setStorage: function setStorage(key, jsonArr) {
			localStorage.setItem(key, JSON.stringify(jsonArr));
		},
		getStorage: function getStorage(key) {
			return JSON.parse(localStorage.getItem(key));
		},
		// 获取分页数据，num: 每次要显示的条数
		getLimitData: function getLimitData(key, num) {
			var data = map.get(key) || [];
			num = num || 5;
			var ret = [],
			    i = 0,
			    first = undefined;

			for (; i < num; i++) {
				first = data.shift();
				if (first) {
					ret.push(first);
				} else {
					break;
				}
			}
			map.set(key, data);
			return {
				data: ret,
				hasMore: !!data.length
			};
		}
	};
	pui.cache = cache;
})(pui);
'use strict';

(function () {
	template: ['<div class="ui-card">', '<div class="ui-card-header ui-divider-fill">', '<div class="ui-card-back">取消</div>', '<div class="ui-card-title">支付确认</div>', '</div>', '<div class="ui-card-content">', '<div class="ui-card-row ui-card-spec ui-divider-part ui-card-row-pay ui-card-row-arrow">', '<div class="ui-card-col-left">支付方式</div>', '<div class="ui-card-col-right">交通银行借记卡&nbsp;&nbsp;尾号0231</div>', '</div>', '<div class="ui-card-row ui-card-row-integral ui-divider-part">', '<div class="ui-card-col-left">已使用积分8400分</div>', '<div class="ui-card-col-right" id="switch_container"></div>', '</div>', '<div class="ui-card-row ui-divider-fill ui-card-row-arrow">', '<div class="ui-card-col-left">抵扣金额</div>', '<div class="ui-card-col-right ui-color-red">-￥25.<span class="ui-app-font-xs">00</span></div>', '</div>', '</div>', '</div>'].join('');
})();
'use strict';

/*
    ********** Juicer **********
    ${A Fast template engine}
    Project Home: http://juicer.name

    Author: Guokai
    Gtalk: badkaikai@gmail.com
    Blog: http://benben.cc
    Licence: MIT License
    Version: 0.6.8-stable
*/

(function (pui) {

    // This is the main function for not only compiling but also rendering.
    // there's at least two parameters need to be provided, one is the tpl, 
    // another is the data, the tpl can either be a string, or an id like #id.
    // if only tpl was given, it'll return the compiled reusable(可重复使用的) function.
    // if tpl and data were given at the same time, it'll return the rendered 
    // result immediately.

    var juicer = function juicer() {

        //  将类数组转换为真正的数组，便于使用数组的一些方法
        var args = [].slice.call(arguments);

        args.push(juicer.options);

        //  可以匹配这样的id(#:-.)
        if (args[0].match(/^\s*#([\w:\-\.]+)\s*$/igm)) {
            args[0].replace(/^\s*#([\w:\-\.]+)\s*$/igm, function ($, $id) {
                // $(#:-.)    $id(:-.)
                // node.js环境没有`document`，所以会先判断`document`
                var _document = document;
                var elem = _document && _document.getElementById($id);
                args[0] = elem ? elem.value || elem.innerHTML : $;
            });
        }

        // 如果是浏览器环境
        if (typeof document !== 'undefined' && document.body) {
            // 先编译`document.body.innerHTML`一次
            juicer.compile.call(juicer, document.body.innerHTML);
        }

        //  一个参数，返回编译后的模板
        if (arguments.length == 1) {
            return juicer.compile.apply(juicer, args);
        }

        //  2个参数，编译模板后立即渲染数据
        if (arguments.length >= 2) {
            return juicer.to_html.apply(juicer, args);
        }
    };

    //  html转义字符操作对象
    var __escapehtml = {
        //  几种html字符转义集合
        escapehash: {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2f;'
        },
        //  根据传入的html字符进行转义
        escapereplace: function escapereplace(k) {
            return __escapehtml.escapehash[k];
        },
        //  如果传入的str不是字符串，直接返回
        //  否则调用escapereplace方法对html字符转义替换
        escaping: function escaping(str) {
            return typeof str !== 'string' ? str : str.replace(/[&<>"]/igm, this.escapereplace);
        },
        // 检测变量是否定义
        detection: function detection(data) {
            return typeof data === 'undefined' ? '' : data;
        }
    };

    //	如果控制台支持打印，从警告级别打印出错误信息。否则直接抛出
    var __throw = function __throw(error) {
        if (typeof console !== 'undefined') {
            if (console.warn) {
                console.warn(error);
                return;
            }

            if (console.log) {
                console.log(error);
                return;
            }
        }

        throw error;
    };

    // 传入两个对象，并返回一个对象，这个新对象同时具有两个对象的属性和方法。
    // 由于 o 是引用传递，因此 o 会被修改
    var __creator = function __creator(o, proto) {
        o = o !== Object(o) ? {} : o; //	如果o不是一个对象，创建一个空对象赋值给o。是，直接赋值给o

        if (o.__proto__) {
            //	如果o存在原型，改变o的原型指向
            o.__proto__ = proto;
            return o;
        }

        var empty = function empty() {};
        //  Object.create(proto, [ propertiesObject ]) 方法创建一个拥有指定原型和若干个指定属性的对象。
        var n = Object.create ? //  如果支持create创建对象，用它创建对象。否则new一个对象
        Object.create(proto) : new (empty.prototype = proto, empty)();

        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                n[i] = o[i]; //	将o的自有属性赋值到n上
            }
        }

        return n; // 返回一个带有参数自有属性的对象
    };

    /**
     * js正则相关：
     * . 匹配除换行符之外的任何一个字符。
     *  \s,[\r\n\t\v\f] 匹配一个空白字符（包括\r\n\t\v\f）\r回车符\n换行符\t制表符\v垂直制表符\f换页符
     *  \S,[^\r\n\t\v\f]
     *  \d,[0-9]
     *  \D,[^0-9]
     *  \w,[a-zA-Z0-9]
     *  \W,[^a-zA-Z0-9]
     *  \\,\/,\.,\*,\?,\+,\(,\),\{,\},\[,\],\|,\^,\$,\-
     *  对于一些不是很确定是否需要转义的，最好都加上转义
     */
    var annotate = function annotate(fn) {
        //  function (), function func()
        //  匹配函数括号里的参数名称
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        //  ,
        var FN_ARG_SPLIT = /,/;
        // _arg_?
        // 匹配参数，如果开头有下划线结尾也得有下划线
        // 因此自定义函数应避免使用`_X_`形式作为形参
        var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
        // 匹配函数的代码块里语句
        // [\s\S]*  .*  在单行模式下，2者相同，都是匹配任意字符
        // 贪婪匹配与非贪婪匹配（前提都是尽可能保证整个表达式匹配成功）
        var FN_BODY = /^function[^{]+{([\s\S]*)}/m;
        // 匹配注释(//...)或/**/
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var args = [],
            fnText,
            fnBody,
            argDecl;

        if (typeof fn === 'function') {
            //  如果函数有形参,arguments获取实参的个数
            if (fn.length) {
                // 获取该函数定义的文本
                fnText = fn.toString();
            }
        } else if (typeof fn === 'string') {
            fnText = fn;
        }

        //  去掉注释后的文本
        fnText = fnText.replace(STRIP_COMMENTS, '');
        fnText = fnText.trim();
        //  得到参数数组
        argDecl = fnText.match(FN_ARGS);
        //  得到函数体文本
        fnBody = fnText.match(FN_BODY)[1].trim();

        for (var i = 0; i < argDecl[1].split(FN_ARG_SPLIT).length; i++) {
            var arg = argDecl[1].split(FN_ARG_SPLIT)[i];
            arg.replace(FN_ARG, function (all, underscore, name) {
                // TODO 函数的各个参数
                args.push(name);
            });
        }

        //  返回一个数组[[arg1, arg2], '函数体文本']
        return [args, fnBody];
    };

    juicer.__cache = {};
    juicer.version = '0.6.8-stable';
    juicer.settings = {}; // 放置forstart：{@each data as item, index}等的正则

    juicer.tags = {
        operationOpen: '{@',
        operationClose: '}',
        interpolateOpen: '\\${',
        interpolateClose: '}',
        // 禁止对其内容转义的变量开
        noneencodeOpen: '\\$\\${',
        // 禁止对其内容转义的变量闭
        noneencodeClose: '}',
        commentOpen: '\\{#',
        commentClose: '\\}'
    };

    juicer.options = { // 配置缓存，剥除注释，错误处理，检测数据是否为空等选项
        //  是否缓存模板编译结果
        cache: true,
        strip: true, //  默认进行空白去除
        errorhandling: true,
        // 开启后，如果变量未定义，将用空白字符串代替变量位置，否则照常输出
        // 所以如果关闭此项，有可能造成输出 undefined
        detection: true,

        //  注册函数保存
        //  系统函数和用户自定义函数都保存在该_method中
        //  因此修改和注销时务必小心
        _method: __creator({
            __escapehtml: __escapehtml,
            __throw: __throw,
            __juicer: juicer
        }, {})
    };

    // 定义各种匹配正则表达式
    juicer.tagInit = function () {
        var forstart = juicer.tags.operationOpen + 'each\\s*([^}]*?)\\s*as\\s*(\\w*?)\\s*(,\\s*\\w*?)?' + juicer.tags.operationClose;
        var forend = juicer.tags.operationOpen + '\\/each' + juicer.tags.operationClose;
        var ifstart = juicer.tags.operationOpen + 'if\\s*([^}]*?)' + juicer.tags.operationClose;
        var ifend = juicer.tags.operationOpen + '\\/if' + juicer.tags.operationClose;
        var elsestart = juicer.tags.operationOpen + 'else' + juicer.tags.operationClose;
        var elseifstart = juicer.tags.operationOpen + 'else if\\s*([^}]*?)' + juicer.tags.operationClose;
        // 匹配变量${  }
        var interpolate = juicer.tags.interpolateOpen + '([\\s\\S]+?)' + juicer.tags.interpolateClose;
        // 匹配不对其内容转义的变量$${}
        var noneencode = juicer.tags.noneencodeOpen + '([\\s\\S]+?)' + juicer.tags.noneencodeClose;
        var inlinecomment = juicer.tags.commentOpen + '[^}]*?' + juicer.tags.commentClose;
        // for辅助循环
        // {@each data in range value,key}
        var rangestart = juicer.tags.operationOpen + 'each\\s*(\\w*?)\\s*in\\s*range\\(([^}]+?)\\s*,\\s*([^}]+?)\\)' + juicer.tags.operationClose;
        // 引入子模板
        // {@include tpl, data}
        var include = juicer.tags.operationOpen + 'include\\s*([^}]*?)\\s*,\\s*([^}]*?)' + juicer.tags.operationClose;
        // 内联辅助函数开始
        // {@helper funName}
        var helperRegisterStart = juicer.tags.operationOpen + 'helper\\s*([^}]*?)\\s*' + juicer.tags.operationClose; //{@helper}
        // 辅助函数代码块内语句
        var helperRegisterBody = '([\\s\\S]*?)';
        // {@/helper}
        var helperRegisterEnd = juicer.tags.operationOpen + '\\/helper' + juicer.tags.operationClose; //{@/helper}

        juicer.settings.forstart = new RegExp(forstart, 'igm');
        juicer.settings.forend = new RegExp(forend, 'igm');
        juicer.settings.ifstart = new RegExp(ifstart, 'igm');
        juicer.settings.ifend = new RegExp(ifend, 'igm');
        juicer.settings.elsestart = new RegExp(elsestart, 'igm');
        juicer.settings.elseifstart = new RegExp(elseifstart, 'igm');
        juicer.settings.interpolate = new RegExp(interpolate, 'igm');
        juicer.settings.noneencode = new RegExp(noneencode, 'igm');
        juicer.settings.inlinecomment = new RegExp(inlinecomment, 'igm');
        juicer.settings.rangestart = new RegExp(rangestart, 'igm');
        juicer.settings.include = new RegExp(include, 'igm');
        juicer.settings.helperRegister = new RegExp(helperRegisterStart + helperRegisterBody + helperRegisterEnd, 'igm');
    };

    juicer.tagInit();

    // Using this method to set the options by given conf-name and conf-value,
    // you can also provide more than one key-value pair wrapped by an object.
    // this interface also used to custom the template tag delimater, for this
    // situation, the conf-name must begin with tag::, for example: juicer.set
    // ('tag::operationOpen', '{@').

    // 设置各种配置
    // 2种传参方式juicer.set('cache', false),jucer.set({cache: false})
    juicer.set = function (conf, value) {
        var that = this;

        // $ () [] + ^ {} ? * | . 
        // 添加双斜杠转义
        var escapePattern = function escapePattern(v) {
            return v.replace(/[\$\(\)\[\]\+\^\{\}\?\*\|\.]/igm, function ($) {
                return '\\' + $;
            });
        };

        var set = function set(conf, value) {
            //  得到匹配以tag::开头的数组
            var tag = conf.match(/^tag::(.*)$/i);

            if (tag) {
                //  用自定义语法边界符替换系统默认语法边界符
                // tag[1] = operationOpen,operationClose等语法边界符
                // 由于系统这里没有判断语法边界符是否是系统所用的
                // 所以一定要拼写正确
                that.tags[tag[1]] = escapePattern(value);
                //  重新初始化自定义语法边界符
                that.tagInit();
                return;
            }

            that.options[conf] = value;
        };

        //  key,value作为分别作为参数进行传参
        if (arguments.length === 2) {
            set(conf, value);
            return;
        }

        //  以对象的方式进行传参
        if (conf === Object(conf)) {
            for (var i in conf) {
                if (conf.hasOwnProperty(i)) {
                    //  循环调用上面的set方法进行初始化语法边界符
                    set(i, conf[i]);
                }
            }
        }
    };

    // Before you're using custom functions in your template like ${name | fnName},
    // you need to register this fn by juicer.register('fnName', fn).
    // 在模板中使用自定义函数，需要先注册
    juicer.register = function (fname, fn) {
        var _method = this.options._method;

        //	如果自定义函数和系统函数同名
        // 如果已经注册了该函数，不允许覆盖
        if (_method.hasOwnProperty(fname)) {
            return false;
        }

        //  将自定义函数添加到_method中返回
        return _method[fname] = fn;
    };

    // remove the registered function in the memory by the provided function name.
    // for example: juicer.unregister('fnName').

    juicer.unregister = function (fname) {
        var _method = this.options._method;

        // 没有检测是否注销的是系统自定义函数
        // 用户不要注销错了
        // 成功删除，返回true，否则返回false
        if (_method.hasOwnProperty(fname)) {
            return delete _method[fname];
        }
    };

    /**
     * 模板引擎
     * 作为构造函数使用
     * 注意，此处的options是覆盖，而不是合并
     */
    juicer.template = function (options) {
        var that = this;

        this.options = options;

        /**
         * 插入，篡改
           变量解析方法
          _escape是否需要转义
        
        该方法也可以用来创建自定义函数
        // 或者在模板内通过内联辅助函数间接创建
         {@helper echoArgs}
          function(a,b){
              return a+b;
         }
         {@/helper}
        // 本质仍然是使用了`juicer.register`
         通过`juicer.register`直接创建
        juicer.register('echoArgs',function(a,b){
            return a + b;
        });
        
         */
        this.__interpolate = function (_name, _escape, options) {
            //function f(a, b,c){console.log(a+";"+b+";"+c)};f.call({}, ["name,age,address"]);
            //name,age,address;undefined;undefined
            //  ${item.name,item.age | fnName, arg1, arg2}
            //  ${item.name | fnName,item.age, arg1, arg2}
            //  _fn为变量名，此处先暂取_define[0]
            var _define = _name.split('|'),
                _fn = _define[0] || '',
                _cluster; //集群

            if (_define.length > 1) {
                //  变量
                _name = _define.shift(); //	shift删除数组的第一个元素，并返回该值
                //  函数名和参数数组
                _cluster = _define.shift().split(',');
                // _cluster.shift() 取得函数名
                // '_method.' + _cluster.shift() 从_method中取得注册函数
                //  [_name].concat(_cluster) 将变量和自己传入的参数一同作为函数的参数传入
                _fn = '_method.' + _cluster.shift() + '.call({}, ' + [_name].concat(_cluster) + ')';
            }

            /**
             * _fn = _method[_cluster.shift()].call({}, [_name].concat(_cluster))
             * <%=_method.__escapehtml.escaping(_method.__escapehtml.detection(`_fn`))%>
             */
            return '<%= ' + (_escape ? '_method.__escapehtml.escaping' : '') + '(' + (!options || options.detection !== false ? '_method.__escapehtml.detection' : '') + '(' + _fn + ')' + ')' + ' %>';
        };

        //  模板解析方法
        //  返回处理后的模板
        this.__removeShell = function (tpl, options) {
            //  计数器
            //  利用计数器避免遍历时创建的临时变量与其他变量冲突
            var _counter = 0;

            tpl = tpl
            //  inline helper register
            //  juicer.settings.helperRegister内联辅助注册函数
            .replace(juicer.settings.helperRegister, function ($, helperName, fnText) {
                var anno = annotate(fnText);
                var fnArgs = anno[0];
                var fnBody = anno[1];
                //  new Function(arg1, arg2 [,arg3...], fnbody)
                //  这种方法创建的函数比较适合在nodejs和全局环境中使用
                //  前面的参数都是构造函数的参数，最后一个是函数体（都是字符串的形式）
                var fn = new Function(fnArgs.join(','), fnBody);

                juicer.register(helperName, fn);
                // 没有清除{@helper}...{@/helper}
                // 如果要清楚，应该return ''
                return $;
                //                    return '';
            })

            // for expression
            // 'each\\s*([^}]*?)\\s*as\\s*(\\w*?)\\s*(,\\s*\\w*?)?'
            // {@each data as item, index}
            .replace(juicer.settings.forstart, function ($, _name, alias, key) {
                var alias = alias || 'value',
                    key = key && key.substr(1); //	substring(start, end)  substr(start, length)
                var _iterate = 'i' + _counter++;
                /**
                 * 返回替换结果，举例如下
                 * <% ~function(){
                  for(var i0 in names){
                     if(names.hasOwnProperty(i0)){
                         var name = names[i0];
                         var index = i0;
                   %>
                 */
                //  数组可以用for in循环，也可以调用hasOwnProperty方法
                //  [2,3].hasOwnProperty(3) ==>true
                return '<% ~function() {' + 'for(var ' + _iterate + ' in ' + _name + ') {' + 'if(' + _name + '.hasOwnProperty(' + _iterate + ')) {' + 'var ' + alias + '=' + _name + '[' + _iterate + '];' + (key ? 'var ' + key + '=' + _iterate + ';' : '') + ' %>';
            }).replace(juicer.settings.forend, '<% }}}(); %>')

            // if expression
            // {@if item.name != ''}
            // 'if\\s*([^}]*?)'
            .replace(juicer.settings.ifstart, function ($, condition) {
                return '<% if(' + condition + ') { %>';
            }).replace(juicer.settings.ifend, '<% } %>')

            // else expression
            .replace(juicer.settings.elsestart, function ($) {
                return '<% } else { %>';
            })

            // else if expression
            .replace(juicer.settings.elseifstart, function ($, condition) {
                return '<% } else if(' + condition + ') { %>';
            })

            // interpolate without escape
            // '([\\s\\S]+?)'
            // 解析禁止对其内容转义的变量
            .replace(juicer.settings.noneencode, function ($, _name) {
                return that.__interpolate(_name, false, options);
            })

            // interpolate with escape
            .replace(juicer.settings.interpolate, function ($, _name) {
                return that.__interpolate(_name, true, options);
            })

            // clean up comments
            // {#}   '[^}]*?'
            // 去掉注释
            .replace(juicer.settings.inlinecomment, '')

            // range expression
            // 'each\\s*(\\w*?)\\s*in\\s*range\\(([^}]+?)\\s*,\\s*([^}]+?)\\)'
            // 解析辅助循环
            .replace(juicer.settings.rangestart, function ($, _name, start, end) {
                var _iterate = 'j' + _counter++;
                return '<% ~function() {' + 'for(var ' + _iterate + '=' + start + ';' + _iterate + '<' + end + ';' + _iterate + '++) {{' + 'var ' + _name + '=' + _iterate + ';' + ' %>';
            })

            // include sub-template
            // 'include\\s*([^}]*?)\\s*,\\s*([^}]*?)'
            // 子模板渲染
            .replace(juicer.settings.include, function ($, tpl, data) {
                // compatible for node.js
                // 如果是node.js环境
                if (tpl.match(/^file\:\/\//igm)) return $;
                return '<%= _method.__juicer(' + tpl + ', ' + data + '); %>';
            });

            // exception handling
            if (!options || options.errorhandling !== false) {
                tpl = '<% try { %>' + tpl;
                tpl += '<% } catch(e) {_method.__throw("Juicer Render Exception: "+e.message);} %>';
            }

            return tpl;
        };

        //  转换为js可执行的模板
        // 根据`juicer.options.strip`判断是否清除多余空白
        // 而后调用`juicer.template.__convert`
        this.__toNative = function (tpl, options) {
            return this.__convert(tpl, !options || options.strip);
        };

        // 词法分析，生成变量和自定义函数定义语句
        this.__lexicalAnalyze = function (tpl) {
            var buffer = []; // 变量
            var method = []; // 方法，已经存储到`juicer.options.__method`才能被采用
            var prefix = ''; // 返回结果
            var reserved = ['if', 'each', '_', '_method', 'console', 'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'finally', 'for', 'function', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'null', 'typeof', 'class', 'enum', 'export', 'extends', 'import', 'super', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'const', 'arguments', 'true', 'false', 'undefined', 'NaN'];

            //  自定义数组indexOf方法
            var indexOf = function indexOf(array, item) {
                //  支持Array的indexOf方法，就调用Array.indexOf方法
                if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) {
                    return array.indexOf(item);
                }

                // 如果在伪数组中查找，遍历之
                for (var i = 0; i < array.length; i++) {
                    if (array[i] === item) return i;
                }

                return -1;
            };

            var variableAnalyze = function variableAnalyze($, statement) {
                statement = statement.match(/\w+/igm)[0];

                // 如果没有分析过，并且非保留字符
                if (indexOf(buffer, statement) === -1 && indexOf(reserved, statement) === -1 && indexOf(method, statement) === -1) {

                    // avoid re-declare native function, if not do this, template 
                    // `{@if encodeURIComponent(name)}` could be throw undefined.

                    // 跳过window内置函数
                    if (typeof window !== 'undefined' && typeof window[statement] === 'function' && window[statement].toString().match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i)) {
                        return $;
                    }

                    // 跳过node.js内置函数
                    // compatible for node.js
                    if (typeof global !== 'undefined' && typeof global[statement] === 'function' && global[statement].toString().match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i)) {
                        return $;
                    }

                    // avoid re-declare registered function, if not do this, template 
                    // `{@if registered_func(name)}` could be throw undefined.

                    // 如果是自定义函数
                    if (typeof juicer.options._method[statement] === 'function' || juicer.options._method.hasOwnProperty(statement)) {
                        method.push(statement);
                        return $;
                    }

                    buffer.push(statement); // fuck ie
                }

                return $;
            };

            // 分析出现在for/变量/if/elseif/include中的变量名
            tpl.replace(juicer.settings.forstart, variableAnalyze).replace(juicer.settings.interpolate, variableAnalyze).replace(juicer.settings.ifstart, variableAnalyze).replace(juicer.settings.elseifstart, variableAnalyze).replace(juicer.settings.include, variableAnalyze).replace(/[\+\-\*\/%!\?\|\^&~<>=,\(\)\[\]]\s*([A-Za-z_]+)/igm, variableAnalyze);

            // 遍历要定义的变量
            for (var i = 0; i < buffer.length; i++) {
                // prefix = 'var arg1 = _.arg1;var arg2 = _.arg2;'
                prefix += 'var ' + buffer[i] + '=_.' + buffer[i] + ';';
            }

            // 遍历要创建的函数表达式
            for (var i = 0; i < method.length; i++) {
                prefix += 'var ' + method[i] + '=_method.' + method[i] + ';';
            }

            return '<% ' + prefix + ' %>';
        };

        //通过不断替换切割等组成函数语句。
        this.__convert = function (tpl, strip) {
            var buffer = [].join(''); //  创建一个空字符串

            buffer += "'use strict';"; // use strict mode
            buffer += "var _=_||{};";
            buffer += "var _out='';_out+='";

            if (strip !== false) {
                buffer += tpl.replace(/\\/g, "\\\\") //  单斜杠转义
                .replace(/[\r\t\n]/g, " ") //  换行符，制表符替换
                .replace(/'(?=[^%]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='").split("<%").join("';").split("%>").join("_out+='") + "';return _out;";

                return buffer;
            }

            buffer += tpl.replace(/\\/g, "\\\\").replace(/[\r]/g, "\\r").replace(/[\t]/g, "\\t").replace(/[\n]/g, "\\n")
            //(?=exp)正向前瞻  (?!exp)负向前瞻
            //正向前瞻用来检查接下来的出现的是不是某个特定的字符集。
            //而负向前瞻则是检查接下来的不应该出现的特定字符串集。零宽断言是不会被捕获的。
            .replace(/'(?=[^%]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='").split("<%").join("';").split("%>").join("_out+='") + "';return _out.replace(/[\\r\\n]\\s+[\\r\\n]/g, '\\r\\n');";

            return buffer;
        };

        // 渲染模板的入口
        this.parse = function (tpl, options) {
            var _that = this;

            if (!options || options.loose !== false) {
                tpl = this.__lexicalAnalyze(tpl) + tpl;
            }

            tpl = this.__removeShell(tpl, options);
            tpl = this.__toNative(tpl, options);

            this._render = new Function('_, _method', tpl);

            this.render = function (_, _method) {
                if (!_method || _method !== that.options._method) {
                    _method = __creator(_method, that.options._method);
                }

                return _that._render.call(this, _, _method);
            };

            return this;
        };
    };

    //  编译模板，如果成功编译，返回编译后的模板
    juicer.compile = function (tpl, options) {
        if (!options || options !== this.options) {
            options = __creator(options, this.options);
        }

        try {
            var engine = this.__cache[tpl] ? this.__cache[tpl] : new this.template(this.options).parse(tpl, options);

            if (!options || options.cache !== false) {
                this.__cache[tpl] = engine;
            }

            return engine; // 如果成功编译，返回编译后的模板
        } catch (e) {
            __throw('Juicer Compile Exception: ' + e.message);

            return {
                render: function render() {} // noop
            };
        }
    };

    juicer.to_html = function (tpl, data, options) {
        if (!options || options !== this.options) {
            options = __creator(options, this.options);
        }

        return this.compile(tpl, options).render(data, options._method);
    };

    // typeof(module) !== 'undefined' && module.exports ? module.exports = juicer : this.juicer = juicer;
    pui.juicer = juicer;
})(pui);
'use strict';

(function (pui, window, doc) {
	/**
  * options: {
  * 		data: data,
  * 		callback: function(){}
  * 		limit: 2
  * }
  * @param  {[type]}   options  [description]
  * @param  {Function} callback [description]
  * @return {[type]}            [description]
  */

	pui.loadMore = function (options) {
		pui.cache.setData(options.key, options.value);
		var id = options.id || ['J_loadMore', 'J_loadMoreText'];
		var loadMore = doc.getElementById(id[0]);
		var loadMoreText = doc.getElementById(id[1]);

		var myScroll = new IScroll('#' + options.scrollId, {
			preventDefault: false,
			probeType: 1
		});

		myScroll.on('scrollEnd', function () {
			if (this.y <= this.maxScrollY) {
				pui.removeClass(loadMore, 'ui-invisible');

				var result = pui.cache.getLimitData(options.key, options.limit);

				setTimeout(function () {
					options.callback(result.data, myScroll);

					pui.addClass(loadMore, 'ui-invisible');

					if (!result.hasMore) {
						loadMoreText.innerText = '已经到底了';
					}
				}, 200);
			}
		});

		// 默认初始化
		(function () {
			options.callback(pui.cache.getLimitData(options.key, options.limit).data, myScroll);
		})();
	};
})(pui, window, document);
'use strict';

/**
 * 等待层
 */
(function (pui, doc) {
	pui.openWaitLayer = function (loadingText) {
		var temp = pui.createEl('div');
		temp.id = 'J_waitLayer';
		loadingText = loadingText || '努力加载中';
		temp.innerHTML = '<div class="ui-loading-container"><div class="ui-loading"><div class="ui-loading-text">' + loadingText + '<span class="ui-loading-dot">...</span></div></div></div>';
		doc.body.appendChild(temp);
	};
	pui.closeWaitLayer = function () {
		var layer = doc.getElementById('J_waitLayer');
		layer && doc.body.removeChild(layer);
	};
})(pui, document);
'use strict';

(function (pui, doc) {
	var defaultConfig = {
		title: '提示',
		content: '温馨提示',
		cancelName: '取消',
		confirmName: '确定',
		singleBtnName: '我知道了',
		singleBtn: false,
		// 点击遮罩层关闭弹窗
		clickBackdropClosed: true,
		template: ['<div class="ui-modal-container" id="${_modal_id}">', '<div class="ui-modal-header">${title}</div>', '<div class="ui-modal-content ui-divider-fill"> ', '<div class="ui-modal-content-text">${content}</div>', '</div>', '<div class="ui-modal-footer">', '{@if singleBtn}', '<div class="ui-modal-btn" id="modal_single_btn">${singleBtnName}</div>', '{@else}', '<div class="ui-modal-btn ui-divider-vertical" id="modal_cancel_btn">${cancelName}</div>', '<div class="ui-modal-btn" id="modal_confirm_btn">${confirmName}</div>', '{@/if}', '</div>', '</div>'].join('')
	};

	function Modal(option) {
		pui.Event.call(this);

		defaultConfig._modal_id = _getRandomId();

		this.options = pui.extend(defaultConfig, option || {});

		this._init();
		this._initEvents();
	}

	function _getRandomId() {
		return ('modal' + Math.random()).replace(/\./g, '');
	}

	Modal.prototype = {
		_init: function _init() {
			doc.body.appendChild(pui.str2Node(pui.juicer.to_html(this.options.template, this.options)));

			this.modal = doc.getElementById(this.options._modal_id);
			this.cancleBtn = doc.getElementById('modal_cancel_btn');
			this.confirmBtn = doc.getElementById('modal_confirm_btn');
			this.singleBtn = doc.getElementById('modal_single_btn');

			this.backdrop = pui.createEl('div', 'ui-backdrop ui-fade');
			this.backdrop.id = 'modal_backdrop';
			doc.body.appendChild(this.backdrop);

			this.show();
		},

		_initEvents: function _initEvents() {
			var _this = this;

			if (this.options.clickBackdropClosed) {
				this.backdrop.onclick = function () {
					_this._hidden([_this.modal, _this]);
				};
			}

			if (this.singleBtn) {
				this.singleBtn.onclick = function () {
					_this._hidden([_this.modal, _this.backdrop]);

					_this.trigger('pui.modal.single', this);
				};
			}

			if (this.cancleBtn) {
				this.cancleBtn.onclick = function () {
					_this._hidden([_this.modal, _this.backdrop]);

					_this.trigger('pui.modal.cancel', this);
				};
			}

			if (this.confirmBtn) {
				this.confirmBtn.onclick = function () {
					_this.options.click && _this.options.click();
					_this._hidden([_this.modal, _this.backdrop]);

					_this.trigger('pui.modal.confirm', this);
				};
			}
		},

		_hidden: function _hidden(nodes) {
			// var arr = pui.covert2Arr(nodes);
			// //为了给弹窗添加过渡效果， 此处分开处理
			// pui.removeClass(arr[0], 'ui-modal-active');
			// pui.addClass(arr[1], 'ui-fade');
			// pui.removeClass(arr[1], 'ui-in');
			// 有同时弹出多个弹框的需求，此处不设置过渡效果了，同时采用直接移除而不是隐藏
			doc.body.removeChild(this.modal);
			doc.body.removeChild(this.backdrop);
		},

		show: function show() {
			pui.addClass(this.modal, 'ui-modal-active');
			pui.removeClass(this.backdrop, 'ui-fade');
			pui.addClass(this.backdrop, 'ui-in');
		},

		hide: function hide() {
			pui.removeClass(this.modal, 'ui-modal-active');
			pui.addClass(this.backdrop, 'ui-fade');
			pui.removeClass(this.backdrop, 'ui-in');
			this._hidden();
		}
	};

	pui.Modal = Modal;
})(pui, document);
'use strict';

/**
 * 底部弹出层
 * 用法：
 * new Popover({
 *     id: '', 将这个popover插入到含有该id的元素
 *     data: {}, 要渲染的json数据
 * })
 * @param  {[type]} w [description]
 * @return {[type]}   [description]
 */
!function (pui) {
	var counter = -1;
	// 每次创建一个popoverContainer都放入该容器
	var popoverBox = [];
	var defaultConfig = {
		id: 'popover',
		// 滚动容器的最大高度，目前定位400px，可以动态传值
		maxHeight: '400px',
		// type 是红包(bonus)还是活动(activity)
		type: 'bonus',
		// 点击遮罩层关闭弹窗
		clickBackdropClosed: true,
		template: ['<div class="ui-popover" id="popover_container_${counter}">', '<div class="ui-popover-header ui-divider-fill">', '<div class="ui-popover-back" id="cancelBtn_${counter}">取消</div>', '{@if type == "bonus"}', '<div class="ui-popover-title">红包使用</div>', '{@/if}', '{@if type == "activity"}', '<div class="ui-popover-title">优惠活动</div>', '{@/if}', '<div class="ui-popover-menu" id="showTips_${counter}"></div>', '</div>', '<div class="ui-popover-content">', '<div class="ui-popover-row ui-divider-fill">', '{@if type == "bonus"}', '<div class="ui-popover-col-left ui-bonus-forbid">不使用红包</div>', '{@/if}', '{@if type == "activity"}', '<div class="ui-popover-col-left ui-activity-forbid">不参加活动</div>', '{@/if}', '<div class="ui-popover-col-right"> </div>', '</div>', '{@each data as item,index}', '<div class="ui-popover-row ui-divider-fill" data-id="${item.id}" data-cardtype="${item.cardType}" data-start="${item.startAmount}" data-discount="${item.discount}" data-limit="${item.actOrderLimit}">', '{@if type == "bonus"}', '<div class="ui-popover-col-left ui-bonus ui-ellipsis">${item.type}</div>', '<div class="ui-popover-col-right ui-ellipsis">${item.effect}</div>', '{@/if}', '{@if type == "activity"}', '<div class="ui-popover-col-left ui-activity ui-ellipsis">${item.type}</div>', '<div class="ui-popover-col-right ui-ellipsis">${item.activity}</div>', '{@/if}', '</div>', '{@/each}', '</div>', '</div>'].join('')
	};

	function Popover(options) {
		pui.Event.call(this);

		counter++;
		this.options = Object.assign ? Object.assign(defaultConfig, options || {}) : pui.extend(defaultConfig, options || {});

		this.maxHeight = this.options.maxHeight;
		this.popoverBox = popoverBox;

		this._init();
		this._initBackDrop();
		this._initEvents();
	}

	Popover.prototype = {
		_init: function _init() {
			var target = document.getElementById(this.options.id);

			var tpl = pui.juicer.to_html(this.options.template, {
				data: this.options.data,
				type: this.options.type,
				counter: counter
			});

			target && (target.innerHTML = tpl);

			this.popover = this.popoverContainer = document.getElementById('popover_container_' + counter);
			popoverBox.push(this.popoverContainer);
		},

		_initBackDrop: function _initBackDrop() {
			this.backdrop = document.getElementById('backdrop');
			if (!this.backdrop) {
				this.backdrop = document.createElement('div');
				pui.addClass(this.backdrop, 'ui-backdrop ui-fade');
				this.backdrop.id = 'backdrop';
				document.body.appendChild(this.backdrop);
			}
			if (this.options.clickBackdropClosed) {
				this.backdrop.onclick = function () {
					pui.addClass(this, 'ui-fade');
					pui.removeClass(this, 'ui-in');
					popoverBox.forEach(function (v) {
						v.style.height = '0';
					});
				};
			}
		},

		_initEvents: function _initEvents() {
			var _this = this;
			// 左边取消按钮和右边的温馨提示的点击事件
			var cancelBtn = document.getElementById('cancelBtn_' + counter),
			    showTips = document.getElementById('showTips_' + counter);
			cancelBtn.addEventListener('click', function () {
				_this.popoverContainer.style.height = '0';
				pui.addClass(_this.backdrop, 'ui-fade');
				pui.removeClass(_this.backdrop, 'ui-in');
			});

			showTips.addEventListener('click', function () {
				// some code
				_this.trigger('pui.popover.tips', this);
			});

			var showInfoElem = document.getElementById(this.options.showInfoId);
			var items = this.popoverContainer.children[1].children;
			// itemsArr = [...items]; 考虑到兼容性问题，降级
			var itemsArr = [].slice.call(items);
			itemsArr.forEach(function (value, index) {
				value.onclick = function () {
					itemsArr.forEach(function (v) {
						v.children[1].classList.remove('ui-checked');
					});
					this.children[1].classList.add('ui-checked');
					pui.addClass(backdrop, 'ui-fade');
					pui.removeClass(backdrop, 'ui-in');
					_this.popoverContainer.style.height = '0';
					if (showInfoElem) {
						showInfoElem.textContent = this.firstElementChild.textContent;
						showInfoElem.setAttribute('data-id', this.getAttribute('data-id'));
						showInfoElem.setAttribute('data-cardtype', this.getAttribute('data-cardtype'));
						showInfoElem.setAttribute('data-discount', this.getAttribute('data-discount'));
						showInfoElem.setAttribute('data-start', this.getAttribute('data-start'));
						showInfoElem.setAttribute('data-limit', this.getAttribute('data-limit'));
					}

					_this.trigger('pui.popover.hide', this);
				};
			});
		}
	};

	Object.defineProperties(Popover.prototype, {
		show: {
			value: function value() {
				pui.addClass(this.backdrop, 'ui-in');
				pui.removeClass(this.backdrop, 'ui-fade');
				this.popover.style.height = this.maxHeight;
			},
			writable: true
		},
		hide: {
			value: function value() {
				pui.addClass(this.backdrop, 'ui-fade');
				pui.removeClass(this.backdrop, 'ui-in');
				this.popover.style.height = '0';
			},
			writable: true
		}
	});

	pui.Popover = Popover;
}(pui);
"use strict";

/**
 * A js pattern of publish/subscribe.
 * Other all js extend the js, then you can use it`s custome event.
 */
;
(function (pui) {
	function Event() {
		this._events = {};
		pui.extend(this, Event.prototype);
	}

	Event.prototype = {
		on: function on(type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}
			this._events[type].push(fn);
		},

		off: function off(type, fn) {
			if (!this._events[type]) {
				return;
			}

			var index = this._events[type].indexOf(fn);

			~index && this._events[type].splice(index, 1);
		},

		clear: function clear(type) {
			if (!this._events[type]) {
				return;
			}

			this._events[type] = [];
		},

		trigger: function trigger(type) {
			if (!this._events[type]) {
				return;
			}

			var i = 0,
			    len = this._events[type].length;

			if (!len) {
				return;
			}
			// trigger by push order
			for (; i < len; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		}
	};

	pui.Event = Event;
})(pui);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * 搜索页面无搜索结果时显示的信息
 * isWhite: 有些页面是灰的，有些页面是白的，就2种情况
 * options: {
 * 		id: 'test', ||
 * 		text: '暂无影片'，
 * 		isWhite: true, || 
 * 		hasBtn: true, ||
 * 		btnText: '随便逛逛',
 * 		action: function(){}
 * }
 * @return {[type]} [description]
 */
(function (pui) {
	var initNonePage = function initNonePage(id, text, isWhite) {
		var options = {};
		if (arguments.length == 1) {
			if (_typeof(arguments[0]) === 'object') {
				options = arguments[0];
			}
		}

		var targetContainer = document.createElement('div');
		pui.addClass(targetContainer, 'ui-none-container');

		var targetImage = document.createElement('div');
		pui.addClass(targetImage, 'ui-none-image');

		var targetText = document.createElement('div');
		pui.addClass(targetText, 'ui-none-text');
		targetText.textContent = options.text || text;

		targetContainer.appendChild(targetImage);
		targetContainer.appendChild(targetText);

		if (options.hasBtn) {
			var btn = document.createElement('a');
			pui.addClass(btn, 'ui-none-btn');
			btn.innerText = options.btnText || '随便逛逛';
			if (options.action) {
				btn.onclick = function () {
					options.action(this);
				};
			}
			targetContainer.appendChild(btn);
		}

		if (options.id) {
			var container = document.getElementById(options.id);
			container.style.position = 'relative';
			targetContainer.style.cssText = 'position: absolute; margin-top: 100px;';
			container.appendChild(targetContainer);
		} else {
			document.body.appendChild(targetContainer);
		}
		if (options.isWhite) {
			targetContainer.style.backgroundColor = '#fff';
		} else {
			targetContainer.style.backgroundColor = '#ebebeb';
		}

		return targetContainer;
	};
	pui.initNonePage = initNonePage;
})(pui);
'use strict';

/**
 * 侧边栏滑动筛选
 * @return {[type]} [description]
 */
(function (pui) {
	var defaultConfig = {
		// 包含热门，A,B,C,D等这些元素的class
		letterContaierClassName: 'ui-index',
		// input输入框的所在元素的id
		searchContainerId: 'search',
		// 滚动容器的id
		scrollContainerId: 'scrollContainer',
		// 创建出来的侧边栏放置到那个容器
		sliderBarId: 'sliderBarContainer',
		headerId: 'header',
		// 显示字符的那个容器id
		showLetterId: 'symbol' + ('' + Math.random()).replace(/\D/g, ''),
		// 当手指滑到每个字母上是否需要显示触碰到的字符
		showLetter: false
	};
	var letterArr = ['current', 'hot', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

	// header和input容器的默认高度
	var headerHeight = 44;
	var searchHeight = 50;

	function SliderBar(option) {
		option = option || {};
		var options = pui.extend(defaultConfig, option);
		var filterContainer = pui.createEl('div', 'ui-city-filter');
		filterContainer.id = 'filter';

		filterContainer.addEventListener('touchstart', handleEvent, false);
		filterContainer.addEventListener('touchmove', handleEvent, false);
		filterContainer.addEventListener('touchend', handleEvent, false);

		var fragment = document.createDocumentFragment();
		letterArr.forEach(function (v, i) {
			var a = pui.createEl('a');;
			if (i == 0) {
				pui.addClass(a, 'ui-spec');
				a.textContent = '当前';
			} else if (i == 1) {
				pui.addClass(a, 'ui-spec');
				a.textContent = '热门';
			} else {
				a.textContent = v;
			}
			fragment.appendChild(a);
		});
		filterContainer.appendChild(fragment);

		var sliderBarContainer = document.getElementById(options.sliderBarId);
		sliderBarContainer.appendChild(filterContainer);

		// 处理城市列表的每个首字母栏目距离顶部的高度
		var letterItems = document.getElementsByClassName(options.letterContaierClassName);
		pui.covert2Arr(letterItems).forEach(function (v) {
			v.setAttribute('data-top', v.getBoundingClientRect().top);
		});

		// 为处理ios上的fixed定位的bug所做的处理
		var searchContainer = document.getElementById(options.searchContainerId),
		    searchContainerH = searchContainer.offsetHeight,
		    scrollContainer = document.getElementById(options.scrollContainerId),
		    headerContainer = document.getElementById('header') || document.getElementsByTagName('header')[0],
		    headerContainerH = headerContainer.offsetHeight,
		    windowH = window.innerHeight || document.documentElement.clientHeight;
		// 44为header的高度，header的高度一般为44px,当然此处也可以动态计算
		scrollContainer.style.height = windowH - searchContainerH - headerContainerH + 'px';
		scrollContainer.style.overflow = 'hidden';
		scrollContainer.style.overflowY = 'scroll';

		// 下面的touchmove需要用到
		headerHeight = headerContainerH;
		searchHeight = searchContainerH;

		options.showLetter && (this.letterBlock = centerCircle());
	}

	// 当手指滑到每个字母上是否需要显示触碰到的字符
	function centerCircle() {
		var div = '<div id=' + defaultConfig.showLetterId + ' style="opactiy: 0; position: fixed; left: 48%; top: 48%; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(81,157,218, 0); color: #fff; z-index: 10; text-align: center; line-height: 40px; -webkit-transition: all .4s linear"></div>';
		var tmp = document.createElement('div');
		tmp.innerHTML = div;
		var nodeDiv = tmp.firstChild;
		document.body.appendChild(nodeDiv);
		return nodeDiv;
	}

	function handleEvent(e) {
		switch (e.type) {
			case 'touchstart':
			case 'touchmove':
				touchmove(e);
				break;
			case 'touchend':
				touchend(e);
				break;
		}
	}

	function touchmove(e) {
		e.preventDefault();

		var id = getCurrentSelect(e),
		    el,
		    centerCircle;

		if (!id) return false;

		if (el = document.getElementById(id)) {
			scrollContainer.scrollTop = el.getAttribute('data-top') - headerHeight - searchHeight;
		}

		id == 'current' && (id = '当');
		id == 'hot' && (id = '热');

		if (centerCircle = document.getElementById(defaultConfig.showLetterId)) {
			centerCircle.textContent = id;
			centerCircle.style.backgroundColor = 'rgba(81,157,218, .9)';
			centerCircle.style.opacity = '1';
		}
	}

	function touchend(e) {
		var centerCircle = document.getElementById(defaultConfig.showLetterId);
		if (centerCircle) {
			centerCircle.style.backgroundColor = 'rgba(81,157,218, 0)';
			centerCircle.style.opacity = '0';
		}
	}

	function getCurrentSelect(e) {
		var touch = e.changedTouches ? e.changedTouches[0] : e;
		var boxObj = document.getElementById('filter').getBoundingClientRect();
		var eltop = boxObj.top;
		var elheight = boxObj.height / letterArr.length;
		var index = Math.floor((touch.clientY - eltop) / elheight);
		return letterArr[index];
	}

	pui.SliderBar = SliderBar;
})(pui);
'use strict';

(function (pui) {
	var defaultConfig = {
		id: 'switch_container',
		// 是否显示开关中的文本
		showSwitchText: false,
		// 开关文本是显示为英文(ON/OFF)还是显示为中文(开/关)
		isTextCN: false,
		// 英文文本显示为大写还是小写
		isTextUpperCase: true,
		template: ['{@if showSwitchText}', '<div class="ui-switch ui-switch-text">', '{@else}', '<div class="ui-switch">', '{@/if}', '<div class="ui-switch-handle"></div>', '</div>'].join('')
	};

	function Switch(option) {
		option = pui.extend(defaultConfig, option);
		var fragment = pui.str2Node(pui.juicer.to_html(option.template, option));
		var container = document.getElementById(option.id);

		if (container) {
			container.appendChild(fragment);
		} else {
			document.body.appendChild(fragment);
		}

		this.container = container;
		this.target = document.getElementsByClassName('ui-switch')[0];
		this.option = option;

		if (option.showSwitchText && option.isTextCN) {
			pui.removeClass(this.target, 'ui-switch-text');
			pui.addClass(this.target, 'ui-switch-text-cn');
		}
	}

	Object.defineProperties(Switch.prototype, {
		toggle: {
			value: function value() {
				pui.toggleClass(this.target, 'ui-active');
				if (pui.hasClass(this.target, 'ui-active')) {
					return true;
				}
				return false;
			}
		},
		on: {
			value: function value() {
				pui.addClass(this.target, 'ui-active');
				return true;
			}
		},
		off: {
			value: function value() {
				pui.removeClass(this.target, 'ui-active');
				return false;
			}
		}
	});

	pui.Switch = Switch;
})(pui);
'use strict';

/**
 * tab筛选，目前只做成线性的，后面可以增强为各种类型的
 * @return {[type]} [description]
 */
(function (pui) {
	var grid = 'position: fixed; top: 50px; left: 0; right: 0; z-index: 99; background-color: #fff;';
	var grid_row = 'display: -webkit-box; text-align: center;';
	var grid_col = 'height: 50px; line-height: 50px; -webkit-box-flex: 1; width: 1%;';


	function Tab(id, textArr) {
		var html = '<div style="' + grid + '">\n\t\t\t\t\t\t<div style="' + grid_row + '" id="tabRow">\n\t\t\t\t\t\t\t<div style="' + grid_col + '">' + textArr[0] + '</div>\n\t\t\t\t\t\t\t<div style="' + grid_col + '">' + textArr[1] + '</div>\n\t\t\t\t\t\t\t<div style="' + grid_col + '">' + textArr[2] + '</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>';
		var temp = document.createElement('div');
		temp.innerHTML = html;
		var target = document.getElementById(id);

		var gridNode = temp.children[0],
		    tabItems = gridNode.children[0].children,
		    itemArr = Array.from ? Array.from(tabItems) : [].slice.call(tabItems);

		// 默认初始化第一个为选中状态
		tabItems[0].style.boxShadow = '0 2px #519dda';
		tabItems[0].style.color = '#519dda';
		if (target) {
			target.appendChild(gridNode);
		} else {
			document.body.appendChild(gridNode);
		}

		itemArr.forEach(function (v, i) {
			v.addEventListener('click', function () {
				itemArr.forEach(function (v, i) {
					v.style.boxShadow = '0 0';
					v.style.color = '#333';
				});
				this.style.boxShadow = '0 2px #519dda';
				this.style.color = '#519dda';
			}, false);
		});

		this.target = gridNode;
		return this;
	}

	pui.Tab = Tab;
})(pui);
'use strict';

(function (pui) {
	pui.toast = function (message, position) {
		var target = pui.createEl('div', 'ui-toast');
		message = message || '最多选择4个座位';
		position = position || 'bottom';

		target.textContent = message;

		switch (position) {
			case 'bottom':
				pui.addClass(target, 'ui-toast-bottom');
				break;
			case 'top':
				pui.addClass(target, 'ui-toast-top');
				break;
			case 'center':
				pui.addClass(target, 'ui-toast-center');
				break;
		}

		target.addEventListener('webkitTransitionEnd', function () {
			if (!pui.hasClass(target, 'ui-toast-show')) {
				document.body.removeChild(target);
			}
		});

		document.body.appendChild(target);
		pui.addClass(target, 'ui-toast-show');
		setTimeout(function () {
			pui.removeClass(target, 'ui-toast-show');
		}, 2000);
	};
})(pui);
'use strict';

/**
 * 二级筛选tab
 * 类似商圈，距离最近，区域这样的
 * 此控件当初没能总体把控，写的有点复杂，html结构和js逻辑最好不要动
 * @return {[type]} [description]
 */
(function (pui) {
	var defaultConfig = {
		// 动态创建的这个组件将要插入到id这个容器
		id: 'topBar',
		// 每个tab的文本数组，有几个元素，就生成几个tab
		text: ['区域', '特色', '排序'],
		// 此处的模板写的比较复杂，是为了考虑以后的可扩展性
		// 现在区域和特色的左边都只有一个选项，但此模板考虑的是左边有多个选项
		// 以后后台增加左边的栏目，此模板完全不需要改动，只要数据按照指定的json格式传过来就行
		template: ['<div id="fixedCon" class="ui-top-bar ui-position-r">', '<div class="ui-header-container ui-divider-fill" id="tabWrap">', '</div>', '<div class="ui-filter-container">', '<div class="ui-filter-item" id="filterLeft" style="display:none">', '<div class="ui-filter-wrap ui-filter-wrap-lf" id="firstWrapLeft">', '<ul>', '{@each data.regino.value as item,index}', '{@if index == 0}', '<li><a class="ui-lf-item ui-checked">${item.key}</a></li>', '{@else}', '<li><a class="ui-lf-item">${item.key}</a></li>', '{@/if}', '{@/each}', '</ul>', '</div>', '<div class="ui-filter-wrap ui-filter-wrap-rg" id="firstWrapRight">', '{@each data.regino.value as item, index}', '<ul>', '<li class="ui-divider-part"><a class="ui-rg-item">全部</a></li>', '{@each item.value as it}', '<li class="ui-divider-part"><a class="ui-rg-item" data-id="${it.districtId}">${it.cinemaDistrict}</a></li>', '{@/each}', '</ul>', '{@/each}', '</div>', '</div>', '<div class="ui-filter-item" id="filterMiddle" style="display:none">', '<div class="ui-filter-wrap ui-filter-wrap-lf" id="secondWrapLeft">', '<ul>', '{@each data.spec.value as item, index}', '{@if index == 0}', '<li><a class="ui-lf-item ui-checked">${item.key}</a></li>', '{@else}', '<li><a class="ui-lf-item">${item.key}</a></li>', '{@/if}', '{@/each}', '</ul>', '</div>', '<div class="ui-filter-wrap ui-filter-wrap-rg" id="secondWrapRight">', '{@each data.spec.value as item}', '<ul>', '<li class="ui-divider-part"><a class="ui-rg-item">全部</a></li>', '{@each item.value as it}', '<li class="ui-divider-part"><a class="ui-rg-item" data-code="${it.t_dictId}">${it.t_dictName}</a></li>', '{@/each}', '</ul>', '{@/each}', '</div>', '</div>', '<div class="ui-filter-item" id="filterRight" style="display:none">', '<div class="ui-filter-wrap ui-filter-wrap-rg">', '<ul id="thirdWrap">', '{@each data.sort.value as item,index}', '<li class="ui-divider-part"><a class="ui-rg-item" data-code="${item.t_dictId}">${item.t_dictName}</a></li>', '{@/each}', '</ul>', '</div>', '</div>', '</div>', '</div>'].join('')
	};

	function TopBar(option) {
		pui.Event.call(this);

		this.options = pui.extend(defaultConfig, option || {});

		this._init();
		this._initNavText();
		this._initEvents();
		this._initBackDrop();
	}

	TopBar.prototype = {
		_init: function _init() {
			var target = document.getElementById(this.options.id),
			    html = pui.str2Node(pui.juicer.to_html(this.options.template, {
				data: this.options.data
			}));

			if (target) {
				target.appendChild(html);
			} else {
				document.body.appendChild(html);
			}
		},

		_initNavText: function _initNavText() {
			var tabWrap = this.tabWrap = document.getElementById('tabWrap'),
			    fragment = document.createDocumentFragment();
			// 根据传入的文本数组动态生成nav
			this.options.text.forEach(function (v) {
				var node = pui.createEl('nav', 'arrow-black-down');
				node.textContent = v;
				fragment.appendChild(node);
			});
			tabWrap.appendChild(fragment);

			this.originTop = pui.gbcr(tabWrap, 'top');
		},

		_initBackDrop: function _initBackDrop() {
			var _this2 = this;

			var backdrop = this.backdrop = pui.createEl('div', 'ui-backdrop ui-fade');
			backdrop.setAttribute('id', 'backdrop');
			document.getElementById(this.options.id).parentElement.appendChild(backdrop);

			backdrop.onclick = function () {
				_this2._hide();
			};
		},

		_initEvents: function _initEvents() {
			var _this3 = this;

			var tabs = this.tabs = document.querySelectorAll('#tabWrap nav'),
			    firstWrapLeft = pui.covert2Arr(document.querySelectorAll('#firstWrapLeft .ui-lf-item')),
			    firstWrapRight = pui.covert2Arr(document.querySelectorAll('#firstWrapRight ul')),
			    secondWrapLeft = pui.covert2Arr(document.querySelectorAll('#secondWrapLeft .ui-lf-item')),
			    secondWrapRight = pui.covert2Arr(document.querySelectorAll('#secondWrapRight ul')),
			    thirdWrap = pui.covert2Arr(document.querySelectorAll('#thirdWrap li'));

			var firstScroll = new IScroll('#firstWrapRight', {
				preventDefault: false
			});
			var secondScroll = new IScroll('#secondWrapRight', {
				preventDefault: false
			});

			var _this = this;
			pui.covert2Arr(tabs).forEach(function (v) {
				// 只处理选中当前tab的状态
				v.onclick = function () {
					pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
					pui.addClass(tabs, 'arrow-black-down');
					pui.addClass(v, 'arrow-blue-up ui-color-blue');
					pui.addClass(_this.backdrop, 'ui-in');
					pui.removeClass(_this.backdrop, 'ui-fade');
					pui.removeClass(this.tabWrap, 'ui-divider');
					pui.addClass(this.tabWrap, 'ui-divider-fill');

					_this.trigger('pui.topbar.show', this);
				};
			});
			tabs[0].addEventListener('click', function () {
				return _this3._handleNavClick('filterLeft', ['filterRight', 'filterMiddle']);
			}, false);
			tabs[1].addEventListener('click', function () {
				return _this3._handleNavClick('filterMiddle', 'filterLeft filterRight');
			}, false);
			tabs[2].addEventListener('click', function () {
				return _this3._handleNavClick('filterRight', ['filterLeft', 'filterMiddle']);
			}, false);

			// 第一个左边
			firstWrapLeft.forEach(function (v, i) {
				v.onclick = function () {
					pui.removeClass(firstWrapLeft, 'ui-checked');
					pui.addClass(_this3, 'ui-checked');
					pui.addClass(firstWrapRight, 'ui-hidden');
					pui.removeClass(firstWrapRight[i], 'ui-hidden');
				};
			});
			// 第一个右边
			pui.covert2Arr(firstWrapRight[0].children).forEach(function (v, i) {
				v.onclick = function () {
					_this.hide();
					_this.trigger('pui.topbar.hide', this); //this应该将点击的那个元素对象传递给回调
				};
			});
			// 第二个左边
			secondWrapLeft.forEach(function (v, i) {
				v.onclick = function () {
					pui.removeClass(secondWrapLeft, 'ui-checked');
					pui.addClass(_this3, 'ui-checked');
					pui.addClass(secondWrapRight, 'ui-hidden');
					pui.removeClass(secondWrapRight[i], 'ui-hidden');
				};
			});
			// 第二个右边
			pui.covert2Arr(secondWrapRight[0].children).forEach(function (v, i) {
				v.onclick = function () {
					_this.hide();
					_this.trigger('pui.topbar.hide', this);
				};
			});
			// 第三个
			thirdWrap.forEach(function (v, i) {
				v.onclick = function () {
					_this.hide();
					_this.trigger('pui.topbar.hide', this);
				};
			});

			this._handleNavClick = function (showId, hideIds) {
				typeof hideIds == 'string' && (hideIds = hideIds.split(' '));
				var filterItem = document.getElementById(showId);
				// 再来处理当切换tab时的状态变化
				if (filterItem.style.display == 'none') {
					filterItem.style.display = '-webkit-box';
					hideIds.forEach(function (v) {
						return document.getElementById(v).style.display = 'none';
					});
					pui.addClass(backdrop, 'ui-in');
					pui.removeClass(backdrop, 'ui-fade');
					pui.removeClass(this.tabWrap, 'ui-divider-fill');
					pui.addClass(this.tabWrap, 'ui-divider');

					firstScroll.refresh();
					secondScroll.refresh();
					// 禁止滑动
					document.addEventListener('touchmove', this._handleTouchMove, false);

					_this.trigger('pui.topbar.show', this);
				} else {
					filterItem.style.display = 'none';
					pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
					pui.addClass(tabs, 'arrow-black-down');
					pui.removeClass(backdrop, 'ui-in');
					pui.addClass(backdrop, 'ui-fade');
					pui.removeClass(this.tabWrap, 'ui-divider');
					pui.addClass(this.tabWrap, 'ui-divider-fill');

					document.removeEventListener('touchmove', this._handleTouchMove, false);

					_this.trigger('pui.topbar.hide', this);
				}
			};
		},

		_handleTouchMove: function _handleTouchMove(e) {
			e.preventDefault();
		},

		_hide: function _hide() {
			this._handleNavClick('filterRight', ['filterLeft', 'filterMiddle']);
			document.getElementById('filterRight').style.display = 'none';
			document.body.style.overflow = 'auto';
			document.removeEventListener('touchmove', this._handleTouchMove, false);

			pui.removeClass(this.tabs, 'arrow-blue-up ui-color-blue');
			pui.addClass(this.tabs, 'arrow-black-down');
			pui.addClass(this.backdrop, 'ui-fade');
			pui.removeClass(this.backdrop, 'ui-in');
			pui.addClass(this.tabWrap, 'ui-divider-fill');
			pui.removeClass(this.tabWrap, 'ui-divider');

			this.trigger('pui.topbar.hide', this);
		},

		hide: function hide() {
			this._hide();
		}

	};

	pui.TopBar = TopBar;
})(pui);
'use strict';

// data API
(function (doc) {
	var inputs = doc.getElementsByTagName('input');
	[].slice.call(inputs).forEach(function (v) {
		var toggle = v.getAttribute('data-toggle');
		var imageClose = v.nextElementSibling;
		if (toggle && imageClose) {
			v.addEventListener('input', function () {
				var val = this.value;
				if (val) {
					imageClose.classList.remove('ui-hidden');
				} else {
					imageClose.classList.add('ui-hidden');
				}
			}, false);

			imageClose.addEventListener('click', function () {
				v.value = '';
				this.classList.add('ui-hidden');
			}, false);
		}
	});
})(document);

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ('value' in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	// 工具方法，全部作为静态方法
	return function (Constructor, staticProps) {
		defineProperties(Constructor, staticProps);
		return Constructor;
	};
}();

(function (pui) {
	var Util = {};

	_createClass(Util, [{
		// 获取指定行数的高度
		key: 'getLineClampHeight',
		value: function value(elem, lines) {
			var styles = pui.getStyles(elem);
			var lineHeight = styles.getPropertyValue('line-height') || styles['line-height'],
			    fontSize = styles.getPropertyValue('font-size') || styles['font-size'],
			    lineClamp = styles.getPropertyValue('-webkit-line-clamp') || styles.getPropertyValue('line-clamp') || styles['webkitLineClamp'];
			// 行间距
			var lineGaps = parseFloat(lineHeight) - parseFloat(fontSize);
			return lines ? lines * (lineGaps + parseFloat(fontSize)) : +lineClamp * (lineGaps + parseFloat(fontSize));
		}
	}, {
		key: 'isOverflow', //判断文字是否溢出
		value: function value(elem) {
			var target = elem.firstElementChild,
			    // 要操作的那个目标元素（显示...的）
			originh = pui.gbcr(target, 'height');
			target.style.display = 'block';
			var showAllH = pui.gbcr(target, 'height');
			target.style.display = '-webkit-box';
			if (showAllH > originh) {
				return true;
			}
			return false;
		}
	}, {
		key: 'handleJSON', // 这个方法主要用来配合后台处理json数据
		value: function value(keys, jsonArr) {
			if (!Array.isArray(jsonArr) || Array.isArray(jsonArr) && jsonArr.length < 1) {
				return;
			}
			var i = 0,
			    l = jsonArr.length,
			    j = 0,
			    kl = keys.length,
			    ret = [];
			for (; i < l; i++) {
				var o = new Object();
				for (; j < kl; j++) {
					o[j] = jsonArr[i][keys[j]];
				}
				j = 0;
				ret.push(o);
			}
			return ret;
		}
	}, {
		key: 'getParameter', // 获取url中指定的参数
		value: function value(name, loc) {
			var value;
			return (value = new RegExp('[?&]' + name + '=([^&]*)(&?)', 'ig').exec(loc)) ? value[1] : null;
		}
	}, {
		key: 'getStarLevel', // 获取星星等级
		value: function value(score) {
			score = +score;
			var all = 0,
			    half = 0,
			    empty = score == 0 ? 5 : 0,
			    a = '',
			    h = '',
			    e = '';
			if (score % 2 == 0) {
				all = score / 2;
				empty = 5 - all;
			} else {
				all = parseInt(score / 2);
				half = 1;
				empty = 5 - 1 - all;
			}
			var num = Math.max(all, half, empty);

			for (var i = 0; i < num; i++) {
				if (i < all) a += '<img src="../images/StarYesSmall.png" height="12">';
				if (i < half) h += '<img src="../images/StarHalfSmall.png" height="12">';
				if (i < empty) e += '<img src="../images/StarYesNone.png" height="12">';
			}

			return a + h + e + '<span class="ui-color-red">&nbsp;' + score + '</span>';
		}
	}]);

	pui.util = Util;
})(pui);
'use strict';

/**
 * keys: ['NAME_CN', 'ADDRESS', 'distance', 'LOWEST_PRICE', 'RATING', 'id'],
 * keys中的元素依次是：影院名称，地址，距离，多少元起，影院评分，每条记录id
 * @param {[type]} option [description]
 */
var ComponentCinema = function ComponentCinema(option) {
	var template = ['{@each data as item}', '<a class="ui-list-container" data-id="${item[4]}">', '<div class="ui-list-wrap ui-divider-part">', '<div class="ui-list-item ui-p-t-10">${item[0]}</div>', '<div class="ui-list-item ui-list-sub-ctr ui-p-y-5">', '<div class="ui-lf-text ui-app-font-xs ui-app-c6">${item[1]}</div>', '{@if item[2]}', '<div class="ui-rg-text ui-ff-ss ui-app-c6 ui-app-font-xs">${item[2]}</div>', '{@else}', '<div class="ui-rg-text ui-ff-ss ui-app-c6 ui-app-font-xs ui-color-red">${item[5]}</div>', '{@/if}', '</div>', '<div class="ui-list-item ui-p-b-10"><span class="ui-color-red ui-app-font-sg">￥${item[3]}</span>&nbsp;<span class="ui-app-font-xs">起</span></div>', '</div>', '</a>', '{@/each}'].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: pui.util.handleJSON(option.keys, option.data)
	}));

	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
};
'use strict';

/**
 * option配置
 * 	{
 * 		id: 将生成的数据插入到id所在的容器元素
 * 		data: 服务端的传过来的数据，
 * 		由于当初没有协调好，此处对服务端传过来的数据做一次处理
 * 		keys: [],服务端要显用到的字段列表，此列表中的顺序一定不能乱
 * 		keys: ['IMG_LOCATION','TITLE_CN', 'version', 'RATING', 'PLOT', 'REALSE_DATE', 'status', 'id']
 * 		keys中的元素依次代表：影片图片路径，影片名称，影片类型(2d, imax)，影片评分，影片简介，
 * 		上映日期，状态(正在热映0，即将上映1)，每条记录id
 * 	}
 * @param {[type]} option [description]
 */
var ComponentMovie = function ComponentMovie(option) {
	var template = ['{@each data as item}', '<li class="movie-list ui-divider-part" data-id="${item[7]}">', '<div class="list-left"><img src="${imageURL}${item[0]}"></div>', '<div class="list-right">', '<div>', '<div>${item[1]}</div>',
	// '{@if item[2] && item[2][0] == "1"}',
	// '<div class="list-right-icon"><img src="../images/2DSmall.png"></div>',
	// '{@/if}',
	'{@if item[2] && item[2][0] == "2"}', '<div class="list-right-icon"><img src="../images/3DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][0] == "3"}', '<div class="list-right-icon"><img src="../images/ImaxSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][0] == "4"}', '<div class="list-right-icon"><img src="../images/Imax3DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][0] == "5"}', '<div class="list-right-icon"><img src="../images/4DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][0] == "6"}', '<div class="list-right-icon"><img src="../images/HugescreenSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][0] == "7"}', '<div class="list-right-icon"><img src="../images/Hugescreen3DSmall.png"></div>', '{@/if}',
	// '{@if item[2] && item[2][1] == "1"}',
	// '<div class="list-right-icon"><img src="../images/2DSmall.png"></div>',
	// '{@/if}',
	'{@if item[2] && item[2][1] == "2"}', '<div class="list-right-icon"><img src="../images/3DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][1] == "3"}', '<div class="list-right-icon"><img src="../images/ImaxSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][1] == "4"}', '<div class="list-right-icon"><img src="../images/Imax3DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][1] == "5"}', '<div class="list-right-icon"><img src="../images/4DSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][1] == "6"}', '<div class="list-right-icon"><img src="../images/HugescreenSmall.png"></div>', '{@/if}', '{@if item[2] && item[2][1] == "7"}', '<div class="list-right-icon"><img src="../images/Hugescreen3DSmall.png"></div>', '{@/if}', '{@if item[6] == "0"}', '<span class="ui-movie-score">&nbsp;&nbsp;&nbsp;${item[3]}</span>', '{@/if}', '</div>', '<div class="ui-ellipsis-2">${item[4]}</div>', '{@if item[6] == "0"}', '<div class="ui-btn-buy">', '<button data-id="${item[7]}">购票</button>', '</div>', '{@else}', '<div class="ui-btn-presell">', '<div class="ui-app-font-xs">${item[5]}上映</div>', '<button data-id="${item[7]}">预售</button>', '</div>', '{@/if}', '</div>', '</li>', '{@/each}'].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: pui.util.handleJSON(option.keys, option.data),
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
};
'use strict';

var ComponentOrder = function ComponentOrder(option) {
	var template = ['{@each data as item}', '<li class="ui-m-t-10">', '<div class="ui-grid ui-bgcolor-white">', '<div class="ui-grid-row ui-app-font-body ui-p-x-15 ui-p-y-12">${item.merName}</div>', '</div><a href="ticket_detail_paied.html" data-id="${item.orderId}">', '<div class="movie-container" style="margin-top:0">', '<div class="pure-g ui-bgcolor-body ui-p-y-10 ui-p-x-15">', '<div class="pure-u-1-4"><img class="movie-pic" src="${imageURL}${item.imgPath}" width="100%"></div>', '<div class="pure-u-3-4">', '<div class="ui-grid">', '<div class="ui-grid-row ui-app-font-body pure-g ui-p-t-5">', '<div class="pure-u-4-5">${item.prodName}&nbsp;&nbsp;', '{@if item.version && item.version[0] == "1"}', '<img src="../images/2DBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "2"}', '<img src="../images/3DBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "3"}', '<img src="../images/ImaxBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "4"}', '<img src="../images/Imax3DBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "5"}', '<img src="../images/4DBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "6"}', '<img src="../images/HugescreenBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[0] == "7"}', '<img src="../images/Hugescreen3DBlack.png" height="13px">&nbsp;&nbsp;', '{@/if}', '{@if item.version && item.version[1] == "1"}', '<img src="../images/2DBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "2"}', '<img src="../images/3DBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "3"}', '<img src="../images/ImaxBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "4"}', '<img src="../images/Imax3DBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "5"}', '<img src="../images/4DBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "6"}', '<img src="../images/HugescreenBlack.png" height="13px">', '{@/if}', '{@if item.version && item.version[1] == "7"}', '<img src="../images/Hugescreen3DBlack.png" height="13px">', '{@/if}', '</div>', '<div class="pure-u-1-5 ui-text-right">&times; ${item.quantity}</div>', '</div>', '</div>', '<div class="ui-grid">', '<div class="ui-grid-row ui-app-font-body ui-p-t-10 ui-color-disabled">${item.releaseDate}</div>', '</div>', '{@if item.mainOrderStatus == "02" || item.mainOrderStatus == "03" || item.mainOrderStatus == "12"}', '<div class="ui-grid">', '<div class="ui-grid-row ui-app-font-body ui-p-t-10 ui-color-disabled">取票信息&nbsp;&nbsp;&nbsp;&nbsp;${item.ecode}</div>', '</div>', '{@/if}', '</div>', '</div>', '</div></a>', '<div class="ui-grid ui-bgcolor-white">', '<div class="ui-grid-row pure-g ui-app-font-body ui-p-x-15 ui-p-y-15">', '{@if item.mainOrderStatus == "02" || item.mainOrderStatus == "03"}', '<div class="pure-u-1-5">已付款</div>', '{@/if}', '{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}', '<div class="pure-u-1-5">待付款</div>', '{@/if}', '{@if item.mainOrderStatus == "04" || item.mainOrderStatus == "13"}', '<div class="pure-u-1-5">出票失败</div>', '{@/if}', '{@if item.mainOrderStatus == "12"}', '<div class="pure-u-1-5">交易完成</div>', '{@/if}', '{@if item.mainOrderStatus == "06"}', '<div class="pure-u-1-5">退款中</div>', '{@/if}', '{@if item.mainOrderStatus == "08"}', '<div class="pure-u-1-5">已退款</div>', '{@/if}', '{@if item.mainOrderStatus == "07"}', '<div class="pure-u-1-5">退款失败</div>', '{@/if}', '<div class="pure-u-4-5 ui-text-right">共${item.quantity}件商品合计<span class="ui-color-red">￥${item.totalPrice}</span>+${item.scoreCostNum}分</div>', '</div>', '{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}', '<div class="ui-grid ui-bgcolor-white">', '<div class="ui-grid-row ui-text-right ui-app-font-body ui-p-x-15 ui-p-b-15">剩余支付时间： ${item.lefttime}秒</div>', '</div>', '{@/if}', '<div class="ui-grid-row ui-text-right ui-p-b-10 ui-p-r-15">', '<button class="ui-p-x-20">删除</button>', '{@if item.mainOrderStatus == "01" || item.mainOrderStatus == "05"}', '<button class="ui-btn-orange ui-p-x-20 ui-m-l-10">支付</button>', '{@/if}', '</div>', '</div>', '</li>', '{@/each}'].join('');

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: option.data,
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	option.data && (this.count = option.data.length);
};
'use strict';

/**
 * movieId:
 * imgLocation: 
 * movieTitleCn:
 * movieRating: 
 * movieRealseDate
 * @param {[type]} option [description]
 */
var ComponentSwiper = function ComponentSwiper(option) {
	var template = ['<div class="swiper-container ${swiperClass} ui-bgcolor-white">', '<div class="swiper-wrapper">', '{@each data as item}', '<div class="swiper-slide">', '<a class="ui-text-center" href="./moviedetail/detail.html?movieId=${item.movieId}&cityId=${cityId}" data-id="${item.movieId}"><img src="${imageURL}${item.imgLocation}" width="100%">', '{@if status == 0}', '<h3 class="ui-ellipsis">${item.movieTitleCn}</h3>', '<h5>$${item.movieRating | getStarLevel}</h5>', '{@else}', '<h5 class="ui-ellipsis">${item.movieTitleCn}</h5>', '<h5 class="ui-h5 ui-ellipsis">${item.movieRealseDate}上映</h5>', '{@/if}', '</a>', '</div>', '{@/each}', '</div>', '</div>'].join('');

	pui.juicer.register('getStarLevel', pui.util.getStarLevel);

	var nodes = pui.str2Node(pui.juicer.to_html(template, {
		data: option.data,
		cityId: option.cityId,
		status: option.status,
		swiperClass: option.swiperClass,
		imageURL: option.imageURL
	}));
	var target = document.getElementById(option.id);
	target && target.appendChild(nodes);

	if (window.Swiper) {
		new Swiper('.' + option.swiperClass, {
			spaceBetween: 15,
			slidesPerView: option.slidesPerView
		});
	}

	option.data && (this.count = option.data.length);
};