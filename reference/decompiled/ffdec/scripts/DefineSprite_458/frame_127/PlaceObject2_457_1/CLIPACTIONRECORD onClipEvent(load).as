onClipEvent(load){
   _parent._parent._parent._parent.enemy_i = 4;
   _root.sound("item_on");
   k = Math.floor(Math.random() * 5);
   if(k != 0)
   {
      k = Math.floor(Math.random() * 4 + 2);
      with(this)
      {
         gotoAndStop(k);
      }
   }
   else
   {
      k = Math.floor(Math.random() * 5 + 20);
      with(this)
      {
         gotoAndStop(k);
      }
   }
}
