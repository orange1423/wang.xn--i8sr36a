// 请将 AppId 改为你自己的 AppId，否则无法本地测试
var appId = 'QdSP5lH9RQqp0OWKNqls0BUH-gzGzoHsz';
var appKey = '9TCDJt1nsDUWkMhSFH590v02';
var server = 'https://qdsp5lh9.lc-cn-n1-shared.com';

AV.init({
  appId: appId,
  appKey: appKey,
  serverURL: server,
});

// 创建实时通信实例
var realtime = new AV.Realtime({
    appId: appId,
    appKey: appKey,
    server: server,
  });

var roomId = '60231839e9213f152f4089e5';

var client;
var messageIterator;

// 用来存储创建好的 roomObject
var room;

// 监听是否服务器连接成功
var firstFlag = true;

// 用来标记历史消息获取状态
var logFlag = false;

// 最早一条消息的时间戳
var msgTime;


// 初始化弹幕
$N.i();   
$N.x("danmu");
$N.p("color","#9999FF");
$N.p('bold',"normal"); 
$N.p('md','normal');
$N.p('opacity',80);
$N.p('time',6);

var loginBtn = document.getElementById('login-btn');
var sendBtn = document.getElementById('send-btn');
var inputName = document.getElementById('input-name');
var inputPassword = document.getElementById('input-password');
var inputSend = document.getElementById('input-send');

// 绑定事件
bindEvent(loginBtn, 'click', startLogin);
bindEvent(sendBtn,'click',startSend);

function startSend(){
  sendMsg(inputSend.value);
  inputSend.value = "";
}

function startLogin() {
  login(inputName.value,inputPassword.value);
  $("#login").hide();
  $("#senddanmu").show();
}

function bindEvent(dom, eventName, fun) {
  if (window.addEventListener) {
    dom.addEventListener(eventName, fun);
  } else {
    dom.attachEvent('on' + eventName, fun);
  }
}

// 注册
function signUp(userName,password) {
  AV.User.signUp(userName, password)
    .then(function(user) {
      console.log('实时弹幕系统：注册成功');
      login(userName,password);
    })
    .catch(function(error) {
      console.log('实时弹幕系统：注册失败：' + error.message);
    });
}

// 登录
function login(username,password) {
  if (username) {
    clientId = username;
  }
  if (!firstFlag) {
    client.close();
  }
  // 创建聊天客户端
  return AV.User.logIn(clientId, password)
    .then(function(user) {
      return realtime.createIMClient(user);
    })
    .then(function(c) {
      firstFlag = false;
      client = c;
      return c.getConversation(roomId);
    })
    .then(function(conversation) {
      if (conversation) {
        return conversation;
      } else {
        // 如果服务器端不存在这个 conversation
        return client
          .createConversation({
            name: 'OrangeLive',
            transient: true,
          })
          .then(function(conversation) {
            roomId = conversation.id;
            console.log("实时弹幕系统：roomId：" + roomId)
            return conversation;
          });
      }
    })
    .then(function(conversation) {
      return conversation.join();
    })
    .then(function(conversation) {
      room = conversation;
      // 房间接受消息
      conversation.on('message', function(message) {
        if (!msgTime) {
          // 存储下最早的一个消息时间戳
          msgTime = message.timestamp;
        }
        console.log("实时弹幕系统：收到弹幕：" + message.text);
        $N.c(message.text);
      });
    })
    .catch(function(err) {
      console.error(err);
      if(err.message.indexOf("Could not find user.") != -1)
      {
        signUp(inputName.value,inputPassword.value);
        return;
      }
      else if(err.message.indexOf("The username and password mismatch.") != -1)
      {
        $N.c("密码错误，请重试！");
      }
      else if(err.message.indexOf("登录失败次数超过限制，请稍候再试，或者通过忘记密码重设密码。" != -1))
      {
        $N.c("登录失败次数超过限制，请稍候再试。");
      }
      else
      {
        $N.c("错误：" + err.message);
      }
      $("#login").show();
      $("#senddanmu").hide();
    });
}

function sendMsg(messageText) {
  // 不让发送空字符
  if (
    !String(messageText)
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
  ) {
    return;
}

  // 向这个房间发送消息，这段代码是兼容多终端格式的，包括 iOS、Android、Window Phone
  room.send(new AV.TextMessage(messageText)).then(function(message) {
    // 发送成功之后的回调
    console.log("实时弹幕系统：发送弹幕：" + message.text);
    $N.c(message.text);
  });
}