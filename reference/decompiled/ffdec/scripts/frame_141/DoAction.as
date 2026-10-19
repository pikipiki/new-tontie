function lv_set()
{
   if(_root.kakuritu_org > 2)
   {
      _root.kakuritu_org -= _root.up_kakuritu;
      if(_root.kakuritu_org < 2)
      {
         _root.kakuritu_org = 2;
      }
   }
   if(_root.koma > 1)
   {
      _root.koma -= _root.up_char;
   }
   if(_root.top_stay > 1)
   {
      _root.top_stay -= _root.up_top * _root.chousei;
   }
}
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
_root.chousei = 3;
_root.lv_silver = 0;
_root.lv_set();
_root.lv_set();
_root.lv_set();
_root.lv_set();
