// import $ from "jquery"

var body =$("body");
var animElem = $("<h3>jstestanimation</h3>");
body.add(animElem);
console.log(animElem);
body.append(animElem)
var movementDelta = 150;

function movement(){
    var a = animElem.css("margin-left");
    var bodyWidth = body.css("width");
    console.log(Number.parseInt(bodyWidth.substring(0,bodyWidth.length-2)));
    var margin = Number.parseInt(a.substring(0,a.length-2))
    console.log(margin);
    if(margin > Number.parseInt(bodyWidth.substring(0,bodyWidth.length-2))) movementDelta = -150;
    if(margin < 0) movementDelta = 150;
    var marginNew = margin + movementDelta
    console.log(marginNew);
    animElem.animate({"margin-left" : marginNew + "px"}, "slow", movement)
}
movement();

function typewriter(element){

    $(element).children().each(function(i, el){
        var tmpText = $(el).text();
        console.log(tmpText);
        $(el).text("");
        var letter = 0;
        var interval = setInterval(() => {
            if(tmpText[letter])
                $(el).text($(el).text()+tmpText[letter++]);
            else clearInterval(interval);
        }, 100);
    })
    
}

typewriter(body);