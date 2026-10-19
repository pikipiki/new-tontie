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
      if(k > _root.top_stay / 5 * 3)
      {
         _parent._parent._parent._parent._parent._parent.hp += 70;
         _parent.nextFrame();
      }
   }
}
