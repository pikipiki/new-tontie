stop();
_root.gameframe = _currentframe;
_root.shop_in = 0;
_root.piko_ok = 1;
_root.sound2("game");
if(_root.ppp == 0)
{
   _root.lvup = 0;
   with(lv_up)
   {
      gotoAndStop(1);
   }
   i = 1;
   while(i <= 9)
   {
      set("_root.henkan" + i,0);
      i++;
   }
   i = 1;
   while(i <= 9)
   {
      set("_root.enemy" + i,0);
      i++;
   }
}
else
{
   _root.ppp = 0;
}
