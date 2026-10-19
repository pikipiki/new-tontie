onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      k += 1;
      if(k > _root.top_stay / 5 * 3)
      {
         _parent.nextFrame();
      }
   }
}
