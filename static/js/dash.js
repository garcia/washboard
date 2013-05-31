function plural(array) {
    return array.length == 1 ? '' : 's';
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

function post2html(post) {
    // Check post's ID against currently loaded posts
    if (post.id >= $(posts).last().prop('id')) {
        // If it wasn't posted before the last post, ignore it
        // and note that we're now one more post behind
        behind_by++;
        return true;
    }
    
    // General setup
    var scan = [];
    var postelem = elem('li').addClass('post');
    postelem.addClass(post.type);
    postelem.attr('id', 'post_' + post.id);
    posts.push(post);

    // Check if this post was specifically hidden
    for (var hp = 0; hp < hidden_posts.length; hp++) {
        if ((post.reblogged_root_url || post.post_url) == hidden_posts[hp].post) {
            return true;
        }
    }

    // Metadata
    var meta = elem('div').addClass('meta');

    // Blog avatar
    meta.append(elem('a')
        .addClass('avatar')
        .attr('href', 'http://' + post.blog_name + '.tumblr.com')
        .html(elem('img')
            .attr('src', 'http://api.tumblr.com/v2/blog/'
                + post.blog_name
                + '.tumblr.com/avatar/40'
            )
        )
    );

    // Blog name
    meta.append(elem('a')
        .addClass('blog_name')
        .text(post.blog_name)
        .attr('href', post.post_url)
    );
    // Reblogged blog name
    if (post.reblogged_from_name) {
        meta.append(elem('span')
            .addClass('reblogged_text')
            .html('&nbsp;reblogged&nbsp;')
        );
        meta.append(elem('a')
            .addClass('reblogged_from_name')
            .text(post.reblogged_from_name)
            .attr('href', post.reblogged_from_url)
        );
        scan.push(post.reblogged_from_name);
    }

    // Buttons
    buttons = elem('div').addClass('buttons');

    // Note count
    if (post.note_count) {
        buttons.append(elem('a')
            .addClass('note_count')
            .text(post.note_count)
        );
    }

    // TODO: don't show like / reblog buttons if it's your own post
    if (true) {

        // Like button
        var like_button = elem('a')
            .addClass('like')
            .text('Like')
            .on('click', function(e) {
                like({
                    id: post.id,
                    reblog_key: post.reblog_key
                });
            });
        if (post.liked) {
            like_button.addClass('liked');
        }
        buttons.append(like_button);

        // Reblog button
        buttons.append(elem('a')
            .addClass('reblog')
            .text('Reblog')
            .attr('href', 'http://www.tumblr.com/reblog/' + post.id + '/' +
                post.reblog_key + '?redirect_to=' + encodeURIComponent(BASE_URL) +
                'dash?reblogged%3D' + post.id)
            .click(function(e) {
                // Save posts
                localStorage.setItem('posts_' + post.id, JSON.stringify(posts));
                localStorage.setItem('behind_by_' + post.id, behind_by);
                // Note that we've saved the posts for this reblog
                var saved = {};
                if (localStorage.getItem('saved')) {
                    saved = JSON.parse(localStorage.getItem('saved'));
                }
                saved[post.id] = new Date().getTime();
                localStorage.setItem('saved', JSON.stringify(saved));
                // Update URL
                location.hash = 'reblogged=' + post.id;
            })
        );
    }

    // Info button
    buttons.append(elem('a')
        .addClass('info')
        .text('Info')
        .attr('data-dropdown', '#post_' + post.id + ' .info-menu')
    );
    meta.append(buttons);
    postelem.append(meta);

    // Info dropdown
    var infomenu = elem('div').addClass('info-menu');
    var infolist = elem('ul');

    // Timestamp
    infolist.append(elem('li').append(elem('a')
        .attr('href', post.post_url)
        .text('Posted ')
        .append(elem('abbr')
            .addClass('timeago')
            .attr('title', post.date.replace(' ', 'T').replace(' GMT', 'Z'))
            .text(post.date)
            .timeago()
        )));

    // Clickthrough
    if (post.link_url) {
        infolist.append(elem('li').append(elem('a')
            .attr('href', post.link_url)
            .text('Clickthrough')));
    }

    // Hide this post
    infolist.append(elem('li').append(elem('a')
        .on('click', function(e) {
            var hide_url = post.reblogged_root_url || post.post_url
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
                $('#post_' + post.id).animate({opacity: 0}, 600, function() {
                    setTimeout(function() {
                        $('#post_' + post.id).css('display', 'none');
                    }, 300);
                });
            });
        })
        .text('Hide this post')
    ));
    infomenu.append(infolist);
    meta.append(infomenu);
    
    infomenu.addClass('dropdown').addClass('dropdown-tip');
    infolist.addClass('dropdown-menu');

    
    // Text posts
    if (post.type == 'text') {

        // Title (optional)
        if (post.title) {
            postelem.append(elem('h2').text(post.title));
            scan.push(post.title);
        }

        // Body
        postelem.append(elem('div').addClass('body').html(post.body));
        scan.push(post.body);
    }

    // Photo posts
    else if (post.type == 'photo') {
        var photos = elem('div').addClass('photos');
        var hr_photos = elem('div').addClass('hr_photos').css('display', 'none');
        var row = elem('div').addClass('row');
        var last_row = 0;
        var row_height = 700;

        // Insert each photo
        $.each(post.photos, function(ph, photo) {

            // Get photoset layout
            if (post.photoset_layout) {
                layout = post.photoset_layout;
            }
            // Pseudo-layout for single images
            else {
                layout = '1';
            }

            // Get row of current photo
            var running_total = 0;
            var running_row = 0;
            while (running_total <= ph) {
                running_total += parseInt(layout[running_row]);
                running_row++;
            }
            running_row--;
            if (running_row > last_row) {
                row.addClass('row-' + layout[last_row]);
                row.css('height', row_height);
                photos.append(row);
                row = elem('div').addClass('row');
                row_height = 700;
            }
            last_row = running_row;

            // Determine optimal photo size to load
            var target_size = optimal_sizes[layout[running_row]];
            var best_photo = best_fit(photo.alt_sizes, target_size);
            var photolink = elem('a')
                .attr('href', best_fit(photo.alt_sizes, 1280).url)
                .attr('target', '_blank')
                .click(function(e) {
                    var this_post = $('#post_' + post.id);
                    this_post.find('.photos').animate(
                        {opacity: 0},
                        600,
                        function() {
                            this_post.find('.photos').css('display', 'none');
                            this_post.addClass('hr')
                                .find('.hr_photos')
                                .css('display', 'block')
                                .css('opacity', 0)
                                .animate({opacity: 1}, 600)
                                .find('img')
                                .each(function(i, img) {
                                    $(img).attr('src', $(img).attr('hr_src'));
                                }
                            );
                            console.log(e.currentTarget);
                            $('body').animate(
                                {scrollTop: this_post.offset().top - 5},
                                200
                            );
                        }
                    );
                    return false;
                });
            photolink.append(elem('img').attr('src', best_photo.url));
            row.append(photolink);
            row_height = Math.min(row_height,
                optimal_sizes[layout[running_row]] / best_photo.width * best_photo.height)

            // Optimal high-res size
            best_photo = best_fit(photo.alt_sizes, window.innerWidth);
            photoelem = elem('img')
                .attr('hr_src', best_photo.url)
                .click(function(e) {
                    var this_post = $('#post_' + post.id);
                    this_post.find('.hr_photos').animate(
                        {opacity: 0},
                        600,
                        function() {
                            this_post.find('.hr_photos').css('display', 'none');
                            this_post.removeClass('hr')
                                .find('.photos')
                                .css('display', 'block')
                                .css('opacity', 0)
                                .animate({opacity: 1}, 600);
                            $('body').animate(
                                {scrollTop: this_post.offset().top - 5},
                                200
                            );
                        }
                    );
                });
            hr_photos.append(photoelem);
        });
        row.addClass('row-' + layout[last_row]);
        if (layout != '1') {
            row.css('height', row_height);
        }
        photos.append(row);
        postelem.append(photos);
        postelem.append(hr_photos);

        // Caption (optional)
        if (post.caption) {
            postelem.append(elem('div').addClass('caption').html(post.caption));
            scan.push(post.caption);
        }
    }

    // Quote posts
    else if (post.type == 'quote') {
        
        // Quote
        postelem.append(elem('div').addClass('quote').html(post.text));
        scan.push(post.text);

        // Source (optional)
        if (post.source) {
            postelem.append(elem('div').addClass('source').html(post.source));
            scan.push(post.source);
        }
    }

    // Link posts
    else if (post.type == 'link') {
        
        // URL
        var anchor = elem('a').addClass('link').attr('href', post.url);
        if (post.title) {
            // Title, if present
            anchor.text(post.title);
        }
        else {
            // Title defaults to the URL itself
            anchor.text(post.url);
        }
        scan.push(post.title);
        scan.push(post.url);
        postelem.append(anchor);

        // Description (optional)
        if (post.description) {
            postelem.append(elem('div').addClass('description').html(post.description));
            scan.push(post.description);
        }
    }

    // Chat posts
    else if (post.type == 'chat') {
        
        // Title (optional)
        if (post.title) {
            postelem.append(elem('h2').addClass('title').text(post.title));
            scan.push(post.title);
        }

        // Dialogue
        chat = elem('ul').addClass('dialogue');
        $.each(post.dialogue, function(l, line) {
            chat.append(elem('li').addClass('line')
                .append(elem('b').text(line.label))
                .append(' ')
                .append(elem('span').text(line.phrase))
            );
            scan.push(line.label);
            scan.push(line.phrase);
        });
        postelem.append(chat);
    }

    // Audio posts
    else if (post.type == 'audio') {

        // Audio box (container for non-caption data)
        var audiobox = elem('div').addClass('audiobox');

        // HTML5 player, if possible
        if (post.audio_url) {
            // Apparently this is required, otherwise it gives a 403...
            if (post.audio_url.indexOf('http://www.tumblr.com/') == 0) {
                post.audio_url += '?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio';
            }
            audiobox.append(
                elem('audio')
                    .attr('src', post.audio_url)
                    .attr('type', 'audio/mp3')
                    .attr('preload', 'none')
                    .addClass('new')
            );
        }
        // Default to embedded player
        else {
            audiobox.append($(post.player).addClass('player'));
        }

        // Album art (optional)
        if (post.album_art) {
            var album_art = elem('img')
                .addClass('album_art')
                .attr('src', post.album_art)
                .click(function() { $(this).toggleClass('expanded'); });
            audiobox.append(album_art);
        }

        // Track name, artist, and album (all optional)
        var metadata = ['track_name', 'artist', 'album'];
        for (var i = 0; i < metadata.length; i++) {
            if (post[metadata[i]]) {
                audiobox.append(
                    elem('p').addClass(metadata[i]).text(post[metadata[i]])
                );
            }
        }
        postelem.append(audiobox);

        // Caption (optional)
        if (post.caption) {
            postelem.append(
                elem('div').addClass('caption').html(post.caption)
            );
            scan.push(post.caption);
        }
    }

    // Video posts
    else if (post.type == 'video') {
        
        // Player
        var best_player = best_fit(post.player, 500 * scale);
        postelem.append($(best_player.embed_code).addClass('player'));

        // Caption (optional)
        if (post.caption) {
            postelem.append(
                elem('div').addClass('caption').html(post.caption)
            );
            scan.push(post.caption);
        }
    }

    // Answer posts
    else if (post.type == 'answer') {
        
        // Answer box
        var answerbox = elem('div').addClass('answerbox');

        // Question
        answerbox.append(elem('p').addClass('question').text(post.question));

        // Asker's information
        var asking = elem('p').addClass('asking');
        // Avatar
        asking.append(elem('img')
            .addClass('asking_avatar')
            .attr('src', (post.asking_name == 'Anonymous') ?
                ('http://assets.tumblr.com/images/anonymous_avatar_24.gif') :
                ('http://api.tumblr.com/v2/blog/'
                    + post.asking_name
                    + '.tumblr.com/avatar/24')
            )
        );
        // Name
        asking_name = elem('a')
            .addClass('asking_name')
            .text(post.asking_name);
        // Blog URL
        if (post.asking_url) {
            asking_name.attr('href', post.asking_url);
        }
        else {
            asking_name.addClass('anonymous');
        }
        scan.push(post.asking_name);
        scan.push(post.question);
        asking.append(asking_name);
        answerbox.append(asking);
        postelem.append(answerbox);

        // Answer
        postelem.append(elem('div').addClass('answer').html(post.answer));
        scan.push(post.answer);

    }
    
    // Unidentifiable posts
    else {
        postelem.append(elem('i').text(
            "Sorry, I don't know how to render " + post.type + " posts yet."
        ));
    }

    // Tags
    if (post.tags.length) {
        var tags = elem('div').addClass('tags');
        $(post.tags).each(function(t, tag) {
            scan.push('#' + tag);
            tags.append(elem('a')
                .attr('href', 'http://www.tumblr.com/tagged/' + encodeURIComponent(tag))
                .html('#' + tag)
            );
        });
        postelem.append(tags)
    }
    
    // Check for blacklisted keywords
    keywords = [];
    blacklist = true;
    notification = true;

    // Iterate over elements to be scanned
    $.each(scan, function(s, scan_element) {
        
        // Iterate over the user's rules
        $.each(rules, function(r, rule) {
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
                
                // Post contains a whitelisted keyword; stop scanning
                if (!rule.blacklist) {
                    blacklist = false;
                    return false;
                }

                // Don't give the user the option to show the post
                if (!rule.show_notification) {
                    notification = false;
                }
                
                // Note that the keyword has already been found
                if (keywords.indexOf(rule.keyword) == -1) {
                    keywords.push(rule.keyword);
                }
            }
        });
    });

    // Mark the post as blacklisted if necessary
    if (keywords.length && blacklist && notification) {
        postelem.addClass('blacklisted');

        // Insert notification
        var notification = elem('div').addClass('notification');
        notification.append(
            elem('h2').text('Post blacklisted')
        );
        notification.append(
            elem('p').html('This post contains the keyword' +
                plural(keywords) + ' ' + kw_list(keywords) + '.')
        );
        notification.append(elem('a')
            .addClass('instructions')
            .text(
                touchscreen ? 'Press and hold to unhide'
                            : 'Click to unhide')
        );
        notification.append(elem('div').addClass('progress'));

        // Add listeners for touchscreens
        if (touchscreen) {
            postelem.on('touchstart', touchstart);
            postelem.on('touchend', touchend);
        }
        // Default to a simple click listener
        else {
            notification.attr('onclick', 'unhide(this)');
        }

        postelem.append(notification);
    }

    // Check for read-more breaks
    postelem.find('p').contents().filter(function() {
        // Select comment nodes
        return this.nodeType == 8;
    }).each(function(i, e) {
        
        // Check contents of comment
        if (e.nodeValue == ' more ') {

            // Replace comment with "Read more" link
            var more_link = elem('a')
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
                    var span = elem('span')
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
    
    // Return element, unless it got blacklisted by a no-notification keyword
    if (!keywords.length || notification) {
        return postelem;
    }
    return false;
}

function dash(data) {
    try {
        // Convenience function to create new jQuery-wrapped elements
        this.elem = function(elem) {
            if(typeof(elem) != "string") {
                return false;
            }
            return $(document.createElement(elem));
        }

        // Global variable for debugging purposes
        d = data;

        // Build posts
        $.each(data.response.posts, function(p, post) {
            var post_elem = post2html(post);
            if (post_elem == true) {
                return true;
            }
            else if (post_elem != false) {
                $('#middle > div > #posts').append(post_elem);
            }
        });

        // Reset "Load more" footer
        if ($('#load_more').hasClass('loading')) {
            $('#load_more').text('Load more');
            $('#load_more').removeClass('loading');
        }

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
            iPhoneUseNativeControls: true,
            AndroidUseNativeControls: false
        });
        $('audio.new').removeClass('new');
    }
    catch (e) {
        $('#load_more').text('There was an error while loading your posts. Try again?');
        $('#load_more').removeClass('loading');
        console.log(e.stack);
    }
}

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
                $(this).css('opacity', .25).css('width', 0);
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
                });
        }
    );
}

