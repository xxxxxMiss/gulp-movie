/**
 * 主要处理一些元素的位置改变
 */
(function() {
	/**
	 * 获取滚动条的偏移量
	 * @param  {[type]} w [description]
	 * @return {[type]}   [description]
	 */
	function getScrollOffset(elem, isWindow) {
		if (isWindow) {
			var w = elem.owerDocument.defaultView;
			if (w.pageXOffset != null) {
				return {
					x: w.pageXOffset,
					y: w.pageYOffset
				}
			}
			var doc = w.document;
			if (doc.compatMode == 'CSS1Compat') {
				return {
					x: doc.documentElement.scrollLeft,
					y: doc.documentElement.scrollTop
				}
			}
			// IE下的怪异模式，现在已经基本用不到了
			return {
				x: doc.body.scrollLeft,
				y: doc.body.scrollTop
			}
		}
		return {
			x: elem.scrollLeft,
			y: elem.scrollTop
		}
	}

	/**
	 * 返回elem的视口尺寸
	 * @param  {[type]}  elem     [description]
	 * @param  {Boolean} isWindow [description]
	 * @return {[type]}           [description]
	 */
	function getViewportSize(elem, isWindow) {
		if (isWindow) {
			var w = elem.owerDocument.defaultView;
			var doc = w.document;
			if (w.innerWidth != null) {
				return {
					x: w.innerWidth,
					y: w.innerHeight
				}
			}
			if (doc.compatMode == 'CSS1Compat') {
				return {
					x: doc.documentElement.clientWidth,
					y: doc.documentElement.clientHeight
				}
			}
			return {
				x: doc.body.clientWidth,
				y: doc.body.clientHeight
			}
		}
		return {
			x: elem.clientWidth,
			y: elem.clientHeight
		}
	}
})();