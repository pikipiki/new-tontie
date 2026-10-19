onClipEvent(load){
   if(_parent._parent._name == "up_boad")
   {
      with(this)
      {
         gotoAndStop("info");
      }
   }
   hp = 8;
   attack = 50;
   score = 30;
   _parent.item = "coin3";
   _parent._parent._parent._parent.hp = hp;
   _parent._parent._parent._parent.attack = attack;
   _parent._parent._parent._parent.score = score;
   _parent._parent.life = hp;
   _parent._parent.damage = - attack;
   _parent._parent.point = score;
}
