onClipEvent(enterFrame){
   if(joutai == "up")
   {
      if(_Y > 0)
      {
         _Y = _Y - _parent.hitokoma;
      }
      else
      {
         _Y = 0;
         _root.piko_ok = 1;
         joutai = "top";
      }
   }
   else if(joutai != "top")
   {
      if(joutai == "down")
      {
         if(_Y < _parent.soko)
         {
            _Y = _Y + _parent.hitokoma;
         }
         else
         {
            _Y = _parent.soko;
            _root.mogura_on -= 1;
            with(_parent)
            {
               gotoAndStop("off");
            }
         }
      }
   }
}
