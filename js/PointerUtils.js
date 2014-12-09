/*
 this doesn't provide any relative coordinates - it just tells how they change
*/
var PointerManager = function(downElement, upElement)
{
 if (!downElement) downElement = document;
 if (!upElement) upElement = document;

 this.down = false;
 this.startx = -1; this.starty = -1;
 this.px = -1; this.py = -1;
 this.scale = 1;
 
 this.downElement = downElement;
 this.upElement = upElement;

 this._onStart = this.onStart.bind(this);
 this._onMove = this.onMove.bind(this);
 this._onEnd = this.onEnd.bind(this);
};
PointerManager.prototype.setScale = function(scale)
{
 this.scale = scale;
};
PointerManager.prototype.enable = function()
{
 this.downElement.addEventListener('touchstart', this._onStart);
};
PointerManager.prototype.disable = function()
{
 this.downElement.removeEventListener('touchstart', this._onStart);
 this.clearMoveEvents();
};
PointerManager.prototype.clearMoveEvents = function()
{
 this.upElement.removeEventListener('touchmove', this._onMove);
 this.upElement.removeEventListener('touchend', this._onEnd);
 this.upElement.removeEventListener('touchleave', this._onEnd);
 this.upElement.removeEventListener('touchcancel', this._onEnd);
};
PointerManager.prototype.clear = function()
{
 this.px = this.py = -1;
 this.down = false;
};
PointerManager.prototype.onStart = function(event)
{
 if (this.down || !event.changedTouches.length) return;

 this.down = true; this.touchId = event.changedTouches[0].identifier;

 this.startx = event.changedTouches[0].pageX/this.scale; this.starty = event.changedTouches[0].pageY/this.scale;
 this.upElement.addEventListener('touchmove', this._onMove);
 this.upElement.addEventListener('touchend', this._onEnd);
 this.upElement.addEventListener('touchleave', this._onEnd);
 this.upElement.addEventListener('touchcancel', this._onEnd);
 this.onMove(event);
};
PointerManager.prototype.onMove = function(event)
{
 for(var t=0;t<event.targetTouches.length;t++) 
 if (event.targetTouches[t].identifier == this.touchId)
 {
  this.px = event.targetTouches[t].pageX/this.scale; this.py = event.targetTouches[t].pageY/this.scale;
 }
 event.preventDefault();
};
PointerManager.prototype.onEnd = function(event)
{
 this.down = false;
 this.clearMoveEvents();
 event.preventDefault();
};
PointerManager.prototype.query = function(event)
{
 if (this.px!=-1)
 {
  var ret = {startx: this.startx, starty: this.starty, x: this.px-this.startx, y: this.py-this.starty};
  if (!this.down) //because we want to know the last position it had
  {
   this.px = this.py = -1;
   ret.last = true;
  }
  return ret;
 }
};