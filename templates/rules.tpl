{% load static %}
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<meta name="viewport" content="width=512, initial-scale=1, minimum-scale=1" />
<title>Washboard</title>
<link rel="stylesheet" type="text/css" href="{% static "rules.css" %}" />
<script type="text/javascript" src="{% static "jquery.min.js" %}"></script>
<script type="text/javascript" src="{% static "jquery.fix.clone.js" %}"></script>
<script type="text/javascript" src="{% static "rules.js" %}"></script>

{% if messages %}
<ul class="messages">
    {% for message in messages %}
    <li{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
    {% endfor %}
</ul>
{% endif %}

{% if rules %}
<form method="post">
    <fieldset>
        {% csrf_token %}
        <table id="rules">
            <tr>
                <th>Keyword</th>
                <th>Show notification</th>
                <th>Show user</th>
                <th>Show keyword</th>
                <th>Scan tags</th>
                <th>Scan post</th>
                <th>Regex</th>
            </tr>
            {% for rule in rules %}
            <tr class="rule">
                {% if not rule.instance.keyword %}
                <td class="defaults">Default values</td>
                <td class="keyword" style="display: none">{{ rule.keyword }}</td>
                {% else %}
                <td class="keyword">{{ rule.keyword }}</td>
                {% endif %}
                <td class="show_notification">{{ rule.show_notification }}</td>
                <td class="show_user">{{ rule.show_user }}</td>
                <td class="show_keyword">{{ rule.show_keyword }}</td>
                <td class="scan_tags">{{ rule.scan_tags }}</td>
                <td class="scan_post">{{ rule.scan_post }}</td>
                <td class="regex">{{ rule.regex }}</td>
            </tr>
            {% endfor %}
        </table>
        <a href="javascript:add_rule()">Add rule</a>
    </fieldset>
</form>
{% endif %}