function apicall(url, data, options) {
    var _data = $.extend({
        // Empty body hash (perhaps I shouldn't assume it'll always be empty?)
        oauth_body_hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk='
    }, data);
    var _options = $.extend({
        url: url,
        data: _data,
        dataType: 'jsonp',
        jsonp: false,
        // Allow caching, otherwise jQuery messes with the query string
        cache: true,
        consumerKey: API_KEY,
        consumerSecret: API_SECRET,
        token: TOKEN_KEY,
        tokenSecret: TOKEN_SECRET,
    }, options);
    console.log(url + ' : ' + JSON.stringify(_data));
    $.oauth(_options);
}

function dashboard(data, options) {
    var _data = $.extend({
        callback: 'dash',
        reblog_info: 'true',
        notes_info: 'true'
    }, data);
    if (window.location.search.indexOf('testdata') >= 0) {
        apicall('/static/js/testdata.js', _data, options);
    }
    else {
        apicall('http://api.tumblr.com/v2/user/dashboard', _data, options);
    }
}

function like(data, options) {
    var cb = 'liked_' + data.id;
    var id = data.id;
    
    // Create global callback function for this post
    window[cb] = function(data) {
        if (data.meta.status == 200) {
            $('#post_' + id).find('.like').toggleClass('liked');
        }
    }

    // Determine whether to like or unlike the post
    mode = $('#post_' + id).find('.like').hasClass('liked') ? 'unlike' : 'like';

    var _data = $.extend({
        callback: cb,
    }, data); 
    apicall('http://api.tumblr.com/v2/user/' + mode, _data, options);
}

