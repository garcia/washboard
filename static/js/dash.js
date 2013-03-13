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

function cb(data) {
    //console.log(JSON.stringify(data));
    this.elem = function(elem) {
        if(typeof(elem) != "string") {
            return false;
        }
        return $(document.createElement(elem));
    }
    d = data;
    var posts_elem = elem('ul').attr('id', 'posts');
    $.each(data.response.posts, function(p, post) {
        // Check post's ID
        if (post.id >= $(posts).last().prop('id')) {
            behind_by++;
            return true;
        }
        posts.push(post);

        //console.log(post);
        var postelem = elem('li').addClass('post');
        postelem.addClass(post.type);
        postelem.attr('id', 'post_' + post.id);

        var scan = [];

        // Common metadata
        var meta = elem('div').addClass('meta');
        meta.append(elem('a')
            .addClass('blog_name')
            .text(post.blog_name)
            .attr('href', post.post_url)
        );
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
        buttons = elem('div').addClass('buttons');
        if (post.note_count) {
            buttons.append(elem('a')
                .addClass('note_count')
                .text(post.note_count)
            );
        }
        // TODO: don't show like / reblog buttons if it's your own post
        if (true) {
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
            buttons.append(elem('a')
                .addClass('reblog')
                .text('Reblog')
            );
        }
        buttons.append(elem('a')
            .addClass('info')
            .text('Info')
        );
        meta.append(buttons);
        postelem.append(meta);

        // Text
        if (post.type == 'text') {
            if (post.title) {
                postelem.append(elem('h2').text(post.title));
                scan.push(post.title);
            }
            postelem.append(elem('div').addClass('body').html(post.body));
            scan.push(post.body);
        }

        // Photo
        else if (post.type == 'photo') {
            var photos = elem('div').addClass('photos');
            var row = elem('div').addClass('row');
            var last_row = 0;
            $.each(post.photos, function(ph, photo) {
                // Photoset logic
                if (post.photoset_layout) {
                    layout = post.photoset_layout;
                }
                else {
                    layout = '1';
                }
                var running_total = 0;
                var running_row = 0;
                while (running_total <= ph) {
                    running_total += parseInt(layout[running_row]);
                    running_row++;
                }
                running_row--;
                if (running_row > last_row) {
                    row.addClass('row-' + layout[last_row]);
                    photos.append(row);
                    row = elem('div').addClass('row');
                }
                last_row = running_row;
                var target_size = {'1': 500 * scale, '2': 245 * scale, '3': 160 * scale}[
                    layout[running_row]
                ];
                var best_photo = best_fit(photo.alt_sizes, target_size);
                var photoelem = elem('img')
                    .attr('src', best_photo.url);
                row.append(photoelem);
            });
            row.addClass('row-' + layout[last_row]);
            photos.append(row);
            postelem.append(photos);
            if (post.caption) {
                postelem.append(elem('div').addClass('caption').html(post.caption));
                scan.push(post.caption);
            }
        }

        // Quote
        else if (post.type == 'quote') {
            postelem.append(elem('div').addClass('quote').html(post.text));
            scan.push(post.text);
            if (post.source) {
                postelem.append(elem('div').addClass('source').html(post.source));
                scan.push(post.source);
            }
        }

        // Link
        else if (post.type == 'link') {
            var anchor = elem('a').addClass('link').attr('href', post.url);
            if (post.title) {
                anchor.text(post.title);
            }
            else {
                anchor.text(post.url);
            }
            scan.push(post.title);
            scan.push(post.url);
            postelem.append(anchor);
            if (post.description) {
                postelem.append(elem('div').addClass('description').html(post.description));
                scan.push(post.description);
            }
        }

        // Chat
        else if (post.type == 'chat') {
            if (post.title) {
                postelem.append(elem('h2').addClass('title').text(post.title));
                scan.push(post.title);
            }
            chat = elem('ul').addClass('dialogue');
            $.each(post.dialogue, function(l, line) {
                chat.append(elem('li').addClass('line').text(
                    line.label + " " + line.phrase
                ));
                scan.push(line.label);
                scan.push(line.phrase);
            });
            postelem.append(chat);
        }

        // Audio
        else if (post.type == 'audio') {
            var audiobox = elem('div').addClass('audiobox');
            audiobox.append($(post.player).addClass('player'));
            if (post.album_art) {
                var album_art = elem('img')
                    .addClass('album_art')
                    .attr('src', post.album_art)
                    .click(function() { $(this).toggleClass('expanded'); });
                audiobox.append(album_art);
            }
            if (post.track_name) {
                audiobox.append(
                    elem('p').addClass('track_name').text(post.track_name)
                );
                scan.push(post.track_name);
            }
            if (post.artist) {
                audiobox.append(
                    elem('p').addClass('artist').text(post.artist)
                );
                scan.push(post.artist);
            }
            if (post.album) {
                audiobox.append(
                    elem('p').addClass('album').text(post.album)
                );
                scan.push(post.album);
            }
            postelem.append(audiobox);
            if (post.caption) {
                postelem.append(
                    elem('div').addClass('caption').html(post.caption)
                );
                scan.push(post.caption);
            }
        }

        // Video
        else if (post.type == 'video') {
            // TODO: choose video size intelligently
            var best_player = best_fit(post.player, 500 * scale);
            postelem.append($(best_player.embed_code).addClass('player'));
            if (post.caption) {
                postelem.append(
                    elem('div').addClass('caption').html(post.caption)
                );
                scan.push(post.caption);
            }
        }

        // Answer
        else if (post.type == 'answer') {
            var answerbox = elem('div').addClass('answerbox');
            answerbox.append(elem('p').addClass('question').text(post.question));
            var asking = elem('p').addClass('asking');
            asking.append(elem('img')
                .addClass('asking_avatar')
                .attr('src', (post.asking_name == 'Anonymous') ?
                    ('http://assets.tumblr.com/images/anonymous_avatar_24.gif') :
                    ('http://api.tumblr.com/v2/blog/'
                        + post.asking_name
                        + '.tumblr.com/avatar/24')
                )
            );
            asking_name = elem('a')
                .addClass('asking_name')
                .text(post.asking_name);
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
            postelem.append(elem('div').addClass('answer').html(post.answer));
            scan.push(post.answer);

        }
        
        // ???
        else {
            postelem.append(elem('i').text(
                "Sorry, I don't know how to render " + post.type + " posts yet."
            ));
        }
        
        // Check for blacklisted keywords
        keywords = [];
        blacklist = true;
        notification = true;
        $.each(scan, function(s, scan_element) {
            $.each(rules, function(r, rule) {
                var kw = rule.keyword;
                if (rule.whole_word) {
                    kw = new RegExp('\\b' + kw + '\\b', 'i');
                    rule.regex = true;
                }
                if ((rule.regex && scan_element.search(kw) >= 0) ||
                    (!rule.regex && scan_element.toLowerCase().indexOf(kw.toLowerCase()) >= 0)) {
                    // Post contains a whitelisted keyword
                    if (!rule.blacklist) {
                        blacklist = false;
                        return false;
                    }
                    if (!rule.show_notification) {
                        notification = false;
                    }
                    if (keywords.indexOf(rule.keyword) == -1) {
                        keywords.push(rule.keyword);
                    }
                }
            });
        });
        if (keywords.length && blacklist && notification) {
            postelem.addClass('blacklisted');
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
            if (touchscreen) {
                console.log('hmm');
                postelem.on('touchstart', touchstart);
                postelem.on('touchend', touchend);
            }
            else {
                notification.attr('onclick', 'unhide(this)');
            }
            postelem.append(notification);
        }

        // Append element, unless it got blacklisted by a no-notification keyword
        if (!keywords.length || notification) {
            posts_elem.append(postelem);
        }
    });
    $('#middle > div > #posts').append(posts_elem.children());

    if ($('#load_more').hasClass('loading')) {
        $('#load_more').text('Load more');
        $('#load_more').removeClass('loading');
    }
}

