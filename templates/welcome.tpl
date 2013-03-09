{% extends "base.tpl" %}

{% block content %}
<form action="/login" method="POST">
    <fieldset>
        {% csrf_token %}
        {{ form.username }}
        {{ form.password }}
        <input type="submit" />
    </fieldset>
</form>

<p>TODO: site description</p>
{% endblock %}
