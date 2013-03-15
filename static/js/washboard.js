$(function() {
    // Insert required information for jquery.dropdown.js
    $('#menu').addClass('dropdown').addClass('dropdown-tip');
    $('#menu ul').addClass('dropdown-menu');
    $('#menu').before('<a class="js" id="menu-link" data-dropdown="#menu">Menu</a>');

    // Hide menu upon touching anywhere else
    $('body').on('touchstart', function(e) {
        if ($('.dropdown-open').length
                && !$(e.target).closest('.dropdown').length) {
            $('.dropdown').css('display', 'none');
        }
    });
});
