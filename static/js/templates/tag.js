function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return " bookmarked";
  }

  buffer += "<li id=\"tag\">\n    <h2 id=\"tag-name\">#";
  if (stack1 = helpers.tag) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.tag; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h2>\n    <div id=\"tag-controls\">\n        <button id=\"bookmark-button\" class=\"shiny";
  stack1 = helpers['if'].call(depth0, depth0.bookmarked, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" onclick=\"Washboard.bookmark()\">Bookmark</button>\n    </div>\n</li>\n";
  return buffer;
  }