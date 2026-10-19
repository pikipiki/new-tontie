_parent._parent._parent.sinamono = "utuwa";
if(_root.life._currentframe >= 3)
{
   _parent._parent._parent.price = "soldout";
   with(price)
   {
      gotoAndStop("soldout");
   }
}
else
{
   _parent._parent._parent.price = 150;
}
