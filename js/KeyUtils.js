var KeyManager = function(func, downElement, upElement)
{
 if (!downElement) downElement = document;
 if (!upElement) upElement = document;

 this.getName = func;
 this.keyDownInternal = {}; //live
 this.eventQueue = {}; //live
 this.keyDownHash = {}; //for client
 
 downElement.addEventListener('keydown', this.onKeyDown.bind(this));
 upElement.addEventListener('keyup', this.onKeyUp.bind(this));
};
KeyManager.prototype.onKeyDown = function(event)
{
 var name = this.getName(event.keyCode);
 if (!name) return;
 event.preventDefault();

 if (this.keyDownInternal[name]) return;
 
 this.keyDownInternal[name] = true;

 if (!Array.isArray(this.eventQueue[name])) this.eventQueue[name] = [];
 this.eventQueue[name].push(true);

};
KeyManager.prototype.onKeyUp = function(event)
{
 var name = this.getName(event.keyCode);
 if (!name) return;
 if (!this.keyDownInternal[name]) return;
 
 this.keyDownInternal[name] = false;

};
KeyManager.prototype.queryKeys = function(event)
{
 var t, ok = Object.keys(this.eventQueue);
 for(t=0;t<ok.length;t++)
 {
  this.keyDownHash[ok[t]] = this.keyDownInternal[ok[t]];

  if (this.eventQueue[ok[t]] && this.eventQueue[ok[t]].length)
  this.keyDownHash[ok[t]] = this.eventQueue[ok[t]].shift();
 }
 return this.keyDownHash;
};
KeyManager.prototype.clearKeys = function(event)
{
 this.keyDownInternal = {}; //live
 this.eventQueue = {}; //live
 this.keyDownHash = {}; //for client
};
var KeyFilterInterval = function(t1, t2)
{
 if (!t1) t1=0;
 this.t1 = t1; this.t2 = t2;
 this.keyState = {};
};
KeyFilterInterval.prototype.clear = function()
{
 this.keyState = {};
};
KeyFilterInterval.prototype.queryState = function(name, current)
{
 if (this.keyState[name]===undefined || !current) this.keyState[name] = -1;
 if (current)
 {
  if (!this.t1)
  this.keyState[name]++;
  else if (this.keyState[name]<this.t1)
  this.keyState[name]++;
  else
  {
   this.keyState[name] = this.t1+(this.keyState[name]+1-this.t1)%this.t2;
  }
 }
 return !this.keyState[name] || this.keyState[name]==this.t1;
};