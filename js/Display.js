kf.Display = function(game, keys)
{
 //store divs @ pos
 this.game = game;
 this.infobarElement = document.getElementById('kf-infocont');
 this.boardcontElement = document.getElementById('kf-boardcont');
 this.boardElement = document.getElementById('kf-board');
 this.scoreElement = document.getElementById('kf-score');
 this.progressElement = document.getElementById('kf-progress');
 this.levelElement = document.getElementById('kf-level');
 this.overlayElement = document.getElementById('kf-overlaytable');
 this.ocauseElement = document.getElementById('kf-ocause');

 this.resumeElement = document.getElementById('kf-resume');
 this.resumeElement.addEventListener('click', this.game.resume.bind(this.game));

 this.newGameElement = document.getElementById('kf-newgame');
 this.newGameElement.addEventListener('click', this.game.newGame.bind(this.game));

 this.newGame2Element = document.getElementById('kf-newgame2');
 this.newGame2Element.addEventListener('click', this.game.newGame.bind(this.game));

 this.pauseElement = document.getElementById('kf-pausegame2');
 this.pauseElement.addEventListener('click', this.game.pause.bind(this.game));

 this.settingsElement = document.getElementById('kf-opensettings');
 this.settingsElement.addEventListener('click', this.game.showSettings.bind(this.game));

 this.nextBall1 = document.getElementById('kf-next-ball1');
 this.nextBall2 = document.getElementById('kf-next-ball2');

 this.ghostBall1 = this._newBallGhost();
 this.ghostBall2 = this._newBallGhost();
 this.ghostBall1.style.display = 'none'; 
 this.ghostBall2.style.display = 'none';

 this.animationElements = [document.getElementById('kf-aholder0'), document.getElementById('kf-aholder1')];

 this.ballSize = parseInt(getComputedStyle(this.nextBall1).width);
 this.tick = null;

 this.keyName = function(code)
 {
  if (code==37 || code==65)
  return 'left';
  else if (code==39 || code==68)
  return 'right';
  else if (code==38 || code==87)
  return 'up';
  else if (code==40 || code==83)
  return 'down';
  else if (code==80)
  return 'pause';
  else if (code==78)
  return 'new';
  else if (code==13)
  return 'enter';
  return false;
 };

 this.keyManager = new KeyManager(this.keyName);
 this.touchManager = new PointerManager(document.getElementById('kf-boardcont'));
 this.animator = new kf.Animator();

 this.dialog = new kf.Dialog();

 this.containerElement = document.getElementById('kf-gamecont');
 this.initBoardDisplay(this.game.nx, this.game.ny);
 
 window.addEventListener('resize', this.updateSize.bind(this));
};
kf.Display.prototype._getDesiredSize = function(element)
{
 var ret = [0, 0], rex = new RegExp('#'+element.id.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1")+'([^_a-zA-Z0-9-]|$)');
 loop: for(var sheet=document.styleSheets.length-1, rule;sheet>=0;sheet--)
 {
  for(rule=document.styleSheets[sheet].cssRules.length-1;rule>=0;rule--)
  {
   if (document.styleSheets[sheet].cssRules[rule].selectorText && document.styleSheets[sheet].cssRules[rule].selectorText.match(rex))
   {
    ret[0] = parseInt(document.styleSheets[sheet].cssRules[rule].style.width) | 0; ret[1] = parseInt(document.styleSheets[sheet].cssRules[rule].style.height) | 0;
    break loop;
   }
  }
 }
 return ret;
};
kf.Display.prototype._expandElementBy = function(element, x, y)
{
 var cs = this._getDesiredSize(element);
 element.style.width = parseInt(cs[0])+x+'px';
 element.style.height = parseInt(cs[1])+y+'px';
};
kf.Display.prototype.initBoardDisplay = function(x, y)
{
 this._expandElementBy(this.containerElement, x*this.ballSize, (y-1)*this.ballSize);
 this._expandElementBy(document.getElementById('kf-bcont'), x*this.ballSize, (y-1)*this.ballSize);
 this._expandElementBy(this.boardElement, x*this.ballSize, (y-1)*this.ballSize);
 this._expandElementBy(this.overlayElement, x*this.ballSize, (y-1)*this.ballSize);

 var infoHeight = this._getDesiredSize(this.infobarElement)[1];
 var boardHeight = parseInt(getComputedStyle(this.boardcontElement).height);
 
 if (infoHeight>boardHeight)
 this.boardcontElement.style.top = (infoHeight-boardHeight)/2+'px';
 else
 {
  this.boardcontElement.style.top = '0';
  this.infobarElement.style.height = boardHeight+'px';
  infoHeight = boardHeight;
 }

 this.containerElement.style.height = (infoHeight+2*parseInt(getComputedStyle(this.containerElement).paddingLeft))+'px';
 var cs = getComputedStyle(this.containerElement);

 this.referenceX = parseInt(cs.width); this.referenceY = parseInt(cs.height);
 this.referenceRatio = this.referenceX/this.referenceY;

 this.updateSize();
 document.getElementById('kf-loading-overlay').style.display = 'none';
 document.getElementById('kf-gamecont').style.display = '';
};
kf.Display.prototype.updateSize = function()
{
 /*
 Yes, I center vertically using JS. There are many methods for this via CSS, but none of them work for my particular case
 */
 var x = innerWidth, y = innerHeight, ratio = x/y;
 this.scale = (ratio>=this.referenceRatio)?y/this.referenceY:x/this.referenceX;
 this.containerElement.style.transform = 'scale('+this.scale+')';

 this.containerElement.style.top = (y-this.referenceY)/2+'px';
 this.containerElement.style.left = (x-this.referenceX)/2+'px';

 this.touchManager.setScale(this.scale);
};
kf.Display.prototype.showOverlay = function(cause)
{
 this.ocauseElement.textContent = cause;
 this.ocauseElement.style.display = 'inline-block';
 this.overlayElement.style.display = 'table';
 this.pauseElement.style.display = 'none';
};
kf.Display.prototype.resume = function(cause)
{
 this.animator.resumeAnimations();
};
kf.Display.prototype.hideOverlay = function()
{
 this.overlayElement.style.display = 'none';
 this.pauseElement.style.display = 'block';
};
kf.Display.prototype.hideSettings = function()
{
 this.clearTouch();
 this.clearKeys();
};
kf.Display.prototype.displayOver = function()
{
 this.resumeElement.style.display = 'none';
 this.newGameElement.style.display = 'block';
 this.showOverlay('Game Over!');
};
kf.Display.prototype.displayPaused = function()
{
 this.animator.pauseAnimations();
 this.resumeElement.style.display = 'block';
 this.newGameElement.style.display = 'none';
 this.showOverlay('Paused');
};
kf.Display.prototype.displaySettings = function()
{
 this.animator.pauseAnimations();
 this.dialog.display('settings', this.game.onHideSettings.bind(this.game));
};
kf.Display.prototype.queryKeys = function()
{
 return this.keyManager.queryKeys();
};
kf.Display.prototype.enableTouch = function()
{
 return this.touchManager.enable();
};
kf.Display.prototype.disableTouch = function()
{
 return this.touchManager.disable();
};
kf.Display.prototype.queryTouch = function()
{
 return this.touchManager.query();
};
kf.Display.prototype.clearKeys = function()
{
 return this.keyManager.clearKeys();
};
kf.Display.prototype.clearTouch = function()
{
 this.touchManager.clear();
};
kf.Display.prototype.newBoard = function(x, y)
{
 this.animator.abortAnimations();
 this.initBoardDisplay(x, y);

 while(this.boardElement.firstChild)
 this.boardElement.removeChild(this.boardElement.firstChild);

 this.balls = [];
 for(var t=0;t<x;t++)
 this.balls[t] = [];

 this.boardElement.appendChild(this.ghostBall1);
 this.boardElement.appendChild(this.ghostBall2);

 this.boardElement.appendChild(this.animationElements[0]);
 this.boardElement.appendChild(this.animationElements[1]);

 this.ghostBall1.style.display = 'none'; 
 this.ghostBall2.style.display = 'none';
};
kf.Display.prototype.updateScore = function()
{
 this.scoreElement.textContent = this.game.score;
 this.progressElement.style.width = this.game.levelProgress+'%';
 this.levelElement.textContent = this.game.level+1;
};
kf.Display.prototype.updateNext = function()
{
 this._setBallColor(this.nextBall1, this.game.nextC1);
 this._setBallColor(this.nextBall2, this.game.nextC2);
};
kf.Display.prototype._setBallColor = function(element, color)
{
 var classes = element.className.split(' '), t;

 for(t=0;t<classes.length;t++)
 if (classes[t].slice(0, 5)=='color')
 classes.splice(t--, 1);

 element.className = classes.join(' ')+' color'+(color+1);
};
kf.Display.prototype._setBallXPosition = function(element, x)
{
 element.style.left = x*this.ballSize+'px';
};
kf.Display.prototype._setBallYPosition = function(element, y)
{
 element.style.top = y*this.ballSize+'px';
};
kf.Display.prototype._getFinalTop = function(element, y)
{
 return y*this.ballSize;
};
kf.Display.prototype._setBallPosition = function(element, x, y)
{
 this._setBallXPosition(element, x); this._setBallYPosition(element, y);
};
kf.Display.prototype._setBallHandles = function(element, handles)
{
 var classes = element.className.split(' '), t;

 for(t=0;t<classes.length;t++)
 if (classes[t]=='left' || classes[t]=='right' || classes[t]=='top' || classes[t]=='bottom')
 classes.splice(t--, 1);

 element.className = classes.join(' ')+(handles?' '+handles:'');
};
kf.Display.prototype._newBall = function(pos, color)
{
 var ret = document.createElement('div'), tmp;
 ret.className = 'ball-container';
 ret.innerHTML = '<div class="ball"></div><div class="handle-left"></div><div class="handle-right"></div><div class="handle-top"></div><div class="handle-bottom"></div>';
 this._setBallColor(ret, color);
 this._setBallPosition(ret, pos[0], pos[1]);
 return ret;
};
kf.Display.prototype._newBallGhost = function()
{
 var ret = this._newBall([0, 0], '1');
 ret.classList.add('ghost');
 return ret;
};
kf.Display.prototype.addNew = function()
{
 this.newBall1 = this._newBall(this.game.board.ns, this.game.board.nsball.color);
 this.newBall2 = this._newBall(this.game.board.np, this.game.board.npball.color);

 this.boardElement.appendChild(this.newBall1);
 this.boardElement.appendChild(this.newBall2);

 this.updateBoardNew();
};
kf.Display.prototype.addGarbage = function(xpos)
{
 for(var t=0;t<xpos.length;t++)
 {
  this.balls[xpos[t]][0] = this._newBall([xpos[t], 0], 0);
  this.boardElement.appendChild(this.balls[xpos[t]][0]);
 }
};
kf.Display.prototype.updateBoardNew = function()
{
 this._setBallPosition(this.newBall1, this.game.board.np[0]+this.game.board.ns[0], this.game.board.np[1]+this.game.board.ns[1]);
 this._setBallPosition(this.newBall2, this.game.board.np[0], this.game.board.np[1]);

 this._setBallXPosition(this.ghostBall1, this.game.board.np[0]+this.game.board.ns[0]);
 this._setBallXPosition(this.ghostBall2, this.game.board.np[0]);
};
kf.Display.prototype.onSettingsChanged = function()
{
 if (this.ghostNow && this.game.settings.settings.ghostEnabled)
 {
  this.ghostBall1.style.display = 'block'; this.ghostBall2.style.display = 'block';
 }
 
 if (!this.game.settings.settings.ghostEnabled)
 {
  this.ghostBall1.style.display = 'none'; this.ghostBall2.style.display = 'none';
 }
};
kf.Display.prototype.hideGhost = function()
{
 this.ghostNow = false;
 this.ghostBall1.style.display = 'none'; this.ghostBall2.style.display = 'none';
};
kf.Display.prototype.showGhost = function(color1, color2)
{
 this.ghostNow = true;
 if (this.game.settings.settings.ghostEnabled)
 {
  this.ghostBall1.style.display = 'block'; this.ghostBall2.style.display = 'block';
 }
 this._setBallColor(this.ghostBall1, color1); this._setBallColor(this.ghostBall2, color2);
};
kf.Display.prototype.updateGhost = function(where)
{
 this._setBallYPosition(this.ghostBall1, where[1]);
 this._setBallYPosition(this.ghostBall2, where[0]);
};
kf.Display.prototype.placeBalls = function()
{
 this.balls[this.game.board.np[0]+this.game.board.ns[0]][this.game.board.np[1]+this.game.board.ns[1]] = this.newBall1;
 this.balls[this.game.board.np[0]][this.game.board.np[1]] = this.newBall2;
 
 this.newBall1 = this.newBall2 = null;
};
kf.Display.prototype.updateBallHandles = function(x, y)
{
 var handles;
 if (!this.game.board.isFree(x, y))
 {
  handles = [];
  if (this.game.board.v[x][y].handles&1) handles.push('left');
  if (this.game.board.v[x][y].handles&2) handles.push('right');
  if (this.game.board.v[x][y].handles&4) handles.push('top');
  if (this.game.board.v[x][y].handles&8) handles.push('bottom');

  this._setBallHandles(this.balls[x][y], handles.join(' '));
 }
};
kf.Display.prototype.updateBoardHandles = function()
{
 var x, y, handles;
 for(x=0;x<this.game.board.x;x++)
 for(y=0;y<this.game.board.y;y++)
 this.updateBallHandles(x, y);
};
kf.Display.prototype._addOneTimeEventListener = function(element, name, func)
{
 var handler = function(event)
 {
  element.removeEventListener(name, handler);
  func(event);
 };
 element.addEventListener(name, handler);
};
kf.Display.prototype.__afterSettle = function(callback)
{
 //call callback, but you may as well set bounce animation or something
 //but don't wait
 callback();
}
kf.Display.prototype.settle = function(diff, callback) //that's hardcore
{
 var lastElement = null, longest = 0, element, toAnimate = [], t, x, y;

 for(t=0;t<diff.length;t++)
 {
  element = this.balls[diff[t][0][0]][diff[t][0][1]];
  this.balls[diff[t][0][0]][diff[t][0][1]+diff[t][1]] = element;
  this.balls[diff[t][0][0]][diff[t][0][1]] = null;

  if (diff[t][1]>longest)
  {
   lastElement = element;
   longest = diff[t][1];
  }

  toAnimate.push(element, Math.sqrt(diff[t][1])/10, diff[t][0][1]+diff[t][1]);
 }

 this.updateBoardHandles();

 for(t=0;t<toAnimate.length;t+=3)
 {
  this.animator.createAnimation(toAnimate[t], {keyframes: 'top: '+this._getFinalTop(toAnimate[t], toAnimate[t+2])+'px', duration: toAnimate[t+1]+'s', timingFunction: 'ease-in', fillMode: 'forwards'}, {onend: toAnimate[t]==lastElement?this.__afterSettle.bind(this, callback):null});
 }

 if (lastElement===null)
 {
  this.__afterSettle(callback);
 }
};
kf.Display.prototype.flashGroups = function(groups, callback)
{
 var t, t2, eventAdded = false, element;
 for(t=0;t<groups.length;t++)
 {
  for(t2=0;t2<groups[t].length;t2++)
  {
   this.animationElements[t].appendChild(this.balls[groups[t][t2][0]][groups[t][t2][1]]);
   this.balls[groups[t][t2][0]][groups[t][t2][1]] = null;
  }
  this.animator.createAnimation(this.animationElements[t], {name: 'flashing'}, {onend: this.__afterFlash.bind(this, this.animationElements[t], callback), onabort: this.__clearAnimationElement.bind(this, this.animationElements[t])});
 }
};
kf.Display.prototype.__afterFlash = function(element, callback)
{
 this._addOneTimeEventListener(element, 'transitionend', this.__clearAnimationElement.bind(this, element));
 element.classList.remove('flash');
 element.style.opacity = '1';
 element.offsetHeight; //hack for chrome so that it can fire transition..
 element.style.transition = 'opacity 0.1s linear';
 element.style.opacity = '0';
 
 if (typeof callback == 'function')
 callback(); //nickelback!!!
};
kf.Display.prototype.__clearAnimationElement = function(element)
{
 while(element.firstChild)
 element.removeChild(element.firstChild);

 element.style.transition = '';
 element.style.opacity = '1';
};
kf.Display.prototype.__killElement = function(element)
{
 element.parentNode.removeChild(element);
};