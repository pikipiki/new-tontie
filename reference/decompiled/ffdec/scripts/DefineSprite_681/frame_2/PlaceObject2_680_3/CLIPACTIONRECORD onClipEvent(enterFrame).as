onClipEvent(enterFrame){
   if(_root.pause == 0)
   {
      if(joutai == "up")
      {
         if(_Y > 0)
         {
            _Y = _Y - _parent.hitokoma;
         }
         else
         {
            _Y = 0;
            joutai = "top";
         }
      }
      else if(joutai == "top")
      {
         if(k > 0)
         {
            k -= 1;
         }
         else
         {
            joutai = "down";
         }
      }
      else if(joutai == "down")
      {
         if(_Y < _parent.soko)
         {
            _Y = _Y + _parent.hitokoma;
         }
         else
         {
            _parent.nikai = 0;
            _Y = _parent.soko;
            _root.mogura_on -= 1;
            _root.damage(_parent.attack);
            if(_parent.attack != 0)
            {
               _root.lost_l += 1;
            }
            with(_parent)
            {
               gotoAndStop("off");
            }
         }
      }
   }
}
