onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      if(_root.mogura_on < 100)
      {
         k -= 1;
         this._width = k * o;
      }
      if(k <= 1)
      {
         _root.lvup = 1;
         with(_parent)
         {
            gotoAndStop("up");
         }
      }
   }
}
