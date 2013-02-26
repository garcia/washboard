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

<h1>Washboard</h1>

<form action="/login" method="POST">
    <fieldset>
        {% csrf_token %}
        {{ form.username }}
        {{ form.password }}
        <input type="submit" />
    </fieldset>
</form>

<p>TODO: site description</p>
