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
                <div class="show_notification">Show notification</div>
                <div class="whole_word">Whole word</div>
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
                <div class="whole_word">{{ rule.whole_word }}</div>
                <div class="regex">{{ rule.regex }}</div>
                <div class="blacklist" style="display: none">{{ rule.blacklist }}</div>
            </div>
            {% endfor %}
            <div class="rule add">
                <div class="label" onclick="javascript:add_rule()">
                    Add rule
                </div>
            </div>
            <div class="rule submit">
                <input type="submit" />
            </div>
        </div>
    </fieldset>
</form>
{% endblock %}
