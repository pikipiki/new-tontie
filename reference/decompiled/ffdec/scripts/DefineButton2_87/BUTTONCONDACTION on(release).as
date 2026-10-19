on(release){
   if(_url.substr(0,22) == "http://202.213.149.177" || _url.substr(0,23) == "http://www.eyezmaze.com")
   {
      _root.sound("push");
      gotoAndStop("tenkey");
   }
   else
   {
      gotoAndStop("tenkey");
   }
}
