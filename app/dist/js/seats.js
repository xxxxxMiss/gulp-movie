'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*! iScroll v5.2.0 ~ (c) 2008-2016 Matteo Spinelli ~ http://cubiq.org/license */
(function (window, document, Math) {
	var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
		window.setTimeout(callback, 1000 / 60);
	};

	var utils = function () {
		var me = {};

		var _elementStyle = document.createElement('div').style;
		var _vendor = function () {
			var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			    transform,
			    i = 0,
			    l = vendors.length;

			for (; i < l; i++) {
				transform = vendors[i] + 'ransform';
				if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
			}

			return false;
		}();

		function _prefixStyle(style) {
			if (_vendor === false) return false;
			if (_vendor === '') return style;
			return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
		}

		me.getTime = Date.now || function getTime() {
			return new Date().getTime();
		};

		me.extend = function (target, obj) {
			for (var i in obj) {
				target[i] = obj[i];
			}
		};

		me.addEvent = function (el, type, fn, capture) {
			el.addEventListener(type, fn, !!capture);
		};

		me.removeEvent = function (el, type, fn, capture) {
			el.removeEventListener(type, fn, !!capture);
		};

		me.prefixPointerEvent = function (pointerEvent) {
			return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8) : pointerEvent;
		};

		me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
			var distance = current - start,
			    speed = Math.abs(distance) / time,
			    destination,
			    duration;

			deceleration = deceleration === undefined ? 0.0006 : deceleration;

			destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;

			if (destination < lowerMargin) {
				destination = wrapperSize ? lowerMargin - wrapperSize / 2.5 * (speed / 8) : lowerMargin;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if (destination > 0) {
				destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}

			return {
				destination: Math.round(destination),
				duration: duration
			};
		};

		var _transform = _prefixStyle('transform');

		me.extend(me, {
			hasTransform: _transform !== false,
			hasPerspective: _prefixStyle('perspective') in _elementStyle,
			hasTouch: 'ontouchstart' in window,
			hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
			hasTransition: _prefixStyle('transition') in _elementStyle
		});

		/*
  This should find all Android browsers lower than build 535.19 (both stock browser and webview)
  - galaxy S2 is ok
    - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
    - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S3 is badAndroid (stock brower, webview)
     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S4 is badAndroid (stock brower, webview)
     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S5 is OK
     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
   - galaxy S6 is OK
     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
  */
		me.isBadAndroid = function () {
			var appVersion = window.navigator.appVersion;
			// Android browser is not a chrome browser.
			if (/Android/.test(appVersion) && !/Chrome\/\d/.test(appVersion)) {
				var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
				if (safariVersion && (typeof safariVersion === 'undefined' ? 'undefined' : _typeof(safariVersion)) === "object" && safariVersion.length >= 2) {
					return parseFloat(safariVersion[1]) < 535.19;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}();

		me.extend(me.style = {}, {
			transform: _transform,
			transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
			transitionDuration: _prefixStyle('transitionDuration'),
			transitionDelay: _prefixStyle('transitionDelay'),
			transformOrigin: _prefixStyle('transformOrigin')
		});

		me.hasClass = function (e, c) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
			return re.test(e.className);
		};

		me.addClass = function (e, c) {
			if (me.hasClass(e, c)) {
				return;
			}

			var newclass = e.className.split(' ');
			newclass.push(c);
			e.className = newclass.join(' ');
		};

		me.removeClass = function (e, c) {
			if (!me.hasClass(e, c)) {
				return;
			}

			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
			e.className = e.className.replace(re, ' ');
		};

		me.offset = function (el) {
			var left = -el.offsetLeft,
			    top = -el.offsetTop;

			// jshint -W084
			while (el = el.offsetParent) {
				left -= el.offsetLeft;
				top -= el.offsetTop;
			}
			// jshint +W084

			return {
				left: left,
				top: top
			};
		};

		me.preventDefaultException = function (el, exceptions) {
			for (var i in exceptions) {
				if (exceptions[i].test(el[i])) {
					return true;
				}
			}

			return false;
		};

		me.extend(me.eventType = {}, {
			touchstart: 1,
			touchmove: 1,
			touchend: 1,

			mousedown: 2,
			mousemove: 2,
			mouseup: 2,

			pointerdown: 3,
			pointermove: 3,
			pointerup: 3,

			MSPointerDown: 3,
			MSPointerMove: 3,
			MSPointerUp: 3
		});

		me.extend(me.ease = {}, {
			quadratic: {
				style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				fn: function fn(k) {
					return k * (2 - k);
				}
			},
			circular: {
				style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
				fn: function fn(k) {
					return Math.sqrt(1 - --k * k);
				}
			},
			back: {
				style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				fn: function fn(k) {
					var b = 4;
					return (k = k - 1) * k * ((b + 1) * k + b) + 1;
				}
			},
			bounce: {
				style: '',
				fn: function fn(k) {
					if ((k /= 1) < 1 / 2.75) {
						return 7.5625 * k * k;
					} else if (k < 2 / 2.75) {
						return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
					} else if (k < 2.5 / 2.75) {
						return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
					} else {
						return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
					}
				}
			},
			elastic: {
				style: '',
				fn: function fn(k) {
					var f = 0.22,
					    e = 0.4;

					if (k === 0) {
						return 0;
					}
					if (k == 1) {
						return 1;
					}

					return e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1;
				}
			}
		});

		me.tap = function (e, eventName) {
			var ev = document.createEvent('Event');
			ev.initEvent(eventName, true, true);
			ev.pageX = e.pageX;
			ev.pageY = e.pageY;
			e.target.dispatchEvent(ev);
		};

		me.click = function (e) {
			var target = e.target,
			    ev;

			if (!/(SELECT|INPUT|TEXTAREA)/i.test(target.tagName)) {
				// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
				// initMouseEvent is deprecated.
				ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
				ev.initEvent('click', true, true);
				ev.view = e.view || window;
				ev.detail = 1;
				ev.screenX = target.screenX || 0;
				ev.screenY = target.screenY || 0;
				ev.clientX = target.clientX || 0;
				ev.clientY = target.clientY || 0;
				ev.ctrlKey = !!e.ctrlKey;
				ev.altKey = !!e.altKey;
				ev.shiftKey = !!e.shiftKey;
				ev.metaKey = !!e.metaKey;
				ev.button = 0;
				ev.relatedTarget = null;
				ev._constructed = true;
				target.dispatchEvent(ev);
			}
		};

		return me;
	}();

	function IScroll(el, options) {
		this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.children[0];
		this.scrollerStyle = this.scroller.style; // cache style for better performance

		this.options = {

			zoomMin: 1,
			zoomMax: 4,
			startZoom: 1,

			resizeScrollbars: true,

			mouseWheelSpeed: 20,

			snapThreshold: 0.334,

			// INSERT POINT: OPTIONS
			disablePointer: !utils.hasPointer,
			disableTouch: utils.hasPointer || !utils.hasTouch,
			disableMouse: utils.hasPointer || utils.hasTouch,
			startX: 0,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,

			bounce: true,
			bounceTime: 600,
			bounceEasing: '',

			preventDefault: true,
			preventDefaultException: {
				tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
			},

			HWCompositing: true,
			useTransition: true,
			useTransform: true,
			bindToWrapper: typeof window.onmousedown === "undefined"
		};

		for (var i in options) {
			this.options[i] = options[i];
		}

		// Normalize options
		this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

		this.options.useTransition = utils.hasTransition && this.options.useTransition;
		this.options.useTransform = utils.hasTransform && this.options.useTransform;

		this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
		this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

		// If you want eventPassthrough I have to lock one of the axes
		this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
		this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

		// With eventPassthrough we also need lockDirection mechanism
		this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
		this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

		this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

		this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

		if (this.options.tap === true) {
			this.options.tap = 'tap';
		}

		// https://github.com/cubiq/iscroll/issues/1029
		if (!this.options.useTransition && !this.options.useTransform) {
			if (!/relative|absolute/i.test(this.scrollerStyle.position)) {
				this.scrollerStyle.position = "relative";
			}
		}

		if (this.options.shrinkScrollbars == 'scale') {
			this.options.useTransition = false;
		}

		this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

		// INSERT POINT: NORMALIZATION

		// Some defaults
		this.x = 0;
		this.y = 0;
		this.directionX = 0;
		this.directionY = 0;
		this._events = {};

		this.scale = Math.min(Math.max(this.options.startZoom, this.options.zoomMin), this.options.zoomMax);

		// INSERT POINT: DEFAULTS

		this._init();
		this.refresh();

		this.scrollTo(this.options.startX, this.options.startY);
		this.enable();
	}

	IScroll.prototype = {
		version: '5.2.0',

		_init: function _init() {
			this._initEvents();

			if (this.options.zoom) {
				this._initZoom();
			}

			if (this.options.scrollbars || this.options.indicators) {
				this._initIndicators();
			}

			if (this.options.mouseWheel) {
				this._initWheel();
			}

			if (this.options.snap) {
				this._initSnap();
			}

			if (this.options.keyBindings) {
				this._initKeys();
			}

			// INSERT POINT: _init
		},

		destroy: function destroy() {
			this._initEvents(true);
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = null;
			this._execEvent('destroy');
		},

		_transitionEnd: function _transitionEnd(e) {
			if (e.target != this.scroller || !this.isInTransition) {
				return;
			}

			this._transitionTime();
			if (!this.resetPosition(this.options.bounceTime)) {
				this.isInTransition = false;
				this._execEvent('scrollEnd');
			}
		},

		_start: function _start(e) {
			// React to left mouse button only
			if (utils.eventType[e.type] != 1) {
				// for button property
				// http://unixpapa.com/js/mouse.html
				var button;
				if (!e.which) {
					/* IE case */
					button = e.button < 2 ? 0 : e.button == 4 ? 1 : 2;
				} else {
					/* All others */
					button = e.button;
				}
				if (button !== 0) {
					return;
				}
			}

			if (!this.enabled || this.initiated && utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
				e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e,
			    pos;

			this.initiated = utils.eventType[e.type];
			this.moved = false;
			this.distX = 0;
			this.distY = 0;
			this.directionX = 0;
			this.directionY = 0;
			this.directionLocked = 0;

			this.startTime = utils.getTime();

			if (this.options.useTransition && this.isInTransition) {
				this._transitionTime();
				this.isInTransition = false;
				pos = this.getComputedPosition();
				this._translate(Math.round(pos.x), Math.round(pos.y));
				this._execEvent('scrollEnd');
			} else if (!this.options.useTransition && this.isAnimating) {
				this.isAnimating = false;
				this._execEvent('scrollEnd');
			}

			this.startX = this.x;
			this.startY = this.y;
			this.absStartX = this.x;
			this.absStartY = this.y;
			this.pointX = point.pageX;
			this.pointY = point.pageY;

			this._execEvent('beforeScrollStart');
		},

		_move: function _move(e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault) {
				// increases performance on Android? TODO: check!
				e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e,
			    deltaX = point.pageX - this.pointX,
			    deltaY = point.pageY - this.pointY,
			    timestamp = utils.getTime(),
			    newX,
			    newY,
			    absDistX,
			    absDistY;

			this.pointX = point.pageX;
			this.pointY = point.pageY;

			this.distX += deltaX;
			this.distY += deltaY;
			absDistX = Math.abs(this.distX);
			absDistY = Math.abs(this.distY);

			// We need to move at least 10 pixels for the scrolling to initiate
			if (timestamp - this.endTime > 300 && absDistX < 10 && absDistY < 10) {
				return;
			}

			// If you are scrolling in one direction lock the other
			if (!this.directionLocked && !this.options.freeScroll) {
				if (absDistX > absDistY + this.options.directionLockThreshold) {
					this.directionLocked = 'h'; // lock horizontally
				} else if (absDistY >= absDistX + this.options.directionLockThreshold) {
					this.directionLocked = 'v'; // lock vertically
				} else {
					this.directionLocked = 'n'; // no lock
				}
			}

			if (this.directionLocked == 'h') {
				if (this.options.eventPassthrough == 'vertical') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'horizontal') {
					this.initiated = false;
					return;
				}

				deltaY = 0;
			} else if (this.directionLocked == 'v') {
				if (this.options.eventPassthrough == 'horizontal') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'vertical') {
					this.initiated = false;
					return;
				}

				deltaX = 0;
			}

			deltaX = this.hasHorizontalScroll ? deltaX : 0;
			deltaY = this.hasVerticalScroll ? deltaY : 0;

			newX = this.x + deltaX;
			newY = this.y + deltaY;

			// Slow down if outside of the boundaries
			if (newX > 0 || newX < this.maxScrollX) {
				newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
			}
			if (newY > 0 || newY < this.maxScrollY) {
				newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
			}

			this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

			if (!this.moved) {
				this._execEvent('scrollStart');
			}

			this.moved = true;

			this._translate(newX, newY);

			/* REPLACE START: _move */

			if (timestamp - this.startTime > 300) {
				this.startTime = timestamp;
				this.startX = this.x;
				this.startY = this.y;
			}

			/* REPLACE END: _move */
		},

		_end: function _end(e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
				e.preventDefault();
			}

			var point = e.changedTouches ? e.changedTouches[0] : e,
			    momentumX,
			    momentumY,
			    duration = utils.getTime() - this.startTime,
			    newX = Math.round(this.x),
			    newY = Math.round(this.y),
			    distanceX = Math.abs(newX - this.startX),
			    distanceY = Math.abs(newY - this.startY),
			    time = 0,
			    easing = '';

			this.isInTransition = 0;
			this.initiated = 0;
			this.endTime = utils.getTime();

			// reset if we are outside of the boundaries
			if (this.resetPosition(this.options.bounceTime)) {
				return;
			}

			this.scrollTo(newX, newY); // ensures that the last position is rounded

			// we scrolled less than 10 pixels
			if (!this.moved) {
				if (this.options.tap) {
					utils.tap(e, this.options.tap);
				}

				if (this.options.click) {
					utils.click(e);
				}

				this._execEvent('scrollCancel');
				return;
			}

			if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
				this._execEvent('flick');
				return;
			}

			// start momentum animation if needed
			if (this.options.momentum && duration < 300) {
				momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
					destination: newX,
					duration: 0
				};
				momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
					destination: newY,
					duration: 0
				};
				newX = momentumX.destination;
				newY = momentumY.destination;
				time = Math.max(momentumX.duration, momentumY.duration);
				this.isInTransition = 1;
			}

			if (this.options.snap) {
				var snap = this._nearestSnap(newX, newY);
				this.currentPage = snap;
				time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(newX - snap.x), 1000), Math.min(Math.abs(newY - snap.y), 1000)), 300);
				newX = snap.x;
				newY = snap.y;

				this.directionX = 0;
				this.directionY = 0;
				easing = this.options.bounceEasing;
			}

			// INSERT POINT: _end

			if (newX != this.x || newY != this.y) {
				// change easing function when scroller goes out of the boundaries
				if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
					easing = utils.ease.quadratic;
				}

				this.scrollTo(newX, newY, time, easing);
				return;
			}

			this._execEvent('scrollEnd');
		},

		_resize: function _resize() {
			var that = this;

			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(function () {
				that.refresh();
			}, this.options.resizePolling);
		},

		resetPosition: function resetPosition(time) {
			var x = this.x,
			    y = this.y;

			time = time || 0;

			if (!this.hasHorizontalScroll || this.x > 0) {
				x = 0;
			} else if (this.x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (!this.hasVerticalScroll || this.y > 0) {
				y = 0;
			} else if (this.y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			if (x == this.x && y == this.y) {
				return false;
			}

			this.scrollTo(x, y, time, this.options.bounceEasing);

			return true;
		},

		disable: function disable() {
			this.enabled = false;
		},

		enable: function enable() {
			this.enabled = true;
		},

		refresh: function refresh() {
			var rf = this.wrapper.offsetHeight; // Force reflow

			this.wrapperWidth = this.wrapper.clientWidth;
			this.wrapperHeight = this.wrapper.clientHeight;

			/* REPLACE START: refresh */
			this.scrollerWidth = Math.round(this.scroller.offsetWidth * this.scale);
			this.scrollerHeight = Math.round(this.scroller.offsetHeight * this.scale);

			this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
			this.maxScrollY = this.wrapperHeight - this.scrollerHeight;
			/* REPLACE END: refresh */

			this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
			this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;

			if (!this.hasHorizontalScroll) {
				this.maxScrollX = 0;
				this.scrollerWidth = this.wrapperWidth;
			}

			if (!this.hasVerticalScroll) {
				this.maxScrollY = 0;
				this.scrollerHeight = this.wrapperHeight;
			}

			this.endTime = 0;
			this.directionX = 0;
			this.directionY = 0;

			this.wrapperOffset = utils.offset(this.wrapper);

			this._execEvent('refresh');

			this.resetPosition();

			// INSERT POINT: _refresh
		},

		on: function on(type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}

			this._events[type].push(fn);
		},

		off: function off(type, fn) {
			if (!this._events[type]) {
				return;
			}

			var index = this._events[type].indexOf(fn);

			if (index > -1) {
				this._events[type].splice(index, 1);
			}
		},

		_execEvent: function _execEvent(type) {
			if (!this._events[type]) {
				return;
			}

			var i = 0,
			    l = this._events[type].length;

			if (!l) {
				return;
			}

			for (; i < l; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		},

		scrollBy: function scrollBy(x, y, time, easing) {
			x = this.x + x;
			y = this.y + y;
			time = time || 0;

			this.scrollTo(x, y, time, easing);
		},

		scrollTo: function scrollTo(x, y, time, easing) {
			easing = easing || utils.ease.circular;

			this.isInTransition = this.options.useTransition && time > 0;
			var transitionType = this.options.useTransition && easing.style;
			if (!time || transitionType) {
				if (transitionType) {
					this._transitionTimingFunction(easing.style);
					this._transitionTime(time);
				}
				this._translate(x, y);
			} else {
				this._animate(x, y, time, easing.fn);
			}
		},

		scrollToElement: function scrollToElement(el, time, offsetX, offsetY, easing) {
			el = el.nodeType ? el : this.scroller.querySelector(el);

			if (!el) {
				return;
			}

			var pos = utils.offset(el);

			pos.left -= this.wrapperOffset.left;
			pos.top -= this.wrapperOffset.top;

			// if offsetX/Y are true we center the element to the screen
			if (offsetX === true) {
				offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
			}
			if (offsetY === true) {
				offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
			}

			pos.left -= offsetX || 0;
			pos.top -= offsetY || 0;

			pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
			pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

			time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

			this.scrollTo(pos.left, pos.top, time, easing);
		},

		_transitionTime: function _transitionTime(time) {
			if (!this.options.useTransition) {
				return;
			}
			time = time || 0;
			var durationProp = utils.style.transitionDuration;
			if (!durationProp) {
				return;
			}

			this.scrollerStyle[durationProp] = time + 'ms';

			if (!time && utils.isBadAndroid) {
				this.scrollerStyle[durationProp] = '0.0001ms';
				// remove 0.0001ms
				var self = this;
				rAF(function () {
					if (self.scrollerStyle[durationProp] === '0.0001ms') {
						self.scrollerStyle[durationProp] = '0s';
					}
				});
			}

			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].transitionTime(time);
				}
			}

			// INSERT POINT: _transitionTime
		},

		_transitionTimingFunction: function _transitionTimingFunction(easing) {
			this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].transitionTimingFunction(easing);
				}
			}

			// INSERT POINT: _transitionTimingFunction
		},

		_translate: function _translate(x, y) {
			if (this.options.useTransform) {

				/* REPLACE START: _translate */
				this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ') ' + this.translateZ; /* REPLACE END: _translate */
			} else {
				x = Math.round(x);
				y = Math.round(y);
				this.scrollerStyle.left = x + 'px';
				this.scrollerStyle.top = y + 'px';
			}

			this.x = x;
			this.y = y;

			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].updatePosition();
				}
			}

			// INSERT POINT: _translate
		},

		_initEvents: function _initEvents(remove) {
			var eventType = remove ? utils.removeEvent : utils.addEvent,
			    target = this.options.bindToWrapper ? this.wrapper : window;

			eventType(window, 'orientationchange', this);
			eventType(window, 'resize', this);

			if (this.options.click) {
				eventType(this.wrapper, 'click', this, true);
			}

			if (!this.options.disableMouse) {
				eventType(this.wrapper, 'mousedown', this);
				eventType(target, 'mousemove', this);
				eventType(target, 'mousecancel', this);
				eventType(target, 'mouseup', this);
			}

			if (utils.hasPointer && !this.options.disablePointer) {
				eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
				eventType(target, utils.prefixPointerEvent('pointermove'), this);
				eventType(target, utils.prefixPointerEvent('pointercancel'), this);
				eventType(target, utils.prefixPointerEvent('pointerup'), this);
			}

			if (utils.hasTouch && !this.options.disableTouch) {
				eventType(this.wrapper, 'touchstart', this);
				eventType(target, 'touchmove', this);
				eventType(target, 'touchcancel', this);
				eventType(target, 'touchend', this);
			}

			eventType(this.scroller, 'transitionend', this);
			eventType(this.scroller, 'webkitTransitionEnd', this);
			eventType(this.scroller, 'oTransitionEnd', this);
			eventType(this.scroller, 'MSTransitionEnd', this);
		},

		getComputedPosition: function getComputedPosition() {
			var matrix = window.getComputedStyle(this.scroller, null),
			    x,
			    y;

			if (this.options.useTransform) {
				matrix = matrix[utils.style.transform].split(')')[0].split(', ');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
			} else {
				x = +matrix.left.replace(/[^-\d.]/g, '');
				y = +matrix.top.replace(/[^-\d.]/g, '');
			}

			return {
				x: x,
				y: y
			};
		},
		_initIndicators: function _initIndicators() {
			var interactive = this.options.interactiveScrollbars,
			    customStyle = typeof this.options.scrollbars != 'string',
			    indicators = [],
			    indicator;

			var that = this;

			this.indicators = [];

			if (this.options.scrollbars) {
				// Vertical scrollbar
				if (this.options.scrollY) {
					indicator = {
						el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
						interactive: interactive,
						defaultScrollbars: true,
						customStyle: customStyle,
						resize: this.options.resizeScrollbars,
						shrink: this.options.shrinkScrollbars,
						fade: this.options.fadeScrollbars,
						listenX: false
					};

					this.wrapper.appendChild(indicator.el);
					indicators.push(indicator);
				}

				// Horizontal scrollbar
				if (this.options.scrollX) {
					indicator = {
						el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
						interactive: interactive,
						defaultScrollbars: true,
						customStyle: customStyle,
						resize: this.options.resizeScrollbars,
						shrink: this.options.shrinkScrollbars,
						fade: this.options.fadeScrollbars,
						listenY: false
					};

					this.wrapper.appendChild(indicator.el);
					indicators.push(indicator);
				}
			}

			if (this.options.indicators) {
				// TODO: check concat compatibility
				indicators = indicators.concat(this.options.indicators);
			}

			for (var i = indicators.length; i--;) {
				this.indicators.push(new Indicator(this, indicators[i]));
			}

			// TODO: check if we can use array.map (wide compatibility and performance issues)
			function _indicatorsMap(fn) {
				if (that.indicators) {
					for (var i = that.indicators.length; i--;) {
						fn.call(that.indicators[i]);
					}
				}
			}

			if (this.options.fadeScrollbars) {
				this.on('scrollEnd', function () {
					_indicatorsMap(function () {
						this.fade();
					});
				});

				this.on('scrollCancel', function () {
					_indicatorsMap(function () {
						this.fade();
					});
				});

				this.on('scrollStart', function () {
					_indicatorsMap(function () {
						this.fade(1);
					});
				});

				this.on('beforeScrollStart', function () {
					_indicatorsMap(function () {
						this.fade(1, true);
					});
				});
			}

			this.on('refresh', function () {
				_indicatorsMap(function () {
					this.refresh();
				});
			});

			this.on('destroy', function () {
				_indicatorsMap(function () {
					this.destroy();
				});

				delete this.indicators;
			});
		},

		_initZoom: function _initZoom() {
			this.scrollerStyle[utils.style.transformOrigin] = '0 0';
		},

		_zoomStart: function _zoomStart(e) {
			var c1 = Math.abs(e.touches[0].pageX - e.touches[1].pageX),
			    c2 = Math.abs(e.touches[0].pageY - e.touches[1].pageY);

			this.touchesDistanceStart = Math.sqrt(c1 * c1 + c2 * c2);
			this.startScale = this.scale;

			this.originX = Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2 + this.wrapperOffset.left - this.x;
			this.originY = Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2 + this.wrapperOffset.top - this.y;

			this._execEvent('zoomStart');
		},

		_zoom: function _zoom(e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault) {
				e.preventDefault();
			}

			var c1 = Math.abs(e.touches[0].pageX - e.touches[1].pageX),
			    c2 = Math.abs(e.touches[0].pageY - e.touches[1].pageY),
			    distance = Math.sqrt(c1 * c1 + c2 * c2),
			    scale = 1 / this.touchesDistanceStart * distance * this.startScale,
			    lastScale,
			    x,
			    y;

			this.scaled = true;

			if (scale < this.options.zoomMin) {
				scale = 0.5 * this.options.zoomMin * Math.pow(2.0, scale / this.options.zoomMin);
			} else if (scale > this.options.zoomMax) {
				scale = 2.0 * this.options.zoomMax * Math.pow(0.5, this.options.zoomMax / scale);
			}

			lastScale = scale / this.startScale;
			x = this.originX - this.originX * lastScale + this.startX;
			y = this.originY - this.originY * lastScale + this.startY;

			this.scale = scale;

			this.scrollTo(x, y, 0);
		},

		_zoomEnd: function _zoomEnd(e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault) {
				e.preventDefault();
			}

			var newX, newY, lastScale;

			this.isInTransition = 0;
			this.initiated = 0;

			if (this.scale > this.options.zoomMax) {
				this.scale = this.options.zoomMax;
			} else if (this.scale < this.options.zoomMin) {
				this.scale = this.options.zoomMin;
			}

			// Update boundaries
			this.refresh();

			lastScale = this.scale / this.startScale;

			newX = this.originX - this.originX * lastScale + this.startX;
			newY = this.originY - this.originY * lastScale + this.startY;

			if (newX > 0) {
				newX = 0;
			} else if (newX < this.maxScrollX) {
				newX = this.maxScrollX;
			}

			if (newY > 0) {
				newY = 0;
			} else if (newY < this.maxScrollY) {
				newY = this.maxScrollY;
			}

			if (this.x != newX || this.y != newY) {
				this.scrollTo(newX, newY, this.options.bounceTime);
			}

			this.scaled = false;

			this._execEvent('zoomEnd');
		},

		zoom: function zoom(scale, x, y, time) {
			if (scale < this.options.zoomMin) {
				scale = this.options.zoomMin;
			} else if (scale > this.options.zoomMax) {
				scale = this.options.zoomMax;
			}

			if (scale == this.scale) {
				return;
			}

			var relScale = scale / this.scale;

			x = x === undefined ? this.wrapperWidth / 2 : x;
			y = y === undefined ? this.wrapperHeight / 2 : y;
			time = time === undefined ? 300 : time;

			x = x + this.wrapperOffset.left - this.x;
			y = y + this.wrapperOffset.top - this.y;

			x = x - x * relScale + this.x;
			y = y - y * relScale + this.y;

			this.scale = scale;

			this.refresh(); // update boundaries

			if (x > 0) {
				x = 0;
			} else if (x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (y > 0) {
				y = 0;
			} else if (y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			this.scrollTo(x, y, time);
		},

		_wheelZoom: function _wheelZoom(e) {
			var wheelDeltaY,
			    deltaScale,
			    that = this;

			// Execute the zoomEnd event after 400ms the wheel stopped scrolling
			clearTimeout(this.wheelTimeout);
			this.wheelTimeout = setTimeout(function () {
				that._execEvent('zoomEnd');
			}, 400);

			if ('deltaX' in e) {
				wheelDeltaY = -e.deltaY / Math.abs(e.deltaY);
			} else if ('wheelDeltaX' in e) {
				wheelDeltaY = e.wheelDeltaY / Math.abs(e.wheelDeltaY);
			} else if ('wheelDelta' in e) {
				wheelDeltaY = e.wheelDelta / Math.abs(e.wheelDelta);
			} else if ('detail' in e) {
				wheelDeltaY = -e.detail / Math.abs(e.wheelDelta);
			} else {
				return;
			}

			deltaScale = this.scale + wheelDeltaY / 5;

			this.zoom(deltaScale, e.pageX, e.pageY, 0);
		},

		_initWheel: function _initWheel() {
			utils.addEvent(this.wrapper, 'wheel', this);
			utils.addEvent(this.wrapper, 'mousewheel', this);
			utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

			this.on('destroy', function () {
				clearTimeout(this.wheelTimeout);
				this.wheelTimeout = null;
				utils.removeEvent(this.wrapper, 'wheel', this);
				utils.removeEvent(this.wrapper, 'mousewheel', this);
				utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
			});
		},

		_wheel: function _wheel(e) {
			if (!this.enabled) {
				return;
			}

			e.preventDefault();

			var wheelDeltaX,
			    wheelDeltaY,
			    newX,
			    newY,
			    that = this;

			if (this.wheelTimeout === undefined) {
				that._execEvent('scrollStart');
			}

			// Execute the scrollEnd event after 400ms the wheel stopped scrolling
			clearTimeout(this.wheelTimeout);
			this.wheelTimeout = setTimeout(function () {
				if (!that.options.snap) {
					that._execEvent('scrollEnd');
				}
				that.wheelTimeout = undefined;
			}, 400);

			if ('deltaX' in e) {
				if (e.deltaMode === 1) {
					wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
					wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
				} else {
					wheelDeltaX = -e.deltaX;
					wheelDeltaY = -e.deltaY;
				}
			} else if ('wheelDeltaX' in e) {
				wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
				wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
			} else if ('wheelDelta' in e) {
				wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
			} else if ('detail' in e) {
				wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
			} else {
				return;
			}

			wheelDeltaX *= this.options.invertWheelDirection;
			wheelDeltaY *= this.options.invertWheelDirection;

			if (!this.hasVerticalScroll) {
				wheelDeltaX = wheelDeltaY;
				wheelDeltaY = 0;
			}

			if (this.options.snap) {
				newX = this.currentPage.pageX;
				newY = this.currentPage.pageY;

				if (wheelDeltaX > 0) {
					newX--;
				} else if (wheelDeltaX < 0) {
					newX++;
				}

				if (wheelDeltaY > 0) {
					newY--;
				} else if (wheelDeltaY < 0) {
					newY++;
				}

				this.goToPage(newX, newY);

				return;
			}

			newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
			newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

			this.directionX = wheelDeltaX > 0 ? -1 : wheelDeltaX < 0 ? 1 : 0;
			this.directionY = wheelDeltaY > 0 ? -1 : wheelDeltaY < 0 ? 1 : 0;

			if (newX > 0) {
				newX = 0;
			} else if (newX < this.maxScrollX) {
				newX = this.maxScrollX;
			}

			if (newY > 0) {
				newY = 0;
			} else if (newY < this.maxScrollY) {
				newY = this.maxScrollY;
			}

			this.scrollTo(newX, newY, 0);

			// INSERT POINT: _wheel
		},

		_initSnap: function _initSnap() {
			this.currentPage = {};

			if (typeof this.options.snap == 'string') {
				this.options.snap = this.scroller.querySelectorAll(this.options.snap);
			}

			this.on('refresh', function () {
				var i = 0,
				    l,
				    m = 0,
				    n,
				    cx,
				    cy,
				    x = 0,
				    y,
				    stepX = this.options.snapStepX || this.wrapperWidth,
				    stepY = this.options.snapStepY || this.wrapperHeight,
				    el;

				this.pages = [];

				if (!this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight) {
					return;
				}

				if (this.options.snap === true) {
					cx = Math.round(stepX / 2);
					cy = Math.round(stepY / 2);

					while (x > -this.scrollerWidth) {
						this.pages[i] = [];
						l = 0;
						y = 0;

						while (y > -this.scrollerHeight) {
							this.pages[i][l] = {
								x: Math.max(x, this.maxScrollX),
								y: Math.max(y, this.maxScrollY),
								width: stepX,
								height: stepY,
								cx: x - cx,
								cy: y - cy
							};

							y -= stepY;
							l++;
						}

						x -= stepX;
						i++;
					}
				} else {
					el = this.options.snap;
					l = el.length;
					n = -1;

					for (; i < l; i++) {
						if (i === 0 || el[i].offsetLeft <= el[i - 1].offsetLeft) {
							m = 0;
							n++;
						}

						if (!this.pages[m]) {
							this.pages[m] = [];
						}

						x = Math.max(-el[i].offsetLeft, this.maxScrollX);
						y = Math.max(-el[i].offsetTop, this.maxScrollY);
						cx = x - Math.round(el[i].offsetWidth / 2);
						cy = y - Math.round(el[i].offsetHeight / 2);

						this.pages[m][n] = {
							x: x,
							y: y,
							width: el[i].offsetWidth,
							height: el[i].offsetHeight,
							cx: cx,
							cy: cy
						};

						if (x > this.maxScrollX) {
							m++;
						}
					}
				}

				this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

				// Update snap threshold if needed
				if (this.options.snapThreshold % 1 === 0) {
					this.snapThresholdX = this.options.snapThreshold;
					this.snapThresholdY = this.options.snapThreshold;
				} else {
					this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
					this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
				}
			});

			this.on('flick', function () {
				var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.x - this.startX), 1000), Math.min(Math.abs(this.y - this.startY), 1000)), 300);

				this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, time);
			});
		},

		_nearestSnap: function _nearestSnap(x, y) {
			if (!this.pages.length) {
				return {
					x: 0,
					y: 0,
					pageX: 0,
					pageY: 0
				};
			}

			var i = 0,
			    l = this.pages.length,
			    m = 0;

			// Check if we exceeded the snap threshold
			if (Math.abs(x - this.absStartX) < this.snapThresholdX && Math.abs(y - this.absStartY) < this.snapThresholdY) {
				return this.currentPage;
			}

			if (x > 0) {
				x = 0;
			} else if (x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (y > 0) {
				y = 0;
			} else if (y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			for (; i < l; i++) {
				if (x >= this.pages[i][0].cx) {
					x = this.pages[i][0].x;
					break;
				}
			}

			l = this.pages[i].length;

			for (; m < l; m++) {
				if (y >= this.pages[0][m].cy) {
					y = this.pages[0][m].y;
					break;
				}
			}

			if (i == this.currentPage.pageX) {
				i += this.directionX;

				if (i < 0) {
					i = 0;
				} else if (i >= this.pages.length) {
					i = this.pages.length - 1;
				}

				x = this.pages[i][0].x;
			}

			if (m == this.currentPage.pageY) {
				m += this.directionY;

				if (m < 0) {
					m = 0;
				} else if (m >= this.pages[0].length) {
					m = this.pages[0].length - 1;
				}

				y = this.pages[0][m].y;
			}

			return {
				x: x,
				y: y,
				pageX: i,
				pageY: m
			};
		},

		goToPage: function goToPage(x, y, time, easing) {
			easing = easing || this.options.bounceEasing;

			if (x >= this.pages.length) {
				x = this.pages.length - 1;
			} else if (x < 0) {
				x = 0;
			}

			if (y >= this.pages[x].length) {
				y = this.pages[x].length - 1;
			} else if (y < 0) {
				y = 0;
			}

			var posX = this.pages[x][y].x,
			    posY = this.pages[x][y].y;

			time = time === undefined ? this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(posX - this.x), 1000), Math.min(Math.abs(posY - this.y), 1000)), 300) : time;

			this.currentPage = {
				x: posX,
				y: posY,
				pageX: x,
				pageY: y
			};

			this.scrollTo(posX, posY, time, easing);
		},

		next: function next(time, easing) {
			var x = this.currentPage.pageX,
			    y = this.currentPage.pageY;

			x++;

			if (x >= this.pages.length && this.hasVerticalScroll) {
				x = 0;
				y++;
			}

			this.goToPage(x, y, time, easing);
		},

		prev: function prev(time, easing) {
			var x = this.currentPage.pageX,
			    y = this.currentPage.pageY;

			x--;

			if (x < 0 && this.hasVerticalScroll) {
				x = 0;
				y--;
			}

			this.goToPage(x, y, time, easing);
		},

		_initKeys: function _initKeys(e) {
			// default key bindings
			var keys = {
				pageUp: 33,
				pageDown: 34,
				end: 35,
				home: 36,
				left: 37,
				up: 38,
				right: 39,
				down: 40
			};
			var i;

			// if you give me characters I give you keycode
			if (_typeof(this.options.keyBindings) == 'object') {
				for (i in this.options.keyBindings) {
					if (typeof this.options.keyBindings[i] == 'string') {
						this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
					}
				}
			} else {
				this.options.keyBindings = {};
			}

			for (i in keys) {
				this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
			}

			utils.addEvent(window, 'keydown', this);

			this.on('destroy', function () {
				utils.removeEvent(window, 'keydown', this);
			});
		},

		_key: function _key(e) {
			if (!this.enabled) {
				return;
			}

			var snap = this.options.snap,
			    // we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			    newY = snap ? this.currentPage.pageY : this.y,
			    now = utils.getTime(),
			    prevTime = this.keyTime || 0,
			    acceleration = 0.250,
			    pos;

			if (this.options.useTransition && this.isInTransition) {
				pos = this.getComputedPosition();

				this._translate(Math.round(pos.x), Math.round(pos.y));
				this.isInTransition = false;
			}

			this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

			switch (e.keyCode) {
				case this.options.keyBindings.pageUp:
					if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
						newX += snap ? 1 : this.wrapperWidth;
					} else {
						newY += snap ? 1 : this.wrapperHeight;
					}
					break;
				case this.options.keyBindings.pageDown:
					if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
						newX -= snap ? 1 : this.wrapperWidth;
					} else {
						newY -= snap ? 1 : this.wrapperHeight;
					}
					break;
				case this.options.keyBindings.end:
					newX = snap ? this.pages.length - 1 : this.maxScrollX;
					newY = snap ? this.pages[0].length - 1 : this.maxScrollY;
					break;
				case this.options.keyBindings.home:
					newX = 0;
					newY = 0;
					break;
				case this.options.keyBindings.left:
					newX += snap ? -1 : 5 + this.keyAcceleration >> 0;
					break;
				case this.options.keyBindings.up:
					newY += snap ? 1 : 5 + this.keyAcceleration >> 0;
					break;
				case this.options.keyBindings.right:
					newX -= snap ? -1 : 5 + this.keyAcceleration >> 0;
					break;
				case this.options.keyBindings.down:
					newY -= snap ? 1 : 5 + this.keyAcceleration >> 0;
					break;
				default:
					return;
			}

			if (snap) {
				this.goToPage(newX, newY);
				return;
			}

			if (newX > 0) {
				newX = 0;
				this.keyAcceleration = 0;
			} else if (newX < this.maxScrollX) {
				newX = this.maxScrollX;
				this.keyAcceleration = 0;
			}

			if (newY > 0) {
				newY = 0;
				this.keyAcceleration = 0;
			} else if (newY < this.maxScrollY) {
				newY = this.maxScrollY;
				this.keyAcceleration = 0;
			}

			this.scrollTo(newX, newY, 0);

			this.keyTime = now;
		},

		_animate: function _animate(destX, destY, duration, easingFn) {
			var that = this,
			    startX = this.x,
			    startY = this.y,
			    startTime = utils.getTime(),
			    destTime = startTime + duration;

			function step() {
				var now = utils.getTime(),
				    newX,
				    newY,
				    easing;

				if (now >= destTime) {
					that.isAnimating = false;
					that._translate(destX, destY);

					if (!that.resetPosition(that.options.bounceTime)) {
						that._execEvent('scrollEnd');
					}

					return;
				}

				now = (now - startTime) / duration;
				easing = easingFn(now);
				newX = (destX - startX) * easing + startX;
				newY = (destY - startY) * easing + startY;
				that._translate(newX, newY);

				if (that.isAnimating) {
					rAF(step);
				}
			}

			this.isAnimating = true;
			step();
		},
		handleEvent: function handleEvent(e) {
			switch (e.type) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);

					if (this.options.zoom && e.touches && e.touches.length > 1) {
						this._zoomStart(e);
					}
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					if (this.options.zoom && e.touches && e.touches[1]) {
						this._zoom(e);
						return;
					}
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					if (this.scaled) {
						this._zoomEnd(e);
						return;
					}
					this._end(e);
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'wheel':
				case 'DOMMouseScroll':
				case 'mousewheel':
					if (this.options.wheelAction == 'zoom') {
						this._wheelZoom(e);
						return;
					}
					this._wheel(e);
					break;
				case 'keydown':
					this._key(e);
					break;
			}
		}

	};

	function createDefaultScrollbar(direction, interactive, type) {
		var scrollbar = document.createElement('div'),
		    indicator = document.createElement('div');

		if (type === true) {
			scrollbar.style.cssText = 'position:absolute;z-index:9999';
			indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
		}

		indicator.className = 'iScrollIndicator';

		if (direction == 'h') {
			if (type === true) {
				scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
				indicator.style.height = '100%';
			}
			scrollbar.className = 'iScrollHorizontalScrollbar';
		} else {
			if (type === true) {
				scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
				indicator.style.width = '100%';
			}
			scrollbar.className = 'iScrollVerticalScrollbar';
		}

		scrollbar.style.cssText += ';overflow:hidden';

		if (!interactive) {
			scrollbar.style.pointerEvents = 'none';
		}

		scrollbar.appendChild(indicator);

		return scrollbar;
	}

	function Indicator(scroller, options) {
		this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
		this.wrapperStyle = this.wrapper.style;
		this.indicator = this.wrapper.children[0];
		this.indicatorStyle = this.indicator.style;
		this.scroller = scroller;

		this.options = {
			listenX: true,
			listenY: true,
			interactive: false,
			resize: true,
			defaultScrollbars: false,
			shrink: false,
			fade: false,
			speedRatioX: 0,
			speedRatioY: 0
		};

		for (var i in options) {
			this.options[i] = options[i];
		}

		this.sizeRatioX = 1;
		this.sizeRatioY = 1;
		this.maxPosX = 0;
		this.maxPosY = 0;

		if (this.options.interactive) {
			if (!this.options.disableTouch) {
				utils.addEvent(this.indicator, 'touchstart', this);
				utils.addEvent(window, 'touchend', this);
			}
			if (!this.options.disablePointer) {
				utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
				utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
			}
			if (!this.options.disableMouse) {
				utils.addEvent(this.indicator, 'mousedown', this);
				utils.addEvent(window, 'mouseup', this);
			}
		}

		if (this.options.fade) {
			this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
			var durationProp = utils.style.transitionDuration;
			if (!durationProp) {
				return;
			}
			this.wrapperStyle[durationProp] = utils.isBadAndroid ? '0.0001ms' : '0ms';
			// remove 0.0001ms
			var self = this;
			if (utils.isBadAndroid) {
				rAF(function () {
					if (self.wrapperStyle[durationProp] === '0.0001ms') {
						self.wrapperStyle[durationProp] = '0s';
					}
				});
			}
			this.wrapperStyle.opacity = '0';
		}
	}

	Indicator.prototype = {
		handleEvent: function handleEvent(e) {
			switch (e.type) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._end(e);
					break;
			}
		},

		destroy: function destroy() {
			if (this.options.fadeScrollbars) {
				clearTimeout(this.fadeTimeout);
				this.fadeTimeout = null;
			}
			if (this.options.interactive) {
				utils.removeEvent(this.indicator, 'touchstart', this);
				utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
				utils.removeEvent(this.indicator, 'mousedown', this);

				utils.removeEvent(window, 'touchmove', this);
				utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
				utils.removeEvent(window, 'mousemove', this);

				utils.removeEvent(window, 'touchend', this);
				utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
				utils.removeEvent(window, 'mouseup', this);
			}

			if (this.options.defaultScrollbars) {
				this.wrapper.parentNode.removeChild(this.wrapper);
			}
		},

		_start: function _start(e) {
			var point = e.touches ? e.touches[0] : e;

			e.preventDefault();
			e.stopPropagation();

			this.transitionTime();

			this.initiated = true;
			this.moved = false;
			this.lastPointX = point.pageX;
			this.lastPointY = point.pageY;

			this.startTime = utils.getTime();

			if (!this.options.disableTouch) {
				utils.addEvent(window, 'touchmove', this);
			}
			if (!this.options.disablePointer) {
				utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
			}
			if (!this.options.disableMouse) {
				utils.addEvent(window, 'mousemove', this);
			}

			this.scroller._execEvent('beforeScrollStart');
		},

		_move: function _move(e) {
			var point = e.touches ? e.touches[0] : e,
			    deltaX,
			    deltaY,
			    newX,
			    newY,
			    timestamp = utils.getTime();

			if (!this.moved) {
				this.scroller._execEvent('scrollStart');
			}

			this.moved = true;

			deltaX = point.pageX - this.lastPointX;
			this.lastPointX = point.pageX;

			deltaY = point.pageY - this.lastPointY;
			this.lastPointY = point.pageY;

			newX = this.x + deltaX;
			newY = this.y + deltaY;

			this._pos(newX, newY);

			// INSERT POINT: indicator._move

			e.preventDefault();
			e.stopPropagation();
		},

		_end: function _end(e) {
			if (!this.initiated) {
				return;
			}

			this.initiated = false;

			e.preventDefault();
			e.stopPropagation();

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
			utils.removeEvent(window, 'mousemove', this);

			if (this.scroller.options.snap) {
				var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

				var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.scroller.x - snap.x), 1000), Math.min(Math.abs(this.scroller.y - snap.y), 1000)), 300);

				if (this.scroller.x != snap.x || this.scroller.y != snap.y) {
					this.scroller.directionX = 0;
					this.scroller.directionY = 0;
					this.scroller.currentPage = snap;
					this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
				}
			}

			if (this.moved) {
				this.scroller._execEvent('scrollEnd');
			}
		},

		transitionTime: function transitionTime(time) {
			time = time || 0;
			var durationProp = utils.style.transitionDuration;
			if (!durationProp) {
				return;
			}

			this.indicatorStyle[durationProp] = time + 'ms';

			if (!time && utils.isBadAndroid) {
				this.indicatorStyle[durationProp] = '0.0001ms';
				// remove 0.0001ms
				var self = this;
				rAF(function () {
					if (self.indicatorStyle[durationProp] === '0.0001ms') {
						self.indicatorStyle[durationProp] = '0s';
					}
				});
			}
		},

		transitionTimingFunction: function transitionTimingFunction(easing) {
			this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
		},

		refresh: function refresh() {
			this.transitionTime();

			if (this.options.listenX && !this.options.listenY) {
				this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
			} else if (this.options.listenY && !this.options.listenX) {
				this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
			} else {
				this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
			}

			if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
				utils.addClass(this.wrapper, 'iScrollBothScrollbars');
				utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

				if (this.options.defaultScrollbars && this.options.customStyle) {
					if (this.options.listenX) {
						this.wrapper.style.right = '8px';
					} else {
						this.wrapper.style.bottom = '8px';
					}
				}
			} else {
				utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
				utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

				if (this.options.defaultScrollbars && this.options.customStyle) {
					if (this.options.listenX) {
						this.wrapper.style.right = '2px';
					} else {
						this.wrapper.style.bottom = '2px';
					}
				}
			}

			var r = this.wrapper.offsetHeight; // force refresh

			if (this.options.listenX) {
				this.wrapperWidth = this.wrapper.clientWidth;
				if (this.options.resize) {
					this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
					this.indicatorStyle.width = this.indicatorWidth + 'px';
				} else {
					this.indicatorWidth = this.indicator.clientWidth;
				}

				this.maxPosX = this.wrapperWidth - this.indicatorWidth;

				if (this.options.shrink == 'clip') {
					this.minBoundaryX = -this.indicatorWidth + 8;
					this.maxBoundaryX = this.wrapperWidth - 8;
				} else {
					this.minBoundaryX = 0;
					this.maxBoundaryX = this.maxPosX;
				}

				this.sizeRatioX = this.options.speedRatioX || this.scroller.maxScrollX && this.maxPosX / this.scroller.maxScrollX;
			}

			if (this.options.listenY) {
				this.wrapperHeight = this.wrapper.clientHeight;
				if (this.options.resize) {
					this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
					this.indicatorStyle.height = this.indicatorHeight + 'px';
				} else {
					this.indicatorHeight = this.indicator.clientHeight;
				}

				this.maxPosY = this.wrapperHeight - this.indicatorHeight;

				if (this.options.shrink == 'clip') {
					this.minBoundaryY = -this.indicatorHeight + 8;
					this.maxBoundaryY = this.wrapperHeight - 8;
				} else {
					this.minBoundaryY = 0;
					this.maxBoundaryY = this.maxPosY;
				}

				this.maxPosY = this.wrapperHeight - this.indicatorHeight;
				this.sizeRatioY = this.options.speedRatioY || this.scroller.maxScrollY && this.maxPosY / this.scroller.maxScrollY;
			}

			this.updatePosition();
		},

		updatePosition: function updatePosition() {
			var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
			    y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

			if (!this.options.ignoreBoundaries) {
				if (x < this.minBoundaryX) {
					if (this.options.shrink == 'scale') {
						this.width = Math.max(this.indicatorWidth + x, 8);
						this.indicatorStyle.width = this.width + 'px';
					}
					x = this.minBoundaryX;
				} else if (x > this.maxBoundaryX) {
					if (this.options.shrink == 'scale') {
						this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
						this.indicatorStyle.width = this.width + 'px';
						x = this.maxPosX + this.indicatorWidth - this.width;
					} else {
						x = this.maxBoundaryX;
					}
				} else if (this.options.shrink == 'scale' && this.width != this.indicatorWidth) {
					this.width = this.indicatorWidth;
					this.indicatorStyle.width = this.width + 'px';
				}

				if (y < this.minBoundaryY) {
					if (this.options.shrink == 'scale') {
						this.height = Math.max(this.indicatorHeight + y * 3, 8);
						this.indicatorStyle.height = this.height + 'px';
					}
					y = this.minBoundaryY;
				} else if (y > this.maxBoundaryY) {
					if (this.options.shrink == 'scale') {
						this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
						this.indicatorStyle.height = this.height + 'px';
						y = this.maxPosY + this.indicatorHeight - this.height;
					} else {
						y = this.maxBoundaryY;
					}
				} else if (this.options.shrink == 'scale' && this.height != this.indicatorHeight) {
					this.height = this.indicatorHeight;
					this.indicatorStyle.height = this.height + 'px';
				}
			}

			this.x = x;
			this.y = y;

			if (this.scroller.options.useTransform) {
				this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
			} else {
				this.indicatorStyle.left = x + 'px';
				this.indicatorStyle.top = y + 'px';
			}
		},

		_pos: function _pos(x, y) {
			if (x < 0) {
				x = 0;
			} else if (x > this.maxPosX) {
				x = this.maxPosX;
			}

			if (y < 0) {
				y = 0;
			} else if (y > this.maxPosY) {
				y = this.maxPosY;
			}

			x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
			y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

			this.scroller.scrollTo(x, y);
		},

		fade: function fade(val, hold) {
			if (hold && !this.visible) {
				return;
			}

			clearTimeout(this.fadeTimeout);
			this.fadeTimeout = null;

			var time = val ? 250 : 500,
			    delay = val ? 0 : 300;

			val = val ? '1' : '0';

			this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

			this.fadeTimeout = setTimeout(function (val) {
				this.wrapperStyle.opacity = val;
				this.visible = +val;
			}.bind(this, val), delay);
		}
	};

	IScroll.utils = utils;

	if (typeof module != 'undefined' && module.exports) {
		module.exports = IScroll;
	} else if (typeof define == 'function' && define.amd) {
		define(function () {
			return IScroll;
		});
	} else {
		window.IScroll = IScroll;
	}
})(window, document, Math);

