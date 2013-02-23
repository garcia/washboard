<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<title>{{ title }} &mdash; Washboard</title>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<h1>Step 2: choose a password</h1>
<p>You're almost done! Just choose a password (ideally not the same password you use for Tumblr) and you're all set.</p>

<form action="finish" method="post"><fieldset>
    {% csrf_token %}
    <input type="hidden" name="api_key" value="{{ api_key }}" />
    <input type="hidden" name="api_secret" value="{{ api_secret }}" />
    <input type="hidden" name="token_key" value="{{ token_key }}" />
    <input type="hidden" name="token_secret" value="{{ token_secret }}" />
    <input name="name" readonly value="{{ name }}" /><br/>
    <input type="password" name="password" placeholder="Password" /><br/>
    <input type="submit" />
</fieldset></form>
