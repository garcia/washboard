{% extends "base.tpl" %}

{% block content %}
<h1>Step 1: register an application</h1>

<form method="post">
    <p><a href="http://www.tumblr.com/oauth/register">Register an application here.</a> Use "<strong>My Washboard</strong>" as the name, "<strong>{{ BASE_URL }}</strong>" as the website, and "<strong>{{ BASE_URL }}callback</strong>" as the default callback URL.</p>
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
