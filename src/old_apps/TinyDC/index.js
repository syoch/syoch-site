var now={
    sid:0,
    cid:0,
    sna:"",
    cna:"",
    sin:{},
    cin:{}
};
var data={
    channel:{
        messages:[]
    }
}
//mod in https://javascript.programmer-reference.com/javascript-han1zen2/
function Zens(str){
    var result = 0;
    for(var i=0;i<str.length;i++){
      var chr = str.charCodeAt(i);
      if((chr >= 0x00 && chr < 0x81) ||
         (chr === 0xf8f0) ||
         (chr >= 0xff61 && chr < 0xffa0) ||
         (chr >= 0xf8f1 && chr < 0xf8f4)){
        //半角文字の場合は1を加算
        //result += 1;
      }else{
        //それ以外の文字の場合は2を加算
        result += 1;
      }
    }
    //結果を返す
    return result;
  };
//copy in https://qiita.com/saekis/items/c2b41cd8940923863791
function escape_html (string) {
    if(typeof string !== 'string') {
      return string;
    }
    return string.replace(/[&'`"<>]/g, function(match) {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });
  }
  
//paddding (Zenkaku)
var pad=(src,len)=>(" ".repeat(len*10)+src).slice(-(len-Zens(src)));
//in guild
function server_enter(){
    console.log(this);
    now.sid=$(this).attr("sid")+"";
    now.sin=bot.servers[now.sid];
    now.sna=now.sin.name;
    $("#D_server-S_now").html(now.sna);
    //rendering channellist
    $("#D_channel-D_channels").html(""); //clerar
    Object.keys(now.sin.channels).map((key)=>{
        btn=$("<a>",{
            cid:now.sin.channels[key].id,
            text:now.sin.channels[key].name,
        });
        btn.css("color","#00ffff");
        btn.css("cursor","pointer");
        btn.click(channel_enter);
        //console.log(btn);
        $("#D_channel-D_channels").append(btn);
        $("#D_channel-D_channels").append($("<br>"))
    });
}
//in guild
function channel_enter(){
    console.log($(this).attr("cid"));
    now.cid=$(this).attr("cid")+"";
    now.cin=bot.channels[now.cid];
    now.cna=now.cin.name;
    $("#D_channel-S_now").html(now.cna);
    $("#D_chat-D_msg").html("");
    //get messages
    bot.getMessages({channelID:now.cid,limit:10},(err,data)=>{
        
        //data=data.reverse();
        data.map((msg)=>{
            $("#D_chat-D_msg").append([$("<span>",{
                html:msgadd(msg,"append")
            }),$("<br>")])
        })
    })
}
if(!localStorage.getItem("token")){
    localStorage.setItem("token",prompt("トークンを入力してください"));
}
var bot = new Discord.Client({
    token:localStorage.getItem("token"),
    autorun: true
});

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);

    //server rendering
    Object.keys(bot.servers).map((key)=>{
        let icon;
        //console.log(bot.servers[key])
        if(bot.servers[key].icon==null){
            icon=`<img src="discord_icon.png">`;
        }else{
            icon=`<img src="https://cdn.discordapp.com/icons/${bot.servers[key].id}/${bot.servers[key].icon}.png">`
        }
        element=$(icon);
        //height:2rem;width:2rem
        element.css("height","5%");
        element.css("width","5%");
        element.attr("title",bot.servers[key].name);
        element.attr("sid",bot.servers[key].id);
        console.log(element);
        element.click(server_enter);
        $("#D_server-D_servericon").append(element);
    });
    //$("#D_server").append($("<span id='S_server_now'>"));
});

bot.on('message', (username,userid,channelid,content,event)=>{
    console.log(username,userid,channelid,content,event);
    if(now.cid==channelid){
        msgadd(event.d);
        //console.log(event.d);
    }
});
$("#D_chat-T_input").keypress((event)=>{
    if(event.code=="Enter"){
        bot.sendMessage({
            to:now.cid,
            message:$("#D_chat-T_input").val()
        });
        setTimeout(()=>{$("#D_chat-T_input").val("")},100);
    }
})
function msgadd(msg,mode){
    //console.log(msg);
    var atc=msg.attachments.map((file)=>{
        return `<a href="${file.url}">${file.filename}</a>`;
    });
    content=`${msg.author.id} (${msg.author.username}#${msg.author.discriminator}) ${escape_html(msg.content.replace(/\n/,"<br>"))}${atc}`;
    console.log(content);
    if(mode=="append"){
        $("#D_chat-D_msg").append([$("<span>",{
            html:content
        }),$("<br>")])
    }else{
        $("#D_chat-D_msg").prepend([$("<span>",{
            html:content
        }),$("<br>")])
    }
    
}