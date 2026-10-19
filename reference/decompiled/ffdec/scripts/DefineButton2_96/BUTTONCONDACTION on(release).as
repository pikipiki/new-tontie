on(release){
   _root.sound("push");
   if(_url.substr(29,2) == "jp" || _url.substr(24,2) == "jp")
   {
      getUrl("http://www.eyezmaze.com/jp/2002/01/donation.html", "");
   }
   else if(_url.substr(11,2) == "fr")
   {
      getUrl("http://www.fr.eyezmaze.com/2002/01/donation.html", "");
   }
   else if(_url.substr(11,2) == "es")
   {
      getUrl("http://www.es.eyezmaze.com/2002/01/donation.html", "");
   }
   else if(_url.substr(11,2) == "ko")
   {
      getUrl("http://www.ko.eyezmaze.com/2002/01/donation.html", "");
   }
   else if(_url.substr(11,5) == "zh-tw")
   {
      getUrl("http://www.zh-tw.eyezmaze.com/2002/01/donation.html", "");
   }
   else
   {
      getUrl("http://www.eyezmaze.com/eyezblog_en/blog/2002/01/donation.html", "");
   }
}
