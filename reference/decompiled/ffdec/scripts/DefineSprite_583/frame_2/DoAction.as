gun.gotoAndStop(Number(String(_root.piko[0]).substr(9,1)) + 1);
with(gun.gun)
{
   gotoAndPlay(1);
}
_root.sound("gun");
