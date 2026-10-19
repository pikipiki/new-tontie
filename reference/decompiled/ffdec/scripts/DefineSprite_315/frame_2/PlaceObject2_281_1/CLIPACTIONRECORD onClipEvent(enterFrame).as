onClipEvent(enterFrame){
   k += 1;
   if(k > _root.top_stay / 5 * 1)
   {
      _parent._parent._parent._parent._parent.hp -= 7;
      _parent.prevFrame();
   }
}
