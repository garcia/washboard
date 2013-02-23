<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<title>{{ title }} &mdash; Washboard</title>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<h1>Step 1: register an application</h1>
<p><a href="http://www.tumblr.com/oauth/register">Register an application here.</a> Use "<strong>My Washboard</strong>" as the name, "<strong>{{ BASE_URL }}</strong>" as the website, and "<strong>{{ BASE_URL }}callback</strong>" as the default callback URL.</p>

<form action="app" method="post"><fieldset>
    {% csrf_token %}
    <input name="api_key" placeholder="OAuth Consumer Key" /><br/>
    <input name="api_secret" placeholder="Secret Key" /><br/>
    <input type="submit" />
</fieldset></form>
