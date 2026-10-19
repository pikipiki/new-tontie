on(keyPress "8"){
   if(_parent.piko_ok == 1)
   {
      _parent.piko_ok = 0;
      _parent.play();
      _root.lv += 1;
   }
}
