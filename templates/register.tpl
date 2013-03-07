{% extends "base.tpl" %}

{% block content %}
<form method="post">
    <p>Because Washboard runs in your browser, we need you to 
       <a href="http://www.tumblr.com/oauth/register"><strong>register your own app.</strong></a></p>
    <p>Use "<strong>My Washboard</strong>" as the name, 
           "<strong>{{ BASE_URL }}</strong>" as the website, and
           "<strong>{{ BASE_URL }}callback</strong>" as the default callback URL.
       The rest of the fields can be left blank.</p>
    <p>After you've registered your app, enter your OAuth Consumer Key and Secret Key in the fields below.</p>
    <fieldset id="key_field">
        {% csrf_token %}
        {{ form.api_key }}
        {{ form.api_secret }}
    </fieldset>
    <p>Then choose a password for Washboard (don't reuse your Tumblr password) and you'll be good to go!</p>
    <fieldset id="password_field">
        {{ form.password }}
    </fieldset>
    <fieldset id="submit_field">
        <input type="submit" />
    </fieldset>
</fieldset></form>
{% endblock %}
