onClipEvent(load){
   if(_parent._parent._name == "up_boad")
   {
      with(this)
      {
         gotoAndStop("info");
      }
   }
   _parent._parent._parent._parent.enemy_i = 1;
   _parent._parent._parent._parent.item = 0;
   hp = 5;
   attack = 40;
   score = 30;
   _parent.item = 0;
   _parent._parent._parent._parent.hp = hp;
   _parent._parent._parent._parent.attack = attack;
   _parent._parent._parent._parent.score = score;
   _parent._parent.life = hp;
   _parent._parent.damage = - attack;
   _parent._parent.point = score;
}
