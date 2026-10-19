on(keyPress "4"){
   if(_parent.rf_ok == 1)
   {
      _root.sound("push");
      _root.lv -= 1;
      _parent.play();
   }
}
