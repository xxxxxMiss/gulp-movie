(function(pui, window, doc) {
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

	pui.loadMore = function(options) {
		pui.cache.setData(options.key, options.value);
		var id = options.id || ['J_loadMore', 'J_loadMoreText'];
		var loadMore = doc.getElementById(id[0]);
		var loadMoreText = doc.getElementById(id[1]);

		var myScroll = new IScroll('#' + options.scrollId, {
			preventDefault: false,
			probeType: 1
		});

		myScroll.on('scrollEnd', function() {
			if (this.y <= this.maxScrollY) {
				pui.removeClass(loadMore, 'ui-invisible');

				var result = pui.cache.getLimitData(options.key, options.limit);

				setTimeout(function() {
					options.callback(result.data, myScroll);

					pui.addClass(loadMore, 'ui-invisible');

					if (!result.hasMore) {
						loadMoreText.innerText = '已经到底了';
					}

				}, 200);
			}
		});

		// 默认初始化
		(function() {
			options.callback(pui.cache.getLimitData(options.key, options.limit).data, myScroll);
		})();
	}
})(pui, window, document)