on(keyPress "6"){
   if(_parent.rf_ok == 1)
   {
      _root.sound("push");
      _root.lv += 1;
      _parent.play();
   }
}
