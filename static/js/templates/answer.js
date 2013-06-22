function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n<div class=\"answerbox\">\n    <p class=\"question\">";
  if (stack1 = helpers.question) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.question; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</p>\n    <p class=\"asking\">\n        <img class=\"asking_avatar\" src=\""
    + escapeExpression(((stack1 = depth1.asking_avatar),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" alt=\"";
  if (stack2 = helpers.asking_name) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.asking_name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "'s avatar\" />\n        ";
  stack2 = helpers['if'].call(depth0, depth0.asking_url, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </p>\n</div>\n<div class=\"answer\">";
  if (stack2 = helpers.answer) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.answer; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</div>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <a class=\"asking_name\" href=\"";
  if (stack1 = helpers.asking_url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.asking_url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.asking_name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.asking_name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n        ";
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <a class=\"asking_name anonymous\">";
  if (stack1 = helpers.asking_name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.asking_name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n        ";
  return buffer;
  }

  stack1 = helpers['with'].call(depth0, depth0.post, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  return buffer;
  }