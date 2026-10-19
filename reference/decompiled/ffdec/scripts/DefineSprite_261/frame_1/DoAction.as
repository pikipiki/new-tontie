function all_bakudan()
{
   _parent.se = "bokan";
   i = 1;
   while(i <= 9)
   {
      if(eval("_root.d" + i + ".enemy_i") != 0 && eval("_root.d" + i + ".dodai_all.joutai") != "down")
      {
         if(!(String(_root.lv / 10).indexOf(".") == -1 && i == 8))
         {
            set("_root.d" + i + ".dodai_all..k",_root.top_stay);
            eval("_root.d" + i + ".dodai_all.enemy_all.enemy.bomb_bokan").gotoAndPlay("on");
         }
      }
      i++;
   }
}
function kaihuku()
{
   _parent.se = "life_get";
   _root.life.red._width -= _parent.sikaesi;
   if(_root.life.red._width > _root.life.black._width)
   {
      _root.life.red._width = _root.life.black._width;
   }
}
function todome()
{
   _parent.se = "todome";
   if(_parent.nikai != 1)
   {
      _parent.attack = 0;
      _root.score += _parent.score;
      _parent.dodai_all.enemy_all.enemy.gotoAndStop("die");
   }
   else
   {
      _parent.nikai = 0;
      _parent.dodai_all.enemy_all.enemy.char.nextFrame();
   }
}
function takara()
{
   _parent.attack = 0;
   if(_parent.item_i == "stone")
   {
      _parent.se = "crystal_get";
      with(_root.life.stone)
      {
         gotoAndStop("on");
      }
      if(_root.stone == 0)
      {
         with(_root.life.red)
         {
            gotoAndPlay("gard");
         }
      }
      _parent.enemy_i = 0;
      with(_parent.dodai_all.enemy_all.enemy.i)
      {
         gotoAndStop("non");
      }
      _parent.dodai_all.joutai = "down";
   }
   else if(_parent.item_i == "gun")
   {
      _parent.se = "gun_get";
      with(_root.hammer)
      {
         gotoAndPlay("gun");
      }
      _parent.enemy_i = 0;
      with(_parent.dodai_all.enemy_all.enemy.i)
      {
         gotoAndStop("non");
      }
      _parent.dodai_all.joutai = "down";
   }
   else if(_parent.item_i == "allcoin")
   {
      _parent.se = "allcoin_get";
      i = 1;
      while(i <= 9)
      {
         if(eval("_root.d" + i + ".enemy_i") != 0)
         {
            if(!(String(_root.lv / 10).indexOf(".") == -1 && i == 8))
            {
               with(eval("_root.d" + i + ".dodai_all.enemy_all.enemy"))
               {
                  gotoAndStop("coin");
               }
               set("_root.d" + i + ".dodai_all..k",_root.top_stay);
            }
         }
         i++;
      }
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "alllife")
   {
      _parent.se = "alllife_get";
      i = 1;
      while(i <= 9)
      {
         if(eval("_root.d" + i + ".enemy_i") != 0)
         {
            if(!(String(_root.lv / 10).indexOf(".") == -1 && i == 8))
            {
               set("_root.d" + i + ".dodai_all..k",_root.top_stay);
               with(eval("_root.d" + i + ".dodai_all.enemy_all.enemy"))
               {
                  gotoAndStop("life");
               }
            }
         }
         i++;
      }
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "utsuwa")
   {
      _parent.se = "sp_get";
      _root.life.nextFrame();
      _root.kaihuku(_root.heart1);
      _root.life.stone.app();
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "wing")
   {
      _parent.se = "sp_get";
      _root.wing = 1;
      with(_root.hammer.wing)
      {
         gotoAndStop("on");
      }
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "hammer1")
   {
      _parent.se = "sp_get";
      if(_root.gun == 0)
      {
         _root.hammer.gotoAndStop(1);
      }
      _root.hammer_lv = 1;
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "hammer2")
   {
      _parent.se = "sp_get";
      if(_root.gun == 0)
      {
         _root.hammer.gotoAndStop(2);
      }
      _root.bronze = 1;
      _root.hammer_lv = 2;
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "hammer3")
   {
      _parent.se = "sp_get";
      if(_root.gun == 0)
      {
         _root.hammer.gotoAndStop(3);
      }
      _root.silver = 1;
      _root.hammer_lv = 3;
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "hammer4")
   {
      _parent.se = "sp_get";
      if(_root.gun == 0)
      {
         _root.hammer.gotoAndStop(4);
      }
      _root.gold = 1;
      _root.hammer_lv = 4;
      _parent.enemy_i = 0;
   }
   _parent.dodai_all.joutai = "down";
   with(_parent.dodai_all.enemy_all.enemy.i)
   {
      gotoAndStop("non");
   }
}
function shop()
{
   stopAllSounds();
   _parent.se = "shop_in";
   _root.pause = 1;
   _root.shop_in = 1;
   _root.piko_ok = 0;
   _root.piko = [];
   _root.lv_con = _root.lv_up.sikaku.k;
   if(_root.lv == 10 || _root.lv == 20)
   {
      _root.hp_con = _root.d8.hp;
   }
   with(_root.up_boad)
   {
      gotoAndPlay("shop");
   }
}
function box()
{
   _parent.se = "takara_open";
   with(_parent.dodai_all.enemy_all.enemy)
   {
      gotoAndStop("box_open");
   }
}
function item()
{
   if(_parent.item_i == "life")
   {
      _parent.se = "life_get";
      _root.kaihuku(_parent.up_i);
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "sekiban2")
   {
      _parent.se = "sekiban";
      _root.iroiro.data.sekiban2 = "aergipu";
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "sekiban3")
   {
      _parent.se = "sekiban";
      _root.iroiro.data.sekiban3 = "aileruhf";
      _parent.enemy_i = 0;
   }
   else if(_parent.item_i == "coin")
   {
      _parent.se = "coin_get";
      _root.money += _parent.up_i;
      if(_root.money > 999)
      {
         _root.money = 999;
      }
      _root.coin100();
      _parent.enemy_i = 0;
   }
   _parent.dodai_all.joutai = "down";
   with(_parent.dodai_all.enemy_all.enemy.i)
   {
      gotoAndStop("non");
   }
}
function boss_die()
{
   _root.lvup = 1;
   _parent.dodai_all.enemy_all.enemy.life._visible = 0;
   _root.boss = 0;
   _parent.se = "todome";
   _parent.attack = 0;
   _root.score += _parent.score;
   with(_parent.dodai_all.enemy_all.enemy)
   {
      gotoAndStop("die_boss");
   }
   i = 1;
   while(i <= 9)
   {
      if(eval("_root.d" + i + ".enemy_i") != 0)
      {
         if(i != 8)
         {
            with(eval("_root.d" + i + ".dodai_all.enemy_all.enemy"))
            {
               gotoAndStop("life");
            }
         }
      }
      i++;
   }
}
