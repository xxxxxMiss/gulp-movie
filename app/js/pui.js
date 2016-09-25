/**
 * core js
 * other js must be dependend on it
 * @param  {[type]} ){} [description]
 * @return {[type]}       [description]
 */
var pui = (function() {
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
	pui.extend = function() {
			var arg = arguments,
				target,
				src = arg[0];
			if (src && arg.length == 1) {
				return src;
			}
			target = arg[1];
			for (var prop in target) {
				if (src[prop]) {
					src[prop] = target[prop]; // 存在，覆盖
				} else {
					src[prop] = target[prop]; // 不存在，添加
				}
			}
			return src;
		}
		/**
		 * 将一段html字符串转换为dom节点
		 * @param  {[type]} str [description]
		 * @return {[type]}     [description]
		 */
	pui.str2Node = function(str) {
			var temp = document.createElement('div');
			temp.innerHTML = str;
			var children = temp.children;
			return children.length > 1 ? children : children[0];
		}
		/**
		 * [将一个类数组转化为数组]
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
		var arr = pui.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(v => {
			classArr.forEach(value => v.classList.remove(value))
		})
	}

	pui.addClass = function(arrayLike, classes) {
		var arr = pui.covert2Arr(arrayLike);
		var classArr = classes.split(' ');
		arr.forEach(v => {
			classArr.forEach(value => v.classList.add(value))
		})
	}

	pui.hasClass = function(node, classes) {
		if (!node.nodeType || node.nodeType && node.nodeType != 1) {
			return false;
		}
		classes = classes.split(' ');
		classes.forEach(v => {
			if (!node.classList.contains(v)) {
				return false;
			}
		})
		return true;
	}

	return pui;
})();


/**
 * tab筛选，目前只做成线性的，后面可以增强为各种类型的
 * @return {[type]} [description]
 */
(function(pui) {
	var [grid, grid_row, grid_col] = ['position: fixed; top: 50px; left: 0; right: 0; z-index: 99; background-color: #fff;',
		'display: -webkit-box; text-align: center;',
		'height: 50px; line-height: 50px; -webkit-box-flex: 1; width: 1%;'
	]

	function Tab(id, textArr) {
		var html = `<div style="${grid}">
						<div style="${grid_row}" id="tabRow">
							<div style="${grid_col}">${textArr[0]}</div>
							<div style="${grid_col}">${textArr[1]}</div>
							<div style="${grid_col}">${textArr[2]}</div>
						</div>
					</div>`;
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

		itemArr.forEach(function(v, i) {
			v.addEventListener('click', function() {
				itemArr.forEach(function(v, i) {
					v.style.boxShadow = '0 0';
					v.style.color = '#333';
				})
				this.style.boxShadow = '0 2px #519dda';
				this.style.color = '#519dda';
			}, false)
		})


		this.target = gridNode;
		return this;
	}

	pui.Tab = Tab;
})(pui);

/**
 * 搜索页面无搜索结果时显示的信息
 * @return {[type]} [description]
 */
(function(pui) {
	var initNonePage = function(containerId, showText) {
		if (arguments.length != initNonePage.length) {
			showText = containerId;
			containerId = undefined;
		}


		var targetContainer = document.createElement('div');
		targetContainer.style.position = 'absolute';
		targetContainer.style.top = '45%';
		targetContainer.style.width = '100%';
		targetContainer.style.display = 'none';


		var targetImage = document.createElement('div');
		targetImage.style.height = '50px';
		targetImage.style.width = '50px';
		targetImage.style.margin = '0 auto';
		targetImage.style.background = 'url(../images/icon_active_gray.png) no-repeat center';
		targetImage.style.backgroundSize = '100%';

		var targetText = document.createElement('div');
		targetText.style.width = '100%';
		targetText.style.textAlign = 'center';
		targetText.style.paddingTop = '15px';
		targetText.textContent = showText;


		targetContainer.appendChild(targetImage);
		targetContainer.appendChild(targetText);

		if (containerId) {
			var container = document.getElementById(containerId);
			// var height = container.getBoudingClientRect().height;
			container.style.position = 'relative';
			container.appendChild(targetContainer);
		} else {
			targetContainer.style.position = 'fixed';
			document.body.appendChild(targetContainer);
		}

		return targetContainer;
	}
	pui.initNonePage = initNonePage;
})(pui);

/**
 * 当前一个插件的末尾没有加；结束，此时！就起到作用了
 * 不然会将2个插件单纯的链接在一起，此时就报错了
 * 底部弹出层
 * 用法：
 * new Popover({
 *     id: '', 将这个popover插入到含有该id的元素
 *     data: {}, 要渲染的json数据
 * })
 * @param  {[type]} w [description]
 * @return {[type]}   [description]
 */
! function(pui) {
	var defaultConfig = {
		id: 'popover',
		// 滚动容器的最大高度，目前定位400px，可以动态传值
		maxHeight: '400px',
		template: ['<div class="ui-popover" id="popoverContainer">',
			'<div class="ui-popover-header ui-divider-fill">',
			'<div class="ui-popover-back" id="cancelBtn">取消</div>',
			'<div class="ui-popover-title">红包使用</div>',
			'<div class="ui-popover-menu" id="showTips"></div>',
			'</div>',
			'<div class="ui-popover-content">',
			'<div class="ui-popover-row ui-divider-fill">',
			'<div class="ui-popover-col-left ui-bonus-forbid">不使用红包</div>',
			'<div class="ui-popover-col-right"> </div>',
			'</div>',
			'{@each data as item,index}',
			'<div class="ui-popover-row ui-divider-fill">',
			'<div class="ui-popover-col-left">${item.type}</div>',
			'<div class="ui-popover-col-right">${item.effect}</div>',
			'</div>',
			'{@/each}',
			'</div>',
			'</div>'
		].join('')
	};

	function Popover(options) {
		options = Object.assign(defaultConfig, options);
		var target = document.getElementById(options.id);

		var tpl = juicer.to_html(options.template, {
			data: options.data
		});

		target.innerHTML = tpl;

		var popoverContainer = document.getElementById('popoverContainer');

		var backdrop = document.createElement('div');
		backdrop.className = 'ui-backdrop';
		backdrop.id = 'backdrop';
		document.body.appendChild(backdrop);

		// 左边取消按钮和右边的温馨提示的点击事件
		var cancelBtn = document.getElementById('cancelBtn'),
			showTips = document.getElementById('showTips');
		cancelBtn.addEventListener('click', function() {
			popoverContainer.style.height = '0';
			backdrop.style.display = 'none';
		})

		var items = popoverContainer.children[1].children,
			itemsArr = [...items];
		itemsArr.forEach((value, index) => {
			value.onclick = function() {
				itemsArr.forEach((v) => {
					v.children[1].classList.remove('ui-checked');
				});
				this.children[1].classList.add('ui-checked');
				backdrop.style.display = 'none';
				popoverContainer.style.height = '0';
			}
		})

		// 返回一个popover对象，包含遮罩层和popover对象
		this.popover = popoverContainer;
		this.backdrop = backdrop;
		this.maxHeight = options.maxHeight;
		return this;
	}

	pui.Popover = Popover;
}(pui);


/**
 * 二级筛选tab
 * 类似商圈，距离最近，区域这样的
 * 此控件当初没能总体把控，写的有点复杂，html结构和js逻辑最好不要动
 * @return {[type]} [description]
 */
(function(pui) {
	var
		defaultConfig = {
			// 动态创建的这个组件将要插入到id这个容器
			id: 'topBar',
			// 每个tab的文本数组，有几个元素，就生成几个tab
			text: ['区域', '特色', '排序'],
			// 超过这个元素的高度开始改变定位
			chPositionId: 'test',
			// 默认字体颜色
			color: '#333',
			// 选中tab的字体颜色
			checkedColor: '#519dda',
			template: `<div id="fixedCon" class="ui-top-bar ui-position-r">
					      <div class="ui-header-container ui-divider-fill" id="tabWrap">
					      </div>
					      <div class="ui-filter-container">
					        <div class="ui-filter-item" id="filterLeft" style="display:none">
					          <div class="ui-filter-wrap ui-filter-wrap-lf" id="firstWrapLeft">
					            <ul>
					              <li><a class="ui-lf-item">闸北区</a></li>
					              <li><a class="ui-lf-item ui-checked">徐汇区</a></li>
					              <li><a class="ui-lf-item">浦东新区</a></li>
					              <li><a class="ui-lf-item">徐汇区</a></li>
					              <li><a class="ui-lf-item">津桥区</a></li>
					            </ul>
					          </div>
					          <div class="ui-filter-wrap ui-filter-wrap-rg" id="firstWrapRight">
					            <ul>
					              <li class="ui-divider-part"><a class="ui-rg-item">中国</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">美国</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">英国</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">俄罗斯</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">德国</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">法国</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">阿根廷</a></li>
					            </ul>
					            <ul class="ui-hidden">
					              <li class="ui-divider-part"><a class="ui-rg-item">eclipse</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">netbeans</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">webstrom</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">sublime text</a></li>
					            </ul>
					            <ul class="ui-hidden">
					              <li class="ui-divider-part"><a class="ui-rg-item">微信</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">QQ</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">陌陌</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">飞信</a></li>
					            </ul>
					          </div>
					        </div>
					        <div class="ui-filter-item" id="filterMiddle" style="display:none">
					          <div class="ui-filter-wrap ui-filter-wrap-rg">
					            <ul>
					              <li class="ui-divider-part"><a class="ui-rg-item">500m</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">1km</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">1.5km</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">2km</a></li>
					            </ul>
					          </div>
					        </div>
					        <div class="ui-filter-item" id="filterRight" style="display:none">
					          <div class="ui-filter-wrap ui-filter-wrap-rg">
					            <ul>
					              <li class="ui-divider-part"><a class="ui-rg-item">20元起</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">30元起</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">50元起</a></li>
					              <li class="ui-divider-part"><a class="ui-rg-item">100元起</a></li>
					            </ul>
					          </div>
					        </div>
					      </div>
					    </div>`
		}

	function TopBar(option) {
		var opt = pui.extend(
			defaultConfig, option);
		var target = document.getElementById(opt.id),
			chPositionHeight = 0,
			chPositionEl = document.getElementById(opt.chPositionId),
			html = pui.str2Node(opt.template);
		chPositionEl && (chPositionHeight = chPositionEl.getBoundingClientRect().height)

		if (target) {
			target.appendChild(html);
		} else {
			document.body.appendChild(html);
		}

		// 与弹窗对应的蒙版
		var backdrop = pui.createEl('div', 'ui-backdrop');
		backdrop.setAttribute('id', 'backdrop');
		document.body.appendChild(backdrop);


		var tabWrap = document.getElementById('tabWrap'),
			fragment = document.createDocumentFragment();
		// 根据传入的文本数组动态生成nav
		opt.text.forEach(function(v) {
			var node = pui.createEl('nav', 'arrow-black-down');
			node.textContent = v;
			fragment.appendChild(node);
		})
		tabWrap.appendChild(fragment);


		var tabs = document.querySelectorAll('#tabWrap nav'),
			firstWrapLeft = pui.covert2Arr(document.querySelectorAll('#firstWrapLeft .ui-lf-item')),
			firstWrapRight = pui.covert2Arr(document.querySelectorAll('#firstWrapRight ul')),
			backdropNode = document.getElementById('backdrop');

		pui.covert2Arr(tabs).forEach(function(v) {
			// 只处理选中当前tab的状态
			v.onclick = function() {
				pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
				pui.addClass(tabs, 'arrow-black-down');
				pui.addClass(this, 'arrow-blue-up ui-color-blue');
				backdropNode.style.display = 'block';
				// 只要出现遮罩层，静止页面滚动
				document.body.style.overflow = 'hidden';
				// 参照支付宝的外卖，不管开始处于什么位置，只要点击筛选，都会置于初始的滚动高度
				document.body.scrollTop = chPositionHeight;
			}
		})
		tabs[0].addEventListener('click', () => handleNavClick('filterLeft', ['filterRight', 'filterMiddle']), false);
		tabs[1].addEventListener('click', () => handleNavClick('filterMiddle', 'filterLeft filterRight'), false);
		tabs[2].addEventListener('click', () => handleNavClick('filterRight', ['filterLeft', 'filterMiddle']), false);

		firstWrapLeft.forEach(function(v, i) {
			v.onclick = function() {
				pui.removeClass(firstWrapLeft, 'ui-checked');
				pui.addClass(this, 'ui-checked');
				pui.addClass(firstWrapRight, 'ui-hidden');
				pui.removeClass(firstWrapRight[i], 'ui-hidden');
			}
		})

		/**
		 * [handleNavClick description]
		 * @param  {[type]} showId  [要显示的元素的id]
		 * @param  {[Array|String]} hideIds [要隐藏的元素的id]
		 * @return {[type]}         [description]
		 */
		function handleNavClick(showId, hideIds) {
			typeof hideIds == 'string' && (hideIds = hideIds.split(' '));
			var filterItem = document.getElementById(showId);
			// 再来处理当切换tab时的状态变化
			if (filterItem.style.display == 'none') {
				filterItem.style.display = '-webkit-box';
				hideIds.forEach(v => document.getElementById(v).style.display = 'none')
				backdropNode.style.display = 'block';
				document.body.style.overflow = 'hidden';
			} else {
				filterItem.style.display = 'none';
				pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
				pui.addClass(tabs, 'arrow-black-down');
				backdropNode.style.display = 'none';
				document.body.style.overflow = 'auto';
			}
		}

		// 点击遮罩层，全部样式复位
		backdropNode.onclick = function() {
			handleNavClick('filterRight', ['filterLeft', 'filterMiddle']);
			document.getElementById('filterRight').style.display = 'none';
			document.body.style.overflow = 'auto';
			pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
			pui.addClass(tabs, 'arrow-black-down');
			this.style.display = 'none';
		}


		// tabs.on('click', function() {
		// 	var index = $(this).index(),
		// 		url;
		// })

	}

	function ajaxData(url, callback) {
		$.ajax({
			url: url,
			type: 'text/html',
			dataType: 'jsonp',
			success: function(data) {
				callback(data);
			},
			error: function() {
				console.log('ajax request error!');
			}
		})
	}

	pui.TopBar = TopBar;
}(pui));


(function(pui) {

	/**
	 * 按照道理应该提供一张足够大的图片，这样模糊效果才会好
	 * 因为绘制的canvas是根据原图片大小来的
	 * 精确计算无法达到缩放比例，故直接放大很大比例，超出隐藏
	 * @param  {[type]} option [description]
	 * @return {[type]}        [description]
	 */
	pui.blurImage = function(option) {
		var srcImageId = option.srcImageId, // 图片id
			canvasId = option.canvasId, //画布id
			blur = option.blur, //模糊程度
			topContainerId = option.topContainerId, // 包含图片的最外层的元素id

			canvas = document.getElementById(canvasId),
			srcImage = document.getElementById(srcImageId),
			topContainer = document.getElementById(topContainerId).getBoundingClientRect(),
			topContainerW = topContainer.width,
			topContainerH = topContainer.height;


		srcImage.addEventListener('load', function() {
			handleImage();
		}, false);

		function handleImage() {
			var imgNaturalW = srcImage.naturalWidth,
				imgNaturalH = srcImage.naturalHeight,

				scaleY = Math.floor(topContainerH / imgNaturalH) + 1;

			canvas.style.webkitTransform = `scaleX(20) scaleY(${scaleY})`;

			stackBlurImage(srcImageId, canvasId, blur, false);
		}
		handleImage();

		// 返回最外层容器的宽高，因为下面的定位需要用到这个高度
		return {
			width: topContainerW,
			height: topContainerH
		}
	}

	/*
	StackBlur - a fast almost Gaussian Blur For Canvas
	*/

	var mul_table = [
		512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
		454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
		482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
		437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
		497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
		320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
		446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
		329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
		505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
		399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
		324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
		268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
		451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
		385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
		332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
		289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
	];


	var shg_table = [
		9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
		17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
		19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
		20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
		21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
		21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
		22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
		22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
	];

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

		if (blurAlphaChannel)
			stackBlurCanvasRGBA(canvasID, 0, 0, w, h, radius);
		else
			stackBlurCanvasRGB(canvasID, 0, 0, w, h, radius);
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
					alert("Cannot access local image");
					throw new Error("unable to access local image data: " + e);
					return;
				}
			}
		} catch (e) {
			alert("Cannot access image");
			throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
			r_out_sum, g_out_sum, b_out_sum, a_out_sum,
			r_in_sum, g_in_sum, b_in_sum, a_in_sum,
			pr, pg, pb, pa, rbs;

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
				r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
				b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
				a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;

				stack = stack.next;
			}


			stackIn = stackStart;
			stackOut = stackEnd;
			for (x = 0; x < width; x++) {
				pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
				if (pa != 0) {
					pa = 255 / pa;
					pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
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

				p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

				r_in_sum += (stackIn.r = pixels[p]);
				g_in_sum += (stackIn.g = pixels[p + 1]);
				b_in_sum += (stackIn.b = pixels[p + 2]);
				a_in_sum += (stackIn.a = pixels[p + 3]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				a_sum += a_in_sum;

				stackIn = stackIn.next;

				r_out_sum += (pr = stackOut.r);
				g_out_sum += (pg = stackOut.g);
				b_out_sum += (pb = stackOut.b);
				a_out_sum += (pa = stackOut.a);

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
				yi = (yp + x) << 2;

				r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
				b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
				a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;

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
				pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
				if (pa > 0) {
					pa = 255 / pa;
					pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
					pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
					pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
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

				p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

				r_sum += (r_in_sum += (stackIn.r = pixels[p]));
				g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
				b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
				a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));

				stackIn = stackIn.next;

				r_out_sum += (pr = stackOut.r);
				g_out_sum += (pg = stackOut.g);
				b_out_sum += (pb = stackOut.b);
				a_out_sum += (pa = stackOut.a);

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
					alert("Cannot access local image");
					throw new Error("unable to access local image data: " + e);
					return;
				}
			}
		} catch (e) {
			alert("Cannot access image");
			throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
			r_out_sum, g_out_sum, b_out_sum,
			r_in_sum, g_in_sum, b_in_sum,
			pr, pg, pb, rbs;

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
				r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
				b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;
			}


			stackIn = stackStart;
			stackOut = stackEnd;
			for (x = 0; x < width; x++) {
				pixels[yi] = (r_sum * mul_sum) >> shg_sum;
				pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

				r_in_sum += (stackIn.r = pixels[p]);
				g_in_sum += (stackIn.g = pixels[p + 1]);
				b_in_sum += (stackIn.b = pixels[p + 2]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;

				stackIn = stackIn.next;

				r_out_sum += (pr = stackOut.r);
				g_out_sum += (pg = stackOut.g);
				b_out_sum += (pb = stackOut.b);

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
				yi = (yp + x) << 2;

				r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
				g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
				b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;

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
				pixels[p] = (r_sum * mul_sum) >> shg_sum;
				pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

				r_sum += (r_in_sum += (stackIn.r = pixels[p]));
				g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
				b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));

				stackIn = stackIn.next;

				r_out_sum += (pr = stackOut.r);
				g_out_sum += (pg = stackOut.g);
				b_out_sum += (pb = stackOut.b);

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

