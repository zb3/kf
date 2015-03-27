kf.Game = function()
{
 this.settings = new kf.Settings(this.onSettingsChanged.bind(this));
 this.combo = this.combo = 0;
 this.normalTickSpeed = 100;
 this.fastTickSpeed = 10;
 this.nx = this.settings.settings.x; this.ny = this.settings.settings.y;
 this.board = new kf.Board(this.nx, this.ny, this.settings.settings.alternativeRotation);
 this.keys = {};
 this.display = new kf.Display(this);
 this.over = true;
 this.controlKeyFilter = new KeyFilterInterval(10, 2);
 this.rotateKeyFilter = new KeyFilterInterval(30, 10);
 this.pauseKeyFilter = new KeyFilterInterval();
};
kf.Game.prototype.start = function()
{
 this.score = this.combo = 0;

 this.board.reset(this.nx, this.ny);
 this.ncolors = 5; //doesn't include garbage

 this.seedNext();
 this.display.updateNext();

 this.display.newBoard(this.nx, this.ny);
 this.display.clearKeys();
 this.state = 'toseed';

 this.level = 0;
 this.levelProgress = 0;
 this.baseFallingSpeed = 18;
 this.fallingSpeedDelta = 2;
 this.currentFallingSpeed = this.baseFallingSpeed;

 this.over = false;
 this.paused = false;

 this.display.updateScore();
};
kf.Game.prototype.newGame = function()
{
 this.display.hideOverlay();
 this.start();
};
kf.Game.prototype.resume = function()
{
 this.display.hideOverlay();
 this.display.resume();
 this.paused = false;
};
kf.Game.prototype.pause = function()
{
 this.paused = true;
 this.display.displayPaused();
};
kf.Game.prototype.showSettings = function()
{
 this.suspended = true;
 this.display.displaySettings();
};
kf.Game.prototype.onSettingsChanged = function()
{
 if (this.nx!=this.settings.settings.x || this.ny!=this.settings.settings.y)
 {
  this.nx = this.settings.settings.x; this.ny = this.settings.settings.y;
  this.newGame();
 }
 this.board.alternativeRotation = this.settings.settings.alternativeRotation;
 this.display.onSettingsChanged();
};
kf.Game.prototype.onHideSettings = function()
{
 this.onSettingsChanged();
 this.display.hideSettings();
 this.suspended = false;
 if (!this.over && !this.paused)
 this.display.resume();
};
kf.Game.prototype.tick = function()
{
 if (this.suspended) return;
 var more = false;
 
 var keys = this.display.queryKeys();
 var touch = this.display.queryTouch();

 if (keys.new)
 return this.newGame();

 if (this.pauseKeyFilter.queryState('pause', keys.pause) && !this.over)
 {
  if (this.paused)
  {
   this.resume();
  }
  else
  {
   this.pause();
  }
 }
 if (keys.enter && this.over)
 return this.newGame();

 if (keys.enter && this.paused)
 return this.resume();

 if (this.paused || this.over || this.state == 'flashing' || this.state == 'settling') return;


 if (this.state == 'tosettle')
 {
  this.display.updateScore();
  this.state = 'settling';
  this.display.settle(this.board.settle(), this.afterSettle.bind(this));
 }
 else if (this.state == 'toseed')
 {
  if (this.combo>1)
  {
   this.display.addGarbage(this.board.addGarbage(this.combo-1)); //accept n parameter, return their x locations..
   this.state = 'tosettle';
   more = true;
   this.combo = 0;
  }
  else
  {
   this.board.addNew(this.nextC1, this.nextC2);
   this.display.addNew();

   this.display.showGhost(this.nextC1, this.nextC2);
   this.display.updateGhost(this.board.getGhostY());

   this.seedNext();
   this.display.updateNext();
   this.setFalling();
  }
 }
 else if (this.state == 'settled')
 {
  this.board.findGroups();
  this.display.hideGhost();

  this.display.updateBoardHandles();
  if (this.board.winningGroups && this.board.winningGroups.length)
  {
   var total = 0;

   this.combo++;
   for(var t=0;t<this.board.winningGroups.length;t++)
   {
    total += this.board.winningGroups[t].length;
    this.score += (4 + (this.board.winningGroups[t].length-4)*(this.board.winningGroups[t].length-4))*(1<<(this.combo-1));
   }

   this.levelProgress += total;
   if (this.levelProgress>=100)
   {
    this.level++; this.levelProgress = 0;
    this.updateLevelInfo();
   }
  
   this.state = 'flashing';
   this.display.flashGroups(this.board.deleteGroups(), this.afterAction.bind(this));
  }
  else
  {
   if (!this.board.isFree(2, 1) || !this.board.isFirstFree())
   this.gameOver();
   else
   this.state = 'toseed';
  }
 }
 else if (this.state == 'falling')
 {
  keys.up = this.rotateKeyFilter.queryState('up', keys.up);
  keys.left = this.controlKeyFilter.queryState('left', keys.left);
  keys.right = this.controlKeyFilter.queryState('right', keys.right);
  if (keys.down && !this.fastFalling)
  {
   this.fallingTick = 1; //which is fast resolution - 1 so that now we will fall
   this.fastFalling = true;
  }
  else if (!keys.down && this.fastFalling)
  this.fastFalling = false;

  if (keys.left && (!keys.right || this.lastArrowKey=='right')) //oh what a shit.
  {
   this.lastArrowKey='left';
   this.moveLeft();
  }
  else if (keys.right && (!keys.left || this.lastArrowKey=='left')) //oh what a shit.
  {
   this.lastArrowKey='right';
   this.moveRight();
  }
  if (keys.up) //also some delay needed. I hate it.
  {
   this.rotate();
  }

  //assert(touch_and_keyboard_not_used_together);
  var tball = 80;
  if (touch)
  {
   if (this.touchAction)
   {
    var tomove = touch.x/this.display.ballSize|0, tm, ts;
    tomove -= this.board.np[0]-this.touchAction.firstColumn;
    ts = Math.sign(tomove); tomove = Math.abs(tomove);

    if (Math.abs(touch.y)>Math.abs(touch.x))
    tomove = 0;

    if (tomove)
    {
     this.touchAction.columnChanged = true;
    }

    for(var tm=0;tm<tomove;tm++)
    if (ts==1)
    this.moveRight();
    else
    this.moveLeft();

    if (touch.last && !this.touchAction.columnChanged)
    {
     if (Math.abs(touch.x)<10 && Math.abs(touch.y)<10)
     {
      this.rotate();
     }
     else if (Math.abs(touch.x)>0.8*Math.abs(touch.y))
     {
      if (touch.x>0)
      this.moveRight();
      else
      this.moveLeft();
     }
     else if (touch.y>2*Math.abs(touch.x))
     {
      return this.drop();
     }
     else this.rotate();
    }
   }
   else
   {
    this.touchAction = {firstColumn: this.board.np[0], columnChanged: false};
   }
  }
  else
  {
   this.touchAction = null;
  }

  this.fallingTick = (this.fallingTick+1)%(this.fastFalling?1:this.currentFallingSpeed);
  if (!this.fallingTick)
  {
   if (!this.board.stepDown())
   {
    this.drop();
   }
   else
   this.display.updateBoardNew();
  }
 }
};
kf.Game.prototype.updateLevelInfo = function()
{
 this.currentFallingSpeed = Math.max(this.baseFallingSpeed - this.level*this.fallingSpeedDelta, this.fallingSpeedDelta);
};
kf.Game.prototype.seedNext = function()
{
 this.nextC1 = Math.floor(Math.random()*this.ncolors)+1; this.nextC2 = Math.floor(Math.random()*this.ncolors)+1;
};
kf.Game.prototype.drop = function()
{
 this.touchAction = null;
 this.display.touchManager.disable();
 this.combo = 0;
 this.display.placeBalls(); //handles+reposition new divs
 this.board.placeBalls();
 this.board.findGroups();
 this.display.updateBoardHandles();
 this.afterAction();
};
kf.Game.prototype.setFalling = function()
{
 this.fallingTick = 0;
 this.fastFalling = false;
 this.controlKeyFilter.clear();
 this.display.enableTouch();
 this.state = 'falling';
};
kf.Game.prototype.moveLeft = function()
{
 this.board.moveLeft();
 this.display.updateBoardNew();
 this.display.updateGhost(this.board.getGhostY());
};
kf.Game.prototype.moveRight = function()
{
 this.board.moveRight();
 this.display.updateBoardNew();
 this.display.updateGhost(this.board.getGhostY());
};
kf.Game.prototype.rotate = function() 
{
 this.board.rotate();
 this.display.updateBoardNew();
 this.display.updateGhost(this.board.getGhostY());
};
kf.Game.prototype.afterAction = function() 
{
 this.state = 'tosettle';
};
kf.Game.prototype.afterSettle = function() 
{
 this.state = 'settled';
};
kf.Game.prototype.gameOver = function()
{
 this.over = true;
 this.display.displayOver();
};