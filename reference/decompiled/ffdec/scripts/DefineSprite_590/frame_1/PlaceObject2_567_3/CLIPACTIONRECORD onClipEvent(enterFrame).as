onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      if(_root.mogura_on < 100)
      {
         if(_root.boss == 1)
         {
            k -= 1;
            this._width = k * o;
            if(k < limit)
            {
               if(limit_k == 0)
               {
                  with(_parent.meter)
                  {
                     gotoAndPlay("red");
                  }
                  limit_k = 1;
               }
            }
            if(k <= 1)
            {
               _root.over_i = "time";
               _root.gotoAndPlay("over");
               _parent.gotoAndStop("stay");
            }
         }
         else
         {
            _parent.gotoAndStop("up");
         }
      }
   }
}
