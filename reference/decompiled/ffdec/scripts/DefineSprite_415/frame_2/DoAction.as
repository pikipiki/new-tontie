if(k != "gun")
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
_parent.bakuhatu = 1;
