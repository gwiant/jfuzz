/**
*
* jFuzz - DOM based particle system ( fuzzy phenomena )
* Date: 6/28/2011
* Author: Grant Wiant wiant@likegiant.com (grantwiant.com)
* Inspired by: @seb_ly #creativejs
* Requires: jQuery
*
*/
(function( $ ){
	$.fn.jFuzz = function( options ) { 
	
		// default settings 
		var settings = {
			'background': 'url(assets/images/spark32x32.png)',
			'border': false,
			'radius': false,
			'posX': 0,
			'posY': 0,
			'emitionRate': 1,
			'mouseX': 0, 
			'mouseY': 0,
			'frameRate': 30,
			'maxParticles': 300,
			'particleWidth': 94,
			'particleHeight': 94,
			'prevMouseX': 0,
			'prevMouseY': 0,
			'gravity':-.3,
			'drag': 0.80,
			'shrink': 1.03,
			'randPos': false,
			'velocity': 10,
			'fadeOut': false,
			'rotate': false,
			'skew': false,
			'decay': .97,
			'velocityRange':false,
			'randomSkewRange': false,
			'randomSizeRange': false,
			'startOpacity': 1,
			'startScale': 1
		};
		
		// If options exist, lets merge them with our default settings
		if ( options ) { 
			$.extend( settings, options );
		}
		
		// internal settings
		settings.emitters = [];
		
		// methods
		var methods = {
			loop: function(i) {
			
				// make Particles
				methods.makeParticles(i);
				
			  	// iteratate through each particle
				for (e=0; e<settings.emitters[i].particles.length; e++) {
				
					var particle = settings.emitters[i].particles[e];
						
					// render particles
					methods.render(i,particle);
					
					// update particles
					methods.update(i,particle);
					
					// Keep taking the oldest particles away until we have fewer than the maximum allowed. 
					while(settings.emitters[i].particles.length>settings.maxParticles) {
						// remove particle
						particle = settings.emitters[i].particles.shift(); 
						// hide particle
						$("#"+particle.DOMid).hide();
						// make spare
						settings.emitters[i].spareParticles.push(particle); 
					}
				}
			},
			update: function(i,particle) { 
				// add gravity force to the y velocity 
				particle.velY += particle.gravity; 
				
				// shrink the particle
				if(particle.shrink!==0) {
					particle.scale *= particle.shrink;
					particle.scale = ( 0 | 100 * particle.scale ) / 100;
				}
				
				// add the velocity to the position
				particle.posX += particle.velX;
				if(settings.gravity<0) {
					particle.posY += ( particle.velY * particle.gravity );
				} else {
					particle.posY += particle.velY;
				}
				
				// opacity
				if(settings.fadeOut===true) {
					particle.opacity *= settings.decay;
					particle.opacity = ( 0 | 100 * particle.opacity ) / 100;
				} else {
					particle.opacity = 1;
				}
				
				// binary shift faster than Math.round()
				particle.posX = ( 0.5 + particle.posX >> 0 );
				particle.posY = ( 0.5 + particle.posY >> 0 );
			},
			render: function(i,particle) {
				var transStr;
				if( $.browser.chrome || $.browser.safari ) {
                    // set CSS3 transform string
    			 	transStr = "translate3d("+particle.posX+"px, "+particle.posY+"px, 0) scale3d("+particle.scale+", "+particle.scale+", 0)"; 
                } else if( $.browser.opera ) {
                    // set CSS3 transform string
    			 	transStr = "translate("+particle.posX+"px, "+particle.posY+"px) scale("+particle.scale+")"; 
                } else if( $.browser.msie ) {
                    // set CSS3 transform string
    			 	transStr = "translate("+particle.posX+"px, "+particle.posY+"px) scale("+particle.scale+")"; 
                } else if( $.browser.mozilla ) {
                    // set CSS3 transform string
    			 	transStr = "translate("+particle.posX+"px, "+particle.posY+"px) scale("+particle.scale+")"; 
                }
                
			 	// update DOM element with cross-browser CSS3 transform
				particle.$particle.css({'-webkit-transform': transStr, '-moz-transform': transStr, '-ms-transform': transStr, '-o-transform': transStr, transform: transStr, opacity: particle.opacity, display:'block'});
			},
			makeParticles: function(i) {
				// generate particles for this(i) emitter
				for(e=0;e<settings.emitionRate;e++) {
				
					// create a new particle in the stage
					if(settings.emitters[i].spareParticles.length>0) {
						// if one is already in the spare array, recycle it
						particle = settings.emitters[i].spareParticles.pop(); 
						
						// reset particle values
						particle.recycled = true;
						
					} else {
						// otherwise make a new particle 
						// set particle DOM id
						var id = 'emitter'+i+'particle'+e, cssStr;
					
						// set default particle settings
						var particle = {
							id: e,
							DOMid: id,
							scale: 1,
							radius: settings.radius,
							border: settings.border,
							background: settings.background,
							recycled: false,
							width: settings.particleWidth,
							height: settings.particleHeight,
							halfWidth: ( 0.5 + ( settings.particleWidth / 2 ) >> 0 ),
							halfHeight: ( 0.5 + ( settings.particleHeight / 2 ) >> 0 ),
							rotate: 0,
						};
						
						cssStr = 'position:absolute; width:'+particle.width+'; height: '+particle.height+';';
						
						// if radius
						if(particle.radius) {
							cssStr += ' -webkit-border-radius:'+particle.radius+';';
						}
						
						// if border
						if(particle.border) {
							cssStr += ' border:'+particle.border+';';
						}
						
						// if background
						if(particle.background) {
							cssStr += ' background:'+particle.background+';';
						}
						
						// build particle DOM element
						particle.$particle = $('<div id="'+particle.id+'" style="'+cssStr+'"/>');
						
						// inject this emitters particles
						$("#emitter"+i+"particles").append(particle.$particle);
					}
					
					// update emitter data
					var emitterOffset = settings.emitters[i].$emitter.offset();
					settings.emitters[i].left = ( emitterOffset.left - settings.emitters[i].parentLeft );
					settings.emitters[i].top = ( emitterOffset.top - settings.emitters[i].parentTop );
					//settings.emitters[i].height = height;
					//settings.emitters[i].width = width;
					//settings.emitters[i].halfHeight = (height / 2);
					//settings.emitters[i].halfWidth = (width / 2);
					
					// update particle 
					particle.opacity = settings.startOpacity;
					particle.shrink = settings.shrink;
					particle.drag = settings.drag;
					particle.gravity = settings.gravity;
					particle.scale = settings.startScale;
					if(settings.randPos) {
						particle.randPosRange = [
							methods.randomRange(
								( settings.emitters[i].left ),
								( settings.emitters[i].left + ( settings.emitters[i].width - particle.width ) )
							),
							methods.randomRange( 
								( settings.emitters[i].top ),
								( settings.emitters[i].top + ( settings.emitters[i].height - particle.height ) )
							)
						];
					} else {
						particle.randPosRange = [settings.emitters[i].left,settings.emitters[i].top];
					}
					if(settings.velocityRange) {
						particle.randVelRange = methods.randomRange(settings.velocityRange[0],settings.velocityRange[1]);
					}
					particle.posX = particle.randPosRange[0];
					particle.posY = particle.randPosRange[1];
					
					// ensure circular distribution of particles, for a more natural appearance
					particle.angle = ( Math.random() * Math.PI * 2 );
					particle.speed = Math.random() * particle.randVelRange;
					particle.velX = Math.sin(particle.angle) * particle.speed; 
					particle.velY = Math.cos(particle.angle) * particle.speed; 
					
					// add particle to this emitters particle collection
					settings.emitters[i].particles.push(particle);
					
				}
			},
			randomRange: function(min, max) {
				// return random range
				return ((Math.random()*(max-min)) + min); 
			},
			init : function(i) { 
			
				settings.userAgent = navigator.userAgent.toLowerCase();
                // Which browser?
                $.browser = {
                	version: (settings.userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
                	chrome: /chrome/.test( settings.userAgent ),
                	safari: /webkit/.test( settings.userAgent ) && !/chrome/.test( settings.userAgent ),
                	opera: /opera/.test( settings.userAgent ),
                	msie: /msie/.test( settings.userAgent ) && !/opera/.test( settings.userAgent ),
                	mozilla: /mozilla/.test( settings.userAgent ) && !/(compatible|webkit)/.test( settings.userAgent )
                };
                
				// inject current(i) emitters particle container
				settings.emitters[i].$emitter.after('<div id="emitter'+i+'particles"></div>');
				
				settings.emitters[i].loop = setInterval(function(){ methods.loop(i) }, 1000 / settings.frameRate);
			}
		};
		
		return this.each(function( i, item ) {
			// get emitter object
			var emitterOffset = $(item).offset(), width = $(item).width(), height = $(item).height();
			var parentOffset = $(item).parent().offset();
			var emitter = { $emitter: $("#"+$(item).attr('id')), particles: [], width: width, height: height, halfHeight: (height / 2), halfWidth: (width / 2), top: emitterOffset.top, left: emitterOffset.left, parentLeft: parentOffset.left, parentTop: parentOffset.top, spareParticles: [] };
			// add emitter to emitters container
			settings.emitters.push(emitter);
			// initialize this emitter
			methods.init(i);
		});
	};
})( jQuery );