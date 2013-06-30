function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, functionType="function";

function program1(depth0,data) {
  
  
  return "ontouchstart=\"Washboard.touchstart(this)\" ontouchend=\"Washboard.touchend(this)\"\n    ";
  }

function program3(depth0,data) {
  
  
  return "onclick=\"Washboard.unhide(this)\"";
  }

function program5(depth0,data) {
  
  
  return "Press and hold";
  }

function program7(depth0,data) {
  
  
  return "Click";
  }

  buffer += "<div class=\"notification\"\n    ";
  stack1 = helpers['if'].call(depth0, depth0.touchscreen, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n    <h2>Post blacklisted</h2>\n    <p>";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n    <a class=\"instructions\">\n        ";
  stack1 = helpers['if'].call(depth0, depth0.touchscreen, {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " to unhide\n    </a>\n    <div class=\"progress\"></div>\n</div>\n\n";
  return buffer;
  }