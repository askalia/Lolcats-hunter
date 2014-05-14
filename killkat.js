
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
    currentImg: null,
    currentImgIndex: -1,
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
        KillKat.razCurrentImg();
	},
    razCurrentImg: function()
    {
        KillKat.currentImg = null;
        KillKat.currentImgIndex = -1;
    },
    setCurrentImg: function(jqImg)
    {
        KillKat.currentImg = jqImg;
        KillKat.currentImgIndex = KillKat.getImgIndex();
    },
	filterImg : function(domImg)
	{
        if (KillKat.meetRequirements(domImg))
        {
            KillKat.currentImg = null;
            KillKat.setCurrentImg(jQuery(domImg));
            KillKat.setImageBehaviour();
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

    setImageId: function(){
        if (typeof(KillKat.currentImg.get(0).id) =='undefined'){
            KillKat.currentImg.attr('id', 'killable-img-'+KillKat.currentImgIndex);
        }
    },
	setImageBehaviour: function()
	{
        KillKat.setImageId();
        KillKat.overrideClickEvent();
        KillKat.setMousePointerStyle();
	},

	overrideClickEvent: function()
	{
		var fct = KillKat.getClickEventFunction();
		KillKat.currentImg.unbind('click').click(fct);
        KillKat.setIconKillable();
	},
	getClickEventFunction: function()
	{
		return function(e){
            e.preventDefault();
            KillKat.razCurrentImg();
            KillKat.setCurrentImg(jQuery(this));
            KillKat.handleTarget(KillKat.currentImg);
            KillKat.convertImgToBase64(this.src, function(dataUrl){
                console.log(dataUrl);
            });
			return false;
		};
	},
	handleTarget: function(jqImg)
	{
		KillKat.setOverlay(jqImg, KillKat.currentImgIndex);
    },
    setOverlay: function()
    {
        var domOverlay = jQuery('#killkat-tag-'+KillKat.currentImgIndex);

        if (! domOverlay.length)
        {
            domOverlay = jQuery('<div class="'+KillKat.OVERLAY_TAG+'" id="killkat-tag-'+KillKat.currentImgIndex+'"></div>')
                            .css({  'width' : KillKat.currentImg.innerWidth(),
                                    'height' : KillKat.currentImg.innerHeight(),
                                    'top' : KillKat.currentImg.offset().top,
                                    'left' : KillKat.currentImg.offset().left,
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
    setIconKillable: function() {

        var domIconKillable = jQuery('#killkat-killable-'+KillKat.currentImgIndex);
        if (! domIconKillable.length)
        {
            jQuery('<div class="'+KillKat.KILLABLE_TAG+'" id="killkat-icon-killable-'+KillKat.currentImgIndex+'"></div>')
                .css({
                    'top' : (KillKat.currentImg.offset().top - (parseInt(KillKat.icons.iconKillable.height)/2)),
                    'left' : (KillKat.currentImg.width() + KillKat.currentImg.offset().left - parseInt(KillKat.icons.iconKillable.width)/2),
                })
                .appendTo(jQuery('body'));
        }
    },
    setMousePointerStyle: function()
    {
        KillKat.currentImg.addClass('killkat-target');
    },

	isKatKilled: function(jqImg)
	{
		return (jqImg.parent().hasClass(KillKat.KILL_TAG));
	},

    getImgIndex : function()
    {
        return KillKat.domImgs.index(KillKat.currentImg);
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
