// data API
(function(doc) {
	var inputs = doc.getElementsByTagName('input');
	[].slice.call(inputs).forEach(v => {
		var toggle = v.getAttribute('data-toggle');
		var imageClose = v.nextElementSibling;
		if (toggle && imageClose) {
			v.addEventListener('input', function() {
				var val = this.value;
				if (val) {
					imageClose.classList.remove('ui-hidden');
				} else {
					imageClose.classList.add('ui-hidden');
				}
			}, false);

			imageClose.addEventListener('click', function() {
				v.value = '';
				this.classList.add('ui-hidden');
			}, false)
		}
	})
})(document);


var _createClass = (function() {
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
	return function(Constructor, staticProps) {
		defineProperties(Constructor, staticProps);
		return Constructor;
	}
})();


(function(pui) {
	var Util = {};

	_createClass(Util, [{
		// 获取指定行数的高度
		key: 'getLineClampHeight',
		value: function(elem, lines) {
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
		value: function(elem) {
			var target = elem.firstElementChild, // 要操作的那个目标元素（显示...的）
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
		value: function(keys, jsonArr) {
			if (!Array.isArray(jsonArr) || (Array.isArray(jsonArr) && jsonArr.length < 1)) {
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
		value: function(name, loc) {
			var value;
			return (value = new RegExp('[?&]' + name + '=([^&]*)(&?)', 'ig').exec(loc)) ? value[1] : null;
		}
	}, {
		key: 'getStarLevel', // 获取星星等级
		value: function(score) {
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
				if (i < all)
					a += '<img src="../images/StarYesSmall.png" height="12">';
				if (i < half)
					h += '<img src="../images/StarHalfSmall.png" height="12">';
				if (i < empty)
					e += '<img src="../images/StarYesNone.png" height="12">';
			}

			return a + h + e + '<span class="ui-color-red">&nbsp;' + score + '</span>';
		}
	}])

	pui.util = Util;
})(pui)