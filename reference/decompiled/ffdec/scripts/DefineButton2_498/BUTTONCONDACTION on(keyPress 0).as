on(keyPress "0"){
   gotoAndStop("go");
   play();
   if(_root.timer <= _root.up_time_mx)
   {
      _root.timer += _root.up_time;
   }
}
