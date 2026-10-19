onClipEvent(enterFrame){
   check_ok = 0;
   i = 1;
   while(i <= 9)
   {
      if(eval("_root.d" + i + "._currentframe") == 2)
      {
         break;
      }
      check_ok += 1;
      i++;
   }
   if(check_ok >= 9)
   {
      i = 1;
      while(i <= 9)
      {
         set("_root.d" + i + ".dodai_all.joutai","down");
         i++;
      }
      if(_root.kakuritu_org > _root.up_kakuritu_mx)
      {
         _root.kakuritu_org -= _root.up_kakuritu;
         if(_root.kakuritu_org < _root.up_kakuritu_mx)
         {
            _root.kakuritu_org = _root.up_kakuritu_mx;
         }
      }
      if(_root.koma > _root.up_char_mx)
      {
         _root.koma -= _root.up_char;
      }
      if(_root.top_stay > _root.up_top_mx)
      {
         _root.top_stay -= _root.up_top;
      }
      if(_root.life.red._width <= 2)
      {
         _root.life.red._width = 2;
      }
      with(_root.up_boad)
      {
         gotoAndPlay("up");
      }
      with(_root)
      {
         gotoAndStop("up");
      }
   }
}