function load_more() {
    // Set the offset, accounting for posts that have been made since initial load
    dashboard({
        offset: $('#posts').children().length + behind_by * 2
    });
    $('#load_more').text('Loading...');
    $('#load_more').addClass('loading');
}

$(function() {
    // Get scale for photos
    // TODO: adjust when window resizes?
    scale = Math.min(500, window.innerWidth) / 500;
    optimal_sizes = {'1': 500 * scale, '2': 245 * scale, '3': 160 * scale};
    
    // Detect touch screen
    touchscreen = 'ontouchstart' in window;
    
    // Remove unnecessary elements from center
    $('#middle > div').html('<div id="posts"></div>');
    
    // Initial variables
    posts = [];
    behind_by = 0;
    allow_selection = -1;
    unhiding = -1;
    
    query = URI(location.search).query(true);
    hash = URI('?' + location.hash.slice(1)).query(true);
    reblogged = query.reblogged || hash.reblogged;
    
    // Load saved posts upon returning from a reblog
    if (reblogged && localStorage.getItem('posts_' + reblogged)) {
        behind_by = parseInt(localStorage.getItem('behind_by_' + reblogged));
        dash({
            'meta': {'status': 200, 'msg': 'OK'},
            'response': {'posts': JSON.parse(localStorage.getItem('posts_' + reblogged))}
        });

        // Cleanup
        localStorage.removeItem('behind_by_' + reblogged);
        localStorage.removeItem('posts_' + reblogged);

        // Go to the post
        location.hash = 'post_' + reblogged;
    }
    // Otherwise, load the first page of the dashboard
    else {
        dashboard();
    }

    // Clean up outdated save states
    if (localStorage.getItem('saved')) {
        console.log('Checking for outdated saves');
        var saved = JSON.parse(localStorage.getItem('saved'));
        var time = new Date().getTime();
        for (var id in saved) {
            console.log(id);
            // Expire saves after 1 hour
            if (time - saved[id] > 3600000) {
                console.log('Removing outdated save ' + id);
                localStorage.removeItem('posts_' + id);
                localStorage.removeItem('behind_by_' + id);
                delete saved[id];
            }
        }
        localStorage.setItem('saved', JSON.stringify(saved));
    }

    // Insert new post button
    $('#new').addClass('dropdown').addClass('dropdown-tip');
    $('#new ul').addClass('dropdown-menu');
    $('#new').before('<a class="js" id="new-link" data-dropdown="#new">New</a>');;
});
