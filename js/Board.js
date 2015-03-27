kf.Board = function(x, y)
{
 this.x = x; this.y = y;
 this.v = [];

 this.reset(x, y);
 
 this.winningGroups = [];
 this.np = null; //primary 
 this.npball = null;
 this.ns = null; //secondary. this is relative to primary
 this.nsball = null;
};
kf.Board.prototype.isOK = function(x, y)
{
 return x>=0 && y>=0 && x<this.x && y<this.y;
};
kf.Board.prototype.isFree = function(x, y)
{
 return !this.v[x][y];
};
kf.Board.prototype.isFirstFree = function() //Other implementations allow it :O
{
 for(var x=0;x<this.x;x++)
 if (!this.isFree(x, 0)) return false;
 return true;
};
kf.Board.prototype.rotate =  function(counter)
{
 var nx = (counter?-1:1)*this.ns[1], ny = (counter?1:-1)*this.ns[0];

 if (this.isOK(this.np[0]+nx, this.np[1]+ny) && this.isFree(this.np[0]+nx, this.np[1]+ny))
 {
  this.ns[0] = nx; this.ns[1] = ny;
 }
 else if (this.isOK(this.np[0]-nx, this.np[1]-ny) && this.isFree(this.np[0]-nx, this.np[1]-ny))
 {
  this.ns[0] = nx; this.ns[1] = ny;
  this.np[0] -= nx; this.np[1] -= ny;
 }
};
kf.Board.prototype.addNew = function(c1, c2)
{
 this.npball = {color: c2, garbage: false, handles: 0, wasSettled: false};
 this.np = [((this.x-1)/2)|0, 1];
 this.nsball = {color: c1, garbage: false, handles: 0, wasSettled: false};
 this.ns = [0, -1];
};
kf.Board.prototype.addGarbage = function(n)
{
 var t, choosefrom = [], choosen = [], random;

 for(t=0;t<this.x;t++)
 if (this.isFree(t, 1))
 choosefrom.push(t);

 while(choosen.length<n && choosefrom.length)
 {
  random = Math.floor(Math.random()*choosefrom.length);
  choosen.push(choosefrom[random]);
  this.v[choosefrom[random]][0] = {color: 0, garbage: true, handles: 0};
  choosefrom.splice(random, 1);
 }

 return choosen;
};

