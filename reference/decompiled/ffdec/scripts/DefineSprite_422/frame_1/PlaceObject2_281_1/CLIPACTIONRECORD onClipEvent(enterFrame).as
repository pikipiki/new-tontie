onClipEvent(enterFrame){
   k += 1;
   if(k > _root.top_stay / 5 * 3)
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
