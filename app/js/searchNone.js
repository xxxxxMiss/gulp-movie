/**
 * 搜索页面无搜索结果时显示的信息
 * isWhite: 有些页面是灰的，有些页面是白的，就2种情况
 * options: {
 * 		id: 'test', ||
 * 		text: '暂无影片'，
 * 		isWhite: true, || 
 * 		hasBtn: true, ||
 * 		btnText: '随便逛逛',
 * 		action: function(){}
 * }
 * @return {[type]} [description]
 */
(function(pui) {
	var initNonePage = function(id, text, isWhite) {
		var options = {};
		if (arguments.length == 1) {
			if (typeof arguments[0] === 'object') {
				options = arguments[0];
			}
		}

		var targetContainer = document.createElement('div');
		pui.addClass(targetContainer, 'ui-none-container');

		var targetImage = document.createElement('div');
		pui.addClass(targetImage, 'ui-none-image');

		var targetText = document.createElement('div');
		pui.addClass(targetText, 'ui-none-text');
		targetText.textContent = options.text || text;

		targetContainer.appendChild(targetImage);
		targetContainer.appendChild(targetText);

		if (options.hasBtn) {
			var btn = document.createElement('a');
			pui.addClass(btn, 'ui-none-btn');
			btn.innerText = options.btnText || '随便逛逛';
			if (options.action) {
				btn.onclick = function() {
					options.action(this);
				}
			}
			targetContainer.appendChild(btn);
		}

		if (options.id) {
			var container = document.getElementById(options.id);
			container.style.position = 'relative';
			targetContainer.style.cssText = 'position: absolute; margin-top: 100px;';
			container.appendChild(targetContainer);
		} else {
			document.body.appendChild(targetContainer);
		}
		if (options.isWhite) {
			targetContainer.style.backgroundColor = '#fff';
		} else {
			targetContainer.style.backgroundColor = '#ebebeb';
		}

		return targetContainer;
	}
	pui.initNonePage = initNonePage;
})(pui);