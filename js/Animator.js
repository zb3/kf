/*
 - info about animation is stored in [name]-playing class
 - !important is not preserved for animated object properties
 - -playing definitions must exist before initialization of this class (for performance reasons)
 - only one animation for an element at a time is supported, so separate the elements, this also gives us order of animations
*/
kf.Animator = function()
{
 this.constructor.instances++;

 this.isWebkit = window.CSSRule.WEBKIT_KEYFRAMES_RULE; //this is not something I'd want in the code, sadly, it has to be there...
 this.ruleFor = {};
 this.fillModeFor = {};
 this.__indexRules();

 //ok, so this is for new
 this.keyframeStyleSheet = this.__createKeyframesStyleSheet();

 this.createdRules = 0;

 this.handleEnd = this._handleEnd.bind(this);

 this.animatedElements = new Map();

 this.freeRules = [];
};
kf.Animator.instances = 0;
kf.Animator.prototype.__createKeyframesStyleSheet = function()
{
 var nel = document.createElement('style');
 document.body.appendChild(nel);
 return document.styleSheets[document.styleSheets.length-1];
};
kf.Animator.prototype.__indexRules = function()
{
 var ts, tr, matches, name, tm;
 
 //index keyframe rules
 for(ts=0;ts<document.styleSheets.length;ts++)
 for(tr=0;tr<document.styleSheets[ts].cssRules.length;tr++)
 if (document.styleSheets[ts].cssRules[tr].type == (window.CSSRule.KEYFRAMES_RULE || window.CSSRule.WEBKIT_KEYFRAMES_RULE))
 {
  this.ruleFor[document.styleSheets[ts].cssRules[tr].name] = document.styleSheets[ts].cssRules[tr];
 }

 //index fill modes
 for(ts=0;ts<document.styleSheets.length;ts++)
 for(tr=0;tr<document.styleSheets[ts].cssRules.length;tr++)
 {
  matches = document.styleSheets[ts].cssRules[tr].selectorText && document.styleSheets[ts].cssRules[tr].selectorText.match(/\.([a-zA-Z0-9-]*)-playing/g);
  for(tm=0;matches && tm<matches.length;tm++)
  {
   name = matches[tm].slice(1, -8);
   if (document.styleSheets[ts].cssRules[tr].style[this.isWebkit?'webkitAnimationFillMode':'animationFillMode'])
   this.fillModeFor[name] = document.styleSheets[ts].cssRules[tr].style[this.isWebkit?'webkitAnimationFillMode':'animationFillMode'];
  }
 }
};
kf.Animator.prototype.__newRule = function()
{
 var thisRule;
 if (this.freeRules.length)
 {
  thisRule = this.freeRules.pop();
  var tx, rule_keys = [];
  for(tx=0;tx<this.ruleFor[thisRule].cssRules.length;tx++)
  rule_keys.push(this.ruleFor[thisRule].cssRules[tx].keyText);

  for(tx=0;tx<rule_keys.length;tx++)
  this.ruleFor[thisRule].deleteRule(rule_keys[tx]);
 }
 else
 {
  thisRule = 'newrule'+this.constructor.instances+this.createdRules;
  this.keyframeStyleSheet.insertRule('@'+(this.isWebkit?'-webkit-':'')+'keyframes '+thisRule+' {}', this.createdRules);
  this.ruleFor[thisRule] = this.keyframeStyleSheet.cssRules[this.createdRules++];
 }
 return thisRule;
};
kf.Animator.prototype.createAnimation = function(elements, animationData, callbacks)
{
 var tx;

 for(tx=0;tx<elements.length;tx++) //we check now so that we don't have to create the new rule if not needed
 {
  if (this.animatedElements.has(elements[tx])) throw 'element already animated';
 }

 var ruleName = animationData.name;

 if (typeof animationData.keyframes === 'string')
 {
  animationData.keyframes = ['100%{'+animationData.keyframes+'}'];
 }
 if (animationData.keyframes && animationData.keyframes.length)
 { 
  ruleName = this.__newRule();
 
  for(tx=0;tx<animationData.keyframes.length;tx++)
  {
   (this.ruleFor[ruleName].appendRule || this.ruleFor[ruleName].insertRule).apply(this.ruleFor[ruleName], [animationData.keyframes[tx]]);
  }
 }
 
 if (!Array.isArray(elements))
 elements = [elements];
  
 for(tx=0;tx<elements.length;tx++)
 {
  this.animatedElements.set(elements[tx], [ruleName, callbacks]);

  elements[tx].addEventListener('animationend', this.handleEnd);
  elements[tx].addEventListener('webkitAnimationEnd', this.handleEnd);

  elements[tx].style.animationName = ruleName;
  elements[tx].style.webkitAnimationName = ruleName;

  elements[tx].classList.add(ruleName+'-playing');

  if (animationData.duration)
  {
   elements[tx].style.animationDuration = animationData.duration;
   elements[tx].style.webkitAnimationDuration = animationData.duration;
  }

  if (animationData.iterationCount)
  {
   elements[tx].style.animationIterationCount = animationData.iterationCount;
   elements[tx].style.webkitAnimationIterationCount = animationData.iterationCount;
  }

  if (animationData.timingFunction)
  {
   elements[tx].style.animationTimingFunction = animationData.timingFunction;
   elements[tx].style.webkitAnimationTimingFunction = animationData.timingFunction;
  }

  if (animationData.fillMode)
  {
   elements[tx].style.animationFillMode = animationData.fillMode;
   elements[tx].style.webkitAnimationFillMode = animationData.fillMode;
  }

  elements[tx].style.animationPlayState = 'running'; //should be a global state, but not so sure
  elements[tx].style.webkitAnimationPlayState = 'running';
 }
};
kf.Animator.prototype.pauseAnimation = function(element, data)
{
 if (data[1].hasOwnProperty('onpause'))
 {
  data[1].onpause();
 }
 element.style.animationPlayState = 'paused';
 element.style.webkitAnimationPlayState = 'paused';
};
kf.Animator.prototype.resumeAnimation = function(element, data)
{
 if (data[1].hasOwnProperty('onresume'))
 {
  data[1].onresume();
 }
 element.style.animationPlayState = 'running';
 element.style.webkitAnimationPlayState = 'running';
};
kf.Animator.prototype.clearAnimation = function(element, data)
{
 var name = data[0];
 this.animatedElements.delete(element);
 element.addEventListener('animationend', this.handleEnd);
 element.addEventListener('webkitAnimationEnd', this.handleEnd);

 if (name.slice(0, 7)=='newrule')
 {
  this.freeRules.push(name);
 }

 element.classList.remove(name+'-playing');
 element.style.animation = '';
 element.style.webkitAnimation = '';
};
kf.Animator.prototype._setElementState = function(element, data)
{
 var fillMode = element.style[this.isWebkit?'webkitAnimationFillMode':'animationFillMode'] || this.fillModeFor[data[0]], tx, rule;
 if (fillMode=='forwards' || fillMode=='both')
 {
  rule = this.ruleFor[data[0]].findRule('100%') 
  for(tx=0;tx<rule.style.length;tx++)
  element.style.setProperty(rule.style[tx], rule.style.getPropertyValue(rule.style[tx]));
 }
};
kf.Animator.prototype.skipAnimation = function(element, data)
{
 this._setElementState(element, data);
 this.clearAnimation(element, data);

 if (data[1].onend)
 {
  data[1].onend();
 }

};
kf.Animator.prototype.abortAnimation = function(element, data)
{
 this.clearAnimation(element, data);

 if (data[1].onabort)
 {
  data[1].onabort();
 }
};
kf.Animator.prototype._handleEnd = function(event)
{
 var element = event.target;

 var data = this.animatedElements.get(element);

 this._setElementState(element, data);
 this.clearAnimation(element, data);

 if (data[1].onend)
 {
  data[1].onend();
 }
};


kf.Animator.prototype.skipAnimationsEach = function(data, element)
{
 this.skipAnimation(element, data);
};
kf.Animator.prototype.skipAnimations = function()
{
 this.animatedElements.forEach(this.skipAnimationsEach.bind(this));
};
kf.Animator.prototype.pauseAnimationsEach = function(data, element)
{
 this.pauseAnimation(element, data);
};
kf.Animator.prototype.pauseAnimations = function()
{
 this.animatedElements.forEach(this.pauseAnimationsEach.bind(this));
};
kf.Animator.prototype.resumeAnimationsEach = function(data, element)
{
 this.resumeAnimation(element, data);
};
kf.Animator.prototype.resumeAnimations = function()
{
 this.animatedElements.forEach(this.resumeAnimationsEach.bind(this));
};
kf.Animator.prototype.abortAnimationsEach = function(data, element)
{
 this.abortAnimation(element, data);
};
kf.Animator.prototype.abortAnimations = function()
{
 this.animatedElements.forEach(this.abortAnimationsEach.bind(this));
};