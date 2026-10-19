if(eval("_root.henkan" + _root.piko[0]) == 0)
{
   eval("_root.d" + _root.piko[0] + ".hammer").gotoAndPlay("on");
}
else
{
   eval("_root.d" + eval("_root.henkan" + _root.piko[0]) + ".hammer").gotoAndPlay("on");
}
_root.sound("bun");
_root.piko.shift();
if(_root.wing == 1)
{
   gotoAndStop("piko2");
   play();
}
