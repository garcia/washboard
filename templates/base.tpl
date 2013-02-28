{% load static %}
<!DOCTYPE html> 
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<meta name="viewport" content="initial-scale=1, minimum-scale=1" />
<title>{% if title %}{{title}} &mdash; {% endif %}Washboard</title>
<link rel="stylesheet" type="text/css" href="{% static "css/washboard.css" %}" />
<script type="text/javascript" src="{% static "js/jquery.min.js" %}"></script>
<script type="text/javascript" src="{% static "js/jquery.fix.clone.js" %}"></script>
{% block head %}{% endblock %}

<div id="top" class="wrapper">
    <div>
    </div>
</div>

<div id="middle" class="wrapper">
    <div>
        <div id="content">
            {% block content %}{% endblock %}
        </div>
    </div>
</div>

<div id="bottom" class="wrapper">
    <div>
    </div>
</div>
