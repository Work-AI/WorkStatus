
const ioHook = require('iohook');
var nexttick = require('next-tick');

var debounce = require('debounce');
var reporter = require('./js/logreporter');
var keycode = require('./js/keycode');

var lastInput = new Date();
var idleCounter = 0;
var lastIdleDuration = 1;
var reportedStatus = false;
var queuedInput = '';

function checkIfIdle(){
    var now = new Date();
    var diff = (now - lastInput)/1000;
    if (diff > 60 ){
        if(reportedStatus === false){
            console.log('Idle for now')
            reporter.report('idle-event',JSON.stringify({'type':'idle'}))
            reportedStatus = true;
        } else {
            lastIdleDuration = diff;
        }
    } else {
        if(lastIdleDuration > 0){
            console.log('Online for now')
            reporter.report('online-event',JSON.stringify({'type':'online','lastIdle':lastIdleDuration}))
            reportedStatus = false;
            lastIdleDuration = 0;
        }
    }
}
function reportInputAsSequencialString(){
    if(queuedInput && queuedInput!==''){
        reporter.report('key-input-event',JSON.stringify({'content':queuedInput}));
        console.log('Key-input-event: '+queuedInput);
        queuedInput = ''
    }
}
var onReportInputAsSequencialString = debounce(reportInputAsSequencialString,20*1000);
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
    console.log(event);
    if(event && event.keycode){
        var inputChar = keycode(event.keycode,true);
        console.log(inputChar);
        if(inputChar && inputChar !==''){
            queuedInput+=inputChar;
        }
        onReportInputAsSequencialString();
    }
    updateActivity()
});
ioHook.on("mouseup", event => {
    //console.log(event);
    updateActivity()
});
ioHook.on("mouseclick", event => {
    updateActivity()

    nexttick(function(){
        activeWin().then(result => {
            console.log(result);
            windowInspector(result);
        });
    })
})

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

            reporter.report('active-win-event', JSON.stringify({
                'type': 'active-window',
                'app': win.app,
                'title': win.title,
                'id': win.id,
                'pid': win.pid
            }))

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
});