onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      k += 1;
      if(_parent._parent.eye == 1 && _parent.bakuhatu == 0)
      {
         _parent._parent._parent._parent._parent._parent.hit = "bakudan_last";
         _parent._parent._parent._parent._parent._parent.se = "bokan";
      }
      else
      {
         _parent._parent._parent._parent._parent._parent.hit = 2;
         _parent._parent._parent._parent._parent._parent.se = "kan";
      }
      if(k > _root.top_stay / 5 * 2)
      {
         bunki = Math.floor(Math.random() * 2);
         if(bunki == 0)
         {
            _parent.gotoAndPlay("p_be");
         }
         else
         {
            _parent.gotoAndPlay("p_r");
         }
      }
   }
}
