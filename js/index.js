import "jquery"
import * as THREE from 'three';
// console.log(THREE);
// var page =$("#page");
// var animElem = $("<h3>jstestanimation</h3>");
// page.add(animElem);
// // // console.log(animElem);
// page.append(animElem)
// var movementDelta = 150;

var inFocus = true;
function pause() {
    inFocus = false;
}
function play() {
    inFocus = true;
}
window.addEventListener("blur", pause);
window.addEventListener("focus", play);


// function movement(){
//     var a = animElem.css("margin-left");
//     var pageWidth = page.css("width");
//     // // console.log(Number.parseInt(pageWidth.substring(0,pageWidth.length-2)));
//     var margin = Number.parseInt(a.substring(0,a.length-2))
//     // // console.log(margin);
//     if(margin > Number.parseInt(pageWidth.substring(0,pageWidth.length-2))) movementDelta = -150;
//     if(margin < 0) movementDelta = 150;
//     var marginNew = margin + movementDelta
//     // // console.log(marginNew);
//     animElem.animate({"margin-left" : marginNew + "px"}, "slow", movement)
// }
// movement();

// function typewriter(element){

//     $(element).children().each(function(i, el){
//         var tmpText = $(el).text();
//         // // console.log(tmpText);
//         $(el).text("");
//         var letter = 0;
//         var interval = setInterval(() => {
//             if(tmpText[letter])
//                 $(el).text($(el).text()+tmpText[letter++]);
//             else clearInterval(interval);
//         }, 100);
//     })
    
// }

// typewriter(page);

class VectorMap{
    map=new Map();
    has(key){
        return Array.from(this.map.keys()).findIndex(p=> Math.abs(p.x-key.x) <= 0.05 && Math.abs(p.y-key.y) <= 0.05) != -1;
    }
    set(key, value){
        this.map.set(key, value);
    }
    get(key){
        return this.map.get(Array.from(this.map.keys()).find(p=> Math.abs(p.x-key.x) <= 0.05 && Math.abs(p.y-key.y) <= 0.05));
    }

}
class LineMap{
    map=new Map();
    has(key){
        return Array.from(this.map.keys()).findIndex(p=> Math.abs(p.startPoint.x-key.startPoint.x) <= 0.05 && Math.abs(p.startPoint.y-key.startPoint.y) <= 0.05
    && Math.abs(p.endPoint.x-key.endPoint.x) <= 0.05 && Math.abs(p.endPoint.y-key.endPoint.y) <= 0.05
    ) != -1;
    }
    set(key, value){
        var currKey = Array.from(this.map.keys()).find(p=> Math.abs(p.startPoint.x-key.startPoint.x) <= 0.05 && Math.abs(p.startPoint.y-key.startPoint.y) <= 0.05
        && Math.abs(p.endPoint.x-key.endPoint.x) <= 0.05 && Math.abs(p.endPoint.y-key.endPoint.y) <= 0.05);
        if(currKey)
            this.map.set(currKey, value);
        else
            this.map.set(key, value);
    }
    get(key){
        return this.map.get(Array.from(this.map.keys()).find(p=> Math.abs(p.startPoint.x-key.startPoint.x) <= 0.05 && Math.abs(p.startPoint.y-key.startPoint.y) <= 0.05
        && Math.abs(p.endPoint.x-key.endPoint.x) <= 0.05 && Math.abs(p.endPoint.y-key.endPoint.y) <= 0.05));
    }

}

var w = window.innerWidth;
var h = window.innerHeight;
const renderer = new THREE.WebGLRenderer( { antialias : false } );
const scene = new THREE.Scene();
const cameraHud = new THREE.OrthographicCamera(- w / 2, w / 2, h / 2, - h / 2, 0.1, 1000);
cameraHud.left = - w / 2;
cameraHud.right = w / 2;
cameraHud.top = h / 2;
cameraHud.bottom = - h / 2;
cameraHud.updateProjectionMatrix();
cameraHud.position.z = 10;
renderer.setSize(w, h);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.autoClear = false;
document.getElementById("hex-canvas").appendChild(renderer.domElement);
var frameClock = new THREE.Clock()
var deltaTime = 0;
var hexPoints = [];
var hexPointMap = new VectorMap();
var lineMap = new LineMap();


const hexLineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x02fafa)
});
function getHexPoints(size, startPoint = new THREE.Vector2(Math.round(((Math.random()*w - w/2) + Number.EPSILON) * 100) / 100 , Math.round(((Math.random()*h - h/2) + Number.EPSILON) * 100) / 100 ), isStart=true, oldStartPoint = startPoint){
    hexPoints.push(startPoint);
    var points = [];
    
    var colors = [Math.random(), Math.random(), Math.random()] ;
    for(var i = 0; i<=2; i++){
        var tmp = null;

        if(isStart)tmp = startPoint.clone().addScalar(size).rotateAround(startPoint, THREE.MathUtils.degToRad(15+120*i));
        else {
            var angles = startPoint.clone().subVectors(startPoint, oldStartPoint).angle();
            tmp = startPoint.clone().addScalar(size).rotateAround(startPoint, THREE.MathUtils.degToRad(15+120*i)+(angles));
        }   
        tmp.setX(Math.round((tmp.x + Number.EPSILON) * 100) / 100);
        tmp.setY(Math.round((tmp.y + Number.EPSILON) * 100) / 100);

        if(!hexPoints.find(p=> Math.abs(tmp.x-p.x) <= 1 && Math.abs(tmp.y-p.y) <= 1) && (tmp.x < (w/2+size*2) && tmp.x > -(w/2+size*2) && tmp.y < (h/2 + size*2) && tmp.y > -(h/2+size*2))){

            points.push(tmp);

            if(hexPointMap.has(tmp)){
                if(!hexPointMap.get(tmp).find(p=> Math.abs(startPoint.x-p.x) <= 1 && Math.abs(startPoint.y-p.y) <= 1))
                    hexPointMap.get(tmp).push(startPoint);
            }else{
                hexPointMap.set(tmp, [startPoint]);
            }
            var tmpPointLine = {
                startPoint: tmp,
                endPoint: startPoint,
                lineObject: new THREE.LineCurve(tmp, startPoint),
                line: new THREE.Line( new THREE.BufferGeometry().setFromPoints( [tmp, tmp] ), hexLineMaterial ),
                currentLength: 0,
                fullLineLength: startPoint.distanceTo(tmp),
                isDrawing:true,
                isErasing:false,
                state: "wasDrawing",
                wait:10
            };
            scene.add(tmpPointLine.line);
            lineMap.set({startPoint:tmp, endPoint: startPoint}, tmpPointLine);

            
            if(hexPointMap.has(startPoint)){
                if(!hexPointMap.get(startPoint).find(p=> Math.abs(tmp.x-p.x) <= 1 && Math.abs(tmp.y-p.y) <= 1))
                    hexPointMap.get(startPoint).push(tmp);
            }else{
                hexPointMap.set(startPoint, [tmp]);
            }

            var startPointLine = {
                startPoint: startPoint,
                endPoint: tmp,
                lineObject: new THREE.LineCurve(startPoint, tmp),
                line: new THREE.Line( new THREE.BufferGeometry().setFromPoints( [startPoint, startPoint] ), hexLineMaterial ),
                currentLength: 0,
                fullLineLength: startPoint.distanceTo(tmp),
                isDrawing:true,
                isErasing:false,
                state: "wasDrawing",
                wait:10
            };
            scene.add(startPointLine.line);
            lineMap.set({startPoint:startPoint, endPoint: tmp}, startPointLine);
        }else if(hexPoints.find(p=> Math.abs(tmp.x-p.x) <= 1 && Math.abs(tmp.y-p.y) <= 1)){
            if(hexPointMap.has(startPoint)){
                if(!hexPointMap.get(startPoint).find(p=> Math.abs(tmp.x-p.x) <= 1 && Math.abs(tmp.y-p.y) <= 1))
                    hexPointMap.get(startPoint).push(tmp);
            }else{
                hexPointMap.set(startPoint, [tmp]);
            }
            var startPointLine = {
                startPoint: startPoint,
                endPoint: tmp,
                lineObject: new THREE.LineCurve(startPoint, tmp),
                line: new THREE.Line( new THREE.BufferGeometry().setFromPoints( [startPoint, startPoint] ), hexLineMaterial ),
                currentLength: 0,
                fullLineLength: startPoint.distanceTo(tmp),
                isDrawing:true,
                isErasing:false,
                state: "wasDrawing",
                wait:10
            };
            scene.add(startPointLine.line);
            lineMap.set({startPoint:startPoint, endPoint: tmp}, startPointLine);
        }
    }
    // if(!isStart) return
    //-// console.log(points);
    for(var p of points) getHexPoints(size, p, false, startPoint);

}
getHexPoints(100);
console.log(hexPoints);
console.log(hexPointMap);
console.log(lineMap);
var currentLines = new Map();
var currentEraseLines = new Map();
var eraseLines = new LineMap();
var initialPoint = hexPoints[Math.floor(Math.random()*(hexPoints.length-1))];
var usedPoints = [];
function getStartLines(point = initialPoint, cleared = false) { 
    if(cleared){
        while(usedPoints.find(x=> x == point) && usedPoints.length!=hexPoints.length){
            point = hexPoints[Math.floor(Math.random()*(hexPoints.length))];
        }
        if(usedPoints.length!=hexPoints.length)
            usedPoints.push(point);
    }
    // console.log("getting Start");
    //console.log(lineMap);
    //console.log(point);
    for(var l of hexPointMap.get(point)){
        // console.log(l);
        var tmp =lineMap.get({startPoint: point, endPoint:l});
        // tmp.isDrawing=true;
        currentLines.set(point.x+"-"+point.y+":"+l.x+"-"+l.y, tmp);
    }
}
function getEraseLines(point = initialPoint, cleared = false) { 
    if(cleared){
        while(usedPoints.find(x=> x == point) && usedPoints.length != hexPoints.length){
            point = hexPoints[Math.floor(Math.random()*(hexPoints.length))];
        }
        if(usedPoints.length!=hexPoints.length)
            usedPoints.push(point);
    }
    // console.log("Getting erase");
    //console.log(eraseLines);
    //console.log(point);
    for(var l of hexPointMap.get(point)){
        // console.log(l);
        var tmp = eraseLines.get({startPoint: point, endPoint:l});
        // tmp.isErasing=true;
        currentEraseLines.set(point.x+"-"+point.y+":"+l.x+"-"+l.y, tmp);
    }
}

