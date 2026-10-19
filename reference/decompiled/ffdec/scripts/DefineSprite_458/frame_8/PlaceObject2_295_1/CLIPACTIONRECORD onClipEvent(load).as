onClipEvent(load){
   if(eval("_root.enemy" + _parent._parent._parent._parent._name.substr(1,1)) == "eye")
   {
      _parent.gotoAndStop("red");
   }
   else
   {
      if(_parent._parent._name == "up_boad")
      {
         with(this)
         {
            gotoAndStop("info");
         }
      }
      hp = 1;
      attack = 15;
      score = 20;
      _parent.item = 0;
      _parent._parent._parent._parent.hp = hp;
      _parent._parent._parent._parent.attack = attack;
      _parent._parent._parent._parent.score = score;
      _parent._parent.life = hp;
      _parent._parent.damage = - attack;
      _parent._parent.point = score;
   }
}
