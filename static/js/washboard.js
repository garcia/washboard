$(function() {
    $('#menu').addClass('dropdown').addClass('dropdown-tip');
    $('#menu ul').addClass('dropdown-menu');
    $('#menu').before('<a class="js" id="menu-link" data-dropdown="#menu">Menu</a>');
});
