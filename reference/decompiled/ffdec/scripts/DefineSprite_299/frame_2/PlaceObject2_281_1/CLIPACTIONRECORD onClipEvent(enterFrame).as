onClipEvent(enterFrame){
   k += 1;
   if(k > _root.top_stay / 8 * 2)
   {
      _parent.prevFrame();
   }
}
