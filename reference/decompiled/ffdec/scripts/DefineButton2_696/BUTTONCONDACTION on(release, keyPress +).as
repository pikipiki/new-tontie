on(release, keyPress "+"){
   stopAllSounds();
   _root.sound("key_push");
   _root.piko = [];
   _root.score = 0;
   _root.life.red._visible = 1;
   _root.life.red._width = 200;
   _root.kaihuku(200);
   _root.gun = 0;
   _root.bacun._visible = 0;
   _root.life.red.gotoAndStop(1);
   _root.life.stone.gotoAndStop("off");
   _root.money = 0;
   _root.shop_l = 0;
   if(_root.con != "e")
   {
      _root.con -= 1;
   }
   _root.hp_con = undefined;
   _root.fps = 17;
   _root.timer = 60;
   _root.kakuritu_org = _root.fps * 2;
   _root.koma = _root.fps;
   _root.top_stay = _root.fps * 4;
   _root.up_time = 1;
   _root.up_kakuritu = 2.5;
   _root.up_char = 1;
   _root.up_top = 1.5;
   _root.up_time_mx = 80;
   _root.up_kakuritu_mx = 3;
   _root.up_char_mx = 6;
   _root.up_top_mx = 50;
   _root.silver_ok = 1;
   _root.start_push_ok = 1;
   _root.pass = [];
   _root.pause = 0;
   _root.score = 0;
   _root.money = 0;
   _root.con = 10;
   _root.mogura_on = 0;
   _root.piko = [];
   _root.piko_ok = 1;
   _root.karaburi = 10;
   _root.heart1 = 52;
   _root.shop_l = 0;
   _root.hit_all = 0;
   _root.hit_l = 0;
   _root.miss_all = 0;
   _root.miss_l = 0;
   _root.monster_all = 0;
   _root.monster_l = 0;
   _root.monster_ls = 0;
   _root.monster_ls_next = 2;
   _root.lost_all = 0;
   _root.lost_l = 0;
   _root.speed_l = 0;
   _root.speed_t = 0;
   _root.speed_k = 0;
   _root.speed_k_t = 0;
   _root.shop_in = 0;
   _root.start_i = 0;
   _root.check_i = 0;
   _root.ppp = 0;
   with(_root)
   {
      gotoAndStop("start");
   }
}
