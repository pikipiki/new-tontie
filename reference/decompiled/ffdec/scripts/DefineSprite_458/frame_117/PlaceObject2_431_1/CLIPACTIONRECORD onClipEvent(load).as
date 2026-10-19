onClipEvent(load){
   if(_parent.item == 0)
   {
      k = Math.floor(Math.random() * 5);
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
         _root.sound("item_on");
         k = Math.floor(Math.random() * 5 + 1);
         if(k == 5 && _root.life.red._width < _root.life.black._width - 1)
         {
            this.gotoAndStop("life");
         }
         else
         {
            this.gotoAndStop("coin");
         }
         _parent._parent._parent._parent.enemy_i = 2;
         _parent._parent._parent.k = _root.top_stay;
      }
   }
   else
   {
      _root.sound("item_on");
      _parent._parent._parent._parent.enemy_i = 2;
      this.gotoAndStop(_parent.item);
   }
}
