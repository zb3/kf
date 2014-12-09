var kf = {};
kf.clone = function(obj)
{
 return JSON.parse(JSON.stringify(obj))
};
kf.loadGame = function()
{
 kf.game = new kf.Game();
 kf.interval = setInterval(kf.game.tick.bind(kf.game), 20);
};
window.addEventListener('load', kf.loadGame);