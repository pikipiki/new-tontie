function app()
{
   _root.life.stone.s5._visible = 1;
   _root.life.stone.s6._visible = 1;
   if(_root.life._currentframe == 1)
   {
      _root.life.stone.s5._visible = 0;
      _root.life.stone.s6._visible = 0;
   }
   if(_root.life._currentframe == 2)
   {
      _root.life.stone.s6._visible = 0;
   }
   if(_root.life._currentframe >= 3)
   {
      _root.life.stone.s5._visible = 1;
      _root.life.stone.s6._visible = 1;
   }
}
stop();
_root.stone = 0;
