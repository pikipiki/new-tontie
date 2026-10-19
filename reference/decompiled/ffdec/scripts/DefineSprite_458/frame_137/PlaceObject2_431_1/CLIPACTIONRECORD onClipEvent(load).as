onClipEvent(load){
   _root.sound("item_on");
   _parent._parent._parent._parent.enemy_i = 2;
   k = Math.floor(Math.random() * 3 + 1);
   this.gotoAndStop("coin" + k);
}
