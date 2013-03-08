function add_rule() {
    // Insert the default rules
    rule = $('.row.defaults').clone().removeClass('defaults').addClass('rule');
    // Replace {prefix} with a random number
    rule.html(
        rule.html()
            .replace(/{prefix}/g, parseInt(Math.random() * 1000000000))
    );
    // Remove the "defaults" label
    rule.find('.label').remove();
    // Make the keyword input visible again
    rule.find('.keyword').removeAttr('style');
    rule.find('.delete').removeAttr('style');
    // Insert the new row into the rules table
    rule.insertBefore($('.row.add'));
    rule.find('.keyword input').focus().keypress(keyword_keypress);
    rule.find('input[type=checkbox]').click(checkbox_click);
}

function keyword_keypress(e) {
    if ((e.which || e.keyCode || e.charCode) == 13) {
        add_rule();
        return false;
    }
}

function checkbox_click(e) {
    console.log(e);
    if (e.shiftKey) {
        if ($(this).closest('.row').hasClass('defaults')) {
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

function delete_rule(e) {
    $(e).closest('.rule').remove();
    console.log($('#rules').children('.rule').length);
    if (!$('#rules').children('.rule').length) {
        add_rule();
    }
}

$(function() {
    $('.keyword input').keypress(keyword_keypress);
    $('input[type=checkbox]').click(checkbox_click);
});