getStartLines()

var numOfStartPoints = 1;
$('#start-point-number').on('change',(el)=>{
    console.log(el.target.value);
    numOfStartPoints=el.target.value;
})
// console.log(linesToDraw);
var lineSpeed = 300;
var state = "draw";
var frameTime=0;
animate()
function animate() {
    // console.log("START");
    if(currentLines.size>lineMap.size)return;
    // console.log(currentLines);
    // console.log(currentEraseLines);
    // console.log(eraseLines);
    // console.log(drawnLines);
    requestAnimationFrame(animate);
    if(!inFocus){frameClock.getDelta(); return};
    if(document.hidden){frameClock.getDelta(); return};
    deltaTime += frameClock.getDelta();
    if(deltaTime<1/60)return;

    var linesToDelete = [];
    // // console.log(deltaTime);
    for(var [id, line] of currentLines.entries()){


        if(line.isDrawing){
            // console.log("draw");
            var lineDistance = deltaTime*lineSpeed; 
            line.currentLength+=lineDistance;
            if(line.currentLength > line.fullLineLength){
                line.line.geometry.setFromPoints([line.startPoint, line.endPoint])
                lineDistance-=line.fullLineLength-line.currentLength;
                line.isDrawing=false;
                line.isErasing=true;
                getStartLines(line.endPoint);
                eraseLines.set({startPoint: line.startPoint, endPoint:line.endPoint}, line);
            }else{
                line.line.geometry.setFromPoints([line.startPoint, line.lineObject.getPointAt(line.currentLength/line.fullLineLength)]);
            }
        }
    }
    for(var [id, line] of currentLines.entries()){
        if(!line.isDrawing){currentLines.delete(id)}
    }
    
    var linesToErase=[];

    for(var [id, line] of currentEraseLines.entries()){
        if(line.isErasing){
            // console.log("erase");
            var lineDistance = deltaTime*lineSpeed; 
            line.currentLength-=lineDistance;
            if(line.currentLength < 0){
                //console.log("destroy");
                line.line.geometry.setFromPoints([line.startPoint, line.startPoint])
                line.isErasing = false;
                line.isDrawing = true;
                getEraseLines(line.endPoint);
            }else{
                line.line.geometry.setFromPoints([line.lineObject.getPointAt(line.currentLength/line.fullLineLength), line.startPoint]);
            }
        }
    }
    for(var [id, line] of currentEraseLines.entries()){
        if(!line.isErasing){currentEraseLines.delete(id)}
    }
    
    
    for(var id of linesToDelete){
        eraseLines.delete(id);
    }
    // console.log(state);
    var switchedState = false;
    if(currentLines.size == 0 && state == "draw" && !switchedState){
        usedPoints = [];
        for(let i = 0; i < numOfStartPoints; i++)
            getEraseLines(hexPoints[Math.floor(Math.random()*(hexPoints.length-1))], true)
        state = "erase";
        switchedState = true;
    }
    if(currentEraseLines.size == 0 && state == "erase" && !switchedState){
        usedPoints = [];
        for(let i = 0; i < numOfStartPoints; i++)
            getStartLines(hexPoints[Math.floor(Math.random()*(hexPoints.length-1))], true)
        state = "draw";
        switchedState = true;
    }
    for(var id of linesToDelete){
        currentLines.delete(id);
    }

    renderer.clearDepth();
    renderer.render(scene, cameraHud);
    deltaTime=0;
};