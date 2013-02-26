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
<p><a href="http://www.tumblr.com/oauth/register">Register an application here.</a> Use "<strong>My Washboard</strong>" as the name, "<strong>{{ BASE_URL }}</strong>" as the website, and "<strong>{{ BASE_URL }}register/callback</strong>" as the default callback URL.</p>

<form action="app" method="post"><fieldset>
    {% csrf_token %}
    {{ form.api_key }}
    {{ form.api_secret }}
    <input type="submit" />
</fieldset></form>
