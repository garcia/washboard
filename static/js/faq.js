(function(Washboard, $, undefined) {
    'use strict';

    function hashchange() {
        var section = $(location.hash);
        if (section.length) {
            section.find('h3').click();
        }
    }

    Washboard.faq = function() {
        $('#faq li ul:not(:first)').hide();
        $('#faq li h3')
            .css('cursor', 'pointer')
            .click(function(e) {
                $(e.currentTarget).closest('li').find('ul').slideToggle();
            });
        window.onhashchange = hashchange;
        hashchange();
    };

}(window.Washboard = window.Washboard || {}, jQuery));

$(Washboard.faq);
