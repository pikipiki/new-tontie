onClipEvent(load){
   if(eval("_root.enemy" + _parent._parent._parent._parent._name.substr(1,1)) == "eye")
   {
      _parent.gotoAndStop("bom_head");
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
      hp = 6;
      attack = 45;
      score = 30;
      _parent.item = 0;
      _parent._parent._parent._parent.hp = hp;
      _parent._parent._parent._parent.attack = attack;
      _parent._parent._parent._parent.score = score;
      _parent._parent.life = hp;
      _parent._parent.damage = - attack;
      _parent._parent.point = score;
   }
}
