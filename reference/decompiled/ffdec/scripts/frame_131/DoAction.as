stop();
_root.ppp = 1;
_root.piko_ok = 1;
_root.shop_in = 0;
i = 1;
while(i <= 9)
{
   with(eval("_root.s" + i))
   {
      gotoAndStop("on");
   }
   i++;
}
