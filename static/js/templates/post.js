function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <span class=\"reblogged_text\">&nbsp;reblogged&nbsp;</span>\n        <a class=\"reblogged_from_name\" href=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.reblogged_from_url)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n            "
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.reblogged_from_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n        </a>\n        ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"tags\">\n        ";
  stack1 = helpers.each.call(depth0, depth0.tags, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n    ";
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <a ";
  stack1 = helpers['if'].call(depth0, depth0.featured, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "href=\"/tagged/";
  if (stack1 = helpers.safe_tag) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.safe_tag; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">#";
  if (stack1 = helpers.tag) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.tag; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n        ";
  return buffer;
  }
function program5(depth0,data) {
  
  
  return "class=\"featured\" ";
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <a class=\"reply js fa fa-lg fa-reply\" aria-label=\"Reply\" onclick=\"Washboard.reply("
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ")\"></a>\n            ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <a class=\"reblog js fa fa-lg fa-retweet\" aria-label=\"Reblog\" onclick=\"Washboard.reblog("
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ")\"></a>\n            ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <a class=\"edit fa fa-lg fa-pencil-square-o\" aria-label=\"Edit\" href=\"http://www.tumblr.com/edit/"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" target=\"_blank\"></a>\n            ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <a class=\"like js";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.liked), {hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += " fa fa-lg fa-heart\" aria-label=\"Like\" onclick=\"Washboard.like("
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ")\"></a>\n            ";
  return buffer;
  }
function program14(depth0,data) {
  
  
  return " liked";
  }

function program16(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n            <a class=\"js note_count\" onclick=\"Washboard.notes("
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ")\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.note_count)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.pluralize || depth0.pluralize),stack1 ? stack1.call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.note_count), "note", "notes", options) : helperMissing.call(depth0, "pluralize", ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.note_count), "note", "notes", options)))
    + "</a>\n            ";
  return buffer;
  }

function program18(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <a class=\"source\" href=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.source_url)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" target=\"_blank\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.source_title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</a>\n            ";
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n    <ol class=\"notes\">\n        ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.notes), {hash:{},inverse:self.noop,fn:self.program(21, program21, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </ol>\n    ";
  return buffer;
  }
function program21(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <li class=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.type; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n            <a href=\"/blog/";
  if (stack1 = helpers.blog_name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.blog_name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.blog_name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.blog_name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n            ";
  stack1 = helpers['if'].call(depth0, depth0.photo_url, {hash:{},inverse:self.program(24, program24, data),fn:self.program(22, program22, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </li>\n        ";
  return buffer;
  }
function program22(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <span class=\"reply-text\"></span>\n            <img src=\"";
  if (stack1 = helpers.photo_url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.photo_url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n            ";
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, depth0.reply_text, {hash:{},inverse:self.noop,fn:self.program(25, program25, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program25(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <span class=\"reply-text\">";
  if (stack1 = helpers.reply_text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.reply_text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n            ";
  return buffer;
  }

  buffer += "<li class=\"post "
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n    id=\"post_"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n    data-reblog-key=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.reblog_key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n    data-type=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n    <div class=\"meta\">\n        <a class=\"avatar\" href=\"/blog/"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.blog_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n            <img src=\"http://api.tumblr.com/v2/blog/"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.blog_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ".tumblr.com/avatar/64\" alt=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.blog_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'s avatar\" />\n        </a>\n        <a class=\"blog_name\" href=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.post_url)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.blog_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</a>\n        ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.reblogged_from_name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </div>\n    \n    ";
  if (stack2 = helpers.inner_html) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.inner_html; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n\n    ";
  stack2 = helpers['if'].call(depth0, depth0.tags, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n\n    <div class=\"actions\">\n        <div class=\"buttons\">\n            <a class=\"info js fa fa-lg fa-info-circle\" aria-label=\"Info\" data-dropdown=\"#info_"
    + escapeExpression(((stack1 = ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></a>\n            ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.can_reply), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n            ";
  stack2 = helpers['if'].call(depth0, depth0.rebloggable, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n            ";
  stack2 = helpers['if'].call(depth0, depth0.mine, {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        </div>\n        <div class=\"not-buttons\">\n            ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.note_count), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n            ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.source_url), {hash:{},inverse:self.noop,fn:self.program(18, program18, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        </div>\n    </div>\n\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.post),stack1 == null || stack1 === false ? stack1 : stack1.notes), {hash:{},inverse:self.noop,fn:self.program(20, program20, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</li>\n\n";
  return buffer;
  }