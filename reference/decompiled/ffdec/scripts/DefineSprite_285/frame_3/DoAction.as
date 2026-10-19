e_all = [1,2,3,4,5,6,7,8,9];
e = [];
i = 1;
while(i <= 9)
{
   targ = Math.floor(Math.random() * e_all.length);
   e.push(e_all[targ]);
   e_all.splice(targ,1);
   i++;
}
no = 0;
i = 0;
while(i < 9)
{
   if(eval("_root.enemy" + e[i]) != "eye")
   {
      set("_root.enemy" + e[i],"eye");
      set("_root.henkan" + e[i],name);
      set("_root.henkan" + name,e[i]);
      henkan = e[i];
      break;
   }
   no += 1;
   i++;
}
if(no >= 9)
{
   henkan = name;
}
