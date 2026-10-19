onClipEvent(load){
   if(_root.lvup == 0)
   {
      this._width = 400;
      if(_root.lv == 10 || _root.lv == 20)
      {
         k = _root.fps * 120;
      }
      else
      {
         k = _root.fps * _root.timer;
      }
      o = 400 / k;
   }
}
