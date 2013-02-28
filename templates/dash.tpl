{% extends "base.tpl" %}
{% load static %}

{% block head %}
<link rel="stylesheet" type="text/css" href="{% static "css/dash.css" %}" />
<script type="text/javascript" src="{% static "js/sha1.js" %}"></script>
<script type="text/javascript" src="{% static "js/oauth.js" %}"></script>
<script type="text/javascript" src="{% static "js/jquery.oauth.js" %}"></script>
<script type="text/javascript" src="{% static "js/json2.js" %}"></script>
<script type="text/javascript">
API_KEY         = "{{ api_key }}"
API_SECRET      = "{{ api_secret }}"
TOKEN_KEY       = "{{ token_key }}"
TOKEN_SECRET    = "{{ token_secret }}"
</script>
<script type="text/javascript" src="{% static "js/dash.js" %}"></script>
{% endblock %}

{% block content %}
<h1>Loading posts...</h1>
{% endblock %}