/*! touchjs v0.2.14  2014-08-05 */
'use strict';
(function (root, factory) {
	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(factory); //Register as a module.
	} else {
		root.touch = factory();
	}
})(window, function () {

	var utils = {};

	utils.PCevts = {
		'touchstart': 'mousedown',
		'touchmove': 'mousemove',
		'touchend': 'mouseup',
		'touchcancel': 'mouseout'
	};

	utils.hasTouch = 'ontouchstart' in window;

	utils.getType = function (obj) {
		return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
	};

	utils.getSelector = function (el) {
		if (el.id) {
			return "#" + el.id;
		}
		if (el.className) {
			var cns = el.className.split(/\s+/);
			return "." + cns.join(".");
		} else if (el === document) {
			return "body";
		} else {
			return el.tagName.toLowerCase();
		}
	};

	utils.matchSelector = function (target, selector) {
		return target.webkitMatchesSelector(selector);
	};

	utils.getEventListeners = function (el) {
		return el.listeners;
	};

	utils.getPCevts = function (evt) {
		return this.PCevts[evt] || evt;
	};

	utils.forceReflow = function () {
		var tempDivID = "reflowDivBlock";
		var domTreeOpDiv = document.getElementById(tempDivID);
		if (!domTreeOpDiv) {
			domTreeOpDiv = document.createElement("div");
			domTreeOpDiv.id = tempDivID;
			document.body.appendChild(domTreeOpDiv);
		}
		var parentNode = domTreeOpDiv.parentNode;
		var nextSibling = domTreeOpDiv.nextSibling;
		parentNode.removeChild(domTreeOpDiv);
		parentNode.insertBefore(domTreeOpDiv, nextSibling);
	};

	utils.simpleClone = function (obj) {
		return Object.create(obj);
	};

	utils.getPosOfEvent = function (ev) {
		if (this.hasTouch) {
			var posi = [];
			var src = null;

			for (var t = 0, len = ev.touches.length; t < len; t++) {
				src = ev.touches[t];
				posi.push({
					x: src.pageX,
					y: src.pageY
				});
			}
			return posi;
		} else {
			return [{
				x: ev.pageX,
				y: ev.pageY
			}];
		}
	};

	utils.getDistance = function (pos1, pos2) {
		var x = pos2.x - pos1.x,
		    y = pos2.y - pos1.y;
		return Math.sqrt(x * x + y * y);
	};

	utils.getFingers = function (ev) {
		return ev.touches ? ev.touches.length : 1;
	};

	utils.calScale = function (pstart, pmove) {
		if (pstart.length >= 2 && pmove.length >= 2) {
			var disStart = this.getDistance(pstart[1], pstart[0]);
			var disEnd = this.getDistance(pmove[1], pmove[0]);

			return disEnd / disStart;
		}
		return 1;
	};

	utils.getAngle = function (p1, p2) {
		return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
	};

	utils.getAngle180 = function (p1, p2) {
		var agl = Math.atan((p2.y - p1.y) * -1 / (p2.x - p1.x)) * (180 / Math.PI);
		return agl < 0 ? agl + 180 : agl;
	};

	utils.getDirectionFromAngle = function (agl) {
		var directions = {
			up: agl < -45 && agl > -135,
			down: agl >= 45 && agl < 135,
			left: agl >= 135 || agl <= -135,
			right: agl >= -45 && agl <= 45
		};
		for (var key in directions) {
			if (directions[key]) return key;
		}
		return null;
	};

	utils.getXYByElement = function (el) {
		var left = 0,
		    top = 0;

		while (el.offsetParent) {
			left += el.offsetLeft;
			top += el.offsetTop;
			el = el.offsetParent;
		}
		return {
			left: left,
			top: top
		};
	};

	utils.reset = function () {
		startEvent = moveEvent = endEvent = null;
		__tapped = __touchStart = startSwiping = startPinch = false;
		startDrag = false;
		pos = {};
		__rotation_single_finger = false;
	};

	utils.isTouchMove = function (ev) {
		return ev.type === 'touchmove' || ev.type === 'mousemove';
	};

	utils.isTouchEnd = function (ev) {
		return ev.type === 'touchend' || ev.type === 'mouseup' || ev.type === 'touchcancel';
	};

	utils.env = function () {
		var os = {},
		    ua = navigator.userAgent,
		    android = ua.match(/(Android)[\s\/]+([\d\.]+)/),
		    ios = ua.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
		    wp = ua.match(/(Windows\s+Phone)\s([\d\.]+)/),
		    isWebkit = /WebKit\/[\d.]+/i.test(ua),
		    isSafari = ios ? navigator.standalone ? isWebkit : /Safari/i.test(ua) && !/CriOS/i.test(ua) && !/MQQBrowser/i.test(ua) : false;
		if (android) {
			os.android = true;
			os.version = android[2];
		}
		if (ios) {
			os.ios = true;
			os.version = ios[2].replace(/_/g, '.');
			os.ios7 = /^7/.test(os.version);
			if (ios[1] === 'iPad') {
				os.ipad = true;
			} else if (ios[1] === 'iPhone') {
				os.iphone = true;
				os.iphone5 = screen.height == 568;
			} else if (ios[1] === 'iPod') {
				os.ipod = true;
			}
		}
		if (wp) {
			os.wp = true;
			os.version = wp[2];
			os.wp8 = /^8/.test(os.version);
		}
		if (isWebkit) {
			os.webkit = true;
		}
		if (isSafari) {
			os.safari = true;
		}
		return os;
	}();

	/** 底层事件绑定/代理支持  */
	var engine = {
		proxyid: 0,
		proxies: [],
		trigger: function trigger(el, evt, detail) {

			detail = detail || {};
			var e,
			    opt = {
				bubbles: true,
				cancelable: true,
				detail: detail
			};

			try {
				if (typeof CustomEvent !== 'undefined') {
					e = new CustomEvent(evt, opt);
					if (el) {
						el.dispatchEvent(e);
					}
				} else {
					e = document.createEvent("CustomEvent");
					e.initCustomEvent(evt, true, true, detail);
					if (el) {
						el.dispatchEvent(e);
					}
				}
			} catch (ex) {
				console.warn("Touch.js is not supported by environment.");
			}
		},
		bind: function bind(el, evt, handler) {
			el.listeners = el.listeners || {};
			if (!el.listeners[evt]) {
				el.listeners[evt] = [handler];
			} else {
				el.listeners[evt].push(handler);
			}
			var proxy = function proxy(e) {
				if (utils.env.ios7) {
					utils.forceReflow();
				}
				e.originEvent = e;
				for (var p in e.detail) {
					if (p !== 'type') {
						e[p] = e.detail[p];
					}
				}
				e.startRotate = function () {
					__rotation_single_finger = true;
				};
				var returnValue = handler.call(e.target, e);
				if (typeof returnValue !== "undefined" && !returnValue) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			handler.proxy = handler.proxy || {};
			if (!handler.proxy[evt]) {
				handler.proxy[evt] = [this.proxyid++];
			} else {
				handler.proxy[evt].push(this.proxyid++);
			}
			this.proxies.push(proxy);
			if (el.addEventListener) {
				el.addEventListener(evt, proxy, false);
			}
		},
		unbind: function unbind(el, evt, handler) {
			if (!handler) {
				var handlers = el.listeners[evt];
				if (handlers && handlers.length) {
					handlers.forEach(function (handler) {
						el.removeEventListener(evt, handler, false);
					});
				}
			} else {
				var proxyids = handler.proxy[evt];
				if (proxyids && proxyids.length) {
					proxyids.forEach(function (proxyid) {
						if (el.removeEventListener) {
							el.removeEventListener(evt, this.proxies[this.proxyid], false);
						}
					});
				}
			}
		},
		delegate: function delegate(el, evt, sel, handler) {
			var proxy = function proxy(e) {
				var target, returnValue;
				e.originEvent = e;
				for (var p in e.detail) {
					if (p !== 'type') {
						e[p] = e.detail[p];
					}
				}
				e.startRotate = function () {
					__rotation_single_finger = true;
				};
				var integrateSelector = utils.getSelector(el) + " " + sel;
				var match = utils.matchSelector(e.target, integrateSelector);
				var ischild = utils.matchSelector(e.target, integrateSelector + " " + e.target.nodeName);
				if (!match && ischild) {
					if (utils.env.ios7) {
						utils.forceReflow();
					}
					target = e.target;
					while (!utils.matchSelector(target, integrateSelector)) {
						target = target.parentNode;
					}
					returnValue = handler.call(e.target, e);
					if (typeof returnValue !== "undefined" && !returnValue) {
						e.stopPropagation();
						e.preventDefault();
					}
				} else {
					if (utils.env.ios7) {
						utils.forceReflow();
					}
					if (match || ischild) {
						returnValue = handler.call(e.target, e);
						if (typeof returnValue !== "undefined" && !returnValue) {
							e.stopPropagation();
							e.preventDefault();
						}
					}
				}
			};
			handler.proxy = handler.proxy || {};
			if (!handler.proxy[evt]) {
				handler.proxy[evt] = [this.proxyid++];
			} else {
				handler.proxy[evt].push(this.proxyid++);
			}
			this.proxies.push(proxy);
			el.listeners = el.listeners || {};
			if (!el.listeners[evt]) {
				el.listeners[evt] = [proxy];
			} else {
				el.listeners[evt].push(proxy);
			}
			if (el.addEventListener) {
				el.addEventListener(evt, proxy, false);
			}
		},
		undelegate: function undelegate(el, evt, sel, handler) {
			if (!handler) {
				var listeners = el.listeners[evt];
				listeners.forEach(function (proxy) {
					el.removeEventListener(evt, proxy, false);
				});
			} else {
				var proxyids = handler.proxy[evt];
				if (proxyids.length) {
					proxyids.forEach(function (proxyid) {
						if (el.removeEventListener) {
							el.removeEventListener(evt, this.proxies[this.proxyid], false);
						}
					});
				}
			}
		}
	};

	var config = {
		tap: true,
		doubleTap: true,
		tapMaxDistance: 10,
		hold: true,
		tapTime: 200,
		holdTime: 650,
		maxDoubleTapInterval: 300,
		swipe: true,
		swipeTime: 300,
		swipeMinDistance: 18,
		swipeFactor: 5,
		drag: true,
		pinch: true,
		minScaleRate: 0,
		minRotationAngle: 0
	};

	var smrEventList = {
		TOUCH_START: 'touchstart',
		TOUCH_MOVE: 'touchmove',
		TOUCH_END: 'touchend',
		TOUCH_CANCEL: 'touchcancel',
		MOUSE_DOWN: 'mousedown',
		MOUSE_MOVE: 'mousemove',
		MOUSE_UP: 'mouseup',
		CLICK: 'click',
		PINCH_START: 'pinchstart',
		PINCH_END: 'pinchend',
		PINCH: 'pinch',
		PINCH_IN: 'pinchin',
		PINCH_OUT: 'pinchout',
		ROTATION_LEFT: 'rotateleft',
		ROTATION_RIGHT: 'rotateright',
		ROTATION: 'rotate',
		SWIPE_START: 'swipestart',
		SWIPING: 'swiping',
		SWIPE_END: 'swipeend',
		SWIPE_LEFT: 'swipeleft',
		SWIPE_RIGHT: 'swiperight',
		SWIPE_UP: 'swipeup',
		SWIPE_DOWN: 'swipedown',
		SWIPE: 'swipe',
		DRAG: 'drag',
		DRAGSTART: 'dragstart',
		DRAGEND: 'dragend',
		HOLD: 'hold',
		TAP: 'tap',
		DOUBLE_TAP: 'doubletap'
	};

	/** 手势识别 */
	var pos = {
		start: null,
		move: null,
		end: null
	};

	var startTime = 0;
	var fingers = 0;
	var startEvent = null;
	var moveEvent = null;
	var endEvent = null;
	var startSwiping = false;
	var startPinch = false;
	var startDrag = false;

	var __offset = {};
	var __touchStart = false;
	var __holdTimer = null;
	var __tapped = false;
	var __lastTapEndTime = null;
	var __tapTimer = null;

	var __scale_last_rate = 1;
	var __rotation_single_finger = false;
	var __rotation_single_start = [];
	var __initial_angle = 0;
	var __rotation = 0;

	var __prev_tapped_end_time = 0;
	var __prev_tapped_pos = null;

	var gestures = {
		getAngleDiff: function getAngleDiff(currentPos) {
			var diff = parseInt(__initial_angle - utils.getAngle180(currentPos[0], currentPos[1]), 10);
			var count = 0;

			while (Math.abs(diff - __rotation) > 90 && count++ < 50) {
				if (__rotation < 0) {
					diff -= 180;
				} else {
					diff += 180;
				}
			}
			__rotation = parseInt(diff, 10);
			return __rotation;
		},
		pinch: function pinch(ev) {
			var el = ev.target;
			if (config.pinch) {
				if (!__touchStart) return;
				if (utils.getFingers(ev) < 2) {
					if (!utils.isTouchEnd(ev)) return;
				}
				var scale = utils.calScale(pos.start, pos.move);
				var rotation = this.getAngleDiff(pos.move);
				var eventObj = {
					type: '',
					originEvent: ev,
					scale: scale,
					rotation: rotation,
					direction: rotation > 0 ? 'right' : 'left',
					fingersCount: utils.getFingers(ev)
				};
				if (!startPinch) {
					startPinch = true;
					eventObj.fingerStatus = "start";
					engine.trigger(el, smrEventList.PINCH_START, eventObj);
				} else if (utils.isTouchMove(ev)) {
					eventObj.fingerStatus = "move";
					engine.trigger(el, smrEventList.PINCH, eventObj);
				} else if (utils.isTouchEnd(ev)) {
					eventObj.fingerStatus = "end";
					engine.trigger(el, smrEventList.PINCH_END, eventObj);
					utils.reset();
				}

				if (Math.abs(1 - scale) > config.minScaleRate) {
					var scaleEv = utils.simpleClone(eventObj);

					//手势放大, 触发pinchout事件
					var scale_diff = 0.00000000001; //防止touchend的scale与__scale_last_rate相等，不触发事件的情况。
					if (scale > __scale_last_rate) {
						__scale_last_rate = scale - scale_diff;
						engine.trigger(el, smrEventList.PINCH_OUT, scaleEv, false);
					} //手势缩小,触发pinchin事件
					else if (scale < __scale_last_rate) {
							__scale_last_rate = scale + scale_diff;
							engine.trigger(el, smrEventList.PINCH_IN, scaleEv, false);
						}

					if (utils.isTouchEnd(ev)) {
						__scale_last_rate = 1;
					}
				}

				if (Math.abs(rotation) > config.minRotationAngle) {
					var rotationEv = utils.simpleClone(eventObj),
					    eventType;

					eventType = rotation > 0 ? smrEventList.ROTATION_RIGHT : smrEventList.ROTATION_LEFT;
					engine.trigger(el, eventType, rotationEv, false);
					engine.trigger(el, smrEventList.ROTATION, eventObj);
				}
			}
		},
		rotateSingleFinger: function rotateSingleFinger(ev) {
			var el = ev.target;
			if (__rotation_single_finger && utils.getFingers(ev) < 2) {
				if (!pos.move) return;
				if (__rotation_single_start.length < 2) {
					var docOff = utils.getXYByElement(el);

					__rotation_single_start = [{
						x: docOff.left + el.offsetWidth / 2,
						y: docOff.top + el.offsetHeight / 2
					}, pos.move[0]];
					__initial_angle = parseInt(utils.getAngle180(__rotation_single_start[0], __rotation_single_start[1]), 10);
				}
				var move = [__rotation_single_start[0], pos.move[0]];
				var rotation = this.getAngleDiff(move);
				var eventObj = {
					type: '',
					originEvent: ev,
					rotation: rotation,
					direction: rotation > 0 ? 'right' : 'left',
					fingersCount: utils.getFingers(ev)
				};
				if (utils.isTouchMove(ev)) {
					eventObj.fingerStatus = "move";
				} else if (utils.isTouchEnd(ev) || ev.type === 'mouseout') {
					eventObj.fingerStatus = "end";
					engine.trigger(el, smrEventList.PINCH_END, eventObj);
					utils.reset();
				}
				var eventType = rotation > 0 ? smrEventList.ROTATION_RIGHT : smrEventList.ROTATION_LEFT;
				engine.trigger(el, eventType, eventObj);
				engine.trigger(el, smrEventList.ROTATION, eventObj);
			}
		},
		swipe: function swipe(ev) {
			var el = ev.target;
			if (!__touchStart || !pos.move || utils.getFingers(ev) > 1) {
				return;
			}

			var now = Date.now();
			var touchTime = now - startTime;
			var distance = utils.getDistance(pos.start[0], pos.move[0]);
			var position = {
				x: pos.move[0].x - __offset.left,
				y: pos.move[0].y - __offset.top
			};
			var angle = utils.getAngle(pos.start[0], pos.move[0]);
			var direction = utils.getDirectionFromAngle(angle);
			var touchSecond = touchTime / 1000;
			var factor = (10 - config.swipeFactor) * 10 * touchSecond * touchSecond;
			var eventObj = {
				type: smrEventList.SWIPE,
				originEvent: ev,
				position: position,
				direction: direction,
				distance: distance,
				distanceX: pos.move[0].x - pos.start[0].x,
				distanceY: pos.move[0].y - pos.start[0].y,
				x: pos.move[0].x - pos.start[0].x,
				y: pos.move[0].y - pos.start[0].y,
				angle: angle,
				duration: touchTime,
				fingersCount: utils.getFingers(ev),
				factor: factor
			};
			if (config.swipe) {
				var swipeTo = function swipeTo() {
					var elt = smrEventList;
					switch (direction) {
						case 'up':
							engine.trigger(el, elt.SWIPE_UP, eventObj);
							break;
						case 'down':
							engine.trigger(el, elt.SWIPE_DOWN, eventObj);
							break;
						case 'left':
							engine.trigger(el, elt.SWIPE_LEFT, eventObj);
							break;
						case 'right':
							engine.trigger(el, elt.SWIPE_RIGHT, eventObj);
							break;
					}
				};

				if (!startSwiping) {
					eventObj.fingerStatus = eventObj.swipe = 'start';
					startSwiping = true;
					engine.trigger(el, smrEventList.SWIPE_START, eventObj);
				} else if (utils.isTouchMove(ev)) {
					eventObj.fingerStatus = eventObj.swipe = 'move';
					engine.trigger(el, smrEventList.SWIPING, eventObj);

					if (touchTime > config.swipeTime && touchTime < config.swipeTime + 50 && distance > config.swipeMinDistance) {
						swipeTo();
						engine.trigger(el, smrEventList.SWIPE, eventObj, false);
					}
				} else if (utils.isTouchEnd(ev) || ev.type === 'mouseout') {
					eventObj.fingerStatus = eventObj.swipe = 'end';
					engine.trigger(el, smrEventList.SWIPE_END, eventObj);

					if (config.swipeTime > touchTime && distance > config.swipeMinDistance) {
						swipeTo();
						engine.trigger(el, smrEventList.SWIPE, eventObj, false);
					}
				}
			}

			if (config.drag) {
				if (!startDrag) {
					eventObj.fingerStatus = eventObj.swipe = 'start';
					startDrag = true;
					engine.trigger(el, smrEventList.DRAGSTART, eventObj);
				} else if (utils.isTouchMove(ev)) {
					eventObj.fingerStatus = eventObj.swipe = 'move';
					engine.trigger(el, smrEventList.DRAG, eventObj);
				} else if (utils.isTouchEnd(ev)) {
					eventObj.fingerStatus = eventObj.swipe = 'end';
					engine.trigger(el, smrEventList.DRAGEND, eventObj);
				}
			}
		},
		tap: function tap(ev) {
			var el = ev.target;
			if (config.tap) {
				var now = Date.now();
				var touchTime = now - startTime;
				var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);

				clearTimeout(__holdTimer);
				var isDoubleTap = function () {
					if (__prev_tapped_pos && config.doubleTap && startTime - __prev_tapped_end_time < config.maxDoubleTapInterval) {
						var doubleDis = utils.getDistance(__prev_tapped_pos, pos.start[0]);
						if (doubleDis < 16) return true;
					}
					return false;
				}();

				if (isDoubleTap) {
					clearTimeout(__tapTimer);
					engine.trigger(el, smrEventList.DOUBLE_TAP, {
						type: smrEventList.DOUBLE_TAP,
						originEvent: ev,
						position: pos.start[0]
					});
					return;
				}

				if (config.tapMaxDistance < distance) return;

				if (config.holdTime > touchTime && utils.getFingers(ev) <= 1) {
					__tapped = true;
					__prev_tapped_end_time = now;
					__prev_tapped_pos = pos.start[0];
					__tapTimer = setTimeout(function () {
						engine.trigger(el, smrEventList.TAP, {
							type: smrEventList.TAP,
							originEvent: ev,
							fingersCount: utils.getFingers(ev),
							position: __prev_tapped_pos
						});
					}, config.tapTime);
				}
			}
		},
		hold: function hold(ev) {
			var el = ev.target;
			if (config.hold) {
				clearTimeout(__holdTimer);

				__holdTimer = setTimeout(function () {
					if (!pos.start) return;
					var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);
					if (config.tapMaxDistance < distance) return;

					if (!__tapped) {
						engine.trigger(el, "hold", {
							type: 'hold',
							originEvent: ev,
							fingersCount: utils.getFingers(ev),
							position: pos.start[0]
						});
					}
				}, config.holdTime);
			}
		}
	};

	var handlerOriginEvent = function handlerOriginEvent(ev) {

		var el = ev.target;
		switch (ev.type) {
			case 'touchstart':
			case 'mousedown':
				__rotation_single_start = [];
				__touchStart = true;
				if (!pos.start || pos.start.length < 2) {
					pos.start = utils.getPosOfEvent(ev);
				}
				if (utils.getFingers(ev) >= 2) {
					__initial_angle = parseInt(utils.getAngle180(pos.start[0], pos.start[1]), 10);
				}

				startTime = Date.now();
				startEvent = ev;
				__offset = {};

				var box = el.getBoundingClientRect();
				var docEl = document.documentElement;
				__offset = {
					top: box.top + (window.pageYOffset || docEl.scrollTop) - (docEl.clientTop || 0),
					left: box.left + (window.pageXOffset || docEl.scrollLeft) - (docEl.clientLeft || 0)
				};

				gestures.hold(ev);
				break;
			case 'touchmove':
			case 'mousemove':
				if (!__touchStart || !pos.start) return;
				pos.move = utils.getPosOfEvent(ev);
				if (utils.getFingers(ev) >= 2) {
					gestures.pinch(ev);
				} else if (__rotation_single_finger) {
					gestures.rotateSingleFinger(ev);
				} else {
					gestures.swipe(ev);
				}
				break;
			case 'touchend':
			case 'touchcancel':
			case 'mouseup':
			case 'mouseout':
				if (!__touchStart) return;
				endEvent = ev;

				if (startPinch) {
					gestures.pinch(ev);
				} else if (__rotation_single_finger) {
					gestures.rotateSingleFinger(ev);
				} else if (startSwiping) {
					gestures.swipe(ev);
				} else {
					gestures.tap(ev);
				}

				utils.reset();
				__initial_angle = 0;
				__rotation = 0;
				if (ev.touches && ev.touches.length === 1) {
					__touchStart = true;
					__rotation_single_finger = true;
				}
				break;
		}
	};

	var _on = function _on() {

		var evts,
		    handler,
		    evtMap,
		    sel,
		    args = arguments;
		if (args.length < 2 || args > 4) {
			return console.error("unexpected arguments!");
		}
		var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
		els = els.length ? Array.prototype.slice.call(els) : [els];
		//事件绑定
		if (args.length === 3 && utils.getType(args[1]) === 'string') {
			evts = args[1].split(" ");
			handler = args[2];
			evts.forEach(function (evt) {
				if (!utils.hasTouch) {
					evt = utils.getPCevts(evt);
				}
				els.forEach(function (el) {
					engine.bind(el, evt, handler);
				});
			});
			return;
		}

		function evtMapDelegate(evt) {
			if (!utils.hasTouch) {
				evt = utils.getPCevts(evt);
			}
			els.forEach(function (el) {
				engine.delegate(el, evt, sel, evtMap[evt]);
			});
		}
		//mapEvent delegate
		if (args.length === 3 && utils.getType(args[1]) === 'object') {
			evtMap = args[1];
			sel = args[2];
			for (var evt1 in evtMap) {
				evtMapDelegate(evt1);
			}
			return;
		}

		function evtMapBind(evt) {
			if (!utils.hasTouch) {
				evt = utils.getPCevts(evt);
			}
			els.forEach(function (el) {
				engine.bind(el, evt, evtMap[evt]);
			});
		}

		//mapEvent bind
		if (args.length === 2 && utils.getType(args[1]) === 'object') {
			evtMap = args[1];
			for (var evt2 in evtMap) {
				evtMapBind(evt2);
			}
			return;
		}

		//兼容factor config
		if (args.length === 4 && utils.getType(args[2]) === "object") {
			evts = args[1].split(" ");
			handler = args[3];
			evts.forEach(function (evt) {
				if (!utils.hasTouch) {
					evt = utils.getPCevts(evt);
				}
				els.forEach(function (el) {
					engine.bind(el, evt, handler);
				});
			});
			return;
		}

		//事件代理
		if (args.length === 4) {
			var el = els[0];
			evts = args[1].split(" ");
			sel = args[2];
			handler = args[3];
			evts.forEach(function (evt) {
				if (!utils.hasTouch) {
					evt = utils.getPCevts(evt);
				}
				engine.delegate(el, evt, sel, handler);
			});
			return;
		}
	};

	var _off = function _off() {
		var evts, handler;
		var args = arguments;
		if (args.length < 1 || args.length > 4) {
			return console.error("unexpected arguments!");
		}
		var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
		els = els.length ? Array.prototype.slice.call(els) : [els];

		if (args.length === 1 || args.length === 2) {
			els.forEach(function (el) {
				evts = args[1] ? args[1].split(" ") : Object.keys(el.listeners);
				if (evts.length) {
					evts.forEach(function (evt) {
						if (!utils.hasTouch) {
							evt = utils.getPCevts(evt);
						}
						engine.unbind(el, evt);
						engine.undelegate(el, evt);
					});
				}
			});
			return;
		}

		if (args.length === 3 && utils.getType(args[2]) === 'function') {
			handler = args[2];
			els.forEach(function (el) {
				evts = args[1].split(" ");
				evts.forEach(function (evt) {
					if (!utils.hasTouch) {
						evt = utils.getPCevts(evt);
					}
					engine.unbind(el, evt, handler);
				});
			});
			return;
		}

		if (args.length === 3 && utils.getType(args[2]) === 'string') {
			var sel = args[2];
			els.forEach(function (el) {
				evts = args[1].split(" ");
				evts.forEach(function (evt) {
					if (!utils.hasTouch) {
						evt = utils.getPCevts(evt);
					}
					engine.undelegate(el, evt, sel);
				});
			});
			return;
		}

		if (args.length === 4) {
			handler = args[3];
			els.forEach(function (el) {
				evts = args[1].split(" ");
				evts.forEach(function (evt) {
					if (!utils.hasTouch) {
						evt = utils.getPCevts(evt);
					}
					engine.undelegate(el, evt, sel, handler);
				});
			});
			return;
		}
	};

	var _dispatch = function _dispatch(el, evt, detail) {
		var args = arguments;
		if (!utils.hasTouch) {
			evt = utils.getPCevts(evt);
		}
		var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
		els = els.length ? Array.prototype.call(els) : [els];

		els.forEach(function (el) {
			engine.trigger(el, evt, detail);
		});
	};

	//init gesture
	function init() {

		var mouseEvents = 'mouseup mousedown mousemove mouseout',
		    touchEvents = 'touchstart touchmove touchend touchcancel';
		var bindingEvents = utils.hasTouch ? touchEvents : mouseEvents;

		bindingEvents.split(" ").forEach(function (evt) {
			document.addEventListener(evt, handlerOriginEvent, false);
		});
	}

	init();

	var exports = {};

	exports.on = exports.bind = exports.live = _on;
	exports.off = exports.unbind = exports.die = _off;
	exports.config = config;
	exports.trigger = _dispatch;

	return exports;
});

