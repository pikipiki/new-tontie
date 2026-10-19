onClipEvent(enterFrame){
   if(Key.isDown(targ) == false)
   {
      if(_root.shop_in != 1)
      {
         _root.piko_ok = 1;
      }
      with(_parent)
      {
         gotoAndStop("off");
      }
   }
}
