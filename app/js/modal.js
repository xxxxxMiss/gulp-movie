(function(pui, doc) {
	var defaultConfig = {
		title: '提示',
		content: '温馨提示',
		cancelName: '取消',
		confirmName: '确定',
		singleBtnName: '我知道了',
		singleBtn: false,
		// 点击遮罩层关闭弹窗
		clickBackdropClosed: true,
		template: [
			'<div class="ui-modal-container" id="${_modal_id}">',
			'<div class="ui-modal-header">${title}</div>',
			'<div class="ui-modal-content ui-divider-fill"> ',
			'<div class="ui-modal-content-text">${content}</div>',
			'</div>',
			'<div class="ui-modal-footer">',
			'{@if singleBtn}',
			'<div class="ui-modal-btn" id="modal_single_btn">${singleBtnName}</div>',
			'{@else}',
			'<div class="ui-modal-btn ui-divider-vertical" id="modal_cancel_btn">${cancelName}</div>',
			'<div class="ui-modal-btn" id="modal_confirm_btn">${confirmName}</div>',
			'{@/if}',
			'</div>',
			'</div>'
		].join('')
	};

	function Modal(option) {
		pui.Event.call(this);

		defaultConfig._modal_id = _getRandomId();

		this.options = pui.extend(defaultConfig, option || {});

		this._init();
		this._initEvents();
	}

	function _getRandomId() {
		return (('modal' + Math.random()).replace(/\./g, ''));
	}

	Modal.prototype = {
		_init: function() {
			doc.body.appendChild(pui.str2Node(pui.juicer.to_html(this.options.template, this.options)));

			this.modal = doc.getElementById(this.options._modal_id);
			this.cancleBtn = doc.getElementById('modal_cancel_btn');
			this.confirmBtn = doc.getElementById('modal_confirm_btn');
			this.singleBtn = doc.getElementById('modal_single_btn');

			this.backdrop = pui.createEl('div', 'ui-backdrop ui-fade');
			this.backdrop.id = 'modal_backdrop';
			doc.body.appendChild(this.backdrop);

			this.show();
		},

		_initEvents: function() {
			var _this = this;

			if (this.options.clickBackdropClosed) {
				this.backdrop.onclick = function() {
					_this._hidden([_this.modal, _this]);
				}
			}

			if (this.singleBtn) {
				this.singleBtn.onclick = function() {
					_this._hidden([_this.modal, _this.backdrop]);

					_this.trigger('pui.modal.single', this);
				}
			}

			if (this.cancleBtn) {
				this.cancleBtn.onclick = function() {
					_this._hidden([_this.modal, _this.backdrop])

					_this.trigger('pui.modal.cancel', this);
				}
			}

			if (this.confirmBtn) {
				this.confirmBtn.onclick = function() {
					_this.options.click && _this.options.click();
					_this._hidden([_this.modal, _this.backdrop]);

					_this.trigger('pui.modal.confirm', this);
				}
			}
		},

		_hidden: function(nodes) {
			// var arr = pui.covert2Arr(nodes);
			// //为了给弹窗添加过渡效果， 此处分开处理
			// pui.removeClass(arr[0], 'ui-modal-active');
			// pui.addClass(arr[1], 'ui-fade');
			// pui.removeClass(arr[1], 'ui-in');
			// 有同时弹出多个弹框的需求，此处不设置过渡效果了，同时采用直接移除而不是隐藏
			doc.body.removeChild(this.modal);
			doc.body.removeChild(this.backdrop);
		},

		show: function() {
			pui.addClass(this.modal, 'ui-modal-active');
			pui.removeClass(this.backdrop, 'ui-fade');
			pui.addClass(this.backdrop, 'ui-in');
		},

		hide: function() {
			pui.removeClass(this.modal, 'ui-modal-active');
			pui.addClass(this.backdrop, 'ui-fade');
			pui.removeClass(this.backdrop, 'ui-in');
			this._hidden();
		}
	}

	pui.Modal = Modal;
})(pui, document);