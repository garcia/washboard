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
        });
    }

    Washboard.hide_all_menus = function() {
        $('#menus > ul').hide();
    }

    Washboard.show_menu = function(menu_id) {
        Washboard.hide_all_menus();
        $('#menu-' + menu_id).show();
        event.stopPropagation();
    }

}(window.Washboard = window.Washboard || {}, jQuery));
// Hide menu upon touching anywhere else

$(function() {
    $('body').on('touchstart', function(e) {
        if (!$(e.target).closest('#menus ul').length) {
            Washboard.hide_all_menus();
        }
    });
    $('body').on('click', Washboard.hide_all_menus);
});
