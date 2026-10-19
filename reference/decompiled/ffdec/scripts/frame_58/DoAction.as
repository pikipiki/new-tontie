_root.lvup = 0;
_root.piko_ok = 1;
_root.ppp = 0;
i = 1;
while(i <= 9)
{
   set("_root.henkan" + i,0);
   i++;
}
i = 1;
while(i <= 9)
{
   set("_root.enemy" + i,0);
   i++;
}
with(_root.d8)
{
   gotoAndStop("on");
}
