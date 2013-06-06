function add_rule(src) {
    // Set the prefix to the largest prefix + 1
    var prefix = Array.max($('.row.rule').map(function() {
        p = $(this).data('prefix');
        if (typeof(p) == 'string' && p.indexOf('-') >= 0) {
            p = p.slice(p.indexOf('-') + 1);
        }
        return p;
    }).get()) + 1 || 0;
    // Insert the default rules
    var rule = $(src).closest('.ruleset').find('.row.defaults')
        .clone()
        .removeClass('defaults')
        .addClass('rule')
        .attr('data-prefix', prefix);

    // Replace {prefix} with the subsequential number
    rule.html(
        rule.html()
            .replace(/{prefix}/g, prefix)
    );

    // Remove the "defaults" label
    rule.find('.label').remove();

    // Make the keyword input visible again
    rule.find('.keyword').removeAttr('style');
    rule.find('.post').removeAttr('style');
    rule.find('.delete').removeAttr('style');

    // Insert the new row into the rules table
    rule.insertBefore($(src).closest('.ruleset').find('.row.add'));
    rule.find('.keyword input').focus().keypress(keyword_keypress);
    rule.find('input[type=checkbox]').click(checkbox_click);
}

function keyword_keypress(e) {
    if ((e.which || e.keyCode || e.charCode) == 13) {
        add_rule(e.target);
        return false;
    }
}

function checkbox_click(e) {
    if (e.shiftKey) {
        if ($(this).closest('.row').hasClass('defaults')) {
            $('.' + $(this).closest('div').attr('class'))
                .find('input[type=checkbox]')
                .prop('checked', this.checked);
        }
    }
}

function check_no_rules(ruleset) {
    if (!ruleset.children('.rule').length) {
        add_rule(ruleset);
    }
}

function delete_rule(e) {
    var ruleset = $(e).closest('.ruleset');
    $(e).closest('.rule').remove();
    check_no_rules(ruleset);
}

$(function() {
    $('.keyword input').keypress(keyword_keypress);
    $('input[type=checkbox]').click(checkbox_click);
    
    Array.max = function(array) {
        result = Math.max.apply( Math, array );
        return (result < 0) ? -1 : result;
    };

    $('.ruleset').each(function(r, ruleset) { check_no_rules($(ruleset)); });
    $('input').blur();
});
