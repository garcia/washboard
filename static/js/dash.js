/******************
 * Notifications  *
 ******************/

function notify(message, type) {
    if (!$('#messages').length) {
        $('body').append('<ul id="messages" class="ajax-messages"></ul>');
    }
    if (!type) {
        type = 'error';
    }
    var message_id = (new Date()).getTime().toString();
    $('#messages').append(Handlebars.templates.message({
        message: message,
        type: type,
        touchscreen: touchscreen,
        id: message_id,
    }));
    $('#message_' + message_id).hide().fadeIn();
}

function dismiss(elem) {
    $(elem).fadeOut();
}

function error_message(jqXHR, doing) {
    var error_class = ~~(jqXHR.status / 100);
    var who = 'Tumblr';
    var status_code = jqXHR.real_status;

    if (error_class > 2) {
        who = 'Washboard';
        status_code = jqXHR.status;
    }

    what_happened = 'encountered an error (' + status_code + ') while ' + doing;
    if (status_code == 404) {
        what_happened = 'couldn\'t find the page you requested';
    }

    return who + ' ' + what_happened + '.';
}

/******************
 * Blacklisting   *
 ******************/

function special_entities(html) {
    return html
        .replace('&#160;', ' ')
        .replace('&#8217;', "'")
        .replace('&#8220;', '"')
        .replace('&#8221;', '"')
        .replace('&amp;', '&')
        .replace('&lt;', '<')
        .replace('&gt;', '>');
}

function kw_list(array) {
    if (!array || !array.length) {
        return "";
    }
    var clone = array.slice(0);
    return function build() {
        if (clone.length == 1) {
            return '<span class="keyword">' + clone[0] + '</span>';
        }
        if (clone.length == 2) {
            return '<span class="keyword">' + clone[0] + '</span> and <span class="keyword">' + clone[1] + '</span>';
        }
        return '<span class="keyword">' + clone.shift() + '</span>, <span class="keyword">' + build();
    }();
}

function plural(array) {
    return array.length == 1 ? '' : 's';
}

