(function(Washboard, $, undefined) {
    'use strict';

    /******************
     * Properties     *
     ******************/

    var session = {
            hr_widths: {},
            last_post: null,
            featured_tag: false,
            offset: 0,
        };
    var scan_attributes = ['blog_name', 'reblogged_from_name',
            'title', 'body', 'caption', 'text', 'source', 'url', 'description',
            'label', 'phrase', 'asking_name', 'question', 'answer', 'source_url'];
    var session_attributes = {
            'session': {
                'get': function() {
                    return JSON.stringify(session);
                },
                'set': function(data) {
                    session = JSON.parse(data);
                },
            },
            'posts': {
                'get': function() {
                    return $('#middle > div')[0].innerHTML.replace(/[\s\n\r]+/g, ' ');
                },
                'set': function(data) {
                    $('#middle > div')[0].innerHTML = data;
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
    var states = [
            {'state': 'published', 'name': 'Publish'},
            {'state': 'draft', 'name': 'Save as draft'},
            {'state': 'queue', 'name': 'Add to queue'},
            // {'state': 'private', 'name': 'Private post'}, // doesn't seem to be working?
        ];
    var allow_selection = -1;
    var unhiding = -1;
    var hash = {};
    var load_more_string = 'Next page';
    var scale = Math.min(500, window.innerWidth) / 500;
    var optimal_sizes = {'1': 500 * scale, '2': 245 * scale, '3': 160 * scale};
    var touchscreen = window.ontouchstart !== undefined;
    var retry_message = (touchscreen ? 'Tap' : 'Click') + ' to retry.';
    var err = {};
    var bad_session = false;
    var post_top_padding = 5;

    /******************
     * Notifications  *
     ******************/

    function notify(message, type) {
        if (!$('#ajax-messages').length) {
            $('body').append('<ul id="ajax-messages" class="messages"></ul>');
        }
        if (!type) {
            type = 'error';
        }
        var message_id = (new Date()).getTime().toString();
        $('#ajax-messages').append(Handlebars.templates.message({
            message: message,
            type: type,
            touchscreen: touchscreen,
            id: message_id,
        }));
        $('#message_' + message_id).hide().fadeIn();
    }

    Washboard.dismiss = function(elem) {
        $(elem).fadeOut();
    };

    function error_message(jqXHR, doing) {
        var error_class = Math.floor(jqXHR.status / 100);
        var status_code = jqXHR.real_status || jqXHR.status;
        var who = 'Tumblr';

        try {
            status_code += ': ' + JSON.parse(jqXHR.responseText).meta.msg;
        }
        catch (e) {}

        var what_happened = 'encountered an error (' + status_code + ') while ' + doing;

        if (error_class > 2) {
            who = 'Washboard';
            status_code = jqXHR.status;
        }
        if (status_code === 404) {
            what_happened = 'couldn\'t find the page you requested';
        }

        return who + ' ' + what_happened + '.';
    }
    
    (Washboard.wrap_all = function(obj) {
        $.each(obj, function(name, prop) {
            if (typeof prop === 'function' && prop.wrapped === undefined) {
                (obj[name] = function() {
                    try {
                        prop.apply(this, arguments);
                    }
                    catch (e) {
                        if (e.stack !== undefined) {
                            Washboard.stack = e.stack;
                        }
                        throw e;
                    }
                }).wrapped = true;
            }
        });
    }).wrapped = true;

    /******************
     * Hash parsing   *
     ******************/

    function parse_hash() {
        hash = URI('?' + location.hash.slice(1)).query(true);
        if (hash.throw_error) {
            Washboard.parameters.throw_error = hash.throw_error;
            Washboard.parameters.error_type = hash.error_type;
        } else {
            delete Washboard.parameters.throw_error;
            delete Washboard.parameters.error_type;
        }
    }

    function save_hash() {
        location.hash = URI.buildQuery(hash);
    }

    /******************
     * API AJAX calls *
     ******************/

    function apicall(endpoint, data, ajaxdata) {
        parse_hash();
        var success = ajaxdata.success;

        data = $.extend(Washboard.parameters, data, {
            csrfmiddlewaretoken: csrf_token,
            endpoint: endpoint,
        });
        ajaxdata = $.extend({
            type: 'POST',
            url: '/api',
            data: data,
            dataType: 'json',
        }, ajaxdata);
        console.log(ajaxdata);

        /* Convert Tumblr errors (which look successful) to HTTP errors */
        ajaxdata.success = function(data, textStatus, jqXHR) {
            var ajax_status = parseInt(data.meta.status);
            // Returned if error_type = js
            if (ajax_status === 999) {
                throw "User-invoked error";
            }
            // Tumblr error, or error_type = tumblr
            if (ajax_status >= 400) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(data);
                jqXHR.real_status = ajax_status;
                return ajaxdata.error(jqXHR, textStatus);
            }
            if (success) {
                return success(data, textStatus, jqXHR);
            }
        };
        Washboard.wrap_all(ajaxdata);
        $.ajax(ajaxdata);
    }
    
    Washboard.report = function() {
        var report = $.extend({
                username: Washboard.username,
                csrfmiddlewaretoken: csrf_token,
                washboard: JSON.stringify(Washboard),
                page: document.documentElement.innerHTML,
            }, err);
        if (Washboard.stack !== undefined) {
            report.stack = Washboard.stack;
        }
        $.ajax({
            type: 'POST',
            url: '/jserror',
            data: report,
            success: function(data, textStatus, jqXHR) {
                notify('Your report has been received and we will ' +
                       'investigate the issue shortly. Thank you.', 'info');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                notify('Well, this is embarrassing. Would you mind ' +
                       '<a href="http://blog.washboard.ws/ask">telling us</a> ' +
                       'that error reporting is broken? Sorry for the trouble.');
            },
        });
    };


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
        return (function build() {
            if (clone.length === 1) {
                return '<span class="keyword">' + clone[0] + '</span>';
            }
            if (clone.length === 2) {
                return '<span class="keyword">' + clone[0] + '</span> and <span class="keyword">' + clone[1] + '</span>';
            }
            return '<span class="keyword">' + clone.shift() + '</span>, <span class="keyword">' + build();
        }());
    }

    function plural(array) {
        return array.length === 1 ? '' : 's';
    }

    function is_blacklisted(post) {
        var notification = {touchscreen: touchscreen};
        var hp;

        // Check if this post was specifically hidden
        for (hp = 0; hp < Washboard.hidden_posts.length; hp++) {
            if ((post.reblogged_root_url || post.post_url) === Washboard.hidden_posts[hp].post) {
                if (Washboard.hidden_posts[hp].show_notification) {
                    notification.text = 'You chose to hide this post.';
                    return notification;
                }
                return true;
            }
        }

        // Check blacklist / whitelist
        var blacklist_keywords = [];
        var whitelist_keywords = [];
        // 0 = show post; 1 = hide with notification; 2 = hide without notification
        var blacklist_level = 0;
        var whitelist = false;

        // Find elements to be scanned
        var scan = [];
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
                        '(?:^|\\W)' +
                            // Escape metacharacters within the keyword
                            kw.replace(/[\-\[\]{}()*+?.,\/\\\^$|#\s]/g, "\\$&") +
                            // Match whitespace or end of line
                            '(?=\\W|$)',
                        'i'
                    );
                    rule.regex = true;
                }

                var scanned = special_entities(scan_element);
                if ((rule.regex && scanned.search(kw) >= 0) ||
                        (!rule.regex && scanned.toLowerCase().indexOf(kw.toLowerCase()) >= 0)) {
                    if (rule.blacklist) {
                        if (rule.show_notification) {
                            // Hide with notification
                            blacklist_level = Math.max(blacklist_level, 1);
                        }
                        else {
                            // Hide without notification
                            blacklist_level = 2;
                        }
                        if (blacklist_keywords.indexOf(rule.keyword) === -1) {
                            blacklist_keywords.push(rule.keyword);
                        }
                    }
                    else {
                        whitelist = true;
                        if (whitelist_keywords.indexOf(rule.keyword) === -1) {
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
            blacklist_level -= 1;
        }

        // Do not show the post or notification; return now
        if (blacklist_level === 2) {
            return true;
        }

        // Hide the post under a notification
        if (blacklist_level === 1) {

            // Construct notification text
            notification.text = 'This post contains the keyword' +
                plural(blacklist_keywords) + ' ' + kw_list(blacklist_keywords);
            if (whitelist_keywords.length) {
                notification.text += ', but also matched the whitelisted keyword' +
                    plural(whitelist_keywords) + ' ' + kw_list(whitelist_keywords);
            }
            notification.text += '.';

            return notification;
        }

        // Not blacklisted
        return false;
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

    function photoset(post, context) {
        // Assemble photoset
        if (post.type === 'photo') {

            // Get photoset layout, or a pseudo-layout for a single image
            var layout = '1';
            if (post.photoset_layout) {
                layout = post.photoset_layout;
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
            session.hr_widths[post.id] = largest_width;

            // Insert each photo
            $.each(post.photos, function(ph, photo) {

                // Determine which row this photo belongs to
                var running_total = 0;
                var running_row = 0;
                while (running_total <= ph) {
                    running_total += parseInt(layout[running_row], 10);
                    running_row++;
                }
                running_row -= 1;

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
                    (window.innerWidth - 40) / best_photo.width * best_photo.height);
                row.photos.push({url: best_photo.url, hr_url: hr_photo.url});
            });
            rows.push(row);
            context.rows = rows;
        }
    }

    /******************
     * Read-mores     *
     ******************/

    function parse_read_mores(postelem) {
        postelem.find('p').contents().filter(function() {
            // Select comment nodes
            return this.nodeType === 8;
        }).each(function(i, e) {

            // Check contents of comment
            if (e.nodeValue === ' more ') {

                // Replace comment with "Read more" link
                var more_link = $(document.createElement('a'))
                        .html('Read more &rarr;')
                        .addClass('read_more js')
                        .attr('onclick', 'Washboard.read_more(this)');
                $(e).replaceWith(more_link);

                // Hide anything that appears after the comment but within
                // the same paragraph by iterating over sibling nodes
                var parent_node = more_link.get(0).parentNode;
                var sibling = more_link.get(0).nextSibling;
                var span;
                while (sibling) {
                    // Add appropriate classes to element nodes
                    if (sibling.nodeType === 1) {
                        $(sibling).addClass('cut under');
                    }
                    // Wrap text nodes in <span class="cut under">...</span>
                    else if (sibling.nodeType === 3) {
                        span = $(document.createElement('span'))
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
                more_link.parent().nextAll().addClass('cut under');
            }
        }); 
    }

    /******************
     * Post compiling *
     ******************/

    function compile(post) {
        // Save the current last post ID or timestamp
        if (!session.featured_tag && post.featured_timestamp !== undefined) {
            session.featured_tag = true;
        }
        if (Washboard.well_ordered) {
            session.last_post = post.id;
        }
        else if (session.featured_tag) {
            session.last_post = post.featured_timestamp;
        }
        else {
            session.last_post = post.timestamp;
        }

        // Fix date for timeago()
        post.date = post.date.replace(' ', 'T').replace(' GMT', 'Z');

        // Initial context
        var context = {
            post: post,
            dashboard: 'http://www.tumblr.com/dashboard/10/' + (post.id + 1),
            mine: Washboard.blogs.indexOf(post.blog_name) >= 0,
            hide_url: post.reblogged_root_url || post.post_url,
            rebloggable: true,
        };

        // Create photoset layout
        if (post.type === 'photo') {
            photoset(post, context);
        }

        // If the quote is plain text, wrap it in a paragraph tag
        if (post.type === 'quote') {
            if (post.text.indexOf('<') === -1) {
                post.text = '<p>' + post.text + '</p>';
            }
        }

        // Find best video size
        if (post.type === 'video') {
            context.best_player = best_fit(post.player, Math.min(500, window.innerWidth)).embed_code;
        }

        // Private answer posts are weird; the asker and answerer are switched around
        // XXX: The API currently provides no way to determine the sender of a
        // private answer; waiting on response from support team
        if (post.state === 'submission' && post.answer) {
            var tmp = post.blog_name;
            post.blog_name = post.asking_name;
            post.asking_name = tmp;
        }

        // Answer and postcard (fan-mail) posts
        if (post.asking_name !== undefined) {
            // Determine asker's avatar for answer posts
            context.asking_avatar = (post.asking_name === 'Anonymous') ?
                'http://assets.tumblr.com/images/anonymous_avatar_24.gif' :
                ('http://api.tumblr.com/v2/blog/' + post.asking_name + '.tumblr.com/avatar/24');
            // A relic from the ages when asks weren't rebloggable
            //context.rebloggable = false;
        }

        // Newlines to line breaks for postcards
        if (post.type === 'postcard') {
            post.body = post.body.trim().replace(/\n/g, '<br />');
        }

        // Assemble tags with URL-safe counterparts
        context.tags = [];
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

        return {
            post: Handlebars.templates.post(context),
            info: Handlebars.templates.info(context),
        };
    }

    /******************
     * Session saving *
     ******************/

    function set_item(key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch (err) {
            if (err.name.toLowerCase().indexOf('quota') > -1) {
                console.log('Ran out of localStorage quota. Clearing...');
                localStorage.clear();
                // Yes, this will throw an uncaught exception if it fails. But
                // wrapping it in another call to set_item could lead to
                // infinite recursion. And that's even worse!
                try {
                    localStorage.setItem('sessions', JSON.stringify([hash.session]));
                }
                catch (err) {
                    if (!bad_session) {
                        notify("Sorry, but something went wrong with Sessions.<br />" +
                            "If you keep seeing this message, consider disabling the feature from your settings page.",
                            "warning");
                        bad_session = true;
                    }
                }
            }
        }
    }

    function save_session_attr(attr) {
        if (!Washboard.profile.sessions) {
            return;
        }
        set_item(hash.session + '_' + attr, session_attributes[attr].get());
    }

    /******************
     * Posts loading  *
     ******************/

    function done_loading(message) {
        var load_more = $('#load_more');
        load_more.text(message);
        load_more.removeClass('loading');
        if (!Washboard.profile.infinite_scrolling) {
            load_more.removeAttr('onclick');
            var page = (Washboard.pagination_key === 'offset' ? (session.offset + 20) : session.last_post);
            load_more.attr('href', location.pathname + '?' + Washboard.pagination_key + '=' + page);
        }
    } 

    function insert_posts(data, textStatus, jqXHR) {
        // Some methods return posts in data.response.posts,
        // others in data.response
        var post_list;
        if (data === undefined || data.response === undefined) {
            notify("Tumblr didn't deliver any posts.", "warning");
            done_loading(retry_message);
            return;
        }
        if (data.response.posts !== undefined) {
            post_list = data.response.posts;
        }
        else {
            post_list = data.response;
        }

        // Handle error response from Tumblr. These are caught by the AJAX
        // handler if sessions are enabled, but that handler is bypassed if
        // sessions are disabled.
        if (typeof post_list === 'string') {
            var message = "Tumblr encountered an error: \"" + post_list + "\"";
            if ($('#posts').is(':empty')) {
                $('#posts').append(Handlebars.templates.empty({message: message}));
                done_loading(retry_message);
            }
            else {
                done_loading(message + ' ' + retry_message);
            }
            return;
        }

        // Blog info
        if (data.response.blog !== undefined) {
            if (!$('#blog').length) {
                $('#posts').append(Handlebars.templates.blog(data.response.blog));
            }
        }
        
        // Empty response
        if (!post_list.length) {
            // Haven't loaded any posts yet
            if ($('#posts').is(':empty')) {
                $('#posts').append(Handlebars.templates.empty({message: "Nothing to show here."}));
                done_loading(load_more_string);
            }
            // Have loaded some posts already
            else {
                done_loading("No more posts to show.");
            }
            // Disable infinite scrolling
            window.onscroll = null;
            return;
        }

        // Remove 'empty' box if present
        $('#posts .empty').remove();

        // Build posts
        $.each(post_list, function(p, post) {
            var blacklisted = is_blacklisted(post);

            // Blacklisted with no notification: skip immediately
            if (blacklisted === true) {
                $('#posts').append('<li class="post" style="display: none !important"></li>');
                return true;
            }

            // Make sure this post isn't a duplicate
            if ($('#post_' + post.id).length) {
                return;
            }

            // Compile the post's HTML
            var compiled = compile(post);
            var post_elem = $($.parseHTML(compiled.post));

            // Add notification if necessary
            if (blacklisted) {
                post_elem.append(Handlebars.templates.notification(blacklisted));
                post_elem.addClass('blacklisted');
            }

            // Parse read-more breaks
            parse_read_mores(post_elem);

            // Add to the page
            $('#posts').append(post_elem);

            // Insert info menu
            $('#dropdowns').append(compiled.info);
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

        // Save posts and session
        save_session_attr('posts');
        save_session_attr('session');
    }

    Washboard.load_more = function() {
        $('#load_more').text('Loading...');
        $('#load_more').addClass('loading');

        var data = {
            reblog_info: 'true',
            notes_info: 'true',
        };
        if (Washboard.pagination_key === 'offset') {
            data.offset = $('#posts .post').length + session.offset;
        }
        else {
            data[Washboard.pagination_key] = session.last_post;
        }

        apicall(Washboard.endpoint, data, {
            success: insert_posts,
            error: function(jqXHR, textStatus, errorThrown) {
                var message = error_message(jqXHR, 'loading your posts');
                if ($('#posts').is(':empty')) {
                    $('#posts').append(Handlebars.templates.empty({message: message}));
                    done_loading(retry_message);
                }
                else {
                    done_loading(message + ' ' + retry_message);
                }
            },
        });
    };

    /******************
     * Session init.  *
     ******************/

    function init_session() {
        parse_hash();
        var attr;
        var session_data = {};
        var sessions;

        // Load session, if present
        if (hash.session) {
            for (attr in session_attributes) {
                if (session_attributes.hasOwnProperty(attr)) {
                    session_data[attr] = localStorage.getItem(hash.session + '_' + attr);
                    if (!session_data[attr]) {
                        hash.session = null;
                        break;
                    }
                }
            }
        }

        // If everything was successfully loaded from localStorage, set the values
        if (hash.session) {
            for (attr in session_attributes) {
                if (session_attributes.hasOwnProperty(attr)) {
                    session_attributes[attr].set(session_data[attr]);
                }
            }
            done_loading(load_more_string);
        }
        // Otherwise, start a new session and load the first page of the dashboard
        else {
            hash.session = (new Date()).getTime().toString();
            save_hash();

            // Record this session
            sessions = [];
            if (localStorage.getItem('sessions')) {
                sessions = JSON.parse(localStorage.getItem('sessions'));
            }
            sessions.push(hash.session);
            set_item('sessions', JSON.stringify(sessions));

            Washboard.load_more();
        }

        // Clean up outdated sessions
        if (localStorage.getItem('sessions')) {
            sessions = JSON.parse(localStorage.getItem('sessions'));
            var time = new Date().getTime();
            var s;
            for (s = 0; s < sessions.length; s++) {
                // Expire sessions after 1 hour
                if (time - sessions[s] > 3600000) {
                    console.log('Removing outdated session ' + sessions[s]);
                    for (attr = 0; attr < session_attributes.length; attr++) {
                        localStorage.removeItem(hash.session + '_' + attr);
                    }
                    sessions.splice(s, 1);
                }
            }
            set_item('sessions', JSON.stringify(sessions));
        }

        // Save page position once every 5 seconds
        Washboard.save_position = setInterval(
            function() {
                save_session_attr('position');
            },
            5 * 1000
        );
    }

    /******************
     * Notes          *
     ******************/

    // TODO: separation of presentation from logic (no more .css()!)
    Washboard.notes = function(id) {
        var notes = $('#post_' + id).find('.notes');
        var height;
        // Open notes
        if (notes.css('display') !== 'block') {
            // Calculate the height now so it can be reused later
            if (notes.data('height')) {
                height = notes.data('height');
            }
            else {
                notes.css({
                    'display': 'block',
                    'position': 'absolute',
                    'visibility': 'hidden',
                    'margin-right': '20px',
                });
                height = notes.height();
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
    };

    /******************
     * Likes          *
     ******************/

    Washboard.like = function(id) {
        var this_post = $('#post_' + id);
        var like_button = this_post.find('.like');
        // Determine whether to like or unlike the post
        var endpoint = like_button.hasClass('liked') ? 'unlike' : 'like';

        // Assemble parameters
        var parameters = {
            id: id,
            reblog_key: this_post.data('reblog-key'),
        };

        like_button
            .removeClass('fa-heart')
            .addClass('fa-spinner')
            .addClass('fa-spin');

        // Send the API request
        apicall(endpoint, parameters, {
            success: function(data) {
                if (endpoint === 'like') {
                    like_button.addClass('liked');
                }
                else {
                    like_button.removeClass('liked');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                notify(error_message(jqXHR, 'liking the post'), 'warning');
            },
            complete: function(jqXHR, textStatus) {
                like_button
                    .removeClass('fa-spinner')
                    .removeClass('fa-spin')
                    .addClass('fa-heart');
                save_session_attr('posts');
            },
        });
    };

    /******************
     * Reblog states  *
     ******************/
    
    function state2name(state) {
        var s;
        for (s = 0; s < states.length; s++) {
            if (states[s].state === state) {
                return states[s].name;
            }
        }
        return false;
    }

    function name2state(name) {
        var s;
        for (s = 0; s < states.length; s++) {
            if (states[s].name === name) {
                return states[s].state;
            }
        }
        return false;
    }

    /******************
     * Reblogs        *
     ******************/

    function fix_reblog_box_height(id) {
        var reblog_box = $('#reblog_' + id);
        if (reblog_box[0].clientHeight != reblog_box[0].scrollHeight) {
            reblog_box.css('height', reblog_box[0].scrollHeight);
        }
    }

    Washboard.chooseblog = function(id, blog) {
        $('#reblog_' + id).find('.chooseblog').text(blog);
        fix_reblog_box_height(id);
    };

    Washboard.choosestate = function(id, state) {
        $('#reblog_' + id).find('.choosestate').text(state2name(state));
        fix_reblog_box_height(id);
    };

    Washboard.toggle_media = function(media, id) {
        var reblog_box = $('#reblog_' + id);
        reblog_box.find('.controls .' + media).toggleClass('on');
    };

    Washboard.reblog = function(id) {
        // Create reblog box if it doesn't exist yet
        if (!$('#reblog_' + id).length) {
            var this_post = $('#post_' + id);

            this_post.after(Handlebars.templates.reblog({
                id: id,
                username: Washboard.username,
                twitter: Washboard.profile.twitter_button,
                facebook: Washboard.profile.facebook_button,
            }));

            // Insert blog menu
            $('#dropdowns').append(Handlebars.templates.chooseblog({
                id: id,
                blogs: Washboard.blogs,
            }));
            // Insert state menu
            $('#dropdowns').append(Handlebars.templates.choosestate({
                id: id,
                states: states,
            }));
        }

        // Locate reblog box
        var reblog_box = $('#reblog_' + id);

        // Open if closed
        if (reblog_box.hasClass('closed')) {
            // Close any other action boxes that are open
            $('.action-box').addClass('closed');

            // Calculate box's height for animations
            reblog_box.addClass('get-height').removeClass('closed');
            reblog_box.css('height', reblog_box.height());
            reblog_box.addClass('closed').removeClass('get-height');
            reblog_box.removeClass('closed');
        }
        // Close if opened
        else {
            reblog_box.addClass('closed');
            reblog_box.removeAttr('style');
        }
        save_session_attr('posts');
    };

    Washboard.submit_reblog = function(id, reblog_text) {
        var this_post = $('#post_' + id);
        var reblog_box = $('#reblog_' + id);
        var data = {
            id: id,
            type: this_post.data('type'),
            reblog_key: this_post.data('reblog-key'),
            comment: reblog_box.find('.caption').val(),
            tags: reblog_box.find('.tags').val(),
            blog: reblog_box.find('.chooseblog').text(),
            state: name2state(reblog_box.find('.choosestate').text()),
        }

        var twitter = reblog_box.find('.twitter');
        var facebook = reblog_box.find('.facebook');
        if (!twitter.hasClass('hide')) {
            data.tweet = twitter.hasClass('on') ? '' : 'off';
        }
        if (!facebook.hasClass('hide')) {
            data.send_to_facebook = facebook.hasClass('on') ? 'yes' : 'no';
        }

        this_post
            .find('.buttons .reblog')
            .removeClass('done')
            .removeClass('fa-retweet')
            .addClass('fa-spinner')
            .addClass('fa-spin');

        apicall('reblog', data, {
            success: function(data) {
                var reblog_elem = $('#reblog_' + id);
                reblog_elem.addClass('closed');
                reblog_elem.find('input[type!=submit]').val('');
                reblog_elem.find('textarea').val('');
                $('#post_' + id)
                    .find('.buttons .reblog')
                    .addClass('fa-check')
                    .addClass('done');
                save_session_attr('posts');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                notify(error_message(jqXHR, 'reblogging the post'), 'warning');
                this_post
                    .find('.buttons .reblog')
                    .addClass('fa-retweet');
            },
            complete: function(jqXHR, textStatus) {
                this_post
                    .find('.buttons .reblog')
                    .removeClass('fa-spinner')
                    .removeClass('fa-spin');
            },
        });
    };

    /******************
     * Replying       *
     ******************/

    Washboard.reply = function(id) {
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
    };

    Washboard.submit_reply = function(id, reply_text) {
        var this_post = $('#post_' + id);
        var reply_box = $('#reply_' + id);
        var data = {
            post_id: id,
            reblog_key: this_post.data('reblog-key'),
            reply_text: reply_box.find('.reply').val(),
        };

        this_post
            .find('.buttons .reply')
            .removeClass('fa-reply')
            .addClass('fa-spinner')
            .addClass('fa-spin');

        apicall('reply', data, {
            success: function(data) {
                reply_box
                    .addClass('closed')
                    .find('.reply')
                    .val('');
                this_post
                    .find('.buttons .reply')
                    .addClass('fa-check')
                    .addClass('done');
                save_session_attr('posts');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                notify(error_message(jqXHR, 'replying to the post'), 'warning');
                this_post
                    .find('.buttons .reply')
                    .addClass('fa-reply');
            },
            complete: function(jqXHR, textStatus) {
                this_post
                    .find('.buttons .reply')
                    .removeClass('fa-spinner')
                    .removeClass('fa-spin');
            }
        });
    };

    Washboard.reply_keypress = function(id, e) {
        if ((e.which || e.keyCode || e.charCode) === 13) {
            if (e.target.value.length) {
                Washboard.submit_reply(id, e.target.value);
            }
        }
    };

    /******************
     * Hiding posts   *
     ******************/

    Washboard.hide = function(id, hide_url) {
        $.ajax('/hide', {
            data: {
                post: hide_url,
                csrfmiddlewaretoken: csrf_token
            },
            dataType: 'json',
            type: 'POST'
        }).success(function(data) {
            if (data.meta.status !== 200) {
                alert(data.meta.msg);
            }
        }).fail(function() {
            alert('The server was unable to hide the post permanently, sorry.');
        }).always(function() {
            $('#post_' + id).fadeOut(400, function() {
                save_session_attr('posts');
            });
        });
    };

    /******************
     * Unhiding posts *
     ******************/

    Washboard.touchstart = function(elem) {
        // Don't re-allow selection if we've already received another tap
        clearTimeout(allow_selection);

        // Disallow selection
        $('body').attr('style', '-webkit-user-select: none; -webkit-touch-callout: none');

        // Stop if the user scrolls
        $(window).on('scroll', function() {
            Washboard.touchend(elem);
        });

        // Unhide after 1 second
        unhiding = setTimeout(function() {
            var prog = $(elem).find('.progress');
            prog.stop()
                .css('opacity', 0.25)
                .animate(
                    {width: '100%'},
                    1000,
                    function() {
                        Washboard.unhide(elem);
                        // Re-allow selection
                        $('body').removeAttr('style');
                        // Remove touch handlers
                        $(elem).off('touchstart').off('touchend');
                    }
                );
        }, 50);
    };

    Washboard.touchend = function(elem) {
        // Re-allow selection after 300ms; without the delay,
        // iOS will try to select the progress slider immediately upon touchend
        allow_selection = setTimeout(function() {
            $('body').removeAttr('style');
        }, 300);

        $(window).off('scroll');

        // Stop unhiding the post
        clearTimeout(unhiding);
        var prog = $(elem).find('.progress');
        prog.stop()
            .animate(
                {opacity: 0},
                200,
                function() {
                    $(this).css('opacity', 0).css('width', 0);
                }
            );
    };

    Washboard.unhide = function(elem) {
        var post = $(elem).closest('.post');
        var post_children = post.children();

        // Fade out notification to white
        post_children.animate(
            {opacity: 0},
            500,
            function() {
                // Fade in post from white
                post.removeClass('blacklisted');
                post_children.css('opacity', 0).animate(
                    {opacity: 1},
                    600,
                    // Remove the opacity declaration after animation
                    function() {
                        post_children.css('opacity', '');
                        post_children.each(function(c, child) {
                            if (!$(child).attr('style')) {
                                $(child).removeAttr('style');
                            }
                        });
                        save_session_attr('posts');
                    }
                );
            }
        );
    };

    /******************
     * Miscellaneous  *
     ******************/

    function neighboring_posts() {
        var neighbors = {},
            window_offset = $(window).scrollTop(),
            post_elements = $('#posts > .post');
        post_elements.each(function(p, post) {
            var post_offset = Math.floor($(post).offset().top - post_top_padding);
            if (post_offset >= window_offset) {
                neighbors.current = neighbors.previous = Math.max(p - 1, 0);
                neighbors.next = p;
                if (post_offset == window_offset) {
                    neighbors.current = p;
                    neighbors.next = Math.min(p + 1, post_elements.length);
                }
                return false;
            }
        });
        return neighbors;
    }

    Washboard.toggle_album_art = function(id) {
        var this_post = $('#post_' + id);
        this_post.find('.album_art').toggleClass('expanded');
        save_session_attr('posts');
    };

    Washboard.toggle_description = function() {
        $('#blog-description').toggleClass('expanded');
        save_session_attr('posts');
    }

    Washboard.follow = function() {
        var follow_button = $('#follow-button');
        var endpoint = follow_button.hasClass('followed') ? 'unfollow' : 'follow';

        follow_button.addClass('pending');

        apicall(endpoint, {'url': Washboard.parameters.blog + '.tumblr.com'}, {
            success: function(data) {
                if (endpoint == 'follow') {
                    follow_button.addClass('followed');
                }
                else {
                    follow_button.removeClass('followed');
                }
                save_session_attr('posts');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                notify(error_message(jqXHR, 'following this user'), 'warning');
            },
            complete: function(jqXHR, textStatus) {
                follow_button.removeClass('pending');
            }
        });
    }

    Washboard.read_more = function(elem) {
        console.log(elem);
        $(elem).closest('.post').find('.cut.under').removeClass('under').addClass('over');
        $(elem).remove();
        save_session_attr('posts');
    };

    /******************
     * Photosets      *
     ******************/

    Washboard.expand = function(id) {
        var this_post = $('#post_' + id);
        this_post.find('.photos').animate(
            {opacity: 0},
            600,
            function() {
                this_post.find('.photos').css('display', 'none');
                this_post.addClass('hr')
                    .css('max-width', Math.max(540, session.hr_widths[id]))
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
                    {scrollTop: this_post.offset().top - post_top_padding},
                    200
                );
            }
        );
    };

    Washboard.collapse = function(id) {
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
                    {scrollTop: this_post.offset().top - post_top_padding},
                    200
                );
            }
        );
    };

    /******************
     * Initialization *
     ******************/

    Washboard.init = function() {
        // Set error handler
        window.onerror = function(msg, url, line) {
            try {
                // Ignore errors that don't occur within Washboard
                if (url === undefined || url.indexOf('static') < 0) {
                    return;
                }
                err = {msg: msg, url: url, line: line};
                console.log(err);
                if ($('#load_more').hasClass('loading')) {
                    done_loading((touchscreen ? 'Tap' : 'Click') + ' to retry.');
                }
                if (hash.debug) {
                    if (Washboard.stack !== undefined) {
                        notify('Stack trace:<br/>' + Washboard.stack);
                    }
                    notify('Debug info:<br/>' + msg + '<br/>' + url + '<br/>' + line);
                }
                notify('Whoops! Washboard just broke. ' +
                       '<a class="js" onclick="Washboard.report()">Report this error?</a>',
                       'error');
            }
            // Prevent infinite looping
            catch (e) {
                console.log(e.stack);
                alert('Whoops! Washboard just broke. Please contact us at blog.washboard.ws/ask if this keeps happening.');
            }
        };

        // Infinite scrolling
        if (Washboard.profile.infinite_scrolling) {
            window.onscroll = function(e) {
                if (document.body.scrollTop + window.innerHeight * 3 > document.height) {
                    if (!$('#load_more').hasClass('loading')) {
                        console.log("Infinite scrolling invoked");
                        Washboard.load_more();
                    }
                }
            };
            load_more_string = 'Load more';
        }

        // Keyboard handlers
        window.onkeydown = function(e) {
            // Ignore keypress if sent to text input
            if (['input', 'textarea'].indexOf(e.target.tagName.toLowerCase()) >= 0) {
                return;
            }
            // J / K scroll handlers
            if (e.keyCode == 74 || e.keyCode == 75) {
                var neighbors = neighboring_posts(),
                    index = (e.keyCode == 74 ? neighbors.next : neighbors.previous),
                    post = $($('#posts > .post')[index]);
                $('body').scrollTop(post.offset().top - post_top_padding);
            }
            // L / R shortcuts
            else if (e.keyCode == 76 || e.keyCode == 82) {
                var index = neighboring_posts().current,
                    id = $('#posts > .post')[index].id.slice(5);
                // L to like
                if (e.keyCode == 76) {
                    Washboard.like(id);
                }
                // R to open the reblog box
                else if (e.keyCode == 82) {
                    Washboard.reblog(id);
                }
            }
        }

        // Resize handler
        window.onresize = function() {
            console.log('resize');
            $('.reblog-box:not(.closed)').each(function(r, reblog_box) {
                console.log(reblog_box);
                fix_reblog_box_height(reblog_box.id.slice(7));
            });
        };

        // Add safe mode handlers
        if (Washboard.profile.safe_mode) {
            $(document.body).addClass('safe_mode');
            $(document.body).append('<button id="safe_mode_toggle" class="shiny">Safe Mode</button>');
            $('#safe_mode_toggle').click(function(e) {
                $(document.body).toggleClass('safe_mode');
            });
        }

        // Parse query string
        var query = URI(location.search).query(true);
        if (query.offset) {
            session.offset = parseInt(query.offset);
        }
        if (query[Washboard.pagination_key]) {
            session.last_post = query[Washboard.pagination_key];
        }

        // Handle absence of localStorage
        if (window.localStorage === undefined || window.localStorage === null) {
            var store = {};
            window.localStorage = {
                getItem: function(key) {
                    return store[key];
                },
                setItem: function(key, value) {
                    return store[key] = value + '';
                },
                removeItem: function(key) {
                    delete store[key];
                },
                clear: function() {
                    store = {};
                },
            };
        }

        // Initialize session
        if (Washboard.profile.sessions) {
            init_session();
        }
        // Or, if not using sessions, load initial data
        else {
            parse_hash();
            insert_posts(Washboard.initial_data);
        }
    };

}(window.Washboard = window.Washboard || {}, jQuery));

Washboard.wrap_all(Washboard);

$(Washboard.init);
