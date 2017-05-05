
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

