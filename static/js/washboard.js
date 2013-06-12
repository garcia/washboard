// Hide menu upon touching anywhere else
$('body').on('touchstart', function(e) {
    if ($('.dropdown-open').length
            && !$(e.target).closest('.dropdown').length) {
        $('.dropdown').css('display', 'none');
    }
});
