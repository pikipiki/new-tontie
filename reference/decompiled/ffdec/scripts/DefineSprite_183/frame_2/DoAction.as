_root.stone = 1;
i = 1;
while(i <= 6)
{
   with(eval("s" + i))
   {
      gotoAndStop(1);
   }
   i++;
}
app();
nextFrame();
