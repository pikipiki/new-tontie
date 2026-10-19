onClipEvent(enterFrame){
   k += 1;
   if(k > _root.top_stay / 5 * 3)
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
