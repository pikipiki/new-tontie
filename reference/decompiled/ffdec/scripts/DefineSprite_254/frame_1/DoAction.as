function chousei()
{
   _root.sound("ppp");
   if(_root.lv < 10)
   {
      lv_s = "0" + _root.lv;
   }
   else
   {
      lv_s = _root.lv;
   }
   if(_root.lv <= 1)
   {
      d.gotoAndStop(2);
   }
   else
   {
      d.gotoAndStop(1);
   }
   if(_root.lv >= _root.iroiro.data.bouns || _root.lv >= 20)
   {
      u.gotoAndStop(2);
   }
   else
   {
      u.gotoAndStop(1);
   }
}
stop();
