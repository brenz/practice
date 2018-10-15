/**
 *  @author Hong Zhang hong.x1.zhang@kp.org
 *  KP Flame element for kp_SOM home page
 */

// Globle parameter
// TODO: factory into object
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,
  camera, scene, renderer, composer, stats,
  uniforms,                                       // shade matirial uniforms
  particles = 100000,                             // number of flame particles, for performance consideration, reduce the particles <100000
  flame, flameGeometry, gv=[],
  shinDots = [],
  cameraPositions = [],
  cameraInter = 0,                                // indicate the current camera position
  rotateTweenL, rotateTweenR, moveCameraTween,    // Tween object
  scrollProgress = 0,
  introPlayed = 0,
  thickNess = 15, thickDis = 4.5, thickScale =0

/*
* parameter for GUI panel
* TODO: remove in production
*/
var params = {
  color: [71,121,158],
  particlesSize: 30,
  particlesRand: 6.4,
  exposure: 1,
  bloomThreshold: 0.49,
  bloomStrength: 2.2,
  bloomRadius: 0.72,
  rotateY: 0,
  ifRotation : true
};

/*
* WEBGL Supportive detect
*/
if (WEBGL.isWebGLAvailable() === true) {
  // User can have full exprience with WebGl, go to WEBGL init()
  init();
  animate();
}
else {
  // go with low bandwidth option;
  document.getElementById('flame-container').appendChild(WEBGL.getWebGLErrorMessage());
}

