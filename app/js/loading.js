/**
 * 等待层
 */
(function(pui, doc) {
	pui.openWaitLayer = function(loadingText) {
		var temp = pui.createEl('div');
		temp.id = 'J_waitLayer';
		loadingText = loadingText || '努力加载中';
		temp.innerHTML = `<div class="ui-loading-container"><div class="ui-loading"><div class="ui-loading-text">${loadingText}<span class="ui-loading-dot">...</span></div></div></div>`;
		doc.body.appendChild(temp);
	};
	pui.closeWaitLayer = function() {
		var layer = doc.getElementById('J_waitLayer');
		layer && doc.body.removeChild(layer);
	}
})(pui, document);