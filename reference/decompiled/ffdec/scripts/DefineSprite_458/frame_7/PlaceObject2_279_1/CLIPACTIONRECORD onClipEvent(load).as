onClipEvent(load){
   if(_parent._parent._name == "up_boad")
   {
      with(this)
      {
         gotoAndStop("info");
      }
   }
   else if(_root.hammer_lv >= 2)
   {
      i = Math.floor(Math.random() * 2);
      if(i != 0)
      {
         if(_root.lv >= 4)
         {
            with(_parent)
            {
               nextFrame();
            }
         }
         else
         {
            with(_parent)
            {
               prevFrame();
            }
         }
      }
   }
   hp = 3;
   attack = 0;
   score = 5;
   _parent.item = "life";
   _parent._parent._parent._parent.hp = hp;
   _parent._parent._parent._parent.attack = attack;
   _parent._parent._parent._parent.score = score;
   _parent._parent.life = hp;
   _parent._parent.damage = - attack;
   _parent._parent.point = score;
}
