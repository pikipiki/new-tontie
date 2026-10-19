onClipEvent(load){
   _parent._parent._parent._parent.enemy_i = 2;
   if(_root.lv == 10 && _root.iroiro.data.sekiban2 != "aergipu")
   {
      this.gotoAndStop("lv10");
   }
   else if(_root.lv == 20 && _root.iroiro.data.sekiban3 != "aileruhf")
   {
      this.gotoAndStop("lv20");
   }
   else if(_root.lv == 100)
   {
      this.gotoAndStop("lv100");
   }
   else
   {
      this.gotoAndStop("lv30");
   }
}
