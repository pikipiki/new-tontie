onClipEvent(unload){
   if(_parent.no < 9)
   {
      if(eval("_root.d" + _parent.henkan + "._currentframe") == 1)
      {
         set("_root.enemy" + _parent.henkan,0);
      }
      else
      {
         set("_root.enemy" + _parent.henkan,1);
      }
      set("_root.henkan" + _parent.henkan,0);
      set("_root.henkan" + _parent.name,0);
   }
   set("_root.enemy" + _parent.name,0);
}
