// Object watch polyfill from gist:
// https://gist.github.com/384583/

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;

			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}



var _w_ = {};

_w_.init = function(options) {

    var settings = $.extend({
        debug: false,
        global: null,
        data: {}
    }, options); 

    $views = $('body').find('[data-view]');

    _w_ = $.extend(_w_, settings.data);

    for (var prop in _w_)
    {
        // Use native or polly filled .watch
        _w_.watch(prop, function (key, oldval, newval) {
            $views.each(function() {
                //Todo: fire only the ones you need to from inspection?
                $(this).trigger('model-change', [key, oldval, newval]); 
            });
            return newval;
        });
    }

    $views
        .each(function() {
            if (typeof settings.global === 'function') { 
                settings.global($(this));
            }
        })
        .on('model-change', function(event, key, oldval, newval) {
            //Run view:
            window[$(this).data('view')]($(this));

            if (settings.debug) {
                console.log(key + " changed from " + oldval + " to " + newval);
            }

            if (settings.debug) {
                console.log('view: ' + $(this).data('view') + ' called');
            }
        });
};
