onClipEvent(load){
   _parent._parent._parent.hit = 1;
   _root.monster_l += 1;
   _root.monster_ls += 1;
   if(_root.monster_ls >= _root.monster_ls_next)
   {
      _root.monster_ls_next = _root.monster_ls_next * 1.2 * 1.2 * 1.2;
      _root.lv_set();
      _root.lv_silver += 1;
      if(_root.lv_silver >= 6 && _root.chousei > 1)
      {
         _root.chousei -= 1;
         _root.lv_silver = 0;
      }
      _root.monster_ls = 0;
   }
   _parent._parent._parent.enemy_i = 1;
}