!function (pui) {

	/**
  * seats: [
  * 	{
  * 		id: 73474, // 为0，表示非座位
  * 		screenY: 0, // 屏幕行，从0开始
  * 		screenX: 0, // 屏幕列，从0开始
  * 		name: '1排1座',
  * 		seatType: 1, // 0-普通座，1-残疾人座，2-情侣左座，3-情侣右座
  * 		seatStatus: 0 // 0-可售，100-已售
  * 	} 
  * ]
  */
	// data: json数组
	function handleSeat(data) {
		var len = data.length,
		    i = 0,
		    obj = new Object();
		for (; i < len; i++) {
			var valueY = data[i].screenY;
			if (!obj[valueY]) {
				obj[valueY] = [];
			}
			obj[valueY].push(data[i]);
		}
		return obj;
	}

	var defaultConfig = {
		aisle: '_', // 过道
		couple: 'q', // 情侣座
		common: 'c', // 路人座
		canSelect: 'ui-seats-white', //可选
		hasSelect: 'ui-seats-green', // 已选
		forbidSelect: 'ui-seats-pink', // 已售
		coupleForbidSelect: 'ui-seats-couple-forbid', // 情侣座已售
		coupleCanSelect: 'ui-seats-couple-white', // 情侣座可选
		coupleHasSelect: 'ui-seats-couple-pink', // 情侣座已选
		showLeftBar: true
	};
	// 保存每个座位的节点信息
	var seatsMap = new Map();

	var myScrollSeat = new IScroll('#J_seatScroll', {
		scrollX: true,
		scrollY: true,
		zoom: true,
		zoomMax: 2.5,
		zoomMin: 0.8,
		mouseWheel: true,
		wheelAction: 'zoom',
		preventDefault: false,
		eventPassthrough: false
		// bindToWrapper: true,
		// freeScroll: true,
		// click: true
		// tap: true,
		// indicators: [{
		// 	el: document.getElementById('J_seatNum'),
		// 	resize: false,
		// 	ignoreBoundaries: true,
		// 	speedRatioY: 1,
		// 	speedRatioX: 1
		// }]
	});

	var myScrollSeatNum = new IScroll('#J_seatNum', {
		scrollX: false,
		scrollY: true,
		zoom: true,
		zoomMax: 2.5,
		zoomMin: 0.8,
		mouseWheel: true,
		wheelAction: 'zoom',
		preventDefault: false,
		eventPassthrough: false
	});

	myScrollSeat.on('zoomEnd', function () {
		myScrollSeatNum.scrollTo(0, myScrollSeat.y);
	});

	touch.on('#seatScroll', 'pinch', function (ev) {
		var seatScale = myScrollSeat.scale;
		console.log('*************' + seatScale);
		myScrollSeatNum.zoom(seatScale);
	});

	touch.on('#seatScroll', 'drag', function (ev) {
		myScrollSeatNum.scrollTo(0, myScrollSeat.y);
	});

	function Seats(options) {
		pui.Event.call(this);

		this.options = pui.extend(defaultConfig, options);
		/*[
  	'___cccccc___cccc_',
  	'__ccccccccc___',
  	'__ccccqqcc______',
  	'________________',
  	'cccccccc_____ccccc',
  	'ccccc_____cccc____'
  ]*/
		var data = handleSeat(this.options.data);
		var fragment = document.createDocumentFragment(); // seat容器
		this.fragmentNum = document.createDocumentFragment(); // seatNum容器

		/*this.seatsFilter = pui.createEl('ul', 'ui-seats-filter'); // 左边的数字序号
  this.seatsFilter.id = 'seatsFilter';*/

		// 分别计算行号和列号
		var rowOrder = 0,
		    colOrder = 0,
		    coupleNum = 0; // 情侣座计数

		for (var key in data) {
			// 遍历行
			var ul = pui.createEl('ul', 'ui-seats-row');
			var filterLi = pui.createEl('li'); // 左边的排序号
			var row = data[key];

			// 不是过道的排
			if (data[key].length != 1 || data[key][0].id != 0) {
				rowOrder++;
				filterLi.innerText = rowOrder;
			}

			for (var i = 0, len = row.length; i < len; i++) {
				// 遍历列
				var col = null;
				if ((row[i].seatType == 0 || row[i].seatType == 1) && row[i].id != 0) {
					// 普通座位和残疾人座位
					colOrder++;

					if (row[i].seatStatus == 0) {
						// 普通座位可售
						col = pui.createEl('li', 'ui-seats-col ui-seats-white');
					} else if (row[i].seatStatus == 100) {
						// 普通座位已售
						col = pui.createEl('li', 'ui-seats-col ui-seats-pink');
					}

					col.setAttribute('data-order', rowOrder + '排' + colOrder + '座'); // 6排6座
					col.setAttribute('data-id', rowOrder + '_' + colOrder); // 6_6
					col.setAttribute('data-seat-id', row[i].id); // 8384764

					seatsMap.set(rowOrder + '_' + colOrder, col);

					col.onclick = this.options.click;
				} else if ((row[i].seatType == 2 || row[i].seatType == 3) && row[i].id != 0) {
					// 情侣座
					colOrder++;

					if (row[i].seatStatus == 0) {
						// 情侣座可售
						col = pui.createEl('li', 'ui-seats-col-couple ui-seats-couple-white');
					} else if (row[i].seatStatus == 100) {
						// 情侣座已售
						col = pui.createEl('li', 'ui-seats-col-couple ui-seats-couple-forbid');
					}

					// 每个情侣座都打上标记，方便点击时的处理
					col.setAttribute('data-couple', true);

					coupleNum++;
					if (coupleNum % 2 == 0) {
						pui.addClass(col, 'ui-seats-couple-fix');
					}

					col.setAttribute('data-order', rowOrder + '排' + colOrder + '座'); // 6排6座
					col.setAttribute('data-id', rowOrder + '_' + colOrder); // 6_6
					col.setAttribute('data-seat-id', row[i].id); // 8384764

					seatsMap.set(rowOrder + '_' + colOrder, col);

					col.onclick = this.options.click;
				} else if (row[i].id == 0) {
					// 过道
					col = pui.createEl('li', 'ui-seats-aisle');
				}

				ul.appendChild(col);
			}

			colOrder = 0; // 重置列的计数

			fragment.appendChild(ul);

			this.fragmentNum.appendChild(filterLi);
		}

		// 将座位图信息插入到文档中
		this.target = document.getElementById(this.options.id);
		this.target && this.target.appendChild(fragment);

		myScrollSeat.refresh();

		this.initLeftBar();
		this.initMidLine();
	}
	/**
  * 初始化左边的排索引BAR
  * @return {[type]} [description]
  */
	Seats.prototype.initLeftBar = function () {
		var seats = document.getElementById('seatsFilter');
		this.options.showLeftBar && seats && seats.appendChild(this.fragmentNum);

		// myScrollSeatNum.refresh();
	};
	/**
  * 	初始化一些居中对齐
  * 	设置居中对齐线，几号厅文本居中对齐
  * @return {[type]} [description]
  */
	Seats.prototype.initMidLine = function () {
		var scrollElem = document.getElementById('seatScroll'),
		    seatsRoom = document.getElementById('seatsRoom'),
		    sw = scrollElem.scrollWidth,
		    sh = scrollElem.scrollHeight,
		    cw = window.innerWidth,
		    ch = window.innerHeight,
		    divider = pui.createEl('div');

		divider.className = 'ui-seats-divider';
		divider.style.left = sw / 2 + 'px';
		scrollElem.appendChild(divider);

		// 此处也可以使用translate改变，具体的效果性能到时候在测试
		scrollElem.style.left = -(sw - cw) / 2 + 'px';
		// seatsFilter.style.left = (sw - cw) / 2 + 'px';
		// seatsRoom.style.width = sw + 'px';
		seatsRoom.style.left = -(sw - cw) / 2 + 'px';
	};

	Seats.prototype.getSeat = function (row_col) {
		return seatsMap.get(row_col);
	};

	Seats.prototype.setStatus = function (row_col, status) {
		var _this = this;

		if (Array.isArray(row_col)) {
			row_col.forEach(function (v) {
				pui.removeClass(_this.getSeat(v), defaultConfig.hasSelect + ' ' + defaultConfig.coupleHasSelect);
				pui.addClass(_this.getSeat(v), defaultConfig[status]);
			});
		}
		if (typeof row_col == 'string') {
			pui.removeClass(this.getSeat(row_col), defaultConfig.hasSelect + ' ' + defaultConfig.coupleHasSelect);
			pui.addClass(this.getSeat(row_col), defaultConfig[status]);
		}
		return this;
	};

	Seats.prototype.getStatus = function (row_col) {
		// return this.getSeat(row_col).status;
	};

	Seats.prototype.isCoupleSeat = function (row_col) {
		return !!this.getSeat(row_col).getAttribute('data-couple');
	};

	pui.Seats = Seats;
}(pui);

