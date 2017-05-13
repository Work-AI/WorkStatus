/**
 * Created by simba on 5/8/17.
 */

var fs = require('fs');
var watcher = null;
var showInLogFlag = false;
var du = require('du');
var nodewatch = require('node-watch');
var reporter = require('./js/logreporter');
var nexttick = require('next-tick');
var debounce = require('debounce');

var fileChangedList = [];

const Configstore = require('configstore');
const conf = new Configstore('desktop.workai.filewatcher');

function StartNodeWatchWatcher(path){
    document.getElementById("messageLogger").innerHTML = "Scanning the path, please wait ...";
    //require('du')(path, function (err, size) {
        //console.log('The size of' + path + ' is:', size, 'bytes')
        addPathToWatch(path);
        nodewatch(path ,{ recursive: true }, function(evt, name) {
            nexttick(function(){
                console.log('%s changed.', name);
                reporter.report('file-event',JSON.stringify({'type':'changed','file':name}))
                if(showInLogFlag){
                    addLog("Changed : "+name,'change');
                }
            })
        });
        onWatcherReady();
    //})
}

function onWatcherReady(){
    console.info('From here can you check for real changes, the initial scan has been completed.');
    //showInLogFlag = true;
    document.getElementById("stop").style.display = "block";
    document.getElementById("messageLogger").innerHTML = "The path is now being watched";
}
document.getElementById("start").addEventListener("click",function(e){
    const {dialog} = require('electron').remote;
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },function(path){
        if(path){
            StartNodeWatchWatcher(path[0]);
        }else {
            console.log("No path selected");
        }
    });
},false);

document.getElementById("stop").addEventListener("click",function(e){
    if(!watcher){
        console.log("You need to start first the watcher");
    }else{
        watcher.close();
        document.getElementById("start").disabled = false;
        document.getElementById("messageLogger").innerHTML = "Nothing is being watched";
    }
},false);
function resetLog(){
    return document.getElementById("log-container").innerHTML = "";
}
function addLog(message,type){
    var el = document.getElementById("log-container");
    var newItem = document.createElement("LI");       // Create a <li> node
    var textnode = document.createTextNode(message);  // Create a text node
    if(type == "delete"){
        newItem.style.color = "red";
    }else if(type == "change"){
        newItem.style.color = "blue";
    }else{
        newItem.style.color = "green";
    }
    newItem.appendChild(textnode);                    // Append the text to <li>
    el.appendChild(newItem);
}
function addPathToWatch(path){
    var watchingList = conf.get('towatch')
    if(watchingList){
        for(var i=0;i<watchingList.length;i++){
            if(watchingList[i] === path){
                console.log('Already on the list');
                return;
            }
        }
        watchingList.push(path);
        startToWatch(path);
        conf.set('towatch',watchingList);
    } else {
        conf.set('towatch',[path]);
    }
}
function startToWatch(filePath){
    nodewatch(filePath ,{ recursive: true }, function(evt, name) {
        nexttick(function(){
            console.log('%s changed.', name);
            fileChangedList.push(name);
            onReportFileChangedList();
            if(showInLogFlag){
                addLog("Changed : "+name,'change');
            }
        })
    });
}
function reportFileChangedList(){
    if(fileChangedList && fileChangedList.length > 0){
        var message = JSON.stringify({
                'type':'changed',
                'number':fileChangedList.length,
                'fileList':fileChangedList}
        );
        reporter.report('file-event',message)
        console.log(message)
        fileChangedList = [];
        return;
    }
    fileChangedList = [];
}

// it's reasonable to merge file changed in the same 3s
var onReportFileChangedList = debounce(reportFileChangedList,3*1000);

setTimeout(function(){
    var watchingList = conf.get('towatch')
    if(watchingList){
        watchingList.forEach(function(item){
            console.log('to watch: '+item)
            startToWatch(item);
        })
    }
},5*1000)