/*
* Load once, create all the obj in init only
* Warning! Do not change obj value while doing tween animation.
* 1. Create/Define scene and render.
* 2 Create Martial, by useing shade matrial
* 3.1 JsonLoader load json data create by Blender/(start load call back)
* 3.2 Create Flame elements
* 3.3 Add shinny Particles
* 3.4 Adjust flame position
* 3.5 Define animation destination, defer cameraPositions
* 3.6 Start Flame rotation
* 4. Add post processing effect
* 5. Add Stats indicator
* 6. GUI control
* 7. Add Event Listener, scroll effect binding in next section
* 8. Add scroll effect
* 8.1 Create scroll scene for intro
* 8.2 Create scroll scene for rest of slide
*/
function init() {
  var container;
  container = document.getElementById('flame-container');

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;

  // 1. Create/Define scene and render
  // TODO: create fog and scence stage?
  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(17,51,128)");

  renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // 2 Create Martial, by useing shade matrial
  // https://threejs.org/examples/?q=buff#webgl_buffergeometry_custom_attributes_particles
  // ## shaded martial, uniforms defined in html
  uniforms = {
    texture:   { value: new THREE.TextureLoader().load("./img/spark1.png") },
    opacity:   { value: 0 },
    topColor:  { value: new THREE.Color( 0x0077ff ) },
  };

  uniforms.topColor.value.copy( new THREE.Color(params.color[0]/255,params.color[1]/255,params.color[2]/255) );

  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,

    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  });

  // 3.1 JsonLoader load json data create by Blender/(start load call back)
  // https://threejs.org/docs/#api/en/loaders/JSONLoader
  var loader = new THREE.JSONLoader();

  flameGeometry = new THREE.BufferGeometry();
  var positions = [];
  var colors = [];
  var sizes = [];
  var color = new THREE.Color();

  //(start load call back)
  loader.load('./data/KPSM_1D_4.json', function (g, m) {
    // Create 5 layers by normal geomertery
    g.scale(560, 560, 560);
    var gg = g.clone()
    for (var i = 0; i < thickNess; i++) {
      var scaleSize = 1 - i * thickScale;
      g.merge(gg.clone().translate(0, 0, -i * thickDis).scale(scaleSize, scaleSize, scaleSize));
    }
    gv = g.vertices
    particles = gv.length;

    // Only bufferGeomerty can take shade matriel, set position from vericles
    for (var j = 0; j < particles; j++) {
      positions.push((gv[j].x)+Math.random()*Math.sin(j)*params.particlesRand);
      positions.push((gv[j].y)+Math.random()*Math.sin(j)*params.particlesRand);
      positions.push((gv[j].z)+Math.random()*Math.sin(j)*params.particlesRand);
      color.setHSL(204/ 360, 0.5 + 0.5 * Math.sin(j), 0.5 + 0.4 * Math.sin(Math.random()*j));
      colors.push(color.r, color.g, color.b);
      sizes.push(Math.random() * params.particlesSize);
    }
    // 3.2 create flame geomertery
    flameGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    flameGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    flameGeometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setDynamic(true));

    flame = new THREE.Points(flameGeometry, shaderMaterial);

    // 3.3 Add shinny Particles
    var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    sphereMaterial.transparent = true;
    sphereMaterial.opacity = 0;
    var sectionLength = document.getElementsByTagName("section").length;
    for (var k = 0; k < sectionLength - 1; k++) {
      var shinDot = new THREE.Mesh(sphereGeometry, sphereMaterial);
      var length = Math.floor(Math.random() * g.vertices.length); // Pick up a random dot to perform
      shinDot.position.add(g.vertices[length]);
      flame.add(shinDot);
      shinDots.push(shinDot);
    }

    // 3.4 Adjust flame position
    // TODO: Conside responsive design
    flame.rotateY(-0.3);
    flame.position.y=-30;
    flame.scale.multiplyScalar(2);
    flame.onAfterRender = animateFlame;
    scene.add(flame);

    // 3.5 Define animation destination, defer cameraPositions
    cameraPositions.push(new THREE.Vector3(
      -windowHalfX / 2 + 100,
      60,
      1000)); // first position is the start position
    for (var i = 0; i < shinDots.length; i++) {
      cameraPositions.push(new THREE.Vector3(
        shinDots[i].position.x + flame.position.x,
        shinDots[i].position.y,
        150));
    }

    // 3.6 Start Flame rotation
    flameRotation();

  }) // End of load callback

  // 4. Add post processing effect:
  // --- Add unreal bloom effect
  // https://threejs.org/examples/?q=unr#webgl_postprocessing_unreal_bloom
  // Add effctFocus
  // https://threejs.org/examples/#webgl_points_dynamic
  var renderScene = new THREE.RenderPass(scene, camera);
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.renderToScreen = true;
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // 5. Add Stats indicator
  // TODO: remove stats indicator in real products
  stats = new Stats();
  container.appendChild(stats.dom);

  // 6. GUI control
  // https://github.com/dataarts/dat.gui && http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  // TODO: Remove GUI control in real products
  var gui = new dat.GUI();
  var f1 = gui.addFolder('flame shape and color');
  f1.addColor(params, 'color').onChange(function (value) {
    uniforms.topColor.value = new THREE.Color(value[0]/255,value[1]/255,value[2]/255)
  })
  f1.add(params, 'particlesSize', 10, 50).step(2).onChange(function (value) {
    params.particlesSize = Number(value);
    var sizes=flameGeometry.attributes.size.array
    for (var i = 0; i < particles; i++) {
      sizes[i] = Math.random() * params.particlesSize;
    }
    flameGeometry.attributes.size.needsUpdate = true;
  });
  f1.add(params, 'particlesRand', 0.1, 12).step(0.1).onChange(function (value) {
    params.particlesRand =  Number(value);
    var positions = flameGeometry.attributes.position.array
    for (var j = 0; j < particles; j++) {
      positions[j*3]=(gv[j].x)+Math.random()*Math.sin(j)*params.particlesRand;
      positions[j*3+1]=(gv[j].y)+Math.random()*Math.sin(j)*params.particlesRand;
      positions[j*3+2]=(gv[j].z)+Math.random()*Math.sin(j)*params.particlesRand;
    }
    flameGeometry.attributes.position.needsUpdate = true;
  });
  var f2 = gui.addFolder('brightness and bloom effect');
  f2.add(params, 'exposure', 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });
  f2.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });
  f2.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });
  f2.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
    bloomPass.radius = Number(value);
  });
  var f3 = gui.addFolder('flame rotation')
  f3.add(params, 'rotateY', -1.0, 1.0).step(0.01).onChange(function (value) {
    flame.rotation.y = Number(value);
  });
  f3.add(params, 'ifRotation').onChange(function(value){
    if(value){
      flameRotation();
    }else{
      flameRotationStop();
    }
  })


  // 7. Add EventListener
  window.addEventListener('resize', onWindowResize, false);

  // 8. Add scroll effect
  // http://scrollmagic.io/
  var controller = new ScrollMagic.Controller();
  var slides = document.querySelectorAll("section");

  // Create Scene from Section intro
  new ScrollMagic.Scene({
    triggerElement: "#section0",
    duration: SCREEN_HEIGHT,
    triggerHook: 0
  })
    .on('progress', function (e) {
      cameraInter = 0
      //console.log("Scroll on intro in progress:"+e.progress)
      scrollProgress = e.progress;
    })
    .on('leave', function (e) {
      //flameRotationStop();
      //document.querySelectorAll("section")[0].classList.remove("fade-in");
      //scrollToTween(0,SCREEN_HEIGHT+1,{duration:5000});
    })
    .on('enter', function (e) {
      //flameRotation();
      //document.querySelectorAll("section")[0].classList.add("fade-in");
    })
    .addIndicators({}) // add indicators (requires plugin)
    .addTo(controller);

  // Create scene for the rest slide
   for (var l = 1; l < slides.length; l++) {
    new ScrollMagic.Scene({
      triggerElement: "#section" + l,
      duration: 2,
      triggerHook: 0
    })
      .setClassToggle("#section" + l, "fade-in")
      .on('progress', function (e) {
        console.log("Scroll on the rest in progress:" + e);
        cameraInter = Math.floor((window.pageYOffset + windowHalfY + 10) / SCREEN_HEIGHT);
        scrollProgress = e.progress;
      })
      .on('start', function (e) {
      })
      .on('enter', function(e){
        console.log("Scroll on the rest in enter:" + e);
        //scrollToTween(0,SCREEN_HEIGHT+1,{duration:5000});
      })
      .on('end', function(e){
      })
      .addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  }
} // End of init()

