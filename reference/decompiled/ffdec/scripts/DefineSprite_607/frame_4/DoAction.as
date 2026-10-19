function buy()
{
   _root.sound("buy");
   _root.money -= _parent.price;
   _root.coin100();
   _parent.price = "soldout";
   with(_parent.dodai_all.enemy_all.enemy)
   {
      gotoAndStop("non");
   }
   _parent.dodai_all.joutai = "down";
}
with(doka)
{
   gotoAndPlay("on");
}
if(_parent.enemy_i == 1)
{
   if(_parent.price != "soldout")
   {
      if(_root.money >= _parent.price)
      {
         if(_parent.sinamono == "heart1")
         {
            _root.kaihuku(_parent.up_i);
            buy();
         }
         else if(_parent.sinamono == "heart2")
         {
            _root.kaihuku(_parent.up_i);
            buy();
         }
         else if(_parent.sinamono == "heart3")
         {
            _root.kaihuku(_parent.up_i);
            buy();
         }
         else if(_parent.sinamono == "tubasa")
         {
            _root.wing = 1;
            with(_root.hammer.wing)
            {
               gotoAndStop("on");
            }
            buy();
         }
         else if(_parent.sinamono == "sekiban")
         {
            _root.iroiro.data.sekiban1 = "awebliucy";
            buy();
         }
         else if(_parent.sinamono == "con")
         {
            if(_root.con != "e")
            {
               _root.con += 1;
            }
            buy();
         }
         else if(_parent.sinamono == "utuwa")
         {
            _root.life.nextFrame();
            _root.kaihuku(_root.heart1);
            _root.life.stone.app();
            buy();
         }
         else if(_parent.sinamono == "hammer1")
         {
            if(_root.gun == 0)
            {
               _root.hammer.gotoAndStop(2);
            }
            _root.hammer_lv = 2;
            _root.bronze = 1;
            buy();
         }
         else if(_parent.sinamono == "hammer2")
         {
            if(_root.gun == 0)
            {
               _root.hammer.gotoAndStop(3);
            }
            _root.hammer_lv = 3;
            _root.silver = 1;
            buy();
         }
         else if(_parent.sinamono == "hammer3")
         {
            if(_root.gun == 0)
            {
               _root.hammer.gotoAndStop(4);
            }
            _root.hammer_lv = 4;
            _root.gold = 1;
            buy();
         }
      }
      else
      {
         _root.sound("no_buy");
      }
   }
}
