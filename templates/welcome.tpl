{% extends "base.tpl" %}
{% load static %}

{% block head %}
<link rel="stylesheet" type="text/css" href="{% static "css/welcome.css" %}" />
{% endblock %}

{% block content %}
<div id="logo">
    <h1>Washboard</h1>
    <h2>for Tumblr</h2>
</div>

<div id="description">
    <p>Washboard is an interface to the Tumblr Dashboard that features keyword blacklisting.
        Think of it as a <a href="http://bjornstar.com/tumblr-savior">Tumblr Savior</a> alternative for mobile devices.</p>
    <p>Signing up is free and only takes a minute, so <a href="/register">what are you waiting for?</a></p>
</p>
</div>

<div id="login">
    <h3>Login</h3>
    <form action="/login" method="POST">
        <fieldset>
            {% csrf_token %}
            {{ form.username }}
            {{ form.password }}
            <input type="submit" value="Go" />
        </fieldset>
    </form>
</div>
{% endblock %}

{% block bottom %}
<ul id="links">
    <li>&copy; <a href="http://grantgarcia.org/">Grant Garcia</a> 2013</li>
    <li><a href="https://github.com/grantgarcia/washboard">Source on GitHub</a></li>
    <li>Built with the <a href="http://www.tumblr.com/docs/en/api/v2">Tumblr API</a></li>
</ul>
{% endblock %}
