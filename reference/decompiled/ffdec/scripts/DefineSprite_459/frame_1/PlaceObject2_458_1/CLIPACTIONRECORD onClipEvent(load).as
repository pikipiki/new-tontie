onClipEvent(load){
   _parent._parent._parent.score = 0;
   _parent._parent._parent.hit = 1;
   k = 1;
   if(_root.lv == 10 || _root.lv == 20)
   {
      k = Math.floor(Math.random() * 35);
   }
   else if(_root.shop_l == 0)
   {
      k = Math.floor(Math.random() * (_root.lv_up.sikaku.k / _root.fps));
   }
   if(k != 0)
   {
      k = Math.floor(Math.random() * 80);
      if(k != 0)
      {
         _root.monster_l += 1;
         _parent._parent._parent.enemy_i = 1;
         this.gotoAndStop(Math.floor(Math.random() * _root.lv + 5));
      }
      else
      {
         _parent._parent._parent.enemy_i = 1;
         _parent._parent._parent.hit = "takara";
         this.gotoAndStop("takara");
      }
   }
   else
   {
      stop();
      _root.shop_l = 1;
      _parent._parent._parent.enemy_i = 1;
      _parent._parent._parent.hit = "shop";
   }
}
