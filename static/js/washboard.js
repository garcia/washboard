$(function() {
    $('#menu').addClass('dropdown').addClass('dropdown-tip');
    $('#menu ul').addClass('dropdown-menu');
    $('#menu').before('<a href="#" id="menu-link" data-dropdown="#menu">Menu</a>');
});
