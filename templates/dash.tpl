{% load static %}
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<meta name="viewport" content="initial-scale=1, minimum-scale=1" />
<title>Washboard</title>
<link rel="stylesheet" type="text/css" href="{% static "css/dash.css" %}" />
<script type="text/javascript" src="{% static "js/jquery.min.js" %}"></script>
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

{% if messages %}
<ul class="messages">
    {% for message in messages %}
    <li{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
    {% endfor %}
</ul>
{% endif %}
