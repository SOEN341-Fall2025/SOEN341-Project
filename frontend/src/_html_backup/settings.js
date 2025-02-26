$(document).ready(function(){
    
    var r = document.querySelector(':root');

    // Create a function for getting a variable value
    function root_get(property) {
        var rs = getComputedStyle(r);
    }
    
    // Create a function for setting a variable value
    function root_set(property, newValue) {
        document.documentElement.style.setProperty(property, newValue);
    }
    
    function init(){
        $("#prevColor1").text($("#colorInput1").val());
        $("#prevColor2").text($("#colorInput2").val());
        $("label.form-control-color").css("filter", "invert(100%)");       
        $("h3").css({"color": "var(--color-bkg) !important","filter": "invert(100%)"});        
        $("label.labelnav").css({"color": "var(--color-accent) !important", "filter": "invert(100%)"});
    }
    
    init();
    $("#colorInput1").on('change', function(){
        $("#prevColor1").text($(this).val());
        $("#prevColor1").val($(this).val());
    });
    $("#colorEdit-accent").on('click', function(){        
        root_set('--color-accent', $("#colorInput1").val());   
        init();
    });
    
    $("#colorInput2").on('change', function(){
        $("#prevColor2").text($(this).val());
        $("#prevColor2").val($(this).val());
    });
    $("#colorEdit-bkg").on('click', function(){  
        root_set('--color-bkg', $("#colorInput2").val());  
        init();
    });

    $("#avatarChanger").on('click', function(){
        // upload modified avatar image to databatse
        // 
    });
});


