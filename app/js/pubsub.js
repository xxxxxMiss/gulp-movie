/**
 * A js pattern of publish/subscribe.
 * Other all js extend the js, then you can use it`s custome event.
 */
;
(function(pui) {
	function Event() {
		this._events = {};
		pui.extend(this, Event.prototype);
	}

	Event.prototype = {
		on: function(type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}
			this._events[type].push(fn);
		},

		off: function(type, fn) {
			if (!this._events[type]) {
				return;
			}

			var index = this._events[type].indexOf(fn);

			~index && this._events[type].splice(index, 1);
		},

		clear: function(type) {
			if (!this._events[type]) {
				return;
			}

			this._events[type] = [];
		},

		trigger: function(type) {
			if (!this._events[type]) {
				return;
			}

			var i = 0,
				len = this._events[type].length;

			if (!len) {
				return;
			}
			// trigger by push order
			for (; i < len; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		}
	}

	pui.Event = Event;
})(pui);