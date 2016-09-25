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
! function(pui) {
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
		template: ['<div class="ui-popover" id="popover_container_${counter}">',
			'<div class="ui-popover-header ui-divider-fill">',
			'<div class="ui-popover-back" id="cancelBtn_${counter}">取消</div>',
			'{@if type == "bonus"}',
			'<div class="ui-popover-title">红包使用</div>',
			'{@/if}',
			'{@if type == "activity"}',
			'<div class="ui-popover-title">优惠活动</div>',
			'{@/if}',
			'<div class="ui-popover-menu" id="showTips_${counter}"></div>',
			'</div>',
			'<div class="ui-popover-content">',
			'<div class="ui-popover-row ui-divider-fill">',
			'{@if type == "bonus"}',
			'<div class="ui-popover-col-left ui-bonus-forbid">不使用红包</div>',
			'{@/if}',
			'{@if type == "activity"}',
			'<div class="ui-popover-col-left ui-activity-forbid">不参加活动</div>',
			'{@/if}',
			'<div class="ui-popover-col-right"> </div>',
			'</div>',
			'{@each data as item,index}',
			'<div class="ui-popover-row ui-divider-fill" data-id="${item.id}" data-cardtype="${item.cardType}" data-start="${item.startAmount}" data-discount="${item.discount}" data-limit="${item.actOrderLimit}">',
			'{@if type == "bonus"}',
			'<div class="ui-popover-col-left ui-bonus ui-ellipsis">${item.type}</div>',
			'<div class="ui-popover-col-right ui-ellipsis">${item.effect}</div>',
			'{@/if}',
			'{@if type == "activity"}',
			'<div class="ui-popover-col-left ui-activity ui-ellipsis">${item.type}</div>',
			'<div class="ui-popover-col-right ui-ellipsis">${item.activity}</div>',
			'{@/if}',
			'</div>',
			'{@/each}',
			'</div>',
			'</div>'
		].join('')
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
		_init: function() {
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

		_initBackDrop: function() {
			this.backdrop = document.getElementById('backdrop');
			if (!this.backdrop) {
				this.backdrop = document.createElement('div');
				pui.addClass(this.backdrop, 'ui-backdrop ui-fade');
				this.backdrop.id = 'backdrop';
				document.body.appendChild(this.backdrop);
			}
			if (this.options.clickBackdropClosed) {
				this.backdrop.onclick = function() {
					pui.addClass(this, 'ui-fade');
					pui.removeClass(this, 'ui-in');
					popoverBox.forEach(v => {
						v.style.height = '0';
					})
				}
			}
		},

		_initEvents: function() {
			var _this = this;
			// 左边取消按钮和右边的温馨提示的点击事件
			var cancelBtn = document.getElementById('cancelBtn_' + counter),
				showTips = document.getElementById('showTips_' + counter);
			cancelBtn.addEventListener('click', function() {
				_this.popoverContainer.style.height = '0';
				pui.addClass(_this.backdrop, 'ui-fade');
				pui.removeClass(_this.backdrop, 'ui-in');
			})

			showTips.addEventListener('click', function() {
				// some code
				_this.trigger('pui.popover.tips', this);
			})

			var showInfoElem = document.getElementById(this.options.showInfoId);
			var items = this.popoverContainer.children[1].children;
			// itemsArr = [...items]; 考虑到兼容性问题，降级
			var itemsArr = [].slice.call(items);
			itemsArr.forEach((value, index) => {
				value.onclick = function() {
					itemsArr.forEach((v) => {
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
				}
			})
		}
	}

	Object.defineProperties(Popover.prototype, {
		show: {
			value: function() {
				pui.addClass(this.backdrop, 'ui-in');
				pui.removeClass(this.backdrop, 'ui-fade');
				this.popover.style.height = this.maxHeight;
			},
			writable: true
		},
		hide: {
			value: function() {
				pui.addClass(this.backdrop, 'ui-fade');
				pui.removeClass(this.backdrop, 'ui-in');
				this.popover.style.height = '0';
			},
			writable: true
		}
	})

	pui.Popover = Popover;
}(pui)