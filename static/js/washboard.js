(function(Washboard, $, undefined) {
    'use strict';

    Washboard.dismiss_alert = function(alert_id) {
        $.ajax({
            type: 'POST',
            url: '/seen',
            data: {
                'id': alert_id,
                'csrfmiddlewaretoken': csrf_token,
            },
            success: function(data, textStatus, jqXHR) {
                $('#alert-' + alert_id).fadeOut();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('NOW YOU FUCKED UP');
            },
        });
    }

}(window.Washboard = window.Washboard || {}, jQuery));
// Hide menu upon touching anywhere else

$(function() {
    $('body').on('touchstart', function(e) {
        if ($('.dropdown-open').length
                && !$(e.target).closest('.dropdown').length) {
            $('.dropdown').css('display', 'none');
        }
    });
});
