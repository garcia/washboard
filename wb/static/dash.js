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
        postelem = $(elem('li')).addClass('post');
        postelem.addClass(post.type);

        // Text posts
        if (post.type == 'text') {
            if (post.title) {
                postelem.append($(elem('h2')).text(post.title));
            }
            postelem.append($(elem('p')).addClass('body').html(post.body));
        }

        // Photo posts
        else if (post.type == 'photo') {
            $.each(post.photos, function(ph, photo) {
                // TODO: photoset layouts
                postelem.append($(elem('img')).attr('src', photo.alt_sizes[0].url));
            });
            if (post.caption) {
                postelem.append($(elem('p')).addClass('caption').html(post.caption));
            }
        }

        // Quote
        if (post.type == 'quote') {
            postelem.append($(elem('p')).addClass('quote').text(post.text));
            if (post.source) {
                postelem.append($(elem('p')).addClass('source').html(post.source));
            }
        }

        // Link
        if (post.type == 'link') {
            var anchor = $(elem('a')).addClass('link').attr('href', post.url);
            if (post.title) {
                anchor.text(post.title);
            }
            else {
                anchor.text(post.url);
            }
            postelem.append(anchor);
            postelem.append($(elem('p')).addClass('description').html(description));
        }

        // Chat
        if (post.type == 'chat') {
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
        
        // ???
        else {
            postelem.append($(elem('strong')).html('Unsupported post type'));
        }
        console.log(postelem);
        posts.append(postelem);
    });
    $('body').append(posts);
}

$.oauth({
    //url: 'http://api.tumblr.com/v2/user/dashboard',
    url: '/static/testdata.js',
    data: {callback: 'cb', oauth_body_hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk='},
    dataType: 'jsonp',
    jsonp: false,
    cache: true,
    consumerKey: API_KEY,
    consumerSecret: API_SECRET,
    token: TOKEN_KEY,
    tokenSecret: TOKEN_SECRET
});
