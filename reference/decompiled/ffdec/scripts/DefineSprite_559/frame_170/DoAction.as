if(_root.lv == 10 || _root.lv == 20)
{
   with(_root)
   {
      gotoAndPlay("boss");
   }
}
else
{
   with(_root)
   {
      gotoAndStop("game");
   }
}
_root.life.cover.gotoAndStop(1);
_root.life.kirinuki.gotoAndStop(1);
