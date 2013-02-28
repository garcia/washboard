function add_rule() {
    // Create a new table; otherwise we lose the <tr> elements
    var rule = $(document.createElement('table'));
    // Insert the default rules
    rule.append($('.defaults').closest('.rule').clone());
    console.log(rule.html());
    // Replace {prefix} with a random number
    rule.html(
        rule.html()
            .replace(/{prefix}/g, parseInt(Math.random() * 1000000000))
    );
    // Remove the "defaults" text
    rule.find('.defaults').remove();
    // Make the keyword input visible again
    rule.find('.keyword').removeAttr('style');
    // Insert the new row into the rules table
    $('#rules').find('tbody').append(rule.find('tbody').html());
}
