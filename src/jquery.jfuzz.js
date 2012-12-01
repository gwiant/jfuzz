/**
*
* jFuzz - DOM based particle system ( fuzzy phenomena )
* Date: 6/28/2011
* Author: Grant Wiant wiant@likegiant.com (grantwiant.com)
* Inspired by: @seb_ly #creativejs
* Requires: jQuery
*
*/
(function ( $ ){
	$.fn.jFuzz = function ( options ) { 
	
		String.prototype.format = function () {
		  var args = arguments;
		  return this.replace(/{(\d+)}/g, function (match, number) {
			  return typeof args[number] != 'undefined' ? (args[number] == null ? "": args[number]): match;
		  });
		};
		
		// default settings 
		var settings = {
			'background': 'url(assets/images/spark32x32.png)',
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
			'fadeOut': true,
			'rotate': false,
			'skew': false,
			'decay': .97,
			'velocityRange':false,
			'randomSkewRange': false,
			'randomSizeRange': false,
			'startOpacity': 1,
			'startScale': 1,
			'isLittleEndian': true
		};
		
		var templates = {
			cssHeight: 'height: {0}px;',
			cssWidth: 'width: {0}px;',
			cssBackground: 'background: url({0});',
			cssTranslate3d: "translate3d({0}px, {1}px, 0)",
			cssTranslate: "translate({0}px, {1}px)",
			cssScale3d: "scale3d({0}, {1}, {2})",
			cssScale: "scale3d({0}, {1})",
			htmlParticle: '<div id="{0}" style="{1}"/>'
		};
		
		// If options exist, lets merge them with our default settings
		if ( options ) { 
			$.extend( settings, options );
		}
		
		// internal settings
		settings.emitters = [];
		
		// define array buffer by max particle count
		settings.arrayBuffer = new ArrayBuffer(settings.maxParticles);
		
		// test for Endianness
		/*
		if (settings.arrayBuffer[4] === 0x0a && settings.arrayBuffer[5] === 0x0b && settings.arrayBuffer[6] === 0x0c && settings.arrayBuffer[7] === 0x0d) {
	        settings.isLittleEndian = false;
	    }
	    */
		
		// methods
		var methods = {
			loop: function (thisEmitter) {
				
				// make Particles if needed
				if (thisEmitter.particles.length<settings.maxParticles) {
					methods.makeParticles(thisEmitter);	
				}
				
			  	// iteratate through each particle
				for (p=0; p<thisEmitter.particles.length; p++) {
				
					var particle = thisEmitter.particles[p];
					
					if (thisEmitter.scaleArray[p]>0) {
					
						// render particles
						methods.render(thisEmitter, particle, p);
						
						// update particles
						methods.update(thisEmitter, particle, p);
						
					} else {
						methods.recycle(thisEmitter, particle);
					}
					
				}
			},
			update: function (thisEmitter, particle, p) { 
			
				// add gravity force to the y velocity 
				thisEmitter.velYArray[p] += particle.gravity; 
				
				// shrink the particle
				if(particle.shrink!==0) {
					thisEmitter.scaleArray[p] = ( 0 | 100 * (thisEmitter.scaleArray[p] *= particle.shrink) ) / 100;
				}
				
				// add the velocity to the position
				thisEmitter.posXArray[p] += thisEmitter.velXArray[p];
				
				if(settings.gravity<0) {
					thisEmitter.posYArray[p] += ( thisEmitter.velYArray[p] * particle.gravity );
				} else {
					thisEmitter.posYArray[p] += thisEmitter.velYArray[p];
				}
				
				// update opacity if true with decay
				if(settings.fadeOut===true) {
					thisEmitter.opacityArray[p] = ( 0 | 100 * ( thisEmitter.opacityArray[p] *= settings.decay ) ) / 100;
				} else {
					thisEmitter.opacityArray[p] = 1;
				}
				
			},
			recycle: function (thisEmitter, particle) {
				//console.log('recycling', particle);
				thisEmitter.scaleArray[particle.id] = settings.startScale;
				thisEmitter.angleArray[particle.id] = ( Math.random() * Math.PI * 2 );
				thisEmitter.speedArray[particle.id] = Math.random() * particle.randVelRange;
				thisEmitter.velXArray[particle.id] = Math.sin(thisEmitter.angleArray[particle.id]) * thisEmitter.speedArray[particle.id]; 
				thisEmitter.velYArray[particle.id] = Math.cos(thisEmitter.angleArray[particle.id]) * thisEmitter.speedArray[particle.id]; 
				thisEmitter.posXArray[particle.id] = particle.randPosRange[0];
				thisEmitter.posYArray[particle.id] = particle.randPosRange[1];
				thisEmitter.opacityArray[p] = 1;
			},
			render: function (thisEmitter, particle, p) {
			
				var transformArray = [], transStr = "";
				
				if( $.browser.chrome || $.browser.safari ) {
				
                    // set position/scale
    			 	transformArray.push(templates.cssTranslate3d.format(thisEmitter.posXArray[p], thisEmitter.posYArray[p], 0));
    			 	transformArray.push(templates.cssScale3d.format(thisEmitter.scaleArray[p], thisEmitter.scaleArray[p], 0));
    			 	
                } else if( $.browser.opera ) {
                
                    // set position/scale
    			 	transformArray.push(templates.cssTranslate.format(thisEmitter.posXArray[p], thisEmitter.posYArray[p]));
    			 	transformArray.push(templates.cssScale.format(thisEmitter.scaleArray[p], thisEmitter.scaleArray[p]));
    			 	
                } else if( $.browser.msie ) {
                
                    // set position/scale
    			 	transformArray.push(templates.cssTranslate.format(thisEmitter.posXArray[p], thisEmitter.posYArray[p]));
    			 	transformArray.push(templates.cssScale.format(thisEmitter.scaleArray[p], thisEmitter.scaleArray[p]));
    			 	
                } else if( $.browser.mozilla ) {
                
                    // set position/scale
    			 	transformArray.push(templates.cssTranslate.format(thisEmitter.posXArray[p], thisEmitter.posYArray[p]));
    			 	transformArray.push(templates.cssScale.format(thisEmitter.scaleArray[p], thisEmitter.scaleArray[p]));
    			 	
                }
                
                transStr += transformArray.join('');
                
			 	// update DOM element with cross-browser CSS3 transform
				particle.$particle.css({'-webkit-transform': transStr, '-moz-transform': transStr, '-ms-transform': transStr, '-o-transform': transStr, transform: transStr, opacity: particle.opacity, display:'block'});
			},
			makeParticles: function (thisEmitter) {
			
				// generate particles for this(i) emitter
				for(e=0; e<settings.emitionRate; e++) {
				
					// create a new particle in the stage
					var cssArray = [];
				
					// set default particle settings
					var particle = {
						id: thisEmitter.particles.length,
						DOMid: 'p'+thisEmitter.particles.length,
						scale: 1,
						background: settings.background,
						recycled: false,
						rotate: 0
					};
					
					thisEmitter.widthArray[thisEmitter.particles.length] = settings.particleWidth;
					thisEmitter.heightArray[thisEmitter.particles.length] = settings.particleHeight;
					
					cssArray.push('position:absolute;');
					cssArray.push(templates.cssWidth.format(thisEmitter.widthArray[thisEmitter.particles.length]));
					cssArray.push(templates.cssHeight.format(thisEmitter.heightArray[thisEmitter.particles.length]));
					
					// if background
					if(particle.background) {
						cssArray.push(templates.cssBackground.format(particle.background));
					}
					
					// build particle DOM element
					particle.$particle = $(templates.htmlParticle.format(particle.DOMid, cssArray.join('')));
					
					// inject this particle
					thisEmitter.$emitter.append(particle.$particle);
					
					// update emitter data
					var emitterOffset = thisEmitter.$emitter.offset();
					thisEmitter.left = thisEmitter.parentLeft;
					thisEmitter.top = thisEmitter.parentTop;
					
					// update particle
					particle.opacity = settings.startOpacity;
					particle.shrink = settings.shrink;
					particle.drag = settings.drag;
					particle.gravity = settings.gravity;
					particle.scale = settings.startScale;
					
					// if random position is set
					if(settings.randPos) {
						particle.randPosRange = [
							methods.randomRange(
								thisEmitter.left,
								( thisEmitter.left + ( thisEmitter.width - thisEmitter.widthArray[thisEmitter.particles.length] ) )
							),
							methods.randomRange( 
								thisEmitter.top,
								( thisEmitter.top + ( thisEmitter.height - thisEmitter.heightArray[thisEmitter.particles.length] ) )
							)
						];
					} else {
						particle.randPosRange = [thisEmitter.left,thisEmitter.top];
					}
					
					if(settings.velocityRange) {
						particle.randVelRange = methods.randomRange(settings.velocityRange[0],settings.velocityRange[1]);
					}
					
					// ensure circular distribution of particles, for a more natural appearance
					thisEmitter.angleArray[thisEmitter.particles.length] = ( Math.random() * Math.PI * 2 );
					thisEmitter.speedArray[thisEmitter.particles.length] = Math.random() * particle.randVelRange;
					thisEmitter.velXArray[thisEmitter.particles.length] = Math.sin(thisEmitter.angleArray[thisEmitter.particles.length]) * thisEmitter.speedArray[thisEmitter.particles.length]; 
					thisEmitter.velYArray[thisEmitter.particles.length] = Math.cos(thisEmitter.angleArray[thisEmitter.particles.length]) * thisEmitter.speedArray[thisEmitter.particles.length]; 
					thisEmitter.posXArray[thisEmitter.particles.length] = particle.randPosRange[0];
					thisEmitter.posYArray[thisEmitter.particles.length] = particle.randPosRange[1];
					thisEmitter.scaleArray[thisEmitter.particles.length] = particle.scale;
					
					// add particle to this emitters particle collection
					thisEmitter.particles.push(particle);
					
				}
			},
			randomRange: function (min, max) {
			
				// return random range
				return ((Math.random()*(max-min)) + min); 
				
			},
			init : function (i) { 
			
				var thisEmitter = settings.emitters[i];
				
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
				thisEmitter.$emitter.after('<div id="emitter'+i+'particles"></div>');
				
				thisEmitter.loop = setInterval(function (){ methods.loop(thisEmitter) }, 1000 / settings.frameRate);
				
			}
		};
		
		return this.each(function ( i, item ) {
			
			// get emitter object
			var emitterOffset = $(item).offset(), width = $(item).width(), height = $(item).height();
			var parentOffset = $(item).parent().offset();
			var emitter = { 
				$emitter: $("#"+$(item).attr('id')), 
				particles: [], 
				posXArray: new Float32Array(settings.arrayBuffer.byteLength), 
				posYArray: new Float32Array(settings.arrayBuffer.byteLength), 
				scaleArray: new Float32Array(settings.arrayBuffer.byteLength), 
				opacityArray: new Float32Array(settings.arrayBuffer.byteLength),
				heightArray: new Float32Array(settings.arrayBuffer.byteLength),  
				widthArray: new Float32Array(settings.arrayBuffer.byteLength), 
				angleArray: new Float32Array(settings.arrayBuffer.byteLength), 
				speedArray: new Float32Array(settings.arrayBuffer.byteLength), 
				velXArray: new Float32Array(settings.arrayBuffer.byteLength), 
				velYArray: new Float32Array(settings.arrayBuffer.byteLength), 
				width: width, 
				height: height,  
				top: emitterOffset.top, 
				left: emitterOffset.left, 
				parentLeft: parentOffset.left, 
				parentTop: parentOffset.top
			};
			
			// add emitter to emitters container
			settings.emitters.push(emitter);
			
			// initialize this emitter
			methods.init(i);
			
		});
	};
})( jQuery );