function is_blacklisted(post) {
    notification = {touchscreen: touchscreen};

    // Check if this post was specifically hidden
    for (var hp = 0; hp < Washboard.hidden_posts.length; hp++) {
        if ((post.reblogged_root_url || post.post_url) == Washboard.hidden_posts[hp].post) {
            if (Washboard.hidden_posts[hp].show_notification) {
                notification.text = 'You chose to hide this post.';
                return notification;
            }
            else {
                return true;
            }
        }
    }
    
    // Check blacklist / whitelist
    blacklist_keywords = [];
    whitelist_keywords = [];
    // 0 = show post; 1 = hide with notification; 2 = hide without notification
    blacklist_level = 0;
    whitelist = false;
    
    // Find elements to be scanned
    scan = [];
    $.each(scan_attributes, function(a, attribute) {
        if (post[attribute]) {
            scan.push(post[attribute]);
        }
    });
    // Add tags
    if (post.tags) {
        $.each(post.tags, function(t, tag) {
            scan.push('#' + tag);
        });
    }

    // Iterate over elements to be scanned
    $.each(scan, function(s, scan_element) {
        // Iterate over the user's rules
        $.each(Washboard.rules, function(r, rule) {
            var kw = rule.keyword;

            // Convert "whole words" to Regex patterns
            if (rule.whole_word) {
                kw = new RegExp(
                    // Match whitespace or start of line
                    '(?:^|\\W)'
                    // Escape metacharacters within the keyword
                    + kw.replace(/[-[\]{}()*+?.,\/\\^$|#\s]/g, "\\$&")
                    // Match whitespace or end of line
                    + '(?=\\W|$)', 'i'
                );
                rule.regex = true;
            }

            scanned = special_entities(scan_element);
            if ((rule.regex && scanned.search(kw) >= 0) ||
                (!rule.regex && scanned.toLowerCase().indexOf(kw.toLowerCase()) >= 0)) {
                
                // Blacklist
                if (rule.blacklist) {
                    // Hide with notification
                    if (rule.show_notification) {
                        blacklist_level = Math.max(blacklist_level, 1);
                    }
                    // Hide without notification
                    else {
                        blacklist_level = 2;
                    }
                    if (blacklist_keywords.indexOf(rule.keyword) == -1) {
                        blacklist_keywords.push(rule.keyword);
                    }
                }
                // Whitelist
                else {
                    whitelist = true;
                    if (whitelist_keywords.indexOf(rule.keyword) == -1) {
                        whitelist_keywords.push(rule.keyword);
                    }
                }
            }
        });
    });
    
    /* If both blacklisted and whitelisted keywords were matched: show the post
     * if none of the blacklisted keywords hid the notification. If at least
     * one blacklisted keyword hides the notification, don't show the post,
     * but do show the notification. */
    if (whitelist && blacklist_level) {
        blacklist_level--;
    }
    
    // Do not show the post or notification; return now
    if (blacklist_level == 2) {
        return true;
    }

    // Hide the post under a notification
    if (blacklist_level == 1) {

        // Construct notification text
        notification.text = 'This post contains the keyword' +
            plural(blacklist_keywords) + ' ' + kw_list(blacklist_keywords);
        if (whitelist_keywords.length) {
            notification.text += ', but also matched the whitelisted keyword'
                + plural(whitelist_keywords) + ' ' + kw_list(whitelist_keywords);
        }
        notification.text += '.';

        return notification;
    }
    
    // Not blacklisted
    return false;
}

/******************
 * Likes          *
 ******************/

function like(id) {
    // Determine whether to like or unlike the post
    endpoint = $('#post_' + id).find('.like').hasClass('liked') ? 'unlike' : 'like';

    // Assemble parameters
    parameters = {
        id: id,
        reblog_key: $('#post_' + id).data('reblog-key'),
    }
    
    // Send the API request
    apicall(endpoint, parameters, {
        success: function(data) {
            $('#post_' + id).find('.like').toggleClass('liked');
            save_session_attr('posts');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            notify(error_message(jqXHR, 'liking the post'), 'warning');
        },
    });
}

/******************
 * Notes          *
 ******************/

// TODO: separation of presentation from logic (no more .css()!)
function notes(id) {
    var notes = $('#post_' + id).find('.notes');
    // Open notes
    if (notes.css('display') != 'block') {
        // Calculate the height now so it can be reused later
        if (notes.data('height')) {
            var height = notes.data('height');
        }
        else {
            notes.css({
                'display': 'block',
                'position': 'absolute',
                'visibility': 'hidden',
                'margin-right': '20px',
            });
            var height = notes.height();
            notes.data('height', height);
            notes.removeAttr('style');
        }
        notes.css({
            'height': 0,
            // Account for margin 'skip' at start of animation
            'margin-bottom': '-20px',
            'display': 'block',
        });
        notes.animate({
                'height': height,
                'margin-bottom': 0,
            },
            600,
            function() {
                save_session_attr('posts');
            }
        );
    }
    // Close notes
    else {
        notes.animate({
            'height': 0,
            // Account for margin 'skip' at end of animation
            'margin-bottom': '-20px',
        }, {complete: function() {
            notes.css('display', 'none');
            save_session_attr('posts');
        }});
    }
}


/******************
 * Reblogs        *
 ******************/

function reblog(id) {
    // Create reblog box if it doesn't exist yet
    if (!$('#reblog_' + id).length) {
        var this_post = $('#post_' + id);
        
        this_post.after(Handlebars.templates.reblog({
            id: id,
            username: Washboard.username,
        }));
        
        // Insert blog menu
        $('#dropdowns').append(Handlebars.templates.chooseblog({
            id: id,
            blogs: Washboard.blogs,
        }));
    }

    // Locate reblog box
    var reblog_box = $('#reblog_' + id);
    
    // Open if closed
    if (reblog_box.hasClass('closed')) {
        // Close any other action boxes that are open
        $('.action-box').addClass('closed');

        // Calculate box's height for animations
        if (!reblog_box.attr('style')) {
            reblog_box.addClass('get-height').removeClass('closed');
            reblog_box.css('height', reblog_box.height());
            reblog_box.addClass('closed').removeClass('get-height');
        }
        reblog_box.removeClass('closed');
    }
    // Close if opened
    else {
        reblog_box.addClass('closed');
    }
    save_session_attr('posts');
}

function submit_reblog(id, reblog_text) {
    var this_post = $('#post_' + id);
    var reblog_box = $('#reblog_' + id);
    data = {
        id: id,
        type: this_post.data('type'),
        reblog_key: this_post.data('reblog-key'),
        comment: reblog_box.find('.caption').val(),
        tags: reblog_box.find('.tags').val(),
        blog: reblog_box.find('.chooseblog').text(),
    };

    apicall('reblog', data, {
        success: function(data) {
            var reblog_elem = $('#reblog_' + id);
            reblog_elem.addClass('closed');
            reblog_elem.find('input[type!=submit]').val('');
            reblog_elem.find('textarea').val('');
            $('#post_' + id).find('.buttons .reblog').addClass('done');
            save_session_attr('posts');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            notify(error_message(jqXHR, 'reblogging the post'), 'warning');
        },
    });
}

/******************
 * Replying       *
 ******************/

function reply(id) {
    // Create reply box if it doesn't exist yet
    if (!$('#reply_' + id).length) {
        var this_post = $('#post_' + id);
        
        this_post.after(Handlebars.templates.reply({
            id: id,
            rebloggable: !$('#post_' + id).hasClass('answer'),
        }));
    }

    // Locate reply box
    var reply_box = $('#reply_' + id);
    
    // Open if closed
    if (reply_box.hasClass('closed')) {
        // Close any other action boxes that are open
        $('.action-box').addClass('closed');

        // Calculate box's height for animations
        if (!reply_box.attr('style')) {
            reply_box.addClass('get-height').removeClass('closed');
            reply_box.css('height', reply_box.height());
            reply_box.addClass('closed').removeClass('get-height');
        }
        reply_box.removeClass('closed');
        setTimeout(function() { 
            reply_box.find('.reply').click().focus();
        }, 200);
    }
    // Close if opened
    else {
        reply_box.addClass('closed');
    }
    save_session_attr('posts');
}

function reply_keypress(id, e) {
    if ((e.which || e.keyCode || e.charCode) == 13) {
        if (e.target.value.length) {
            submit_reply(id, e.target.value);
        }
    }
}

function submit_reply(id, reply_text) {
    data = {
        post_id: id,
        reblog_key: $('#post_' + id).data('reblog-key'),
        reply_text: $('#reply_' + id).find('.reply').val(),
    };
    apicall('reply', data, {
        success: function(data) {
            $('#reply_' + id)
                .addClass('closed')
                .find('.reply')
                .val('');
            $('#post_' + id).find('.buttons .reply').addClass('done');
            save_session_attr('posts');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            notify(error_message(jqXHR, 'replying to the post'), 'warning');
        },
    });
}

/******************
 * Hiding posts   *
 ******************/

function hide(id, hide_url) {
    $.ajax('/hide', {
        data: {
            post: hide_url,
            csrfmiddlewaretoken: csrf_token
        },
        dataType: 'json',
        type: 'POST'
    }).success(function(data) {
        if (data.meta.status != 200) {
            alert(data.meta.msg);
        }
    }).fail(function() {
        alert('The server was unable to hide the post permanently, sorry.');
    }).always(function() {
        $('#post_' + id).fadeOut(400, function() {
            save_session_attr('posts');
        });
    });
}

/******************
 * Unhiding posts *
 ******************/

function touchstart(e) {
    // Don't re-allow selection if we've already received another tap
    clearTimeout(allow_selection);
    
    // Disallow selection
    $('body').attr('style', '-webkit-user-select: none; -webkit-touch-callout: none');

    // Unhide after 1 second
    unhiding = setTimeout(function() {
        var prog = $(e.currentTarget).find('.progress');
        prog.stop()
            .css('opacity', .25)
            .animate(
                {width: '100%'},
                1000,
                function() {
                    unhide(e.currentTarget);
                    // Re-allow selection
                    $('body').removeAttr('style');
                    // Remove touch handlers
                    $(e.currentTarget).off('touchstart').off('touchend');
                }
            );
    }, 50);
}

function touchend(e) {
    // Re-allow selection after 300ms; without the delay,
    // iOS will try to select the progress slider immediately upon touchend
    allow_selection = setTimeout(function() {
        $('body').removeAttr('style');
    }, 300);

    // Stop unhiding the post
    clearTimeout(unhiding);
    var prog = $(e.currentTarget).find('.progress');
    prog.stop()
        .animate(
            {opacity: 0},
            200,
            function() {
                $(this).css('opacity', 0).css('width', 0);
            }
        );
}

function unhide(a) {
    var post = $(a).closest('.post');

    // Fade out notification to white
    post.children().animate(
        {opacity: 0},
        500,
        function() {
            // Fade in post from white
            post.removeClass('blacklisted');
            post.children().css('opacity', 0).animate(
                {opacity: 1},
                600,
                // Remove the opacity declaration after animation
                function() {
                    post.children().css('opacity', '');
                    post.children().each(function(c, child) {
                        $(child).attr('style') || $(child).removeAttr('style')
                    });
                    save_session_attr('posts');
                });
        }
    );
}

/******************
 * Miscellaneous  *
 ******************/

function toggle_album_art(id) {
    var this_post = $('#post_' + id);
    this_post.find('.album_art').toggleClass('expanded');
    save_session_attr('posts');
}

function chooseblog(id, blog) {
    $('#reblog_' + id).find('.chooseblog').text(blog);
}


/******************
 * Read-mores     *
 ******************/

function read_more(postelem) {
    postelem.find('p').contents().filter(function() {
        // Select comment nodes
        return this.nodeType == 8;
    }).each(function(i, e) {
        
        // Check contents of comment
        if (e.nodeValue == ' more ') {

            // Replace comment with "Read more" link
            var more_link = $(document.createElement('a'))
                    .html('Read more &rarr;')
                    .addClass('read_more js')
                    .on('click', function(e) {
                        $(this).closest('.post').find('.cut.under').removeClass('under').addClass('over');
                        $(this).remove();
                    });
            $(e).replaceWith(more_link);

            // Hide anything that appears after the comment but within
            // the same paragraph by iterating over sibling nodes
            var parent_node = more_link.get(0).parentNode;
            var sibling = more_link.get(0).nextSibling;
            while (sibling) {
                // Add appropriate classes to element nodes
                if (sibling.nodeType == 1) {
                    $(sibling).addClass('cut under');
                }
                // Wrap text nodes in <span class="cut under">...</span>
                else if (sibling.nodeType == 3) {
                    var span = $(document.createElement('span'))
                        .text(sibling.nodeValue)
                        .addClass('cut under')
                        .get(0);
                    parent_node.replaceChild(span, sibling);
                    sibling = span;
                }
                // Unknown node type
                else {
                    console.log("Unable to hide nodeType " + sibling.nodeType);
                    console.log(sibling);
                }
                sibling = sibling.nextSibling;
            }

            // Hide everything else
            more_link.parent().nextAll().addClass('cut under')
        }
    }); 
    save_session_attr('posts');
}

/******************
 * Photo(set)s    *
 ******************/

function best_fit(elements, target_width) {
    var best = 0;
    var best_width = 0;
    $.each(elements, function(i, item) {
        if ((item.width < target_width && item.width > best_width) ||
            // ^ Too small, but bigger than the next best option
            (item.width >= target_width &&
                (best_width < target_width || item.width < best_width))) {
            // ^ Big enough, but not excessive
            best = i;
            best_width = item.width;
        }
    });
    return elements[best];
}

function expand(id) {
    var this_post = $('#post_' + id);
    this_post.find('.photos').animate(
        {opacity: 0},
        600,
        function() {
            this_post.find('.photos').css('display', 'none');
            this_post.addClass('hr')
                .css('max-width', Math.max(540, Session.hr_widths[id]))
                .find('.hr_photos')
                .css('display', 'block')
                .css('opacity', 0)
                .animate(
                    {opacity: 1},
                    600,
                    function() {
                        save_session_attr('posts');
                    }
                )
                .find('img')
                .each(function(i, img) {
                    $(img).attr('src', $(img).attr('hr-src'));
                }
            );
            $('body').animate(
                {scrollTop: this_post.offset().top - 5},
                200
            );
        }
    );
}

function collapse(id) {
    var this_post = $('#post_' + id);
    this_post.find('.hr_photos').animate(
        {opacity: 0},
        600,
        function() {
            this_post.find('.hr_photos').css('display', 'none');
            this_post.removeClass('hr')
                .css('max-width', 'none')
                .find('.photos')
                .css('display', 'block')
                .css('opacity', 0)
                .animate(
                    {opacity: 1},
                    600,
                    function() {
                        save_session_attr('posts');
                    }
                );
            $('body').animate(
                {scrollTop: this_post.offset().top - 5},
                200
            );
        }
    );
}

function photoset(post, context) {
    // Assemble photoset
    if (post.type == 'photo') {

        // Get photoset layout, or a pseudo-layout for a single image
        if (post.photoset_layout) {
            layout = post.photoset_layout;
        }
        else {
            layout = '1';
        }

        var rows = [];
        var row = {height: 700, count: layout[0], photos: []};
        var last_row = 0;

        // Get the widest photo's width: when showing HR photos, don't make the
        // post any wider than it needs to be
        var largest_width = 0;
        $.each(post.photos, function(ph, photo) {
            largest_width = Math.max(largest_width, best_fit(photo.alt_sizes, 1280).width);
        });
        Session.hr_widths[post.id] = largest_width;

        // Insert each photo
        $.each(post.photos, function(ph, photo) {

            // Determine which row this photo belongs to
            var running_total = 0;
            var running_row = 0;
            while (running_total <= ph) {
                running_total += parseInt(layout[running_row]);
                running_row++;
            }
            running_row--;

            // If it's the first photo of a new row, push the previous row and
            // start a new one
            if (running_row > last_row) {
                rows.push(row);
                // TODO: duplicated default row
                row = {height: 700, count: layout[running_row], photos: []};
            }
            last_row = running_row;

            // Determine optimal photo sizes to load
            var target_size = optimal_sizes[layout[running_row]];
            var best_photo = best_fit(photo.alt_sizes, target_size);
            var hr_photo = best_fit(photo.alt_sizes, window.innerWidth);
            
            // Recalculate row height
            row.height = Math.min(row.height,
                optimal_sizes[layout[running_row]] / best_photo.width * best_photo.height,
                (window.innerWidth - 40) / best_photo.width * best_photo.height)
            row.photos.push({url: best_photo.url, hr_url: hr_photo.url})
        });
        rows.push(row);
        context.rows = rows;
    }
}

/******************
 * Post compiling *
 ******************/

function compile(post) {
    // Save the current last post ID or timestamp
    if (!Session.featured_tag && 'featured_timestamp' in post) {
        Session.featured_tag = true;
    }
    if (Washboard.well_ordered) {
        Session.last_post = post.id;
    }
    else if (Session.featured_tag) {
        Session.last_post = post.featured_timestamp;
    }
    else {
        Session.last_post = post.timestamp;
    }
    
    // Fix date for timeago()
    post.date = post.date.replace(' ', 'T').replace(' GMT', 'Z');
    
    // Initial context
    context = {
        post: post,
        dashboard: 'http://www.tumblr.com/dashboard/10/' + (post.id + 1),
        mine: Washboard.blogs.indexOf(post.blog_name) >= 0,
        hide_url: post.reblogged_root_url || post.post_url,
        rebloggable: true,
    };

    // Create photoset layout
    if (post.type == 'photo') {
        photoset(post, context);
    }

    // If the quote is plain text, wrap it in a paragraph tag
    if (post.type == 'quote') {
        if (post.text.indexOf('<') == -1) {
            post.text = '<p>' + post.text + '</p>';
        }
    }

    // Find best video size
    if (post.type == 'video') {
        context.best_player = best_fit(post.player, Math.min(500, window.innerWidth)).embed_code;
    }

    if (post.type == 'answer') {
        // Determine asker's avatar for answer posts
        context.asking_avatar = (post.asking_name == 'Anonymous') ?
            'http://assets.tumblr.com/images/anonymous_avatar_24.gif' :
            ('http://api.tumblr.com/v2/blog/' + post.asking_name + '.tumblr.com/avatar/24');
        // Don't show reblog button
        context.rebloggable = false;
    }

    // Assemble tags with URL-safe counterparts
    context.tags = []
    if (post.featured_in_tag) {
        $.each(post.featured_in_tag, function(t, tag) {
            context.tags.push({
                tag: tag,
                safe_tag: encodeURIComponent(tag),
                featured: true,
            });
        });
    }
    $.each(post.tags, function(t, tag) {
        context.tags.push({
            tag: tag,
            safe_tag: encodeURIComponent(tag),
            featured: false,
        });
    });

    // Render post to HTML
    context.inner_html = Handlebars.templates[post.type](context);
    return Handlebars.templates.post(context);
}

function dash(data, textStatus, jqXHR) {
    // Global variable for debugging purposes
    d = data;
    
    // Some methods return posts in data.response.posts,
    // others in data.response
    if ('posts' in data.response) {
        post_list = data.response.posts;
    }
    else {
        post_list = data.response;
    }

    // Remove 'empty' box if present
    $('#posts .empty').remove();

    // Build posts
    $.each(post_list, function(p, post) {
        var blacklisted = is_blacklisted(post);
        
        // Blacklisted with no notification: skip immediately
        if (blacklisted == true) {
            return true;
        }

        // Make sure this post isn't a duplicate
        if ($('#post_' + post.id).length) {
            return;
        }

        // Compile the post's HTML
        var post_elem = $($.parseHTML(compile(post)));
        
        // Add notification if necessary
        if (blacklisted) {
            post_elem.append(Handlebars.templates.notification(blacklisted));
            post_elem.addClass('blacklisted');
            
            // Add listeners for touchscreens
            if (touchscreen) {
                post_elem.on('touchstart', touchstart);
                post_elem.on('touchend', touchend);
            }
            // Default to a simple click listener
            else {
                post_elem.on('click', unhide);
            }
        }

        // Parse read-more breaks
        read_more(post_elem);
        
        // Add to the page
        $('#posts').append(post_elem);
        
        // Insert info menu
        $('#dropdowns').append(Handlebars.templates.info(context));
        $('#info_' + post.id).find('.timeago').timeago();
    });

    // Reset "Load more" footer
    done_loading(load_more_string);

    // Convert new audio elements to MediaElement players
    // This has to be done after they've been inserted into the document
    $('audio.new').mediaelementplayer({
        audioWidth: '100%',
        audioHeight: 30,
        startVolume: 0.8,
        loop: false,
        enableAutosize: true,
        features: ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume'],
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false
    });
    $('audio.new').removeClass('new');

    // Save posts and Session
    save_session_attr('posts');
    save_session_attr('Session');
}

/******************
 * API AJAX calls *
 ******************/

function apicall(endpoint, data, ajaxdata) {
    parse_hash();

    var _data = $.extend(data, {
        csrfmiddlewaretoken: csrf_token,
        endpoint: endpoint,
    });
    _data = $.extend(Washboard.parameters, _data);
    var _ajaxdata = $.extend(ajaxdata, {
        type: 'POST',
        url: '/api',
        data: _data,
        dataType: 'json',
    });
    console.log(_ajaxdata);
    
    /* Convert Tumblr errors (which look successful) to HTTP errors */
    var success = ajaxdata.success || function() {};
    _ajaxdata.success = function(data, textStatus, jqXHR) {
        try {
            // Returned if error_type = js
            if (data.meta.status == 999) {
                raise.an.error;
            }
            // Tumblr error, or error_type = tumblr
            if (data.meta.status >= 400) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(data);
                jqXHR.real_status = data.meta.status;
                return ajaxdata.error(jqXHR, textStatus);
            }
            // Success
            else {
                return success(data, textStatus, jqXHR);
            }
        }
        // Print the whole stack before calling window.onerror
        catch (e) {
            console.log(e.stack);
            if (hash.debug) {
                notify(e.stack.replace(/\n/g, '<br />'));
            }
            throw e;
        }
    }
    $.ajax(_ajaxdata);
}

function dashboard(data) {
    var _data = $.extend({
        reblog_info: 'true',
        notes_info: 'true'
    }, data);
    apicall(Washboard.endpoint, _data, {
        success: dash,
        error: function(jqXHR, textStatus, errorThrown) {
            var message = error_message(jqXHR, 'loading your posts')
            var retry_message = (touchscreen ? 'Tap' : 'Click') + ' to retry.';
            if ($('#posts').is(':empty')) {
                $('#posts').append(Handlebars.templates.empty({message: message}));
                done_loading(retry_message);
            }
            else {
                done_loading(message + ' ' + retry_message);
            }
        },
    });
}

/******************
 * Load more      *
 ******************/

function load_more() {
    var data = {};
    if (Washboard.pagination_key == 'offset') {
        data['offset'] = $('#posts .post').length + Session.offset;
    }
    else {
        data[Washboard.pagination_key] = Session.last_post;
    }
    dashboard(data);
    $('#load_more').text('Loading...');
    $('#load_more').addClass('loading');
}

function done_loading(message) {
    var load_more = $('#load_more');
    load_more.text(message);
    load_more.removeClass('loading');
    if (!Washboard.profile.infinite_scrolling) {
        load_more.removeAttr('onclick');
        var page = (Washboard.pagination_key == 'offset' ? (Session.offset + 20) : Session.last_post);
        load_more.attr('href', location.pathname + '?' + Washboard.pagination_key + '=' + page);
    }
}

/******************
 * Inf. scrolling *
 ******************/

function scroll_handler(e) {
    if (document.body.scrollTop + window.innerHeight * 2 > document.height) {
        if (!$('#load_more').hasClass('loading')) {
            console.log("Infinite scrolling invoked");
            load_more();
        }
    }
}

/******************
 * Sessions       *
 ******************/

function init_session() {
    parse_hash();

    // Load session, if present
    if (hash.session) {
        var session_data = {};
        for (attr in session_attributes) {
            session_data[attr] = localStorage.getItem(hash.session + '_' + attr);
            if (!session_data[attr]) {
                hash.session = null;
                break;
            }
        }
    }

    // If everything was successfully loaded from localStorage, set the values
    if (hash.session) {
        for (attr in session_attributes) {
            session_attributes[attr].set(session_data[attr]);
        }
    }
    // Otherwise, start a new session and load the first page of the dashboard
    else {
        session = (new Date()).getTime().toString();
        hash.session = session;
        save_hash();

        // Record this session
        var sessions = [];
        if (localStorage.getItem('sessions')) {
            sessions = JSON.parse(localStorage.getItem('sessions'));
        }
        sessions.push(session);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        load_more();
    }

    // Clean up outdated sessions
    if (localStorage.getItem('sessions')) {
        var sessions = JSON.parse(localStorage.getItem('sessions'));
        var time = new Date().getTime();
        for (var s in sessions) {
            // Expire sessions after 1 hour
            if (time - sessions[s] > 3600000) {
                console.log('Removing outdated session ' + sessions[s]);
                for (attr in session_attributes) {
                    localStorage.removeItem(hash.session + '_' + attr);
                }
                sessions.splice(s, 1);
            }
        }
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }
    
    save_position = setInterval(
        function() {
            save_session_attr('position');
        },
        5 * 1000
    );
}

function save_session_attr(attr) {
    if (!Washboard.profile.sessions) {
        return;
    }
    try {
        localStorage.setItem(hash.session + '_' + attr, session_attributes[attr].get());
    }
    catch (err) {
        console.log('Ran out of localStorage quota. Clearing...');
        if (err.name.toLowerCase().indexOf('quota') > -1) {
            localStorage.clear();
            localStorage.setItem('sessions', JSON.stringify([session]));
        }
    }
}

/******************
 * URL parsing    *
 ******************/

function parse_hash() {
    hash = URI('?' + location.hash.slice(1)).query(true);
    if (hash.throw_error) {
        Washboard.parameters.throw_error = hash.throw_error;
        Washboard.parameters.error_type = hash.error_type;
    }
    else {
        delete Washboard.parameters.throw_error;
        delete Washboard.parameters.error_type;
    }
}

function save_hash() {
    location.hash = URI.buildQuery(hash);
}

/******************
 * Debugging      *
 ******************/

function error_handler(msg, url, line) {
    try {
        console.log({msg: msg, url: url, line: line});
        if ($('#load_more').hasClass('loading')) {
            done_loading((touchscreen ? 'Tap' : 'Click') + ' to retry.');
        }
        if (hash.debug) {
            notify('Debug info:<br/>' + msg + '<br/>' + url + '<br/>' + line);
        }
        notify('Whoops! Washboard just broke. Please <a href="mailto:admin@washboard.ws">contact us</a> if this keeps happening.', 'error');
    }
    // Prevent infinite looping
    catch (e) {
        console.log(e.stack);
        alert('Whoops! Washboard just broke. Please contact us at admin@washboard.ws if this keeps happening.');
    }
}

/******************
 * Initialization *
 ******************/

$(function() {
    Session = {
        hr_widths: {},
        last_post: null,
        featured_tag: false,
        offset: 0,
    };
    
    scan_attributes = ['reblogged_from_name', 'title', 'body', 'caption',
        'text', 'source', 'url', 'description', 'label', 'phrase',
        'asking_name', 'question', 'answer', 'source_url'];
    session_attributes = {
        'Session': {
            'get': function() {
                return JSON.stringify(Session);
            },
            'set': function(data) {
                Session = JSON.parse(data);
            },
        },
        'posts': {
            'get': function() {
                return $('#middle > div')[0].innerHTML.replace(/[\s\n\r]+/g, ' ');
            },
            'set': function(data) {
                $('#middle > div')[0].innerHTML = data;
                done_loading(load_more_string);
            },
        },
        'position': {
            'get': function() {
                return $('body').scrollTop();
            },
            'set': function(data) {
                $('body').scrollTop(data);
            },
        },
    };

    allow_selection = -1;
    unhiding = -1;
    hash = {};
    load_more_string = 'Next page';
    window.onerror = error_handler;
    if (Washboard.profile.infinite_scrolling) {
        window.onscroll = scroll_handler;
        load_more_string = 'Load more';
    }
    scale = Math.min(500, window.innerWidth) / 500;
    optimal_sizes = {'1': 500 * scale, '2': 245 * scale, '3': 160 * scale};
    touchscreen = 'ontouchstart' in window;

    query = URI(location.search).query(true);
    if (query.offset) {
        Session.offset = query.offset;
    }
    if (query[Washboard.pagination_key]) {
        Session.last_post = query[Washboard.pagination_key];
    }

    if (Washboard.profile.sessions) {
        init_session();
    }
    else {
        load_more();
    }
});
