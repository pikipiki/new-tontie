on(keyPress "0"){
   _root.sound("key_push");
   i = 1;
   while(i < _root.lv)
   {
      if(_root.kakuritu_org > _root.up_kakuritu_mx)
      {
         _root.kakuritu_org -= _root.up_kakuritu;
         if(_root.kakuritu_org < _root.up_kakuritu_mx)
         {
            _root.kakuritu_org = _root.up_kakuritu_mx;
         }
      }
      if(_root.koma > _root.up_char_mx)
      {
         _root.koma -= _root.up_char;
      }
      if(_root.top_stay > _root.up_top_mx)
      {
         _root.top_stay -= _root.up_top;
      }
      if(_root.timer <= _root.up_time_mx)
      {
         _root.timer += _root.up_time;
      }
      i++;
   }
   _root.money = 999;
   _root.coin100();
   _root.hammer_lv = 4;
   _root.hammer.gotoAndStop(_root.hammer_lv);
   _root.wing = 1;
   _root.hammer.wing.gotoAndStop("on");
   i = 1;
   while(i <= 2)
   {
      _root.life.nextFrame();
      _root.kaihuku(_root.heart1);
      _root.life.stone.app();
      i++;
   }
   _root.stone = 1;
   _root.life.stone.gotoAndStop("on");
   with(_root.life.red)
   {
      gotoAndPlay("gard");
   }
   _root.gun = 1;
   _root.hammer.gotoAndStop("gun");
   _root.bronze = 1;
   _root.silver = 1;
   _root.gold = 1;
   _root.gotoAndStop("start");
}
