onClipEvent(load){
   k = Math.floor(Math.random() * 15);
   if(k > 1)
   {
      _parent._parent._parent._parent.enemy_i = 0;
      _parent._parent._parent.joutai = "down";
      with(this)
      {
         gotoAndStop("non");
      }
   }
   else
   {
      _parent._parent._parent._parent.enemy_i = 2;
      k = Math.floor(Math.random() * 3 + 1);
      this.gotoAndStop("life" + k);
   }
}
