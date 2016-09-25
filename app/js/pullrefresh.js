(function(pui) {
	var config = {
		down: {
			height: 50,
			contentinit: '下拉可以刷新',
			contentdown: '下拉可以刷新',
			contentover: '释放立即刷新',
			contentrefresh: '正在刷新...'
		},
		up: {
			height: 50,
			contentinit: '上拉显示更多',
			contentup: '上拉显示更多',
			contentrefresh: '正在加载...',
			contentnomore: '没有更多数据了',
			duration: 300
		}
	};
	var PullRefresh = {
		init: function(elem) {
			elem.addEventListener('touchstart', handleStart, false);
			elem.addEventListener('touchmove', handleMove, false);
			elem.addEventListener('touchend', handleEnd, false);
		},
		pulldownRefresh: function(elem) {

		},
		pullupLoadMore: function(elem) {

		}
	}


	var J_pullrefresh = document.getElementById('J_pullrefresh');
	var J_topPocket = document.getElementById('J_topPocket');
	var J_pulldownIcon = document.getElementById('J_pulldownIcon');
	var J_pulldownText = document.getElementById('J_pulldownText');
	var J_scroll = document.getElementById('J_scroll');
	var deltaY = 0,
		pageYStart = 0,
		y = 0;

	J_scroll.addEventListener('touchstart', function(e) {
		var touch = e.changedTouches[0];
		pageYStart = touch.pageY;
		J_scroll.style.webkitTransform = 'translate3d(0, 0, 0)';

		console.log('start pagey:' + touch.pageY);
	})
	J_scroll.addEventListener('touchmove', function(e) {
		// console.log(e);
		var touch = e.changedTouches[0];
		// deltaY = touch.pageY - pageYStart;
		deltaY = touch.pageY - pageYStart;
		// console.log(deltaY);
		pui.addClass(J_topPocket, 'ui-visibility');
		if (deltaY > 50) {
			J_pulldownText.innerHTML = config.down.contentover;
			pui.addClass(J_pulldownIcon, 'ui-icon-reverse');
		}



		var translateString = pui.getStyles(J_scroll, 'transform');
		if (translateString) {
			y = pui.parseTranslateMatrix(translateString, 'y');
			console.log('y:' + y);
			y += deltaY;
			J_scroll.style.webkitTransform = 'translate3d(0,' + y + 'px, 0)';
		}

		// deltaY = 0;
		console.log(touch.pageY - pageYStart);
		console.log();
		console.log('------' + deltaY);

		console.log('move pagey:' + touch.pageY);
	})

	J_scroll.addEventListener('touchend', function(e) {
		/*if (deltaY > 50) {
			J_pulldownText.innerHTML = config.down.contentrefresh;
			pui.addClass(J_pulldownIcon, 'ui-icon-refresh');
			J_scroll.style.webkitTransform = 'translate3d(0, 50px, 0)';
		}
		if (deltaY < 50) {
			J_scroll.style.webkitTransform = 'translate3d(0, 0, 0)';
		}
		setTimeout(function() {
			J_scroll.style.webkitTransform = 'translate3d(0, 0, 0)';
			J_pulldownText.innerHTML = config.down.contentinit;
			pui.removeClass(J_topPocket, 'ui-visibility');
			pui.removeClass(J_pulldownIcon, 'ui-icon-reverse');
			pui.addClass(J_pulldownIcon, 'ui-icon-pulldown');
			pui.removeClass(J_pulldownIcon, 'ui-icon-refresh');
		}, 2000);*/
		var touch = e.changedTouches[0];
		deltaY += (touch.pageY - pageYStart);
		// console.log('-----' + deltaY);
		// J_scroll.style.webkitTransform = 'translate3d(0,' + deltaY + 'px, 0)';
	})

})(pui)