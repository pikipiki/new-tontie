stop();
_root.gameframe = _currentframe;
if(_root.ppp == 0)
{
   d8.dodai_all.enemy_all.enemy.life._visible = 1;
   d8.dodai_all.enemy_all.enemy.life2._visible = 1;
   if(_root.hp_con != undefined)
   {
      _root.d8.dodai_all.enemy_all.enemy.life2.bar._width = _root.d8.w_org * _root.hp_con;
   }
}
else
{
   _root.ppp = 0;
}