function animate() {
  requestAnimationFrame(animate);
  render();
  TWEEN.update();
  stats.update();
}

function render() {
  if (cameraPositions[cameraInter + 1] !== undefined && scrollProgress < 1) {
    camera.position.x = cameraPositions[cameraInter].x + (cameraPositions[cameraInter + 1].x - cameraPositions[cameraInter].x) * scrollProgress;
    camera.position.y = cameraPositions[cameraInter].y + (cameraPositions[cameraInter + 1].y - cameraPositions[cameraInter].y) * scrollProgress;
    camera.position.z = cameraPositions[cameraInter].z + (cameraPositions[cameraInter + 1].z - cameraPositions[cameraInter].z) * scrollProgress;
  }

  if (flame !== undefined) {
    if (introPlayed !== 1) { playIntro(); }
  }
  renderer.render(scene, camera);
  composer.render();
}
/*
* trigger by flame element render ready, turn it in visiable, and let text fade-in, triggier in render();
*/
function playIntro() {
  //Todo: Detail the intro
  window.scrollTo(0,0);
  introPlayed = 1;
  document.querySelectorAll("section")[0].classList.add("fade-in");
  document.getElementsByClassName("scroll_down")[0].classList.add("fade-in");
  new TWEEN.Tween(flame.material.uniforms.opacity).to({ value: 1 }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function (){
      flame.position.y +=0.1;
    })
    .start();
}

function animateFlame() {
  var time = Date.now() * 0.002;
  var sizes = flameGeometry.attributes.size.array;
  var fp = flameGeometry.attributes.position.array
  for (var i = 0; i < particles; i+= Math.floor(1500*Math.random())) {
    sizes[i] = Math.random() * params.particlesSize;
    //sizes[i] = 20 * (1+Math.sin(time));
    //sizes[i] = 12 * (1 + Math.sin(time + fp[i * 3] * 0.01) * Math.random());
  }
  flameGeometry.attributes.size.needsUpdate = true;
}

/*
* Start the flame shimm
*/
function flameRotation() {
  console.log("flame start rotation");
  if (!rotateTweenL && !rotateTweenR && flame != undefined) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.1 }, 10000)
      .easing(TWEEN.Easing.Linear.None)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.3 }, 10000)
      .easing(TWEEN.Easing.Linear.None)
    rotateTweenL.chain(rotateTweenR);
    rotateTweenR.chain(rotateTweenL);
    rotateTweenL.start();
  }else if(rotateTweenL && rotateTweenR){
    rotateTweenL.start();
  }
}
/*
* Stop the flame shimm
*/
function flameRotationStop() {
  console.log("flame stop rotation");
  if (rotateTweenL || rotateTweenR){
    rotateTweenL.stop();
    rotateTweenR.stop();
  }
}

function moveCamera(i) {
  flameRotationStop();
  if (i === undefined) {
    i = cameraInter;
  }
  moveCameraTween = animateVector3(camera.position, cameraPositions[i], {
    duration: 1000,
    easing: TWEEN.Easing.Quadratic.InOut,
    update: function (d) { },
    callback: function () { flameRotation() }
  })
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


/*
 * Animates a Vector3 to the target
 * animateVector3 (objToMove:Vector3, target:Vector3, options{easing:,duration:,onUpdate:,onComplete} )
 * https://medium.com/@lachlantweedie/animation-in-three-js-using-tween-js-with-examples-c598a19b1263
*/
function animateVector3(vectorToAnimate, target, options) {
  options = options || {};
  // get targets from options or set to defaults
  var to = target || THREE.Vector3(),
    easing = options.easing || TWEEN.Easing.Quadratic.In,
    duration = options.duration || 2000;
  // create the tween
  var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
    .to({ x: to.x, y: to.y, z: to.z }, duration)
    .easing(easing)
    .onUpdate(function (d) {
      if (options.update) {
        options.update(d);
      }
    })
    .onComplete(function () {
      if (options.callback) options.callback();
    });
  // start the tween
  tweenVector3.start();
  // return the tween in case we want to manipulate it later on
  return tweenVector3;
}
/**
 * Scroll to `(x, y)`.
 * @param {Number} x
 * @param {Number} y
 * @param {options}  ease: 'out-bounce', duration: 1500y
 */
function scrollToTween(x, y, options) {
  options = options || {};

  // start position
  var start = {
    left: window.pageXOffset || window.scrollX,
    top: window.pageYOffset || window.scrollY
  },
   easing = options.easing || TWEEN.Easing.Quadratic.In,
   duration = options.duration || 2000;

  //setup tween
  var tween = new TWEEN.Tween(start)
    .to({ left: x, top: y }, duration)
    .easing(easing)
    .onUpdate(function(o){
      window.scrollTo(o.left | 0, o.top | 0);
    })
  tween.start();
  return tween;
}
