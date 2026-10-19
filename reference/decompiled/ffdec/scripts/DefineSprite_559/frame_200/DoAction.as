stop();
rf_ok = 1;
_root.kaijo_ok = 1;
lifemater.gotoAndStop(life);
if(_root.lv <= 1)
{
   r.gotoAndStop(2);
}
else
{
   r.gotoAndStop(1);
}
if(_root.lv >= _root.lv_org)
{
   f.gotoAndStop(2);
}
else
{
   f.gotoAndStop(1);
}