/*
var target = document.getElementById('seatScroll');
var seatsFilter = document.getElementById('seatsFilter');
var seatsRoom = document.getElementById('seatsRoom');
var seatsInfo = seats.getInfo();
var cw = seatsInfo.dragElemCW,
	ch = seatsInfo.dragElemCH,
	sw = seatsInfo.dragElemSW,
	sh = seatsInfo.dragElemSH;
touch.on(target, 'tap drag', function (ev) {
	ev.preventDefault();
})


var currentScale;
var thresholdX = 100; // 上下左右可以拖动的阈值
var scaleThreshold = 0.125;
var initialScale = 1;
var maxScale = 2;
var minScale = 0.375;

var dx, dy;
touch.on(target, 'dragstart pinchstart', function(ev){
	console.log('----------start-----------');
})
touch.on(target, 'drag', function (ev) {
	var scale = getScale();
	dx = dx || 0;
	dy = dy || 0;
	var offx = dx + ev.x;
	var offy = dy + ev.y;

	target.style.webkitTransition = 'none';
	seatsFilter.style.webkitTransition = 'none';
	
	target.style.webkitTransform = 'translate3d(' + offx + 'px,' + offy + 'px, 0) scale(' + scale + ')';
	seatsFilter.style.webkitTransform = 'translateY(' + offy + 'px) translateZ(0) scale(' + scale + ')';
	seatsRoom.style.webkitTransform = 'translateX(' + offx + 'px) translateZ(0)';
})
touch.on(target, 'dragend', function (ev) {
	dx += ev.x;
	dy += ev.y;

	var scale = getScale();
	var maxX = (sw * scale - cw) / 2;
	var maxY = sh * scale - deltaOffset;
	var y = pui.parseTranslate(target.style.transform, 'y');

	if (Math.abs(dx) > maxX + thresholdX) {
		if (dx > 0) {
			dx = maxX + thresholdX;
		}else{
			dx = -(maxX + thresholdX);
		}
	}

	if(sh * scale <= deltaOffset){
		dy = 0;
	}

	if(y >= 0 && dy > 0){
		dy = 0;
	}

	if(dy < 0 && (Math.abs(dy) > maxY)){
		dy = -maxY;
	}

	target.style.webkitTransition = 'transform 0.4s ease-out 0s';
	seatsFilter.style.webkitTransition = 'transform 0.4s ease-out 0s';

	target.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px, 0) scale(' + scale + ')';
	seatsFilter.style.webkitTransform = 'translateY(' + dy + 'px) translateZ(0) scale(' + scale + ')';
	seatsRoom.style.webkitTransform = 'translateX(' + dx + 'px) translateZ(0)';
})


touch.on(target, 'pinch', function(ev){
	currentScale = ev.scale - 1;
	currentScale = initialScale + currentScale;
	//currentScale = currentScale > 2 ? 2 : currentScale;
	currentScale = currentScale < (minScale - scaleThreshold) ? minScale : currentScale;

	var pointers = ev.originEvent.touches;
	var pointersLen = pointers && pointers.length;
	var x = 0, y = 0, i = 0;
	if(pointersLen == 1){
		x = pointer.pageX,
		y = pointer.pageY;
	}
	while(i < pointersLen){
		x += pointers[i].pageX;
		y += pointers[i].pageY;
		i++;
	}
	x = Math.round(x / pointersLen);
	y = Math.round(y / pointersLen);

	target.style.webkitTransition = 'none';
	seatsFilter.style.webkitTransition = 'none';

	//target.style.webkitTransformOrigin = x + 'px ' + y + 'px 0';
	target.style.webkitTransform = 'scale(' + currentScale + ')';
	seatsFilter.style.webkitTransform = 'scale(' + currentScale + ')';
});

touch.on(target, 'pinchend', function(ev){
	var currentScale = ev.scale;
	if(currentScale > maxScale + scaleThreshold){
		currentScale = maxScale;
	}
	if(currentScale < minScale - scaleThreshold){
		currentScale = minScale;
	}

	target.style.webkitTransition = 'transform 0.2s ease-out 0s';
	seatsFilter.style.webkitTransition = 'transform 0.2s ease-out 0s';

	target.style.webkitTransform = 'scale(' + currentScale + ')';
	seatsFilter.style.webkitTransform = 'scale(' + currentScale + ')';

	initialScale = currentScale;
});


function getScale () {
	var rscale = /(?:scale\((\d)\))/,
		transform = target.style.webkitTransform,
		ret;
	return (transform && (ret = rscale.exec(transform)) && ret[1]) || 1;
}
*/