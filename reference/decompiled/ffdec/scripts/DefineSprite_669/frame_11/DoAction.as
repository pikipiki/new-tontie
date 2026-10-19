with(doka)
{
   gotoAndPlay("on");
}
if(_parent.enemy_i == 0)
{
   _parent.se = "karaburi";
   _root.miss_l += 1;
}
else if(_parent.enemy_i == 1)
{
   if(_parent.hit == 1 || _parent.hit == 2 || _parent.hit == 3)
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
   else if(_parent.hit == "bakudan")
   {
      _parent.se = "bokan";
      _parent.hp -= _root.attack;
      _parent.attack = 0;
      _parent.enemy_i = 0;
      _root.score += _parent.score;
      with(_parent.dodai_all.enemy_all.enemy.i)
      {
         gotoAndPlay("bokan");
      }
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
else
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
   if(_parent.hit != 1)
   {
      if(_parent.hit == "bakudan")
      {
         _parent.se = "bokan";
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
         _parent.dodai_all.enemy_all.enemy.i.boss.bomb.gotoAndPlay("bokan");
         _parent.dodai_all.enemy_all.enemy.i.boss.bomb.k = "gun";
      }
   }
}
_root.sound(_parent.se);
