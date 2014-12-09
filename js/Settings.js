kf.Dialog = function()
{
 var _this = this;

 this.dialogExit = this._dialogExit.bind(this);

 this.overlay = document.getElementById('kf-dialog-overlay');
 this.overlay.onclick = function(){_this.dialogExit();};
};
kf.Dialog.prototype.display = function(name, callback)
{
 this.overlay.style.display = 'block';
 document.getElementById('kf-'+name+'-dialog').onclick = function(event){event.stopPropagation();};
 document.getElementById('kf-'+name+'-dialog').getElementsByClassName('kf-dialog-close')[0].onclick = this.dialogExit;
 document.getElementById('kf-'+name+'-dialog').style.display = 'inline-block';
 this.callback = callback;
 this.name = name;
};
kf.Dialog.prototype._dialogExit = function()
{
 document.getElementById('kf-'+this.name+'-dialog').style.display = 'none';
 this.overlay.style.display = 'none';

 if (this.callback)
 this.callback();

 this.callback = null;
};
kf.Settings = function(callback)
{
 var _this = this; //js=genius part2
 this.settings = {ghostEnabled: true, x: 6, y: 13};

 try
 {
  var tmp = JSON.parse(localStorage.getItem('zb3.kf.settings'));
  if (tmp) this.settings = tmp;
 } catch(e) {}

 this.ghostCheckbox = document.getElementById('kf-settings-enable-ghost');
 this.ghostCheckbox.checked  = this.settings.ghostEnabled;
 this.ghostCheckbox.onchange = function()
 {
  _this.settings.ghostEnabled = _this.ghostCheckbox.checked;
  localStorage.setItem('zb3.kf.settings', JSON.stringify(_this.settings));
  callback();
 };

 this.widthInput = document.getElementById('kf-settings-width-input');
 this.widthInput.value  = this.settings.x;
 this.widthInput.onchange = function()
 {
  _this.settings.x = parseInt(_this.widthInput.value) || _this.settings.x;
  _this.widthInput.value = _this.settings.x;
  localStorage.setItem('zb3.kf.settings', JSON.stringify(_this.settings));
  callback();
 };

 this.heightInput = document.getElementById('kf-settings-height-input');
 this.heightInput.value  = this.settings.y;
 this.heightInput.onchange = function()
 {
  _this.settings.y = parseInt(_this.heightInput.value) || _this.settings.y;
  _this.heightInput.value = _this.settings.y;
  localStorage.setItem('zb3.kf.settings', JSON.stringify(_this.settings));
  callback();
 };
};