window.TACK = {};

var bindAllInputs = function() {
    $(':input[data-tack-val]').on('keydown keyup', function(e) {
        TACK[$(this).data('tack-val')] = $(e.target).val();
    });
};

TACK.init = function(options) {

    var settings = $.extend({
        debug: false,
        data: {}
    }, options); 

    TACK = $.extend(TACK, settings.data);

    for (var prop in settings.data)
    {
        // Use native or polly filled .watch
        TACK.watch(prop, function (key, oldval, newval) {
            
            if (settings.debug) {
                console.log(key + " changed from " + oldval + " to " + newval);
            }

            var newData = settings.data;
            newData[key] = newval;

            $('[data-tack-view]').trigger('tack-change', [newData]);

            return newval;
        });
    }

    bindAllInputs();
};
