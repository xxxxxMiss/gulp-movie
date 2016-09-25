(function(pui) {
	var defaultConfig = {
		id: 'switch_container',
		// 是否显示开关中的文本
		showSwitchText: false,
		// 开关文本是显示为英文(ON/OFF)还是显示为中文(开/关)
		isTextCN: false,
		// 英文文本显示为大写还是小写
		isTextUpperCase: true,
		template: [
			'{@if showSwitchText}',
			'<div class="ui-switch ui-switch-text">',
			'{@else}',
			'<div class="ui-switch">',
			'{@/if}',
			'<div class="ui-switch-handle"></div>',
			'</div>'
		].join('')
	};

	function Switch(option) {
		option = pui.extend(defaultConfig, option);
		var fragment = pui.str2Node(pui.juicer.to_html(option.template, option));
		var container = document.getElementById(option.id);

		if (container) {
			container.appendChild(fragment);
		} else {
			document.body.appendChild(fragment);
		}


		this.container = container;
		this.target = document.getElementsByClassName('ui-switch')[0];
		this.option = option;

		if (option.showSwitchText && option.isTextCN) {
			pui.removeClass(this.target, 'ui-switch-text');
			pui.addClass(this.target, 'ui-switch-text-cn');
		}
	}


	Object.defineProperties(Switch.prototype, {
		toggle: {
			value: function() {
				pui.toggleClass(this.target, 'ui-active');
				if (pui.hasClass(this.target, 'ui-active')) {
					return true;
				}
				return false;
			}
		},
		on: {
			value: function() {
				pui.addClass(this.target, 'ui-active');
				return true;
			}
		},
		off: {
			value: function() {
				pui.removeClass(this.target, 'ui-active');
				return false;
			}
		}
	})

	pui.Switch = Switch;

})(pui);