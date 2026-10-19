on(keyPress "0"){
   if(_root.shop_in == 0)
   {
      if(_root.pause == 0)
      {
         sound_bgm.soundObject.setVolume(30);
         _root.pause = 1;
         _root.kaijo_ok = 0;
         _root.piko_ok = 0;
         _root.lv_org = _root.lv;
         _root.up_boad.gotoAndPlay("pause");
         _root.gotoAndStop("pause");
         _root.sound("pause");
      }
      else if(_root.kaijo_ok == 1)
      {
         sound_bgm.soundObject.setVolume(100);
         _root.pause = 0;
         _root.piko_ok = 1;
         _root.lv = _root.lv_org;
         _root.up_boad.gotoAndStop("stay");
         _root.gotoAndStop("game");
         _root.sound("pause");
      }
   }
}
