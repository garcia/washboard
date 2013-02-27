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
        return document.createElement(elem);
    }
    d = data;
    posts = $(elem('ul')).attr('id', 'posts');
    $.each(data.response.posts, function(p, post) {
        var postelem = $(elem('li')).addClass('post');
        postelem.addClass(post.type);

        // Common metadata
        var meta = $(elem('div')).addClass('meta');
        meta.append($(elem('a'))
            .addClass('blog_name')
            .text(post.blog_name)
            .attr('href', post.post_url)
        );
        if (post.reblogged_from_name) {
            meta.append($(elem('span'))
                .addClass('reblogged_text')
                .html('&nbsp;reblogged&nbsp;')
            );
            meta.append($(elem('a'))
                .addClass('reblogged_from_name')
                .text(post.reblogged_from_name)
                .attr('href', post.reblogged_from_url)
            );
        }
        if (post.note_count) {
            meta.append($(elem('a'))
                .addClass('note_count')
                .text(post.note_count)
            );
        }
        // TODO: reblog, like buttons
        postelem.append(meta);

        // Text
        if (post.type == 'text') {
            if (post.title) {
                postelem.append($(elem('h2')).text(post.title));
            }
            postelem.append($(elem('div')).addClass('body').html(post.body));
        }

        // Photo
        else if (post.type == 'photo') {
            var photos = $(elem('div')).addClass('photos');
            var row = $(elem('div')).addClass('row');
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
                    photos.append(row);
                    row = $(elem('div')).addClass('row');
                }
                last_row = running_row;
                var target_size = {'1': 500, '2': 245, '3': 160}[
                    layout[running_row]
                ];
                var best_photo = best_fit(photo.alt_sizes, target_size);
                var photoelem = $(elem('img'))
                    .attr('src', best_photo.url)
                    .attr('width', target_size);
                row.append(photoelem);
            });
            photos.append(row);
            postelem.append(photos);
            if (post.caption) {
                postelem.append($(elem('div')).addClass('caption').html(post.caption));
            }
        }

        // Quote
        else if (post.type == 'quote') {
            postelem.append($(elem('div')).addClass('quote').html(post.text));
            if (post.source) {
                postelem.append($(elem('div')).addClass('source').html(post.source));
            }
        }

        // Link
        else if (post.type == 'link') {
            var anchor = $(elem('a')).addClass('link').attr('href', post.url);
            if (post.title) {
                anchor.text(post.title);
            }
            else {
                anchor.text(post.url);
            }
            postelem.append(anchor);
            postelem.append($(elem('div')).addClass('description').html(post.description));
        }

        // Chat
        else if (post.type == 'chat') {
            if (post.title) {
                postelem.append($(elem('h2')).addClass('title').text(post.title));
            }
            chat = $(elem('ul')).addClass('dialogue');
            $.each(post.dialogue, function(l, line) {
                chat.append($(elem('li')).addClass('line').text(
                    line.label + " " + line.phrase
                ));
            });
            postelem.append(chat);
        }

        // Audio
        else if (post.type == 'audio') {
            var audiobox = $(elem('div')).addClass('audiobox');
            audiobox.append($(post.player).addClass('player'));
            if (post.album_art) {
                audiobox.append(
                    $(elem('img')).addClass('album_art').attr('src', post.album_art)
                );
            }
            if (post.track_name) {
                audiobox.append(
                    $(elem('p')).addClass('track_name').text(post.track_name)
                );
            }
            if (post.artist) {
                audiobox.append(
                    $(elem('p')).addClass('artist').text(post.artist)
                );
            }
            if (post.album) {
                audiobox.append(
                    $(elem('p')).addClass('album').text(post.album)
                );
            }
            postelem.append(audiobox);
            if (post.caption) {
                postelem.append(
                    $(elem('div')).addClass('caption').html(post.caption)
                );
            }
        }

        // Video
        else if (post.type == 'video') {
            // TODO: choose video size intelligently
            var best_player = best_fit(post.player, 500);
            postelem.append($(best_player.embed_code).addClass('player'));
            if (post.caption) {
                postelem.append(
                    $(elem('div')).addClass('caption').html(post.caption)
                );
            }
        }

        // Answer
        else if (post.type == 'answer') {
            var answerbox = $(elem('div')).addClass('answerbox');
            answerbox.append($(elem('p')).addClass('question').text(post.question));
            var asking = $(elem('p')).addClass('asking');
            asking.append($(elem('img'))
                .addClass('asking_avatar')
                .attr('src', (post.asking_name == 'Anonymous') ?
                    ('http://assets.tumblr.com/images/anonymous_avatar_24.gif') :
                    ('http://api.tumblr.com/v2/blog/'
                        + post.asking_name
                        + '.tumblr.com/avatar/24')
                )
            );
            asking_name = $(elem('a'))
                .addClass('asking_name')
                .text(post.asking_name);
            if (post.asking_url) {
                asking_name.attr('href', post.asking_url);
            }
            else {
                asking_name.addClass('anonymous');
            }
            asking.append(asking_name);
            answerbox.append(asking);
            postelem.append(answerbox);
            postelem.append($(elem('div')).addClass('answer').html(post.answer));

        }
        
        // ???
        else {
            postelem.append($(elem('i')).text(
                "Sorry, I don't know how to render " + post.type + " posts yet."
            ));
        }
        posts.append(postelem);
    });
    $('body').append(posts);
}

$.oauth({
    //url: 'http://api.tumblr.com/v2/user/dashboard',
    url: '/static/testdata.js',
    data: {
        callback: 'cb',
        reblog_info: 'true',
        notes_info: 'true',
        oauth_body_hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk='
    },
    dataType: 'jsonp',
    jsonp: false,
    cache: true,
    consumerKey: API_KEY,
    consumerSecret: API_SECRET,
    token: TOKEN_KEY,
    tokenSecret: TOKEN_SECRET
});