kf.Board.prototype.reset = function(x, y)
{
 this.x = x; this.y = y;
 this.np = this.ns = this.npball = this.nsball = null;
 for(var t=0,t2;t<this.x;t++)
 {
  if (!Array.isArray(this.v[t])) this.v[t] = [];
  for(t2=0;t2<this.y;t2++)
  this.v[t][t2] = null;
 }
};
kf.Board.prototype.placeBalls = function()
{
 this.v[this.np[0]][this.np[1]] = this.npball;
 this.v[this.np[0]+this.ns[0]][this.np[1]+this.ns[1]] = this.nsball;
 this.np = this.ns = this.npball = this.nsball = null;
};
kf.Board.prototype.__appendGarbage = function(group)
{
 var t, x, y, garbage = [];

 for(t=group.length-1;t>=0;t--)
 {
  x = group[t][0]; y = group[t][1];

  if (this.isOK(x-1, y) && !this.isFree(x-1, y) && this.v[x-1][y].garbage && garbage.indexOf(this.v[x-1][y])===-1)
  garbage.push([x-1, y], this.v[x-1][y]);
  if (this.isOK(x+1, y) && !this.isFree(x+1, y) && this.v[x+1][y].garbage && garbage.indexOf(this.v[x+1][y])===-1)
  garbage.push([x+1, y], this.v[x+1][y]);
  if (this.isOK(x, y-1) && !this.isFree(x, y-1) && this.v[x][y-1].garbage && garbage.indexOf(this.v[x][y-1])===-1)
  garbage.push([x, y-1], this.v[x][y-1]);
  if (this.isOK(x, y+1) && !this.isFree(x, y+1) && this.v[x][y+1].garbage && garbage.indexOf(this.v[x][y+1])===-1)
  garbage.push([x, y+1], this.v[x][y+1]);
 }

 for(t=garbage.length-2;t>=0;t-=2)
 group.push(garbage[t]);
};
kf.Board.prototype.deleteGroups = function()
{
 var ret = this.winningGroups;
 for(var t=this.winningGroups.length-1, t2;t>=0;t--)
 {
  var visited = {}; //now we want to append garbage so we can delete. but we need to pass this info...
  this.__appendGarbage(this.winningGroups[t]);
  for(t2=this.winningGroups[t].length-1;t2>=0;t2--)
  {
   this.v[this.winningGroups[t][t2][0]][this.winningGroups[t][t2][1]] = null;
  }
 }
 this.winningGroups = null;
 return ret;
};
kf.Board.prototype.moveLeft =  function()
{
 if (this.isOK(this.np[0]-1, this.np[1]) && this.isOK(this.np[0]+this.ns[0]-1, this.np[1]+this.ns[1]) && this.isFree(this.np[0]-1, this.np[1]) && this.isFree(this.np[0]+this.ns[0]-1, this.np[1]+this.ns[1]))
 this.np[0]--;
};
kf.Board.prototype.moveRight =  function()
{
 if (this.isOK(this.np[0]+1, this.np[1]) && this.isOK(this.np[0]+this.ns[0]+1, this.np[1]+this.ns[1]) && this.isFree(this.np[0]+1, this.np[1]) && this.isFree(this.np[0]+this.ns[0]+1, this.np[1]+this.ns[1]))
 this.np[0]++;
};
kf.Board.prototype.stepDown =  function()
{
 if (this.isOK(this.np[0], this.np[1]+1) && this.isOK(this.np[0]+this.ns[0], this.np[1]+this.ns[1]+1) && this.isFree(this.np[0], this.np[1]+1) && this.isFree(this.np[0]+this.ns[0], this.np[1]+this.ns[1]+1))
 {
  this.np[1]++;
  return true;
 }
 return false;
};
kf.Board.prototype.__findGroups = function(visited, object, x, y, group)
{
 if (visited[x+':'+y]) return;
 visited[x+':'+y] = true;
 
 group.push([x, y]);
 if (this.isOK(x-1, y) && !this.isFree(x-1, y) && this.v[x-1][y].wasSettled && this.v[x-1][y].color==object.color)
 {
  object.handles |= 1;
  this.__findGroups(visited, this.v[x-1][y], x-1, y, group);
 }
 if (this.isOK(x+1, y) && !this.isFree(x+1, y) && this.v[x+1][y].wasSettled && this.v[x+1][y].color==object.color)
 {
  object.handles |= 2;
  this.__findGroups(visited, this.v[x+1][y], x+1, y, group);
 }
 if (this.isOK(x, y-1) && y>1 && !this.isFree(x, y-1) && this.v[x][y-1].wasSettled && this.v[x][y-1].color==object.color)
 {
  object.handles |= 4;
  this.__findGroups(visited, this.v[x][y-1], x, y-1, group);
 }
 if (this.isOK(x, y+1) && !this.isFree(x, y+1) && this.v[x][y+1].wasSettled && this.v[x][y+1].color==object.color)
 {
  object.handles |= 8;
  this.__findGroups(visited, this.v[x][y+1], x, y+1, group);
 }
};
kf.Board.prototype.findGroups = function()
{
 var visited = {}, x, y, allGroups = [], newGroup;
 for(x=0;x<this.x;x++)
 for(y=0;y<this.y;y++)
 if (!this.isFree(x, y) && this.v[x][y].color)
 this.v[x][y].handles = 0;

 for(x=0;x<this.x;x++)
 {
  for(y=0;y<this.y;y++)
  {
   if (!this.isFree(x, y) && this.v[x][y].wasSettled && this.v[x][y].color)
   {
    newGroup = [];
    this.__findGroups(visited, this.v[x][y], x, y, newGroup);
    if (newGroup.length>=4) 
    allGroups.push(newGroup);
   }
  }
 }

 this.winningGroups = allGroups;
};
kf.Board.prototype.__cloneValues = function()
{
 var ret = [], t;
 for (t=0;t<this.x;t++)
 ret[t] = this.v[t].slice();
 return ret;
};
kf.Board.prototype.getGhostY = function()
{
 var ret = [];
 //for np
 for(var y=this.y-1;y>=0;y--)
 {
  if (this.isFree(this.np[0], y))
  {
   ret[0] = y; break;
  }
 } 
 //for ns
 for(var y=this.y-1;y>=0;y--)
 {
  if (this.isFree(this.np[0]+this.ns[0], y))
  {
   ret[1] = y; break;
  }
 } 
 if (this.ns[1]==1) ret[0]--;
 else if (this.ns[1]==-1) ret[1]--;

 return ret;
};
kf.Board.prototype.settle =  function()
{
 var t, t2, free, diff = [], dhash = {};
 /*
  we:
  -clone the values
  -move blocks in newValues

  then for old values, we check if their neighbors had a different fall amount
  (we need old values, because we need to know their neighbors before they fell)
  if so, remove handles... in the new values ! (we know them because we know the fall time)

  then set values as new values

  then, display.settle receives new handles.

  display then switches handles to the new ones
  and updates the handles so that we break the ones invalid DURING animation

  then it sets position for all.
 */
 var newValues = this.__cloneValues();

 for(t=0;t<this.x;t++)
 {
  free = this.y-1;
  for(t2=this.y-1;t2>=0;t2--)
  {
   if (!this.isFree(t, t2)) //this operates on old values, however, it checks something unaffected yet
   {
    if (t2!=free)
    {
     diff.push([[t, t2], free-t2]);
     dhash[t+'|'+t2] = free-t2;

     newValues[t][free] = this.v[t][t2];
     newValues[t][t2] = null;
    }
    free--;
   }
  }
 }

 //this operates on new values. jeez what a mess.
 for(t=0;t<this.x-1;t++)
 {
  for(t2=0;t2<this.y;t2++)
  {
   if (!this.isFree(t, t2) && this.v[t][t2].handles&2) //I am not checking isfree+1 on purpose - we cannot mask errors
   {
    if (dhash[t+'|'+t2]!=dhash[(t+1)+'|'+t2])
    {
     newValues[t][(dhash[t+'|'+t2]===undefined?0:dhash[t+'|'+t2])+t2].handles &= ~2;
     newValues[t+1][(dhash[(t+1)+'|'+t2]===undefined?0:dhash[(t+1)+'|'+t2])+t2].handles &= ~1;
    }
   }
  }
 }
 
 this.v = newValues; 
 for(t=0;t<this.x;t++)
 for(t2=0;t2<this.y;t2++)
 if (!this.isFree(t, t2))
 this.v[t][t2].wasSettled = true;

 /*
  don't group again until settlement
 */

 return diff;
};