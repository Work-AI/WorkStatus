
const ioHook = require('iohook');
var lastInput = new Date();
var idleCounter = 0;

function checkIfIdle(){
    var now = new Date();
    var diff = (now - lastInput)/1000;
    if (diff > 30){
        console.log('Idle for now')
    }
}
function updateActivity(){
    lastInput = new Date();
}

setInterval(function(){
    checkIfIdle();
},10 * 1000)

ioHook.on("mousemove", event => {
    //console.log(event);
    updateActivity()
});

ioHook.on("keyup", event => {
    //console.log(event);
    updateActivity()
});
ioHook.on("mouseup", event => {
    //console.log(event);
    updateActivity()
});
ioHook.on("mouseclick", event => {
    //console.log(event);
    updateActivity()
    //monitor.getActiveWindow(callback);
    activeWin().then(result => {
        console.log(result);
        windowInspector(result);
    });
});
//Register and start hook
ioHook.start();

const activeWin = require('active-win');

var previousApp = ''
var previousTitle = ''
windowInspector = function(win){
    try {
        if(win.app !== previousApp &&  win.title!==previousTitle){
            console.log("App: " + win.app);
            console.log("Title: " + win.title);
            previousApp = win.app
            previousTitle = win.title
        }
    }catch(err) {
        console.log(err);
    }
}

activeWin().then(result => {
    console.log(result);
    windowInspector(result);
    /*
     {
         title: 'npm install',
         id: 54,
         app: 'Terminal',
         pid: 368
     }
     */
});