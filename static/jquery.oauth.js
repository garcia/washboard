(function (window, document, $, undefined) {
    if (!$.Deferred) throw 'jQuery 1.5 is required to use the jQuery.oauth script!';

    function require(name, url) {
        if (window[name] === undefined)
            return $.ajax({ type: 'GET', cache: true, dataType: 'script', url: url });
    }

    $.oauth = function (options) {
        var d = $.Deferred();

        $.when(
            require('str_sha1', 'http://oauth.googlecode.com/svn/code/javascript/sha1.js'),
            require('OAuth', 'http://oauth.googlecode.com/svn/code/javascript/oauth.js')
        ).then(function () {
            $.ajax(addOAuthStuffs(options)).done(d.resolve);
        });

        return $.extend({
            success: function () { return this.then.apply(this, arguments); },
            complete: function () { return this.done.apply(this, arguments); },
            error: function () { return this.fail.apply(this, arguments); }
        }, d.promise());
    };

    function addOAuthStuffs(options) {
        options = $.extend({ type: 'GET', consumerKey: '', consumerSecret: '', tokenSecret: '', url: '' }, options);
        if (options.data) {
            if (typeof options.data !== "string")
                options.data = $.param(options.data);
        }

        if (options.url.indexOf(':') == -1) {
            if (options.url.substr(0, 1) == '/') {
                options.url = location.protocol + '//' + location.host + options.url;
            } else {
                options.url = location.href.substr(0, location.href.lastIndexOf('/') + 1) + options.url;
            }
        }

        var message = { action: options.url + (options.data && options.data.length > 0 ? '?' + options.data : ''),
            method: options.type, parameters: [["oauth_version", "1.0"], ["oauth_consumer_key", options.consumerKey]]
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, { consumerSecret: options.consumerSecret, tokenSecret: options.tokenSecret });

        var parameterMap = OAuth.getParameterMap(message);
        var baseStr = OAuth.decodeForm(OAuth.SignatureMethod.getBaseString(message));
        options.data = baseStr[2][0];

        if (parameterMap.parameters)
            $.each(parameterMap.parameters, function (item, values) {
                return $.each(values, function (subitem, value) {
                    if (value == 'oauth_signature') {
                        options.data += '&oauth_signature=' + escape(values[1]);
                        return false;
                    }
                });
            });

        if (options.url.indexOf('?') > -1)
            options.url = options.url.substr(0, options.url.indexOf('?'));

        options.cache = false;
        return options;
    }
})(window, document, jQuery);