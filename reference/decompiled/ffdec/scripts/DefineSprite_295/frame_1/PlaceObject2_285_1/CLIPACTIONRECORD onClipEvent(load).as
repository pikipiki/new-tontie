onClipEvent(load){
   if(_parent._parent._name == "enemy_b")
   {
      with(this)
      {
         stop();
      }
   }
   name = _parent._parent._parent._parent._parent._name.substr(1,1);
}
