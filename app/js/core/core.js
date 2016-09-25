/**
 * core js
 * other js must be dependend on it
 * @param  {[type]} ){} [description]
 * @return {[type]}       [description]
 */
var pui = (function() {
	// 非贪婪匹配
	var translateRE = /translate(?:3d)?\((.+?)\)/;
	var translateMatrixRE = /matrix(3d)?\((.+?)\)/;
	var pui = function() {}

	pui.createEl = function(nodeName, classes) {
			var node = document.createElement(nodeName);
			classes && (node.className = classes);
			return node;
		}
		/**
		 * 将第二个对象的属性合并到第一个对象
		 * @return {[type]} [description]
		 */
	pui.extend = function(src, target) {
			for (var prop in target) {
				src[prop] = target[prop]
			}
			return src;
		}
		/**
		 * 返回一个fragment
		 * @param  {[type]} str [description]
		 * @return {[type]}     [description]
		 */
	pui.str2Node = function(str) {
			var temp = document.createElement('div'),
				fragment = document.createDocumentFragment();
			temp.innerHTML = str;
			this.covert2Arr(temp.children).forEach(v => {
				fragment.appendChild(v);
			})
			return fragment;
		}
		/**
		 * [将一个类数组, 数组，字符串转化为数组]
		 * @param  {[type]} arrayLike [类数组或单个dom节点]
		 * @return {[type]}           [description]
		 */
	pui.covert2Arr = function(arrayLike) {
		var al = null;
		if (!arrayLike) return [];
		if (arrayLike.nodeType && arrayLike.nodeType === 1) {
			arrayLike = [arrayLike];
		}
		al = arrayLike || [];
		return Array.from ? Array.from(al) : [].slice.call(al);
	}

	/**
	 * 以下的3个方法（removeClass, addClass, 
	 * hasClass）基于classList实现，当然可以使用正则来实现
	 */
	pui.removeClass = function(arrayLike, classes) {
		var arr = this.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(v => {
			classArr.forEach(value => v.classList.remove(value))
		})
	}

	pui.addClass = function(arrayLike, classes) {
		var arr = this.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(v => {
			classArr.forEach(value => v.classList.add(value))
		})
	}

	pui.hasClass = function(elem, className) {
		if (!this.isEleNode(elem)) return false;
		var classes = elem.className.split(' ');
		if (!~classes.indexOf(className)) {
			return false
		}
		return true;
	}

	pui.toggleClass = function(node, classes) {
		if (!this.isEleNode(node)) return false;

		classes = classes.split(' ');
		classes.forEach(v => {
			if (node.classList.contains(v)) {
				this.removeClass(node, v)
			} else {
				this.addClass(node, v);
			}
		})
	}


	/**
	 * 判断一个对象是否是元素节点
	 * @param  {[type]}  node [description]
	 * @return {Boolean}      [description]
	 */
	pui.isEleNode = function(node) {
		if (node === undefined) {
			return false;
		}
		if (node.nodeType && node.nodeType === 1) {
			return true;
		}
	}

	pui.parseTranslate = function(translateString, position) {
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

	pui.parseTranslateMatrix = function(translateString, position) {
		var matrix = translateString.match(translateMatrixRE);
		var is3D = matrix && matrix[1];
		if (matrix) {
			matrix = matrix[2].split(",");
			if (is3D === "3d")
				matrix = matrix.slice(12, 15);
			else {
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

	pui.getStyles = function(elem, property) {
			// CSSStyleDeclaration
			var styles = elem.ownerDocument.defaultView.getComputedStyle(elem, null);
			if (property) {
				return styles.getPropertyValue(property) || styles[property];
			}
			return styles;
		}
		/**
		 * 获取元素的视口坐标
		 * @param  {[type]} elem     [description]
		 * @param  {[type]} property [description]
		 * @return {[type]}          [description]
		 */
	pui.gbcr = function(elem, property) {
		if (!this.isEleNode(elem)) return;
		var o = elem.getBoundingClientRect();
		if (property) {
			return o[property];
		}
		return o;
	}

	pui.observe = function(elem, callback) {
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
	}

	return pui;
})();