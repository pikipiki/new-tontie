on(keyPress "2"){
   if(_parent.piko_ok == 1)
   {
      _parent.piko_ok = 0;
      _parent.play();
      if(_root.lv >= 1)
      {
         _root.lv -= 1;
      }
   }
}
