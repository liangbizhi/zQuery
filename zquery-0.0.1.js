/**
 * zQuery, imitated from jQuery
 * @author liangbizhi
 */
;(function(window, undefined) {
	/* initialize zQuery object */
	var zQuery = function() {
		return new zQuery.prototype.init(arguments[0]);
	};
	/* prototype */
	zQuery.fn = zQuery.prototype = {
		constructor: zQuery,
		length: 0,
		// handle id selector only
		init: function(selector) {
			select.call(this, selector);
		},
		zquery: '0.0.1'
	};
	/* give zQuery.fn.init function the zQuery prototype for later instantiation */
	zQuery.fn.init.prototype = zQuery.fn;
	/**
	 * extend
	 * 1. extend(src1, src2, ...);
	 * 2. extend(dest, src1, src2, ...);
	 * 3. extend(true|false, dest, src1, src2, ...);
	 */
	zQuery.extend = zQuery.fn.extend = function() {
		var sources, name, targetVal, srcVal, srcValIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length;
			deep = false;
		// deep clone, case 3
		if(typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the dest object.
			i = 2;
		}

		if(typeof target !== 'object' && !zQuery.isFunction(target)) {
			target = {};
		}
		// extend zQuery itself if only one argument passed, case 1
		if(i === length) {
			target = this;
			i--;
		}

		for(; i < length; i++) {
			if((sources = arguments[i]) !== null) {
				for(name in sources) {
					targetVal = target[name];
					srcVal = sources[name];

					if(deep && srcVal &&
						(zQuery.isPlainObject(srcVal) || (srcValIsArray = zQuery.isArray(srcVal)))) {
						if(srcValIsArray) {
							srcValIsArray = false;
							clone = targetVal && zQuery.isArray(targetVal) ? targetVal : [];
						} else {
							clone = targetVal && zQuery.isPlainObject(targetVal) ? targetVal : {};
						}
						target[name] = zQuery.extend(deep, clone, srcVal);
					} else if(srcVal !== undefined) {
						target[name] = srcVal;
					}
				}
			}
		}
		return target;
	};
	/* private attributes and methods */
	var EventMapping = {},
		regId = /^#([\w\-]+)/,
        regCls = /^([\w\-]+)?\.([\w\-]+)/,
        regTag = /^([\w\*]+)$/,
        regNodeAttr = /^([\w\-]+)?\[([\w]+)(=(\S+))?\]/,
        // A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
	function isNode(ele) {
		return ele && ele.nodeType;
	}
	function isDocument(ele) {
		return ele && ele === window.document;
	}
	function getEvent(e) {
		return e || window.event;
	}
	function getTarget(e) {
		var e = getEvent(e);
		return e.target || e.srcElement;
	}
	function uniqueArray(arr) {
		var i, len, element, result = [], hash = {};
		if(zQuery.isArray(arr)) {
			for(i = 0, len = arr.length; i < len; i++) {
				element = arr[i];
				if(!hash[element]) {
					result.push(element);
					hash[element] = true;
				}
			}
			return result;
		} else {
			zQuery.error('IllegalArgumentException: Array expected');
		}
	}
	function isArraylike(obj) {
		var length = obj.length,
			type = zQuery.type(obj);
		if(zQuery.isWindow(obj)) {
			return false;
		}
		if(obj.nodeType === 1 && length) {
			return true;
		}
		return type === "array" || type !== "function" &&
			(length === 0 ||
			typeof length === "number" && length > 0 && (length - 1) in obj);
	}
	// seletor
	function select(selector) {
		var selectors;			
        if(zQuery.type(selector) === 'string') {
        	selector = zQuery.trim(selector);
        	if(selector.length === 0) {
        		return this;
        	} else {
        		selectors = selector.split(/\s+/);
        		return _select.call(this, selectors, [document]);
        	}
        } else if(isNode(selector) || zQuery.isWindow(selector) || isDocument(selector)) {
        	this[0] = selector;
        	this.length = 1;
        	return this;
        } else {
        	return selector;
        }
	}

	function _select(selectors, preEles) {
		var currSelector, kv,
			key, value,
			tmpEles = [],
			foundEles, i, len,
			matchTag,
			that = this;
		if(selectors.length === 0) {
			// put into zQuery object
			zQuery.each(preEles, function(i, ele) {
				that[i] = ele;
			});
			this.length = preEles.length;
			return this;
		}
		currSelector = selectors.shift();
		// e.g. #id
		if(regId.test(currSelector)) {
			key = currSelector.match(regId)[1];
			tmpEles.push(document.getElementById(key));
		}
		// p.header
		else if(regCls.test(currSelector)) {
			kv = currSelector.match(regCls);
			key = kv[1] || '*';
			value = kv[2];
			zQuery.each(preEles, function(i, ele) {
				foundEles = ele.getElementsByTagName(key);
				for(i = 0, len = foundEles.length; i < len; i++) {
					if((new RegExp('(\\s|^)' + value + '(\\s|$)')).test(foundEles[i].className)) {
						tmpEles.push(foundEles[i]);	
					}
				}
			});
		}
		// p
		else if(regTag.test(currSelector)) {
			key = currSelector.match(regTag)[1];
			zQuery.each(preEles, function(i, ele) {
				foundEles = ele.getElementsByTagName(key);
				for(i = 0, len = foundEles.length; i < len; i++) {
					tmpEles.push(foundEles[i]);
				}
			});
		}
		// just for p[class=success], does not support p[class="success bold"]...
		else if(regNodeAttr.test(currSelector)) {
			kv = currSelector.match(regNodeAttr);
			matchTag = kv[1] || '*';
			key = kv[2];
			value = kv[4];
			zQuery.each(preEles, function(i, ele) {
				foundEles = ele.getElementsByTagName(matchTag);
				for(i = 0, len = foundEles.length; i < len; i++) {
					if(foundEles[i].hasAttribute(key)) {
						if(value) {
							if(foundEles[i].getAttribute(key) === value) {
								tmpEles.push(foundEles[i]);
							}
						} else {
							tmpEles.push(foundEles[i]);
						}
					}
				}
			});
		} else {
			zQuery.error('Failed to execute selector: The provided selector is unsupported.');
		}
		return _select.call(this, selectors, tmpEles);
	}

	// function fireEvent(type, event) {
	// 	var i, len, eventArray;
	// 	if(type in EventMapping) {
	// 		eventArray = EventMapping[type];
	// 		for(i = 0, len = eventArray.length; i < len; i++) {
	// 			eventArray[i].call(event);
	// 		}
	// 	}
	// }
	// function bindConcreteEvent(type, fn) {
	// 	if(zQuery.type(type) !== 'string') return;
	// 	type = zQuery.trim(type.toLowerCase());
	// 	if(fn) {
	// 		this.bind(type, fn);
	// 	} else {
	// 		fireEvent(type, );
	// 	}
	// }
	/* prototype methods */
	zQuery.fn.extend({
		get: function(index) {
			return this[index];
		},
		size: function() {
			return this.length;
		},
		each: function(fn) {
			zQuery.each(this, fn);
			return this;
		},
		// attributes
		attr: function() {
			var element = this.get(0),
				length = arguments.length,
				key = arguments[0],
				value = arguments[1],
				name;
			if(!isNode(element)) return this;
			if(arguments.length === 1) {
				if(zQuery.isPlainObject(key)) {
					for(name in key) {
						this.each(function(i, ele) {
							element.setAttribute(name, key[name]);
						});
					}
				} else {
					return element.getAttribute(key);
				}
			} else if(arguments.length === 2) {
				this.each(function(i, ele) {
					element.setAttribute(key, value);
				});
			}
			return this;
		},
		removeAttr: function(name) {
			var element = this.get(0);
			if(isNode(element)) {
				element.removeAttribute(name);
			}
			return this;
		},
		hasClass: function(clazz) {
			var element = this.get(0);
			if(!isNode(element) || zQuery.type(clazz) !== 'string') return false;
			if(element.className) {
				return (new RegExp('(\\s|^)' + zQuery.trim(clazz) + '(\\s|$)')).test(element.className);
			}
			return false;
		},
		addClass: function(clazz) {
			var i, clazzes;
			if(zQuery.type(clazz) !== 'string') return this;
			this.each(function(i, ele) {
				if(isNode(ele)) {
					clazzes = uniqueArray((ele.className + ' ' + clazz).split(/\s+/));
					ele.className = clazzes.join(' ');
				}
			});
			return this;
		},
		removeClass: function(clazz) {
			var i, j, len, clazzesLen, element, clazzes;
			clazz = clazz || '';
			if(zQuery.type(clazz) !== 'string') return this;
			clazzes = uniqueArray(clazz.split(/\s+/));
			this.each(function(i, ele) {
				if(isNode(ele)) {
					for(j = 0, clazzesLen = clazzes.length; j < clazzesLen; j++) {
						var re = new RegExp('(\\s|^)' + clazzes[j] + '(\\s|$)');
						ele.className = ele.className.replace(re, ' ');
					}
				}
			});
			return this;
		},
		html: function() {
			var element = this.get(0);
			if(!isNode(element)) return this;
			if(arguments.length === 0) {
				return element.innerHTML;
			} else if (arguments.length === 1) {
				if(zQuery.type(arguments[0]) === 'string') {
					this.get(0).innerHTML = arguments[0];
				}
			}
			return this;
		},
		val: function() {
			var element = this.get(0);
			if(!isNode(element)) return '';
			if(arguments.length === 0) {
				return element.value || '';
			} else if(arguments.length === 1) {
				if(zQuery.type(element.value) === 'string' && zQuery.type(arguments[0]) === 'string') {
					element.value = arguments[0];
				}
			}
			return this;
		},
		// CSS
		css: function() {
			var element = this.get(0),
				length = arguments.length,
				key = arguments[0] || '',
				value = arguments[1],
				name;
			if(!isNode(element)) return '';
			if(length === 1) {
				if(zQuery.isPlainObject(key)) {
					this.each(function(i, ele) {					
						for(name in key) {
							ele.style[name] = key[name];
						}
					});
				} else {	
					if(element.currentStyle) {
						return element.currentStyle[key].toLowerCase();
					} else {
						return window.getComputedStyle(element, null)[key].toLowerCase();
					}
				}
			} else if(length === 2) {
				this.each(function(i, ele) {
					ele.style[key] = value;
				});
			}
			return this;
		},
		offset: function() {
			var element = this.get(0);
			var docClientLeft = document.documentElement.clientLeft;
			var docClientTop = document.documentElement.clientTop;
			return {
				left: element.getBoundingClientRect().left - docClientLeft,
				top: element.getBoundingClientRect().top - docClientTop
			};
		},
		position: function() {
			var element = this.get(0);
			return {top: element.offsetTop, left: element.offsetLeft};
		},
		// DOM operations
		append: function(o) {
			var insertHTML;
			if(zQuery.type(o) === 'string') {
				this.each(function(i, ele) {
					ele.innerHTML += o;
				});
			} else if(isNode(o)) {
				this.each(function(i, ele) {
					this.get(i).appendChild(o);
				});
			} else if(o.init.prototype.constructor === zQuery) {
				this.each(function(i, ele) {
					this.get(i).appendChild(o.get(0));
				});
			}
			
			return this;
		},
		prepend: function(o) {
			var insertHTML;
			if(zQuery.type(o) === 'string') {
				insertHTML = o;
			} else if(isNode(o)) {
				insertHTML = o.outerHTML;
			} else if(o.init.prototype.constructor === zQuery) {
				insertHTML = o.get(0).outerHTML;
			}
			this.each(function(i, ele) {
				$(ele).html(insertHTML + $(ele).html());
			});
			return this;
		},
		parent: function() {
			var element = this.get(0);
			if(isNode(element)) {
				return element.parentNode;
			}
		},
		remove: function() {
			if(arguments.length === 0) {
				this.each(function(i, ele) {
					ele.parentNode.removeChild(ele);
				});
			} else if (arguments.length === 1) {
				if(zQuery.type(arguments[0]) === 'string') {
					this.find(arguments[0]).remove();
				}
			}
		},
		// find
		find: function(selector) {
			if(zQuery.type(selector) === 'string') {
				var clone = zQuery.extend(true, {}, this);
				return _select.call(clone, (zQuery.trim(selector)).split(/\s+/), this);
			} else {
				return this;
			}
		},
		// events
		bind: function(type, fn) {
			if(zQuery.type(type) !== 'string' || !zQuery.isFunction(fn)) return this;
			type = zQuery.trim(type.toLowerCase());
			if(EventMapping[type]) {
				EventMapping[type].push(fn);
			} else {
				EventMapping[type] = [fn];
			}
			if(window.addEventListener) {
				this.each(function(i, ele) {
					ele.addEventListener(type, fn, false);
				});
			} else {
				this.each(function(i, ele) {
					ele.attachEvent('on' + type, fn);
				});
			}
			return this;
		},
		// (bug)
		unbind: function() {
			var type;
			if(arguments.length === 0) {
				for(type in EventMapping) {
					unbindFn.call(this, EventMapping[type], type);
				}
			} else if(arguments[0]) {
				if(zQuery.type(argumenets[0]) !== 'string') return this;
				type = zQuery.trim(arguments[0].toLowerCase());
				if(type in EventMapping) {
					unbindFn.call(this, EventMapping[type], type);
				}
			}
			function unbindFn(eventArray, type) {
				var i, fn;
				for(i = 0, len = eventArray.length; i < len; i++) {
					fn = eventArray[0];
					if(window.removeEventListener) {
						this.each(function(i, ele) {
							ele.removeEventListener(type, fn, false);
						});
					} else {
						this.each(function(i, ele) {
							ele.detachEvent('on' + type, fn);
						});
					}
					eventArray.shift();
				}
			}
			return this;
		},
		// (bug) to do
		on: function() {
			var type = arguments[0],
				filter = zQuery.trim(arguments[1]).toLowerCase(),
				callback = arguments[arguments.length - 1],
				target, parent;
			this.bind(type, function(e) {
				if(zQuery.type(filter) === 'string') {
					target = getTarget(e);
					if(target.tagName.toLowerCase() === filter) {
						callback.call(target, e);
					}
					// find its parent (bug)
					else {
						while((parent = target.parentNode) !== this) {
							if(parent.tagName.toLowerCase() === filter) {
								callback.call(parent, e);
								break;
							}
						}
					}
				} else {
					callback.call(this, e);
				}

			});
		},
		ready: function(fn) {
			if(document.addEventListener) {
				document.addEventListener('DOMContentLoaded', fn, false);
			} else {
				document.attachEvent('onreadystatechange', function() {
					if(document.readyState === 'complete') {
						fn();
					}
				});
			}
		},
		// 
		show: function() {
			if(this.css('display') === 'none') {
				this.css('display', 'block');
			}
		},
		hide: function() {
			if(this.css('display') !== 'none') {
				this.css('display', 'none');
			}
		}
	});
	
	/* zQuery static methods */
	zQuery.extend({
		// to test
		// {
		// 	async：boolean
		// 	contentType：String
		// 	data:Obejct或String
		// 	error：Function(XMLHttpRequest, textStatus)
		// 	success：Function(data, textStatus)
		// 	type：String，"get"[default] or "post"
		// 	url：String，默认当前页面
		// }
		ajax: function(options) {
			var async = options.async || true,
				contentType = options.contentType || 'application/x-www-form-urlencoded',
				data = options.data || {},
				error = options.error,
				success = options.success,
				type = options.type || 'post',
				url = options.url || window.location.pathname,
				xmlhttp,
				key, convert = [];

			var Promise = function() {
				this.callbacks = [];
			};
			Promise.prototype = {
				constructor: Promise,
				resolve: function(result) {
					this.complete('resolve', result);
				},
				reject: function(result) {
					this.complete('reject', result);
				},
				complete: function(type, result) {
					var fn;
					while(this.callbacks[0]) {
						fn = this.callbacks.shift()[type];
						if(fn) {
							fn(result);
						}
					}
				},
				then: function(successHandler, failedHandler) {
					this.callbacks.push({
						resolve: successHandler,
						reject: failedHandler
					});
				},
				done: function(successHandler) {
					this.then(successHandler);
					return this;
				},
				fail: function(failedHandler) {
					this.then(null, failedHandler);
				}
			};
			var promise = new Promise();

			// create XMLhttprequest
			if(window.XMLHttpRequest) {
				xmlhttp = new XMLHttpRequest();
			} else {
				xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
			}
			// setup data
			if(type.toLowerCase() === 'get') {
				for(key in data) {
					if(data.hasOwnProperty(key)) {
						convert.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
					}
				}
				if(convert.length > 0) {
					url += ('?' + (convert = convert.join('&')));
				}
			}
			// open
			xmlhttp.open(type, url, async);
			// 
			xmlhttp.onreadystatechange = function() {
				if(xmlhttp.readyState === 4) {
					if(xmlhttp.status >= 200 && xmlhttp.status < 300 || xmlhttp.status == 304) {
						if(success) {
							success(xmlhttp.responseText, xmlhttp.status);
						} else {
							promise.resolve(xmlhttp.responseText);
						}
					} else {
						if(error) {
							error(xmlhttp, xmlhttp.status);
						} else {
							promise.reject(xmlhttp);
						}
					}
				}
			};
			// send
			if(type.toLowerCase() === 'post') {
				xmlhttp.setRequestHeader('Content-type', contentType);
				xmlhttp.send(data);
			} else {
				xmlhttp.send();
			}
			// return promise
			return promise;
		},
		each: function(o, fn) {
			var i, len, key,
				fn = fn || function() {return false;};
			if(isArraylike(o)) {
				for(i = 0, len = o.length; i < len; i++) {
					if(fn.call(o, i, o[i]) === false) {
						break;
					}
				}
			} else if(zQuery.isPlainObject(o)) {
				i = 0;
				for(key in o) {
					if(fn.call(o, i, o[key]) === false) {
						break;
					}
					i++;
				}
			} else {
				zQuery.error('Failed to execute each: The provided params is invalid.');
			}
		},
		trim: function(str) {
			return zQuery.type(str) === 'string' ? str.replace(/^\s+|\s+$/g, '') : str;
		},
		type: function(o) {
			var oStr = Object.prototype.toString.call(o);
			return oStr.substring(8, oStr.length - 1).toLowerCase();
		},
		isArray: function(o) {
			return Array.isArray ? Array.isArray(o) : zQuery.type(o) === 'array'; 
		},
		isFunction: function(o) {
			return zQuery.type(o) === 'function';
		},
		isWindow: function(o) {
			return o !== null && o === window;
		},
		isPlainObject: function(o) {
			if(zQuery.type(o) !== 'object' || o.nodeType || zQuery.isWindow(o)) {
				return false;
			}
			try {
				if(o.constructor 
					&& !Object.prototype.hasOwnProperty.call(o.constructor.prototype, 'isPrototypeOf')) {
					return true;
				}
			} catch(e) {
				return false;
			}
			return true;
		},
		isEmptyObject: function(o) {
			var name;
			for(name in o) {
				return false;
			}
			return true;
		},
		error: function(msg) {
			throw new Error(msg);
		}
	});

	zQuery.each(['blur', 'change', 'click', 'dbclick', 'error', 'focus', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit', 'unload'], function(i, ele) {
		zQuery.fn[ele] = function(fn) {
			this.bind(ele, fn);
		}
	});

	if(typeof window === 'object' && typeof window.document === 'object') {
		window.zQuery = window.$ = zQuery;
	}
})(window);