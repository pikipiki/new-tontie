onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      k += 1;
      if(k > _root.top_stay / 6 * 1)
      {
         _parent._parent._parent._parent._parent._parent.hp -= 70;
         _parent.prevFrame();
      }
   }
}
