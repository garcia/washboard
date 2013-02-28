/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
	
/*
  A wrapper for JQuery.ajax that provides OAuth signed requests.
 
  To use, call $.oauth and provide a consumerKey and consumerSecret
  in the options.
  
  NOTE: Do not attempt to send any "data" options or parameters
  when sending a DELETE request, as these are removed before 
  sending, invalidating the signature.
 
 */
	 
    (function (window, document, $, undefined) {
    if (!$.Deferred) throw 'jQuery 1.5 is required to use the jQuery.oauth script!';

     
    function require(name, url) {
        if (window[name] === undefined)
            return $.ajax({ type: 'GET', cache: true, dataType: 'script', url: url });
    }
    
    //
    // Add $.oauth function
    //
    $.oauth = function (options) {
        var d = $.Deferred();

        $.ajax(extendOptions(options)).done(d.resolve);

        return $.extend({
            success: function () { return this.then.apply(this, arguments); },
            complete: function () { return this.done.apply(this, arguments); },
            error: function () { return this.fail.apply(this, arguments); }
        }, d.promise());
    };


    //
    // Extend options passed to inner .ajax() method with oAuth requirements
    //
    function extendOptions(options) {
        options = $.extend({ type: 'GET', consumerKey: '', consumerSecret: '', tokenSecret: '', url: '' }, options);

        if (options.data) {
            if (typeof options.data !== "string")
                options.data = $.param(options.data);
        }
        
        //
        // Normalize url
        //
        if (options.url.indexOf(':') == -1) {
            if (options.url.substr(0, 1) == '/') {
                options.url = location.protocol + '//' + location.host + options.url;
            } else {
                options.url = location.href.substr(0, location.href.lastIndexOf('/') + 1) + options.url;
            }
        }

        //
        // Create the oAuth message parameters and sign the message
        //
        var message = { action: options.url + (options.data && options.data.length > 0 ? '?' + options.data : ''),
            method: options.type, parameters: [["oauth_version", "1.0"], ["oauth_consumer_key", options.consumerKey], ["oauth_token", options.token]]
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, { consumerSecret: options.consumerSecret, tokenSecret: options.tokenSecret });
        var parameterMap = OAuth.getParameterMap(message);
        var baseStr = OAuth.decodeForm(OAuth.SignatureMethod.getBaseString(message));
        
        if (options.type === "DELETE"){
        
           //
           // Add Authorization header to the request.
           // We don't use parameters to send oAuth information as DELETE requests
           // cannot carry any parameters.
           //
           var auth =  OAuth.getAuthorizationHeader("", message.parameters)
           options.beforeSend = function(req) {
               req.setRequestHeader('Authorization', auth);
           }
           
        } else {
        
           //
           // For any other request type, merge the oAuth params and
           // the original parameters in the options.data array
           //
           if (parameterMap.parameters){
             options.data = baseStr[2][0];
             $.each(parameterMap.parameters, function (item, values) {
                return $.each(values, function (subitem, value) {
                    if (value == 'oauth_signature') {
                        options.data += '&oauth_signature=' + encodeURIComponent(values[1]);
                        return false;
                    }
                });
             });
           }
        }

        //
        // Strip querystring off the URL
        //
        if (options.url.indexOf('?') > -1)
            options.url = options.url.substr(0, options.url.indexOf('?'));

        return options;
    }
})(window, document, jQuery);
