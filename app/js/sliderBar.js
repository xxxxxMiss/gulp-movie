/**
 * 侧边栏滑动筛选
 * @return {[type]} [description]
 */
(function(pui) {
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
	}
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
		letterArr.forEach((v, i) => {
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
		})
		filterContainer.appendChild(fragment);

		var sliderBarContainer = document.getElementById(options.sliderBarId);
		sliderBarContainer.appendChild(filterContainer);

		// 处理城市列表的每个首字母栏目距离顶部的高度
		var letterItems = document.getElementsByClassName(options.letterContaierClassName);
		pui.covert2Arr(letterItems).forEach(v => {
			v.setAttribute('data-top', v.getBoundingClientRect().top);
		})

		// 为处理ios上的fixed定位的bug所做的处理
		var searchContainer = document.getElementById(options.searchContainerId),
			searchContainerH = searchContainer.offsetHeight,
			scrollContainer = document.getElementById(options.scrollContainerId),
			headerContainer = document.getElementById('header') || document.getElementsByTagName('header')[0],
			headerContainerH = headerContainer.offsetHeight,
			windowH = window.innerHeight || document.documentElement.clientHeight;
		// 44为header的高度，header的高度一般为44px,当然此处也可以动态计算
		scrollContainer.style.height = (windowH - searchContainerH - headerContainerH) + 'px';
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
		var centerCircle = document.getElementById(defaultConfig.showLetterId)
		if (centerCircle) {
			centerCircle.style.backgroundColor = 'rgba(81,157,218, 0)';
			centerCircle.style.opacity = '0';
		}
	}

	function getCurrentSelect(e) {
		var touch = e.changedTouches ? e.changedTouches[0] : e;
		var boxObj = document.getElementById('filter').getBoundingClientRect();
		var eltop = boxObj.top;
		var elheight = boxObj.height / (letterArr.length);
		var index = Math.floor((touch.clientY - eltop) / elheight);
		return letterArr[index];
	}

	pui.SliderBar = SliderBar;
})(pui);