(function(pui) {

	// This is the main function for not only compiling but also rendering.
	// there's at least two parameters need to be provided, one is the tpl, 
	// another is the data, the tpl can either be a string, or an id like #id.
	// if only tpl was given, it'll return the compiled reusable(可重复使用的) function.
	// if tpl and data were given at the same time, it'll return the rendered 
	// result immediately.

	var juicer = function() {

		//  将类数组转换为真正的数组，便于使用数组的一些方法
		var args = [].slice.call(arguments);

		args.push(juicer.options);

		//  可以匹配这样的id(#:-.)
		if (args[0].match(/^\s*#([\w:\-\.]+)\s*$/igm)) {
			args[0].replace(/^\s*#([\w:\-\.]+)\s*$/igm, function($, $id) { // $(#:-.)    $id(:-.)
				// node.js环境没有`document`，所以会先判断`document`
				var _document = document;
				var elem = _document && _document.getElementById($id);
				args[0] = elem ? (elem.value || elem.innerHTML) : $;
			});
		}

		// 如果是浏览器环境
		if (typeof(document) !== 'undefined' && document.body) {
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
		escapereplace: function(k) {
			return __escapehtml.escapehash[k];
		},
		//  如果传入的str不是字符串，直接返回
		//  否则调用escapereplace方法对html字符转义替换
		escaping: function(str) {
			return typeof(str) !== 'string' ? str : str.replace(/[&<>"]/igm, this.escapereplace);
		},
		// 检测变量是否定义
		detection: function(data) {
			return typeof(data) === 'undefined' ? '' : data;
		}
	};

	//	如果控制台支持打印，从警告级别打印出错误信息。否则直接抛出
	var __throw = function(error) {
		if (typeof(console) !== 'undefined') {
			if (console.warn) {
				console.warn(error);
				return;
			}

			if (console.log) {
				console.log(error);
				return;
			}
		}

		throw (error);
	};

	// 传入两个对象，并返回一个对象，这个新对象同时具有两个对象的属性和方法。
	// 由于 o 是引用传递，因此 o 会被修改
	var __creator = function(o, proto) {
		o = o !== Object(o) ? {} : o; //	如果o不是一个对象，创建一个空对象赋值给o。是，直接赋值给o

		if (o.__proto__) { //	如果o存在原型，改变o的原型指向
			o.__proto__ = proto;
			return o;
		}

		var empty = function() {};
		//  Object.create(proto, [ propertiesObject ]) 方法创建一个拥有指定原型和若干个指定属性的对象。
		var n = Object.create ? //  如果支持create创建对象，用它创建对象。否则new一个对象
			Object.create(proto) :
			new(empty.prototype = proto, empty);

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
	var annotate = function(fn) {
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
			arg.replace(FN_ARG, function(all, underscore, name) { // TODO 函数的各个参数
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
	juicer.tagInit = function() {
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
		var helperRegisterStart = juicer.tags.operationOpen + 'helper\\s*([^}]*?)\\s*' + juicer.tags.operationClose; //{@ helper}
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
	juicer.set = function(conf, value) {
		var that = this;

		// $ () [] + ^ {} ? * | . 
		// 添加双斜杠转义
		var escapePattern = function(v) {
			return v.replace(/[\$\(\)\[\]\+\^\{\}\?\*\|\.]/igm, function($) {
				return '\\' + $;
			});
		};

		var set = function(conf, value) {
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
	juicer.register = function(fname, fn) {
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

	juicer.unregister = function(fname) {
		var _method = this.options._method;

		// 没有检测是否注销的是系统自定义函数
		// 用户不要注销错了
		if (_method.hasOwnProperty(fname)) {
			return delete _method[fname];
		}
	};

	/**
	 * 模板引擎
	 * 作为构造函数使用
	 */
	juicer.template = function(options) {
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
		this.__interpolate = function(_name, _escape, options) {
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
			return '<%= ' + (_escape ? '_method.__escapehtml.escaping' : '') + '(' +
				(!options || options.detection !== false ? '_method.__escapehtml.detection' : '') + '(' +
				_fn +
				')' +
				')' +
				' %>';
		};

		//  模板解析方法
		//  返回处理后的模板
		this.__removeShell = function(tpl, options) {
			//  计数器
			//  利用计数器避免遍历时创建的临时变量与其他变量冲突
			var _counter = 0;

			tpl = tpl
				//  inline helper register
				//  juicer.settings.helperRegister内联辅助注册函数
				.replace(juicer.settings.helperRegister, function($, helperName, fnText) {
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
			.replace(juicer.settings.forstart, function($, _name, alias, key) {
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
					return '<% ~function() {' +
						'for(var ' + _iterate + ' in ' + _name + ') {' +
						'if(' + _name + '.hasOwnProperty(' + _iterate + ')) {' +
						'var ' + alias + '=' + _name + '[' + _iterate + '];' +
						(key ? ('var ' + key + '=' + _iterate + ';') : '') +
						' %>';
				})
				.replace(juicer.settings.forend, '<% }}}(); %>')

			// if expression
			// {@if item.name != ''}
			// 'if\\s*([^}]*?)'
			.replace(juicer.settings.ifstart, function($, condition) {
					return '<% if(' + condition + ') { %>';
				})
				.replace(juicer.settings.ifend, '<% } %>')

			// else expression
			.replace(juicer.settings.elsestart, function($) {
				return '<% } else { %>';
			})

			// else if expression
			.replace(juicer.settings.elseifstart, function($, condition) {
				return '<% } else if(' + condition + ') { %>';
			})

			// interpolate without escape
			// '([\\s\\S]+?)'
			// 解析禁止对其内容转义的变量
			.replace(juicer.settings.noneencode, function($, _name) {
				return that.__interpolate(_name, false, options);
			})

			// interpolate with escape
			.replace(juicer.settings.interpolate, function($, _name) {
				return that.__interpolate(_name, true, options);
			})

			// clean up comments
			// {#}   '[^}]*?'
			// 去掉注释
			.replace(juicer.settings.inlinecomment, '')

			// range expression
			// 'each\\s*(\\w*?)\\s*in\\s*range\\(([^}]+?)\\s*,\\s*([^}]+?)\\)'
			// 解析辅助循环
			.replace(juicer.settings.rangestart, function($, _name, start, end) {
				var _iterate = 'j' + _counter++;
				return '<% ~function() {' +
					'for(var ' + _iterate + '=' + start + ';' + _iterate + '<' + end + ';' + _iterate + '++) {{' +
					'var ' + _name + '=' + _iterate + ';' +
					' %>';
			})

			// include sub-template
			// 'include\\s*([^}]*?)\\s*,\\s*([^}]*?)'
			// 子模板渲染
			.replace(juicer.settings.include, function($, tpl, data) {
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
		this.__toNative = function(tpl, options) {
			return this.__convert(tpl, !options || options.strip);
		};

		// 词法分析，生成变量和自定义函数定义语句
		this.__lexicalAnalyze = function(tpl) {
			var buffer = []; // 变量
			var method = []; // 方法，已经存储到`juicer.options.__method`才能被采用
			var prefix = ''; // 返回结果
			var reserved = [
				'if', 'each', '_', '_method', 'console',
				'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do',
				'finally', 'for', 'function', 'in', 'instanceof', 'new', 'return', 'switch',
				'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'null', 'typeof',
				'class', 'enum', 'export', 'extends', 'import', 'super', 'implements', 'interface',
				'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'const', 'arguments',
				'true', 'false', 'undefined', 'NaN'
			];

			//  自定义数组indexOf方法
			var indexOf = function(array, item) {
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

			var variableAnalyze = function($, statement) {
				statement = statement.match(/\w+/igm)[0];

				// 如果没有分析过，并且非保留字符
				if (indexOf(buffer, statement) === -1 && indexOf(reserved, statement) === -1 && indexOf(method, statement) === -1) {

					// avoid re-declare native function, if not do this, template 
					// `{@if encodeURIComponent(name)}` could be throw undefined.

					// 跳过window内置函数
					if (typeof(window) !== 'undefined' && typeof(window[statement]) === 'function' && window[statement].toString().match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i)) {
						return $;
					}

					// 跳过node.js内置函数
					// compatible for node.js
					if (typeof(global) !== 'undefined' && typeof(global[statement]) === 'function' && global[statement].toString().match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i)) {
						return $;
					}

					// avoid re-declare registered function, if not do this, template 
					// `{@if registered_func(name)}` could be throw undefined.

					// 如果是自定义函数
					if (typeof(juicer.options._method[statement]) === 'function' || juicer.options._method.hasOwnProperty(statement)) {
						method.push(statement);
						return $;
					}

					buffer.push(statement); // fuck ie
				}

				return $;
			};

			// 分析出现在for/变量/if/elseif/include中的变量名
			tpl.replace(juicer.settings.forstart, variableAnalyze).
			replace(juicer.settings.interpolate, variableAnalyze).
			replace(juicer.settings.ifstart, variableAnalyze).
			replace(juicer.settings.elseifstart, variableAnalyze).
			replace(juicer.settings.include, variableAnalyze).
			replace(/[\+\-\*\/%!\?\|\^&~<>=,\(\)\[\]]\s*([A-Za-z_]+)/igm, variableAnalyze);

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
		this.__convert = function(tpl, strip) {
			var buffer = [].join(''); //  创建一个空字符串

			buffer += "'use strict';"; // use strict mode
			buffer += "var _=_||{};";
			buffer += "var _out='';_out+='";

			if (strip !== false) {
				buffer += tpl
					.replace(/\\/g, "\\\\") //  单斜杠转义
					.replace(/[\r\t\n]/g, " ") //  换行符，制表符替换
					.replace(/'(?=[^%]*%>)/g, "\t")
					.split("'").join("\\'")
					.split("\t").join("'")
					.replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='")
					.split("<%").join("';")
					.split("%>").join("_out+='") +
					"';return _out;";

				return buffer;
			}

			buffer += tpl
				.replace(/\\/g, "\\\\")
				.replace(/[\r]/g, "\\r")
				.replace(/[\t]/g, "\\t")
				.replace(/[\n]/g, "\\n")
				//(?=exp)正向前瞻  (?!exp)负向前瞻
				//正向前瞻用来检查接下来的出现的是不是某个特定的字符集。
				//而负向前瞻则是检查接下来的不应该出现的特定字符串集。零宽断言是不会被捕获的。
				.replace(/'(?=[^%]*%>)/g, "\t")
				.split("'").join("\\'")
				.split("\t").join("'")
				.replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='")
				.split("<%").join("';")
				.split("%>").join("_out+='") +
				"';return _out.replace(/[\\r\\n]\\s+[\\r\\n]/g, '\\r\\n');";

			return buffer;
		};

		// 渲染模板的入口
		this.parse = function(tpl, options) {
			var _that = this;

			if (!options || options.loose !== false) {
				tpl = this.__lexicalAnalyze(tpl) + tpl;
			}

			tpl = this.__removeShell(tpl, options);
			tpl = this.__toNative(tpl, options);

			this._render = new Function('_, _method', tpl);

			this.render = function(_, _method) {
				if (!_method || _method !== that.options._method) {
					_method = __creator(_method, that.options._method);
				}

				return _that._render.call(this, _, _method);
			};

			return this;
		};
	};

	//  编译模板，如果成功编译，返回编译后的模板
	juicer.compile = function(tpl, options) {
		if (!options || options !== this.options) {
			options = __creator(options, this.options);
		}

		try {
			var engine = this.__cache[tpl] ?
				this.__cache[tpl] :
				new this.template(this.options).parse(tpl, options);

			if (!options || options.cache !== false) {
				this.__cache[tpl] = engine;
			}

			return engine; // 如果成功编译，返回编译后的模板

		} catch (e) {
			__throw('Juicer Compile Exception: ' + e.message);

			return {
				render: function() {} // noop
			};
		}
	};

	juicer.to_html = function(tpl, data, options) {
		if (!options || options !== this.options) {
			options = __creator(options, this.options);
		}

		return this.compile(tpl, options).render(data, options._method);
	};

	// typeof(module) !== 'undefined' && module.exports ? module.exports = juicer : this.juicer = juicer;
	pui.juicer = juicer;
})(pui);