function touchstart(e) {
    $('body').css('-webkit-user-select', 'none');
    unhiding = setTimeout(function() {
        var prog = $(e.currentTarget).find('.progress');
        prog.stop()
            .css('opacity', .25)
            .animate(
                {width: '100%'},
                1000,
                function() {
                    unhide(e.currentTarget);
                    $('body').css('-webkit-user-select', 'text');
                    $(e.currentTarget).off('touchstart').off('touchend');
                }
            );
    }, 50);
    //checktouch = setInterval(function() {
        
}

function touchend(e) {
    $('body').css('-webkit-user-select', 'text');
    console.log(e);
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
    post.children().animate(
        {opacity: 0},
        500,
        function() {
            post.removeClass('blacklisted');
            post.children().css('opacity', 0).animate({opacity: 1}, 600);
        }
    );
}

function apicall(url, data, options) {
    var _data = $.extend({
        oauth_body_hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk='
    }, data);
    var _options = $.extend({
        url: url,
        data: _data,
        dataType: 'jsonp',
        jsonp: false,
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
        callback: 'cb',
        reblog_info: 'true',
        notes_info: 'true'
    }, data);
    //apicall('http://api.tumblr.com/v2/user/dashboard', _data, options);
    apicall('/static/js/testdata.js', _data, options);
}

function like(data, options) {
    var cb = 'liked_' + data.id;
    var id = data.id;
    window[cb] = function(data) {
        if (data.meta.status == 200) {
            $('#post_' + id).find('.like').toggleClass('liked');
        }
    }
    var _data = $.extend({
        callback: cb,
    }, data);
    mode = $('#post_' + id).find('.like').hasClass('liked') ? 'unlike' : 'like';
    apicall('http://api.tumblr.com/v2/user/' + mode, _data, options);
}

function load_more() {
    dashboard({
        offset: $('#posts').children().length + behind_by * 2
    });
    $('#load_more').text('Loading...');
    $('#load_more').addClass('loading');
}

$(function() {
    scale = Math.min(500, screen.width) / 500;
    touchscreen = 'ontouchstart' in window;
    $('#middle > div').html('<div id="posts"></div>');
    posts = [];
    behind_by = 0;
    dashboard();
    $('#new').addClass('dropdown').addClass('dropdown-tip');
    $('#new ul').addClass('dropdown-menu');
    $('#new').before('<a class="js" id="new-link" data-dropdown="#new">New</a>');;
});
