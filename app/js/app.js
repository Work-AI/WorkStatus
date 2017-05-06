
const ioHook = require('iohook');

ioHook.on("mousemove", event => {
    console.log(event);
});

ioHook.on("keyup", event => {
    console.log(event);
});
ioHook.on("mouseup", event => {
    console.log(event);
});
ioHook.on("mouseclick", event => {
    console.log(event);
    //monitor.getActiveWindow(callback);
});
//Register and start hook
ioHook.start();

var monitor = require('active-window');

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

monitor.getActiveWindow(windowInspector,-1,1);