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
// End Polyfill--------------------------------------------

var $w = {};

$w.init = function(options) {

    var settings = $.extend({
        debug: false,
        globalSetup: null,
        renderings: [],
        data: {}
    }, options); 

    $w = $.extend($w, settings.data);

    $('body').find('[data-view]')
        .each(function() {
            var $this = $(this);
            var $view = $this.data('view');

            if (typeof settings.globalSetup === 'function') { 
                if (settings.debug) {
                    alert($view +': globalSetup run');
                }
                settings.globalSetup($this);
            }

            if (settings.debug) {
                alert($view +': initial run');
            }
            settings.renderings[$view]($w, $this);
        })

    var renderingDependencies = {};

    for (var prop in settings.data)
    {
        // Automatically detect dependencies:
        for (var rendering in settings.renderings) {
            var dependencies = [];
            if (settings.renderings[rendering].toString().indexOf('$w.' + prop) > -1) {
                dependencies.push(prop);
            }

            if (renderingDependencies[rendering])
                $.merge(renderingDependencies[rendering], dependencies);
            else
                renderingDependencies[rendering] = dependencies;
        }

        // Use native or polly filled .watch
        $w.watch(prop, function (key, oldval, newval) {
            
            if (settings.debug) {
                console.log(key + " changed from " + oldval + " to " + newval);
            }

            for (var viewName in settings.renderings)
            {
                var w = $.extend({}, $w);
                w[key] = newval;

                // check if rendering needs to be fired
                if ($.inArray(key, renderingDependencies[viewName]) > -1) { 
                    // Run rendering: 
                    settings.renderings[viewName](w, $('[data-view=' + viewName + ']'));

                    if (settings.debug) {
                        console.log('rendering: ' + viewName + ' called');
                    }
                }
            }

            return newval;
        });
    }
};
