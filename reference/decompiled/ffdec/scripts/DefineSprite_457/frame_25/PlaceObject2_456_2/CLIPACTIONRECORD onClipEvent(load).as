onClipEvent(load){
   k = Math.floor(Math.random() * 10);
   if(k != 0)
   {
      with(_parent)
      {
         prevFrame();
      }
   }
}
