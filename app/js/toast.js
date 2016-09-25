(function(pui) {
	pui.toast = function(message, position) {
		var target = pui.createEl('div', 'ui-toast');
		message = message || '最多选择4个座位';
		position = position || 'bottom';

		target.textContent = message;

		switch (position) {
			case 'bottom':
				pui.addClass(target, 'ui-toast-bottom');
				break;
			case 'top':
				pui.addClass(target, 'ui-toast-top');
				break;
			case 'center':
				pui.addClass(target, 'ui-toast-center');
				break;
		}

		target.addEventListener('webkitTransitionEnd', function() {
			if (!pui.hasClass(target, 'ui-toast-show')) {
				document.body.removeChild(target);
			}
		});

		document.body.appendChild(target);
		pui.addClass(target, 'ui-toast-show');
		setTimeout(function() {
			pui.removeClass(target, 'ui-toast-show');
		}, 2000);

	}
})(pui);