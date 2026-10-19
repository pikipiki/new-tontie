on(release, keyPress "+"){
   stopAllSounds();
   _root.sound("key_push");
   _root.piko = [];
   _root.score = 0;
   _root.life.red._visible = 1;
   _root.life.red._width = 200;
   _root.kaihuku(200);
   _root.gun = 0;
   with(_root.hammer)
   {
      gotoAndStop(_root.hammer_lv);
   }
   _root.bacun._visible = 0;
   if(_root.bronze == 1 && _root.hammer._currentframe < 2)
   {
      _root.hammer_lv = 2;
      _root.hammer.gotoAndStop(2);
   }
   if(_root.silver == 1 && _root.hammer._currentframe < 3)
   {
      _root.hammer_lv = 3;
      _root.hammer.gotoAndStop(3);
   }
   if(_root.gold == 1 && _root.hammer._currentframe < 4)
   {
      _root.hammer_lv = 4;
      _root.hammer.gotoAndStop(4);
   }
   _root.life.red.gotoAndStop(1);
   _root.life.stone.gotoAndStop("off");
   _root.money = Math.round(_root.money / 2);
   _root.shop_l = 0;
   if(_root.con != "e")
   {
      _root.con -= 1;
   }
   _root.hp_con = undefined;
   with(_root)
   {
      gotoAndStop("start");
   }
}
