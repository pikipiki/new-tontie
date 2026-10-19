on(press){
   if(_root.start_push_ok == 1)
   {
      _root.start_push_ok = 0;
      _root.pass = [];
      _root.start_i = 0;
      i = 1;
      while(i <= 9)
      {
         eval("_root.a" + i).gotoAndStop(1);
         i++;
      }
      play();
   }
}
