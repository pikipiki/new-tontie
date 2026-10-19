on(release){
   _root.sound_on = 1;
   if(_root._currentframe == _root.gameframe)
   {
      _root.sound2("game");
   }
   prevFrame();
   _root.sound("push");
}
