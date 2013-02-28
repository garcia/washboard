{% extends "base.tpl" %}
{% load static %}

{% block head %}
<link rel="stylesheet" type="text/css" href="{% static "css/rules.css" %}" />
<link rel="stylesheet" type="text/css" href="{% static "css/ios-checkboxes.css" %}" />
<script type="text/javascript" src="{% static "js/rules.js" %}"></script>
<script type="text/javascript" src="{% static "js/ios-checkboxes.js" %}"></script>
<!--<script type="text/javascript">
$(document).ready(function() {
    $(':checkbox').iphoneStyle();
});
</script>-->
{% endblock %}

{% block title %}
Blacklist rules
{% endblock %}

{% block content %}
<form method="post">
    <fieldset>
        {% csrf_token %}
        <div id="rules">
            <div class="rule header">
                <div class="keyword">Keyword</div>
                <div class="show_notification">Notification</div>
                <div class="show_user">Show user</div>
                <div class="show_keyword">Show keyword</div>
                <div class="scan_tags">Scan tags</div>
                <div class="scan_post">Scan post</div>
                <div class="regex">Regex</div>
            </div>
            {% for rule in rules %}
            <div class="rule{% if not rule.instance.keyword %} defaults{% endif %}">
                {% if not rule.instance.keyword %}
                <div class="label">Default values</div>
                <div class="keyword" style="display: none">{{ rule.keyword }}</div>
                {% else %}
                <div class="keyword">{{ rule.keyword }}</div>
                {% endif %}
                <div class="show_notification">{{ rule.show_notification }}</div>
                <div class="show_user">{{ rule.show_user }}</div>
                <div class="show_keyword">{{ rule.show_keyword }}</div>
                <div class="scan_tags">{{ rule.scan_tags }}</div>
                <div class="scan_post">{{ rule.scan_post }}</div>
                <div class="regex">{{ rule.regex }}</div>
            </div>
            {% endfor %}
            <div class="rule add">
                <div class="label" onclick="javascript:add_rule()">
                    Add rule
                </div>
            </div>
        </div>
    </fieldset>
</form>
{% endblock %}
