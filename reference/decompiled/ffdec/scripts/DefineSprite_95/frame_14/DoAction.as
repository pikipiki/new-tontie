k -= 1;
mabataki = Math.floor(Math.random() * k);
if(mabataki == 1)
{
   gotoAndStop("m1");
   play();
}
else if(mabataki == 0)
{
   gotoAndStop("m2");
   play();
}
else
{
   gotoAndStop("be");
   play();
}
