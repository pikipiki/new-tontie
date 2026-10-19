on(keyPress "0"){
   gotoAndStop("go_silver");
   play();
   if(_root.timer <= _root.up_time_mx)
   {
      _root.timer += _root.up_time;
   }
}
