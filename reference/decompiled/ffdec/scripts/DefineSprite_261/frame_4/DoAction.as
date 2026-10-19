with(doka)
{
   gotoAndPlay("on");
}
if(_parent.enemy_i == 0)
{
   _root.damage(_root.karaburi);
   _parent.se = "karaburi";
   _root.miss_l += 1;
}
else if(_parent.enemy_i == 1)
{
   if(_parent.hit == 1)
   {
      _parent.hp -= _root.attack;
      if(_parent.hp <= 0)
      {
         todome();
      }
      else
      {
         _parent.se = "hit";
      }
   }
   else if(_parent.hit == 2)
   {
      _root.miss_l += 1;
   }
   else if(_parent.hit == 3)
   {
      _parent.hp -= _root.attack;
      if(_parent.hp <= 0)
      {
         todome();
      }
      else
      {
         _root.miss_l += 1;
         if(_parent.sikaesi != "coin")
         {
            _parent.se = "damage";
            _root.damage(_parent.sikaesi);
         }
         else if(_root.money > 0)
         {
            if(_parent.kingaku > 10)
            {
               _parent.se = "damage_coin30";
            }
            else
            {
               _parent.se = "damage_coin";
            }
            _root.damage_coin(_parent.kingaku);
            with(_parent.dodai_all.enemy_all.enemy.char)
            {
               gotoAndPlay("on");
            }
         }
      }
   }
   else if(_parent.hit == "bakudan")
   {
      _root.miss_l += 1;
      _parent.se = "bokan";
      _parent.hp -= _root.attack;
      _root.damage(_parent.sikaesi);
      _parent.attack = 0;
      _parent.enemy_i = 0;
      _root.score += _parent.score;
      with(_parent.dodai_all.enemy_all.enemy.i)
      {
         gotoAndPlay("bokan");
      }
   }
   else if(_parent.hit == "kaihuku")
   {
      kaihuku();
   }
   else if(_parent.hit == "all_bakudan")
   {
      all_bakudan();
   }
   else if(_parent.hit == "shop")
   {
      shop();
   }
   else if(_parent.hit == "takara")
   {
      box();
   }
}
else if(_parent.enemy_i == 2)
{
   item();
}
else if(_parent.enemy_i == 4)
{
   takara();
}
else if(_parent.hit == 1)
{
   _parent.hp -= _root.attack;
   if(_parent.hp <= 0)
   {
      boss_die();
   }
   else
   {
      _parent.dodai_all.enemy_all.enemy.life.bar._width = _parent.w_org * _parent.hp;
      _parent.dodai_all.enemy_all.enemy.life2.bar._width = _parent.w_org * _parent.hp;
      _parent.se = "hit";
   }
}
else if(_parent.hit == "bakudan")
{
   _parent.se = "bokan";
   _root.damage(_parent.sikaesi);
   if(_root.lv == 10)
   {
      _parent.dodai_all.enemy_all.enemy.i.gotoAndPlay("bokan");
   }
   else
   {
      _parent.dodai_all.enemy_all.enemy.i.boss.bomb.gotoAndPlay("bokan");
   }
}
else if(_parent.hit == "bakudan_last")
{
   _parent.se = "bokan";
   _parent.dodai_all.enemy_all.enemy.i.boss.bomb.gotoAndPlay("bokan");
}
else if(_parent.hit == 2)
{
   _root.miss_l += 1;
}
_root.sound(_parent.se);
