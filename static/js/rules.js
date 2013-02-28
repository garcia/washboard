function add_rule() {
    // Insert the default rules
    rule = $('.rule.defaults').clone().removeClass('defaults');
    // Replace {prefix} with a random number
    rule.html(
        rule.html()
            .replace(/{prefix}/g, parseInt(Math.random() * 1000000000))
    );
    // Remove the "defaults" label
    rule.find('.label').remove();
    // Make the keyword input visible again
    rule.find('.keyword').removeAttr('style');
    // Insert the new row into the rules table
    rule.insertBefore($('.rule.add'));
    rule.find('.keyword input').focus().keypress(keyword_keypress);
    rule.find('input[type=checkbox]').click(checkbox_click);
}

function keyword_keypress(e) {
    if (e.which == 13) {
        add_rule();
    }
}

function checkbox_click(e) {
    console.log(e);
    if (e.shiftKey) {
        if ($(this).closest('.rule').hasClass('defaults')) {
            $('.' + $(this).closest('div').attr('class'))
                .find('input[type=checkbox]')
                .prop('checked', this.checked);
        }
        /* I'm not sure if I like this idea or not...
        else {
            $(this).closest('.rule')
                .find('input[type=checkbox]')
                .prop('checked', this.checked);
        }
        */
    }
}

$(function() {
    $('.keyword input').keypress(keyword_keypress);
    $('input[type=checkbox]').click(checkbox_click);
});
