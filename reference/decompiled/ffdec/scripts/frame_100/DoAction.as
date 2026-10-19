_root.piko = [];
i = 1;
while(i <= 9)
{
   set("_root.d" + i + ".dodai_all.joutai","down");
   i++;
}
_root.piko_ok = 0;
with(_root.up_boad)
{
   gotoAndStop("over");
}
if(_root.iroiro.data.bouns == undefined || _root.lv > _root.iroiro.data.bouns)
{
   _root.iroiro.data.bouns = _root.lv;
}
if(_root.iroiro.data.soid == undefined || _root.score > _root.iroiro.data.soid)
{
   _root.iroiro.data.soid = _root.score;
}
play();
