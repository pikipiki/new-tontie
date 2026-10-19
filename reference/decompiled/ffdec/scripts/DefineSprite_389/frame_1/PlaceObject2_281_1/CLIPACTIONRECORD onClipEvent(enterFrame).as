onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      k += 1;
      if(k > _root.top_stay / 5 * 2)
      {
         _parent.nextFrame();
      }
   }
}
