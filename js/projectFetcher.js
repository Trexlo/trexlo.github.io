import "jquery"

var projectDiv = $("#projects");
var cardTemplate = $("#card-template");

fetch('/data/projects.json',
    {
        method:'GET'
    }
).then(res=>{
    return res.json();
}).then(data=>{
    console.log(data);
    /*
        <div hidden id="card-template" class="project-card">
            <h3 class="card-title"></h2>
            <a class="card-link"></a>
            <p class="card-description"></p>
            <img class="card-image">
        </div>
         */
    for(var project of data){
        console.log(project);
        let tmp = cardTemplate.clone();
        tmp.css('opacity','0')
        tmp.show();
        tmp.attr('id','');
        tmp.find('.card-title').first().text(project.name);
        let tmpLinkContainer = tmp.find('.card-link-container');
        let tmpLink = tmp.find('.card-link').first().clone();
        tmp.find('.card-link').remove();
        for(var link of project.links){
            let newLink = tmpLink.clone();
            newLink.text(link.text).attr('href', link.href);
            tmpLinkContainer.append(newLink);
        }
        tmp.find('.card-description').first().text(project.description);
        let tmpImageContainer = tmp.find('.card-image-container');
        let tmpdotContainer = tmp.find('.card-dot-container');
        let tmpImg = tmp.find('.card-image').first().clone();
        tmp.find('.card-image').remove();
        let tmpDot = tmp.find('.card-dot').first().clone();
        tmp.find('.card-dot').remove();
        let first = true;
        let imgNum = 0;
        let currentImage = 0;
        for(var image of project.images){
            let newImage = tmpImg.clone();
            let newDot = tmpDot.clone();
            newImage.attr('image-number', imgNum);
            newImage.find('.card-image-object').attr('src', image.src);
            newImage.find('.card-image-description').text(image.description);
            newImage.on('click',(el)=>{
                el.stopPropagation();
                if(newImage.attr("fullscreen") == "true")
                    newImage.attr("fullscreen","false");
                else
                    newImage.attr("fullscreen","true");
            })
            if(!first){
                newImage.attr('show',false);
            }else{
                newDot.attr('active',true);
            }
            first = false;
            tmpImageContainer.append(newImage);
            console.log(imgNum);
            newDot.attr('image-number', imgNum++);
            newDot.on('click',(el)=>{
                el.stopPropagation();
                var selectedDotNum = $(el.target).attr('image-number');
                console.log(selectedDotNum, currentImage);
                console.log($(el.target).parent().parent().find('.card-image[image-number="'+currentImage+'"]'));
                $(el.target).parent().parent().find('.card-image[image-number="'+currentImage+'"]').attr('show',false);
                $(el.target).parent().find('.card-dot[image-number="'+currentImage+'"]').attr('active',false);
                $(el.target).attr('active',true);
                $(el.target).parent().parent().find('.card-image[image-number="'+selectedDotNum+'"]').attr('show',true);
                currentImage=selectedDotNum;
            })
            tmpdotContainer.append(newDot);
        }
        if(project.images && project.images.length==0){
            tmpImageContainer.css('display','none');
            tmpdotContainer.css('display','none');
        }
        tmp.css('display',"block");
        
        tmp.on('click',()=>{

            if(tmp.attr('show')=="true"){
                tmp.attr('show',false);
                tmp.find('.card-content').attr('show',false);
            }else {
                tmp.attr('show',true);
                tmp.find('.card-content').attr('show',true);
            }
        })

        $("body").append(tmp)
        console.log(tmp.find('.card-content').height());
        tmp.find('.card-content').css('height', tmp.find('.card-content').height());
        projectDiv.append(tmp);
    }
    jQuery(function() { 
        console.log("ready");
        $('.card-content').attr('show',false);
        setTimeout(() => {
            $('.card-content').addClass('card-content-transition');
            $('.project-card').css('opacity','1');
        }, 10);
    })
})