onClipEvent(enterFrame){
   k += 1;
   if(k > _root.top_stay / 5 * 3)
   {
      _parent.nextFrame();
   }
}
