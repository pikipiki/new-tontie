onClipEvent(load){
   if(eval("_root.enemy" + _parent._parent._parent._parent._name.substr(1,1)) == "eye")
   {
      _parent.gotoAndStop("bom_head");
   }
   else
   {
      _parent._parent._parent._parent.hit = 2;
      _parent._parent._parent._parent.sikaesi = 40;
      _parent._parent._parent._parent.nikai = 1;
      if(_parent._parent._name == "up_boad")
      {
         this.gotoAndStop("info");
      }
      hp = 4;
      attack = 65;
      score = 25;
      _parent.item = "life2";
      _parent._parent._parent._parent.hp = hp;
      _parent._parent._parent._parent.attack = attack;
      _parent._parent._parent._parent.score = score;
      _parent._parent.life = hp;
      _parent._parent.damage = - attack;
      _parent._parent.point = score;
   }
}
