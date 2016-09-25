(function(pui) {
	if (typeof window.Map === 'undefined') {
		function Map() {
			var o = {};
			this.set = function(key, value) {
				o[key] = value;
			};
			this.get = function(key) {
				return o[key];
			}
		}
		window.Map = window.Map || Map;
	}
	var map = new Map();
	var cache = {
		setData: function(key, jsonArr) {
			map.set(key, jsonArr);
		},
		getData: function(key) {
			return map.get(key);
		},
		setStorage: function(key, jsonArr) {
			localStorage.setItem(key, JSON.stringify(jsonArr));
		},
		getStorage: function(key) {
			return JSON.parse(localStorage.getItem(key));
		},
		// 获取分页数据，num: 每次要显示的条数
		getLimitData: function(key, num) {
			var data = map.get(key) || [];
			num = num || 5;
			var ret = [],
				i = 0,
				first = undefined;

			for (; i < num; i++) {
				first = data.shift();
				if (first) {
					ret.push(first)
				} else {
					break;
				}
			}
			map.set(key, data);
			return {
				data: ret,
				hasMore: !!data.length
			}
		}
	}
	pui.cache = cache;
})(pui);