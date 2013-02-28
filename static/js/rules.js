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
}

function keyword_keypress(e) {
    console.log('beep');
    if (e.which == 13) {
        console.log('boop');
        add_rule();
    }
}

$(function() {
    $('.keyword input').keypress(keyword_keypress);
});
