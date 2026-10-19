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
if(_root.iroiro.data.silver_hi == undefined || _root.score > _root.iroiro.data.silver_hi)
{
   _root.iroiro.data.silver_hi = _root.score;
}
_root.hi_score = "Hi-SCORE / " + _root.iroiro.data.silver_hi;
play();
