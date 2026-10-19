if(_root.gun != 1)
{
   if(_root.hammer_lv > 1)
   {
      _root.hammer_lv -= 1;
      with(_root.hammer.bokan)
      {
         gotoAndPlay("on");
      }
   }
}
