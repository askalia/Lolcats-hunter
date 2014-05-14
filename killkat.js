
var jq = null;
var KillKat = 
{
	init: 	function(){
        if (confirm("Ready to kill Katz ??"))
        {
            KillKat.loadStaticFiles();
            KillKat.initImagesHandler();
            KillKat.setSoundPlayer();
        }
	},
    sound: null,
    domImgs : [],
    listImgs : [],
    icons: {
       iconKillable: {
            width: '20px',
            height: '20px'
       }
    },
	IMG_MIN_WIDTH : 100,
	IMG_MIN_HEIGHT : 100,
	KILL_TAG: 'killkat-shot',
    OVERLAY_TAG: 'killkat-overlay',
    KILLABLE_TAG : 'killkat-icon-killable',
    GITHUB : "https://rawgit.com/jorisgrouillet/killkat/master",

    requirements: {
        'min-dimensions' : function(img){ return ((img.width * img.height) > (KillKat.IMG_MIN_WIDTH * KillKat.IMG_MIN_HEIGHT)); }
    },

    loadStaticFiles: function()
    {
        var stylesheet = document.createElement('link');
        stylesheet.href = KillKat.GITHUB+'/css/killkat.css';
        stylesheet.rel = 'stylesheet';
        stylesheet.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(stylesheet);
    },
	initImagesHandler : function()
	{
        KillKat.domImgs = jQuery('img');
        KillKat.domImgs.each(
			function(idx, domImg){
				KillKat.filterImg(domImg);

			}
		);
	},

	filterImg : function(domImg)
	{
		if (KillKat.meetRequirements(domImg)){
			KillKat.addToListImgs(domImg);	
		}
	},

	meetRequirements : function(domImg)
	{	
		var reqs = KillKat.requirements || [];
		var validateReqs = true;
		for (var rIdx in reqs){
			if (typeof(reqs[rIdx]) == 'function'){
				validateReqs &= reqs[rIdx].call(this, domImg);
			}
		}
		return (validateReqs===1);
	},
	
	addToListImgs: function(domImg)
	{
		jqImg = KillKat.overrideClickEvent(domImg);
		KillKat.listImgs.push(jqImg);
	},

	overrideClickEvent: function(domImg)
	{
		var jqImg = jQuery(domImg);
		var fct = KillKat.getClickEventFunction();
		jqImg.unbind('click').click(fct);
        KillKat.setIconKillable(jqImg, KillKat.getImgIndex(jqImg));
		return jqImg;
	},
	getClickEventFunction: function()
	{
		return function(e){
            e.preventDefault();
			KillKat.handleTarget(this);
            KillKat.convertImgToBase64(this.src, function(dataUrl){
                console.log(dataUrl);
            });
			return false;
		};
	},
	handleTarget: function(domImg)
	{
		var jqImg = jQuery(domImg);
        KillKat.setOverlay(jqImg, KillKat.getImgIndex(jqImg));
    },
    setOverlay: function(jqImg, imgIndex)
    {
        var domOverlay = jQuery('#killkat-tag-'+imgIndex);

        if (! domOverlay.length)
        {
            domOverlay = jQuery('<div class="'+KillKat.OVERLAY_TAG+'" id="killkat-tag-'+imgIndex+'"></div>')
                            .css({  'width' : jqImg.innerWidth(),
                                    'height' : jqImg.innerHeight(),
                                    'top' : jqImg.offset().top,
                                    'left' : jqImg.offset().left,
                                })
                            .appendTo(jQuery('body'));

            KillKat.playSound();
            return;
        }

        if (domOverlay.is(':visible')){
            domOverlay.fadeOut(1000);
        }
        else{
            domOverlay.show();
            KillKat.playSound();
        }
    },
    setIconKillable: function(jqImg, imgIndex) {

        var domIconKillable = jQuery('#killkat-killable-'+imgIndex);
        if (! domIconKillable.length)
        {
            jQuery('<div class="'+KillKat.KILLABLE_TAG+'" id="killkat-killable-'+imgIndex+'"></div>')
                .css({
                    'top' : (jqImg.offset().top - (parseInt(KillKat.icons.iconKillable.height)/2)),
                    'left' : (jqImg.width() + jqImg.offset().left - parseInt(KillKat.icons.iconKillable.width)/2),
                })
                .appendTo(jQuery('body'));
        }
    },

	isKatKilled: function(jqImg)
	{
		return (jqImg.parent().hasClass(KillKat.KILL_TAG));
	},

    getImgIndex : function(jqImg)
    {
        return KillKat.domImgs.index(jqImg);
    },
    playSound : function()
    {
        if (! jQuery('#killkat-sound').length){
            KillKat.setSoundPlayer();
        }
        KillKat.sound.play();
    },
    setSoundPlayer: function()
    {
        if (! jQuery('#killkat-sound').length)
        {
            var sound = jQuery('<audio id="killkat-sound" preload="auto">'+
                '<source src="'+KillKat.GITHUB+'/audio/splatter-sound.mp3" type="audio/mp3" />'+
                            //'<source src="http://www.freesfx.co.uk/rx2/mp3s/2/1871_1272479313.mp3" type="audio/mp3" />'+
                            'Votre navigateur n\'est pas compatible'+
                            '</audio>');

            jQuery('body').append(sound);
            KillKat.sound = sound.get(0);
        }
    },
	convertImgToBase64 : function(url, callback, outputFormat)
	{
	    var canvas = document.createElement('canvas'),
	    ctx = canvas.getContext('2d'),
	    img = new Image();
	    img.crossOrigin = 'Anonymous';
	    img.onload = function(){
	        canvas.height = img.height;
	        canvas.width = img.width;
	        ctx.drawImage(img,0,0);
	        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
	        callback.call(this, dataURL);
	        canvas = null; 
	    };
	    img.src = url;
	}
};




(function (_callback) {

    function loadScript(url, callback) {

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function () {
			jq = jQuery;
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {

         //jQuery loaded
         console.log('jquery loaded');
		 _callback.call(this);
    });


})( function(){  KillKat.init();});
