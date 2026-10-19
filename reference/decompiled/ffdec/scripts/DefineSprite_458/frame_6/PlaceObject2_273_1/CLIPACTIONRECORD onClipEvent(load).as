onClipEvent(load){
   hp = 2;
   attack = 15;
   score = 10;
   _parent.item = 0;
   _parent._parent._parent._parent.hp = hp;
   _parent._parent._parent._parent.attack = attack;
   _parent._parent._parent._parent.score = score;
   _parent._parent.life = hp;
   _parent._parent.damage = - attack;
   _parent._parent.point = score;
}
