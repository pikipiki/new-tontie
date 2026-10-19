stop();
enemy_i = 0;
if(eval("_root.enemy" + _name.substr(1,1)) != "eye")
{
   set("_root.enemy" + _name.substr(1,1),0);
}
