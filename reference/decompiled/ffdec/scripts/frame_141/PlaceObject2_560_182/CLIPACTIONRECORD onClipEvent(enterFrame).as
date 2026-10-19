onClipEvent(enterFrame){
   if(_root.mogura_on < 9 && _root.lvup == 0)
   {
      if(_root.pause == 0)
      {
         go = Math.floor(Math.random() * kakuritu);
         if(go == 0)
         {
            kakuritu = _root.kakuritu_org;
            mogura = Math.floor(Math.random() * 9 + 1);
            if(eval("_root.d" + mogura + "._currentframe") == 1)
            {
               with(eval("_root.d" + mogura))
               {
                  gotoAndStop("on");
               }
            }
         }
         else
         {
            kakuritu -= 1;
         }
      }
   }
}
