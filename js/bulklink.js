import "jquery"

var submitBtn = $("#link-btn");
var linkInput = $("#link-input");
var linkList = $("#link-list");
var linkTmpl = $("#link-content-tmpl");
var linkGen = $("#link-generated");

linkGen.one('dragstart', (e) => e.preventDefault())
var params = new URLSearchParams(window.location.search);
function bulkDownload(){
    console.log("loading links");
    console.log(window.location);
    
    var links = JSON.parse(params.get('dl'));
    if(links){

        for(var l of links){
            var newLink = linkTmpl.clone();
            newLink.attr('id', null);
            newLink.text(l);
            newLink.attr('hidden', null);
            newLink.attr('href', l);
            linkList.append(newLink);
            linkGen.text(window.location.href)
            linkGen.attr('href', window.location.href)
            window.open(l, "_blank");
        }
    }
}


window.onload = bulkDownload();
// submitBtn.on('click', bulkDownload);
submitBtn.on('click', ()=>{
    var str = linkInput.val()
    str.trim();
    console.log(str);
    
    if(str.length != 0){
        console.log(params) ;
        
        var links = JSON.parse(params.get('dl'));
        console.log(links);
        
        if(!links) links = [];
        links.push(str);
        console.log(links);
        
        params.set('dl', JSON.stringify(links));
        const nextURL = window.location.origin+window.location.pathname+"?"+params.toString();
        const nextTitle = 'My new page title';
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        window.history.replaceState(nextState, nextTitle, nextURL);
        var newLink = linkTmpl.clone();
        newLink.attr('id', null);
        newLink.text(str);
        newLink.attr('hidden', null);
        newLink.attr('href', str);
        linkList.append(newLink);
        linkGen.text(window.location.href)
        linkGen.attr('href', window.location.href)
        linkInput.val(null);
    }

})