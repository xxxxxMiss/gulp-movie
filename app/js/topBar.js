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
			// 此处的模板写的比较复杂，是为了考虑以后的可扩展性
			// 现在区域和特色的左边都只有一个选项，但此模板考虑的是左边有多个选项
			// 以后后台增加左边的栏目，此模板完全不需要改动，只要数据按照指定的json格式传过来就行
			template: ['<div id="fixedCon" class="ui-top-bar ui-position-r">',
				'<div class="ui-header-container ui-divider-fill" id="tabWrap">',
				'</div>',
				'<div class="ui-filter-container">',
				'<div class="ui-filter-item" id="filterLeft" style="display:none">',
				'<div class="ui-filter-wrap ui-filter-wrap-lf" id="firstWrapLeft">',
				'<ul>',
				'{@each data.regino.value as item,index}',
				'{@if index == 0}',
				'<li><a class="ui-lf-item ui-checked">${item.key}</a></li>',
				'{@else}',
				'<li><a class="ui-lf-item">${item.key}</a></li>',
				'{@/if}',
				'{@/each}',
				'</ul>',
				'</div>',
				'<div class="ui-filter-wrap ui-filter-wrap-rg" id="firstWrapRight">',
				'{@each data.regino.value as item, index}',
				'<ul>',
				'<li class="ui-divider-part"><a class="ui-rg-item">全部</a></li>',
				'{@each item.value as it}',
				'<li class="ui-divider-part"><a class="ui-rg-item" data-id="${it.districtId}">${it.cinemaDistrict}</a></li>',
				'{@/each}',
				'</ul>',
				'{@/each}',
				'</div>',
				'</div>',
				'<div class="ui-filter-item" id="filterMiddle" style="display:none">',
				'<div class="ui-filter-wrap ui-filter-wrap-lf" id="secondWrapLeft">',
				'<ul>',
				'{@each data.spec.value as item, index}',
				'{@if index == 0}',
				'<li><a class="ui-lf-item ui-checked">${item.key}</a></li>',
				'{@else}',
				'<li><a class="ui-lf-item">${item.key}</a></li>',
				'{@/if}',
				'{@/each}',
				'</ul>',
				'</div>',
				'<div class="ui-filter-wrap ui-filter-wrap-rg" id="secondWrapRight">',
				'{@each data.spec.value as item}',
				'<ul>',
				'<li class="ui-divider-part"><a class="ui-rg-item">全部</a></li>',
				'{@each item.value as it}',
				'<li class="ui-divider-part"><a class="ui-rg-item" data-code="${it.t_dictId}">${it.t_dictName}</a></li>',
				'{@/each}',
				'</ul>',
				'{@/each}',
				'</div>',
				'</div>',
				'<div class="ui-filter-item" id="filterRight" style="display:none">',
				'<div class="ui-filter-wrap ui-filter-wrap-rg">',
				'<ul id="thirdWrap">',
				'{@each data.sort.value as item,index}',
				'<li class="ui-divider-part"><a class="ui-rg-item" data-code="${item.t_dictId}">${item.t_dictName}</a></li>',
				'{@/each}',
				'</ul>',
				'</div>',
				'</div>',
				'</div>',
				'</div>'
			].join('')
		}

	function TopBar(option) {
		pui.Event.call(this);

		this.options = pui.extend(defaultConfig, option || {});

		this._init();
		this._initNavText();
		this._initEvents();
		this._initBackDrop();
	}

	TopBar.prototype = {
		_init: function() {
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

		_initNavText: function() {
			var tabWrap = this.tabWrap = document.getElementById('tabWrap'),
				fragment = document.createDocumentFragment();
			// 根据传入的文本数组动态生成nav
			this.options.text.forEach(function(v) {
				var node = pui.createEl('nav', 'arrow-black-down');
				node.textContent = v;
				fragment.appendChild(node);
			})
			tabWrap.appendChild(fragment);

			this.originTop = pui.gbcr(tabWrap, 'top');
		},

		_initBackDrop: function() {
			var backdrop = this.backdrop = pui.createEl('div', 'ui-backdrop ui-fade');
			backdrop.setAttribute('id', 'backdrop');
			document.getElementById(this.options.id).parentElement.appendChild(backdrop);

			backdrop.onclick = () => {
				this._hide();
			}
		},

		_initEvents: function() {
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
			pui.covert2Arr(tabs).forEach(v => {
				// 只处理选中当前tab的状态
				v.onclick = function() {
					pui.removeClass(tabs, 'arrow-blue-up ui-color-blue');
					pui.addClass(tabs, 'arrow-black-down');
					pui.addClass(v, 'arrow-blue-up ui-color-blue');
					pui.addClass(_this.backdrop, 'ui-in');
					pui.removeClass(_this.backdrop, 'ui-fade');
					pui.removeClass(this.tabWrap, 'ui-divider');
					pui.addClass(this.tabWrap, 'ui-divider-fill');

					_this.trigger('pui.topbar.show', this);
				}
			})
			tabs[0].addEventListener('click', () => this._handleNavClick('filterLeft', ['filterRight', 'filterMiddle']), false);
			tabs[1].addEventListener('click', () => this._handleNavClick('filterMiddle', 'filterLeft filterRight'), false);
			tabs[2].addEventListener('click', () => this._handleNavClick('filterRight', ['filterLeft', 'filterMiddle']), false);

			// 第一个左边
			firstWrapLeft.forEach((v, i) => {
				v.onclick = () => {
					pui.removeClass(firstWrapLeft, 'ui-checked');
					pui.addClass(this, 'ui-checked');
					pui.addClass(firstWrapRight, 'ui-hidden');
					pui.removeClass(firstWrapRight[i], 'ui-hidden');
				}
			});
			// 第一个右边
			pui.covert2Arr(firstWrapRight[0].children).forEach((v, i) => {
				v.onclick = function() {
					_this.hide();
					_this.trigger('pui.topbar.hide', this); //this应该将点击的那个元素对象传递给回调
				}
			});
			// 第二个左边
			secondWrapLeft.forEach((v, i) => {
				v.onclick = () => {
					pui.removeClass(secondWrapLeft, 'ui-checked');
					pui.addClass(this, 'ui-checked');
					pui.addClass(secondWrapRight, 'ui-hidden');
					pui.removeClass(secondWrapRight[i], 'ui-hidden');
				}
			});
			// 第二个右边
			pui.covert2Arr(secondWrapRight[0].children).forEach((v, i) => {
				v.onclick = function() {
					_this.hide();
					_this.trigger('pui.topbar.hide', this);
				}
			});
			// 第三个
			thirdWrap.forEach((v, i) => {
				v.onclick = function() {
					_this.hide();
					_this.trigger('pui.topbar.hide', this);
				}
			});

			this._handleNavClick = function(showId, hideIds) {
				typeof hideIds == 'string' && (hideIds = hideIds.split(' '));
				var filterItem = document.getElementById(showId);
				// 再来处理当切换tab时的状态变化
				if (filterItem.style.display == 'none') {
					filterItem.style.display = '-webkit-box';
					hideIds.forEach(v => document.getElementById(v).style.display = 'none')
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
			}

		},

		_handleTouchMove: function(e) {
			e.preventDefault();
		},

		_hide: function() {
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

		hide: function() {
			this._hide();
		}

	}

	pui.TopBar = TopBar;
}(pui))