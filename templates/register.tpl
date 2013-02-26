{% load static %}
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<title>Washboard</title>
<script type="text/javascript" src="{% static "jquery.min.js" %}"></script>

{% if messages %}
<ul class="messages">
    {% for message in messages %}
    <li{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
    {% endfor %}
</ul>
{% endif %}

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
