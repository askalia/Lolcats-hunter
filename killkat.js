var KillKat =
{
	init: 	function(){
        //if (confirm("Ready to kill Katz ??"))
        //{
            KillKat.staticFiles.load(function(){
                KillKat.initImagesHandler();
                KillKat.setSoundPlayer();
            });
        //}
	},
    currentImg: null,
    currentImgIndex: -1,
    currentOverlay: null,
    sound: null,
    domImgs : [],
    listImgs : [],
    icons: {
       iconKillable: {
            width: '30px',
            height: '30px',
            marginRight: '5px'
       }
    },
    rules : {
        IMG_MIN_WIDTH : '100px',
        IMG_MIN_HEIGHT : '100px'
    },
    styles :{
        OVERLAY_CLASS: 'killkat-overlay',
        KILLABLE_CLASS : 'killkat-icon-killable',
        KILLED_CLASS : 'killkat-overlay-splatter',
        TARGET_CLASS : 'killkat-overlay-target'
    },
    GITHUB : 'https://rawgit.com/jorisgrouillet/killkat/master',
    ///GITHUB : 'http://sandbox.local/killkat/',

    requirements: {
        'min-dimensions' : function(domImg){ return ((domImg.width * domImg.height) > (parseInt(KillKat.rules.IMG_MIN_WIDTH) * parseInt(KillKat.rules.IMG_MIN_HEIGHT))); }
    },

    staticFiles: {
        load : function(callback){
            KillKat.staticFiles.loadStyles();
            KillKat.staticFiles.loadJS(callback);
        },
        loadStyles: function()
        {
            var stylesheet = document.createElement('link');
            stylesheet.href = KillKat.GITHUB+'/css/killkat.css';
            stylesheet.rel = 'stylesheet';
            stylesheet.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(stylesheet);

            var stylesheet = document.createElement('link');
            stylesheet.href = '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css';
            stylesheet.rel = 'stylesheet';
            stylesheet.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(stylesheet);


        },
        loadJS : function(callback){

            KillKat.loadFirstJSFile('//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js', function()
            {
                require.config(
                {
                        paths: {
                            'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
                            'jquery-ui' : '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min'

                        },
                        shim: {
                            'jQuery': {
                                exports: 'jQuery'
                            }
                        }
                });

                require(['jquery', 'jquery-ui'],
                        function(){
                            jQuery.noConflict();
                            require.config({
                                paths : {
                                    'jquery-transform': '//rawgit.com/louisremi/jquery.transform.js/master/jquery.transform2d',
                                    'jquery-viewport' : KillKat.GITHUB+'/js/jquery.viewport.min'
                                }
                            });
                            require(['jquery-transform', 'jquery-viewport'], function(){
                                callback.call(this);
                            });

                        });
            });
        }
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
        KillKat.currentOverlay = null;
    },
    setCurrentImg: function(domImg)
    {
        if (domImg.tagName.toLowerCase() =='div'){
            domImg = jQuery(domImg).parent().find('img:eq(0)').get(0);
        }
        KillKat.currentImg = jQuery(domImg);
        KillKat.currentImgIndex = KillKat.getImgIndex();
        if (KillKat.currentImgIndex > -1){
            KillKat.currentOverlay = jQuery('#killkat-overlay-'+KillKat.currentImgIndex);
        }

    },

	filterImg : function(domImg)
	{
        if (KillKat.meetRequirements(domImg))
        {
            KillKat.currentImg = null;
            KillKat.setCurrentImg(domImg);
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
        var overlay = KillKat.setOverlay();
        KillKat.overrideClickEvent(overlay);
	},
    setOverlay: function()
    {
        var domOverlay = KillKat.currentOverlay;

        if (! domOverlay.length)
        {
            var _parent = KillKat.currentImg.parent();
            domOverlay = jQuery('<div class="'+KillKat.styles.OVERLAY_CLASS+' '+KillKat.styles.TARGET_CLASS+'" id="killkat-overlay-'+KillKat.currentImgIndex+'"></div>')
                .css({  'width' : _parent.innerWidth()+'px',
                    'height' : _parent.innerHeight()+'px',
                    //'left' : (_parent.innerWidth()/4)+'px',
                    'z-index' : 1
                })
                .insertBefore(KillKat.currentImg.parent());
            KillKat.currentImg.closest('div').css({ position : 'relative'});
            return domOverlay;
        }
    },
    overrideClickEvent: function(target)
	{
		var fct = KillKat.getClickEventFunction();
		//KillKat.currentImg.unbind('click').click(fct);
        target.click(fct);
        KillKat.setIconKillable();
	},
	getClickEventFunction: function()
	{
		return function(e){
            e.preventDefault();
            KillKat.razCurrentImg();
            KillKat.setCurrentImg(this);
            KillKat.handleTarget();

			return false;
		};
	},
	handleTarget: function()
	{
        KillKat.toggleSplatter();
    },

    toggleSplatter: function(pos)
    {
        if (! KillKat.currentOverlay.hasClass(KillKat.styles.KILLED_CLASS)){
            KillKat.removeSprite('target');
            KillKat.playSound();
            KillKat.applyVisualEffect();
        }
    },
    removeSprite : function(type)
    {
        KillKat.currentOverlay.addClass(KillKat.styles.KILLED_CLASS)
                             .removeClass(KillKat.styles.TARGET_CLASS);
    },
    applyVisualEffect : function()
    {
        // on efface le splatter
        KillKat.currentOverlay.fadeOut(1200);


        // on applique l'effet d'image : flip et collapse
        KillKat.currentImg
            .css({position :'relative'})
            .animate({ top: '-60px'}, 200, 'swing').dequeue()  // upping
            .animate({ 'transform' : 'rotate(360deg)'}, 1200) // rotation
            .animate({ top: '+=800px' }, 2000, 'swing') // collapses
            .effect( 'explode', 1200) // explodes
            .fadeOut()  // hides
        ;
            /*
            .slideToggle(
            {    easing: 'easeOutExpo',
                duration: 200,
                complete: function()
                {
                    jQuery(this).slideToggle(
                        {
                            easing: 'easeOutExpo',
                            duration: 200,
                            complete : function(){
                                jQuery(this).animate({
                                    top: '+=800px'
                                }, 2000, 'swing').fadeOut(function(){ jQuery(this).hide();});
                            }
                        });
                }
            });
            */
    },
    setIconKillable: function()
    {
        var domIconKillable = jQuery('#'+KillKat.styles.KILLABLE_CLASS+'-'+KillKat.currentImgIndex);
        if (! domIconKillable.length)
        {
            var _parent = KillKat.currentImg.parent();
            jQuery('<div class="'+KillKat.styles.KILLABLE_CLASS+'" id="killkat-icon-killable-'+KillKat.currentImgIndex+'"></div>')
                .css({
                    'top' : 0,
                    'left' : _parent.outerWidth() - parseInt(KillKat.icons.iconKillable.width) +'px'
                })
                .insertBefore(KillKat.currentImg.parent());
        }
    },
    highlightKillables: function(){

        var loops = 0;
        var lst = jQuery('.'+KillKat.styles.KILLABLE_CLASS+':in-viewport');

        lst.on('transitionend webkitTransitionEnd', function(){
            if (loops==lst.length){
                lst.animate({ 'transform' : 'scale(1)', 'background-color' : 'rgb(242, 222, 222)'}, 700);
                loops=0;
            }
        })
        .animate({ 'transform' : 'scale(2)', 'background-color': '#e88888'}, 700, function(){ loops++; });


        //jQuery.when( doit() ).done(function(){
          //  console.log('done');
           // lst.animate({ 'transform' : 'scale(1)'}, 700);
        //});
            //.animate({ 'transform' : 'scale(1)'}, 700);


    },

	isKatKilled: function(jqImg)
	{
		return (jqImg.parent().hasClass(KillKat.styles.KILLED_CLASS));
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
	},
    loadFirstJSFile: function(url, callback)
    {
        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    if (callback) callback();
                }
            };
        } else { //Others
            script.onload = function () {
                if (callback) callback();

            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

};

KillKat.init();



