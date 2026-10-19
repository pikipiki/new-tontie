function psw_check(b_name)
{
   _root.check_i += 1;
   _root.pass.push(b_name.substr(1,1));
   if(_root.check_i >= 9)
   {
      if(_root.pass.toString() == _root.pass4 || _root.pass.toString() == _root.pass3 || _root.pass.toString() == _root.pass2 || _root.pass.toString() == _root.pass1)
      {
         _root.sound("psw_ok");
      }
   }
}
function start_ok(b_name)
{
   _root.start_i += 1;
   if(_root.start_i >= 9)
   {
      if(_root.pass.toString() == _root.pass3)
      {
         _root.pass = [];
         _root.con = "e";
         _root.select.gotoAndStop("on");
      }
      else if(_root.pass.toString() == _root.pass2)
      {
         _root.lv = 11;
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
         _root.money = 100;
         _root.coin100();
         _root.hammer_lv = 3;
         _root.hammer.gotoAndStop(_root.hammer_lv);
         _root.wing = 1;
         _root.hammer.wing.gotoAndStop("on");
         _root.bronze = 1;
         _root.silver = 1;
         _root.life.nextFrame();
         _root.kaihuku(_root.heart1);
         _root.life.stone.app();
         _root.pass = [];
         _root.gotoAndStop("start");
      }
      else if(_root.pass.toString() == _root.pass1)
      {
         _root.money = 100;
         _root.coin100();
         _root.hammer_lv = 2;
         _root.hammer.gotoAndStop(_root.hammer_lv);
         _root.bronze = 1;
         _root.pass = [];
         _root.gotoAndStop("start");
      }
      else if(_root.pass.toString() == _root.pass4)
      {
         _root.up_kakuritu_mx = 2;
         _root.up_char_mx = 1;
         _root.up_top_mx = 1;
         _root.silver_ok = 1;
         _root.hammer_lv = 3;
         _root.hammer.gotoAndStop(_root.hammer_lv);
         _root.wing = 1;
         _root.hammer.wing.gotoAndStop("on");
         _root.bronze = 1;
         _root.silver = 1;
         _root.lv = "KIA";
         _root.pass = [];
         _root.gotoAndStop("start");
      }
      else
      {
         _root.gotoAndStop("start");
      }
   }
}
function sound(se)
{
   if(_root.sound_on == 1)
   {
      with(soundm)
      {
         gotoAndPlay(se);
      }
   }
}
function sound2(se)
{
   if(_root.sound_on == 1)
   {
      with(sound_bgm)
      {
         gotoAndPlay(se);
      }
   }
}
function piko_ato(targ)
{
   _root.hit_l += 1;
   _root.piko_ok = 0;
   with(_root.key_check)
   {
      gotoAndStop("on");
   }
   if(_root.gun == 0)
   {
      _root.piko.push(targ);
      with(_root.pikopiko)
      {
         gotoAndStop("on");
      }
   }
   else
   {
      _root.piko.push(eval("_root.d" + targ));
      with(_root.bacun)
      {
         gotoAndPlay("on");
      }
      _root.hammer.tama -= 1;
      if(_root.hammer.tama <= 0)
      {
         _root.gun = 0;
         with(_root.hammer)
         {
            gotoAndStop(_root.hammer_lv);
         }
         _root.bacun._visible = 0;
         _root.sound("gun_end");
      }
   }
}
function piko_ato_s(targ)
{
   _root.piko.push(targ);
   _root.piko_ok = 0;
   with(_root.pikopiko)
   {
      gotoAndStop("on");
   }
   with(_root.key_check)
   {
      gotoAndStop("on");
   }
}
function damage(p)
{
   if(_root.stone == 1 && p >= 0)
   {
      life_i = _root.life.red._width;
      if(p != 0)
      {
         with(_root.life.stone)
         {
            play();
         }
      }
   }
   else
   {
      life_i = _root.life.red._width - p;
   }
   if(life_i <= 0)
   {
      _root.life.red._visible = 0;
      if(_root.silver_ok == 0)
      {
         _root.gotoAndPlay("over");
      }
      else
      {
         _root.gotoAndPlay("over_silver");
      }
   }
   _root.life.red._width = life_i;
   if(_root.life.red._width > _root.life.black._width)
   {
      _root.life.red._width = _root.life.black._width;
   }
}
function coin100()
{
   _root.coin2._visible = 0;
   _root.coin1._visible = 0;
   if(_root.money < 100)
   {
      _root.coin2._visible = 1;
   }
   if(_root.money < 10)
   {
      _root.coin1._visible = 1;
   }
}
function damage_coin(kingaku)
{
   _root.money -= kingaku;
   if(_root.money <= 0)
   {
      _root.money = 0;
   }
   _root.coin100();
}
function kaihuku(p)
{
   _root.life.red._width += p;
   if(_root.life.red._width > _root.life.black._width)
   {
      _root.life.red._width = _root.life.black._width;
   }
}
Stage.scaleMode = "noScale";
_root.sound_on = 1;
pass1 = "8,1,6,4,7,5,2,3,9";
pass2 = "9,6,5,8,1,3,4,7,2";
pass3 = "7,2,6,5,3,8,9,4,1";
pass4 = "9,7,1,3,8,4,2,6,5";
pass_org = "Push Your Keybord";
