onClipEvent(load){
   hp = 1;
   attack = 50;
   score = 1;
   _parent.item = 0;
   _parent._parent._parent._parent.hp = hp;
   _parent._parent._parent._parent.attack = attack;
   _parent._parent._parent._parent.score = score;
   _parent._parent.life = hp;
   _parent._parent.damage = - attack;
   _parent._parent.point = score;
}
