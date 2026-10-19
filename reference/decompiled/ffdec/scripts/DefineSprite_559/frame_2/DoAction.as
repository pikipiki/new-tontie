play();
_root.sound("panel");
i = 1;
while(i <= 9)
{
   with(eval("_root.d" + i))
   {
      gotoAndStop("off");
   }
   i++;
}
if(_root.iroiro.data.bouns < _root.lv)
{
   _root.iroiro.data.bouns = _root.lv;
}
