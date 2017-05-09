/**
 * Created by simba on 5/8/17.
 */

var chokidar = require('chokidar');
var fs = require('fs');
var watcher = null;
var showInLogFlag = true;
var watch = require('watch');
var du = require('du');
var fsmonitor = require('fsmonitor');
var nodewatch = require('node-watch');

function StartWatchWatcher(path){
    document.getElementById("messageLogger").innerHTML = "Scanning the path, please wait ...";
    require('du')(path, function (err, size) {
        console.log('The size of' + path + ' is:', size, 'bytes')

        watch.createMonitor(path,{
            ignoreDotFiles: true,
            ignoreUnreadableDir: true,
            ignoreNotPermitted: true,
            ignoreDirectoryPattern: /node_modules/
        } ,function (monitor) {
            monitor.files[path[0]+'/.zshrc'] // Stat object for my zshrc.
            monitor.on("created", function (f, stat) {
                // Handle new files
                console.log('Directory', f, 'has been added');
                if(showInLogFlag){
                    addLog("Folder added : "+f,"new");
                }
            })
            monitor.on("changed", function (f, curr, prev) {
                // Handle file changes
                console.log('Directory', f, 'has been changes');
                if(showInLogFlag){
                    addLog("Folder changes : "+f);
                }
            })
            monitor.on("removed", function (f, stat) {
                // Handle removed files
                console.log('Directory', f, 'has been removed');
                if(showInLogFlag){
                    addLog("Folder removed : "+f);
                }

            })
            onWatcherReady();
        })
    })
}

function StartChokidarWatcher(path){
    document.getElementById("start").disabled = true;
    document.getElementById("messageLogger").innerHTML = "Scanning the path, please wait ...";
    watcher = chokidar.watch(path, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignorePermissionErrors: true
    });
    watcher
        /*.on('add', function(path) {
         console.log('File', path, 'has been added');
         if(showInLogFlag){
         addLog("File added : "+path,"new");
         }
         })
         .on('addDir', function(path) {
         console.log('Directory', path, 'has been added');
         if(showInLogFlag){
         addLog("Folder added : "+path,"new");
         }
         })*/
        .on('change', function(path) {
            console.log('File', path, 'has been changed');
            if(showInLogFlag){
                addLog("A change ocurred : "+path,"change");
            }
        })
        .on('unlink', function(path) {
            console.log('File', path, 'has been removed');
            if(showInLogFlag){
                addLog("A file was deleted : "+path,"delete");
            }
        })
        .on('unlinkDir', function(path) {
            console.log('Directory', path, 'has been removed');
            if(showInLogFlag){
                addLog("A folder was deleted : "+path,"delete");
            }
        })
        .on('error', function(error) {
            console.log('Error happened', error);
            if(showInLogFlag){
                addLog("An error ocurred: ","delete");
                console.log(error);
            }
        })
        .on('ready', onWatcherReady)
    //.on('raw', function(event, path, details) {
    // This event should be triggered everytime something happens.
    //	console.log('Raw event info:', event, path, details);
    //});
}
function StartFSMonitorWatcher(path){
    document.getElementById("messageLogger").innerHTML = "Scanning the path, please wait ...";
    require('du')(path, function (err, size) {
        console.log('The size of' + path + ' is:', size, 'bytes')

        var monitor = fsmonitor.watch(path, null);
        monitor.on('change', function(changes) {
            console.log(changes);

            console.log(changes, 'has been added');
            if(showInLogFlag){
                addLog("Changed : "+changes,'change');
            }
        });
        onWatcherReady();
    })
}
function StartNodeWatchWatcher(path){
    document.getElementById("messageLogger").innerHTML = "Scanning the path, please wait ...";
    require('du')(path, function (err, size) {
        console.log('The size of' + path + ' is:', size, 'bytes')

        nodewatch(path ,{ recursive: true }, function(evt, name) {
            console.log('%s changed.', name);
            if(showInLogFlag){
                addLog("Changed : "+name,'change');
            }
        });
        onWatcherReady();
    })
}
function onWatcherReady(){
    console.info('From here can you check for real changes, the initial scan has been completed.');
    showInLogFlag = true;
    document.getElementById("stop").style.display = "block";
    document.getElementById("messageLogger").innerHTML = "The path is now being watched";
}
document.getElementById("start").addEventListener("click",function(e){
    const {dialog} = require('electron').remote;
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },function(path){
        if(path){
            //StartChokidarWatcher(path[0]);
            //StartFSMonitorWatcher(path[0]);
            //StartWatchWatcher(path[0]);
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
        showInLogFlag = false;
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