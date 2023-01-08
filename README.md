# Online-Soccer-Game
<h2>簡介</h2>
應景一下世足賽，就順便做了這個線上的簡單多人足球遊戲，之後若有空，美觀再用的好看一點和一些細節再調整或是新增一些道具。
<br/>
<h2>遊玩規則</h2>
1. 移動：按上下左右可移動自己的角色。
<br/>
2. 抄球：若觸碰到球，可以按 d 搶球，若成功球就會跟隨自己角色移動。
<br/>
3. 射門：若球在自己身上，可以按 w 向左射門，按 e 向右射門，射球時球會隨機往上下偏移。按著射門鍵越久可以射得越遠，不過射的越遠，球往上下的隨機偏移量越大，且射門時必須站著不動，
在此期間別的玩家可以搶球。
<br/>
4. 道具-香菇：每 10 秒會在地圖上的隨機位置生成。使用者吃到香菇後移動速度會變快，效果維持 5 秒，速度不能累加。
<h2>安裝方法</h2>
0. 安裝 node
<br/>

1.`mkdir soccer`
<br/>
2.`cd soccer`
<br/>
3.`git remote add origin https://github.com/tommygood/Online-Soccer-Game.git`
<br/>
4.`node test.js`
<br/>
5.open localhost:5000 on browser
<h2>實際遊玩</h2>
<image src = "https://github.com/tommygood/Online-Soccer-Game/blob/master/output.gif"></image>
<br/>
<h2>資料來源</h2>
<a href = "https://www.google.com/imgres?imgurl=https%3A%2F%2Fct.yimg.com%2Fxd%2Fapi%2Fres%2F1.2%2FDjaZfLSHXBgLS2uoPJl3JQ--%2FYXBwaWQ9eXR3YXVjdGlvbnNlcnZpY2U7Zmk9ZmlsbDtoPTgwMDtxPTg1O3JvdGF0ZT1hdXRvO3c9ODAw%2Fhttps%3A%2F%2Fs.yimg.com%2Fob%2Fimage%2Fb4048022-5328-4343-b8c2-00081bb9c54f.jpg&imgrefurl=https%3A%2F%2Ftw.bid.yahoo.com%2Famp%2Fitem%2F101131288457&tbnid=7rHf7dePbn6JrM&vet=12ahUKEwjyu6qD9rT8AhVSSfUHHeFzDfwQMygBegUIARC7AQ..i&docid=Sy7k87S4oCi6TM&w=800&h=800&q=%E8%B6%B3%E7%90%83%E6%A1%86&ved=2ahUKEwjyu6qD9rT8AhVSSfUHHeFzDfwQMygBegUIARC7AQ">足球框</a>
<br/>
<a href = "https://www.google.com/imgres?imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F042%2F169%2Foriginal%2Fmushroom-vector-power.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fmario-mushroom&tbnid=QpvaCiiR8JZBlM&vet=12ahUKEwjHjdip9rT8AhXr0YsBHYewBK0QMygJegUIARDcAQ..i&docid=gZxXj5C_GeBeTM&w=1400&h=980&q=rushroom%20mario&ved=2ahUKEwjHjdip9rT8AhXr0YsBHYewBK0QMygJegUIARDcAQ">mario rushroom</a>
