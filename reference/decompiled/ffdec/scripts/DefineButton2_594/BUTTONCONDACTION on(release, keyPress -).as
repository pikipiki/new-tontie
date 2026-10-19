on(release, keyPress "-"){
   stopAllSounds();
   _root.score = 0;
   _root.sound("key_push");
   gotoAndStop("title");
}
