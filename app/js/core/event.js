(function() {
	if (typeof window.CustomEvent === 'undefined') {
		function CustomEvent(type, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			for (var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(type, bubbles, true);
			return evt;
		}
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}

	function trigger(elem, type, eventData) {
		elem.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			cancelable: true,
			detail: eventData
		}))
	}
})();