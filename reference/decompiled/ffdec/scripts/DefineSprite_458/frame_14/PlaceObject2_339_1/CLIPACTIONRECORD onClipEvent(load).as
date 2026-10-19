onClipEvent(load){
   if(_root.lv != 10)
   {
      _parent.prevFrame();
   }
   else if(_parent._parent._parent._parent._name == "d8" || _parent._parent._name == "up_boad")
   {
      if(_parent._parent._name == "up_boad")
      {
         with(this)
         {
            gotoAndStop("info");
         }
      }
      _parent._parent._parent._parent.enemy_i = "boss";
      hp = 500;
      attack = 500;
      score = 500;
      if(_root.hp_con == undefined)
      {
         _parent._parent._parent._parent.hp = hp;
      }
      else
      {
         _parent._parent._parent._parent.hp = _root.hp_con;
      }
      _parent._parent._parent._parent.attack = attack;
      _parent._parent._parent._parent.score = score;
      _parent._parent.life = 10;
      _parent._parent.damage = "--";
      _parent._parent.point = score;
   }
   else
   {
      _parent.prevFrame();
   }
}
