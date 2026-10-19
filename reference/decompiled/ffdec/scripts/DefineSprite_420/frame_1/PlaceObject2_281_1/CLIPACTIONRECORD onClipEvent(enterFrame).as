onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      k += 1;
      if(_parent._parent.eye == 1)
      {
         _parent._parent._parent._parent._parent._parent.hit = 1;
         _parent._parent._parent._parent._parent._parent.se = "hit";
      }
      else
      {
         _parent._parent._parent._parent._parent._parent.hit = 2;
         _parent._parent._parent._parent._parent._parent.se = "kan";
      }
      if(k > _root.top_stay / 5 * 10)
      {
         bunki = Math.floor(Math.random() * 2);
         if(bunki == 0)
         {
            _parent.gotoAndPlay("be_r");
         }
         else
         {
            _parent.gotoAndPlay("be_p");
         }
      }
   }
}
