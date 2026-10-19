stopAllSounds();
_root.shop_l = 0;
if(_root.lv >= 20)
{
   gotoAndStop("clear");
   play();
}
else
{
   _root.sound("level_up");
}
