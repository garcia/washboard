{% load static %}
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<title>Washboard</title>
<script type="text/javascript" src="{% static "jquery.min.js" %}"></script>
<script type="text/javascript" src="{% static "sha1.js" %}"></script>
<script type="text/javascript" src="{% static "oauth.js" %}"></script>
<script type="text/javascript" src="{% static "jquery.oauth.js" %}"></script>
<script type="text/javascript">
API_KEY         = "{{ api_key }}"
API_SECRET      = "{{ api_secret }}"
TOKEN_KEY       = "{{ token_key }}"
TOKEN_SECRET    = "{{ token_secret }}"

function cb(data) {
    console.log(data);
}

$.oauth({
    url: 'http://api.tumblr.com/v2/user/dashboard',
    data: {callback: 'cb', oauth_body_hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk='},
    dataType: 'jsonp',
    jsonp: false,
    cache: true,
    consumerKey: API_KEY,
    consumerSecret: API_SECRET,
    token: TOKEN_KEY,
    tokenSecret: TOKEN_SECRET
});

</script>

{% if messages %}
<ul class="messages">
    {% for message in messages %}
    <li{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
    {% endfor %}
</ul>
{% endif %}
