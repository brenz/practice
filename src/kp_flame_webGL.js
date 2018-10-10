/**
 *  @author Hong Zhang hong.x1.zhang@kp.org
 *  KP Flame element for kp_SOM home page
 */

// Globle parameter
// TODO: factory into object
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  mouseX = 0, mouseY = 0,
  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,
  camera, scene, renderer, composer, lightHelper, stats,
  spotLight, spotLights = [],
  ambientLight,
  flame, flameGeometry,
  shinDots = [],
  cameraPositions = [],
  cameraInter = 0,
  rotateTweenL, rotateTweenR, moveCameraTween,
  scrollProgress = 0

/*
* TODO: parameter for GUI panel remove in production
*/
var params = {
  color: [255, 255, 255],
  exposure: 1,
  bloomStrength: 1.2,
  bloomThreshold: 0.4,
  bloomRadius: 0,
  rotateY: 0,
};

/*
* WEBGL Supportive detecter
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
* Load once,
* Warning! Do not change obj value while doing tween animation.
* 1. Create scene.
* 2. Create SpotLight
* 3.1. JsonLoader load json data create by Blender
* 3.2. Create Flame elements
* 4. Create shinDots
* 5. Define animation destination
* 6. Start Flame rotation, Spotlight animation
* 7. Add post processing effect
* 8. Stats indicator
* 9. Add Event Listener
*/
function init() {
  var container;
  container = document.getElementById('flame-container');

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;

  // 1. Create scene
  // TODO: create fog and scence stage?
  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(0,45,95)");

  // 2. Create Spotlight https://threejs.org/docs/#api/en/lights/SpotLight
  // TODO: Add more light
  for (var i = 0; i < 1; i++) {
    spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(0, 0, 500);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 1000;
    spotLights.push(spotLight);
    scene.add(spotLight);

    lightHelper = new THREE.SpotLightHelper(spotLight);
    //scene.add( lightHelper);
  }

  ambientLight = new THREE.AmbientLight(0xaaeeff);
  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // 3.1 Load Json data.
  // https://threejs.org/docs/#api/en/loaders/JSONLoader
  var loader = new THREE.JSONLoader();

  loader.load('./data/KPSM_flame.json', function (g, m) {
    // Create 10 layers by normal geomertery
    g.scale(500, 500, 500);
    var gg = g.clone()
    for (var i = 0; i < 1; i++) {
      var scaleSize = 1 - i * 0.01;
      g.merge(gg.clone().translate(0, 0, -i * 4).scale(scaleSize, scaleSize, scaleSize));
    }

    // Create material
    // https://threejs.org/docs/index.html#api/en/materials/MeshPhongMaterial
    // ## MeshPhongMaterial - A material for shiny surfaces with specular highlights.

    var spriteMap = new THREE.TextureLoader().load( "img/spark1.png" );
    flame = new THREE.Points();

    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
    for (var j=0; j< g.vertices.length; j=j+5) {
      var gv = g.vertices[j];
      var sprite = new THREE.Sprite( spriteMaterial );
      sprite.position.normalize();
      sprite.position.add( gv);
      sprite.position.multiplyScalar( 1 );
      sprite.scale=new THREE.Vector3(100,100,100);
			flame.add( sprite );
    }

    // Create flame element.


    // 4. Add shinny Particles
    var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var sectionLength = document.getElementsByTagName("section").length;
    for (var k = 0; k < sectionLength - 1; k++) {
      var shinDot = new THREE.Mesh(sphereGeometry, sphereMaterial);
      var length = Math.floor(Math.random() * g.vertices.length); // Pick up a random dot to perform
      shinDot.position.add(g.vertices[length]);
      flame.add(shinDot);
      shinDots.push(shinDot);
    }

    // Adjust flame position
    // TODO: Conside responsive design
    flame.position.z = 0;
    flame.position.y = -60;
    flame.position.x = windowHalfX / 2 - 100;
    flame.rotateY(-0.1);
    flame.scale.multiplyScalar(2);

    scene.add(flame);

    // 5. Define animation destination, defer cameraPositions
    cameraPositions.push(new THREE.Vector3(0, 0, 1000));
    //cameraPositions.push(new THREE.Vector3(flame.position.x, 0, 1000));
    for (var i = 0; i < shinDots.length; i++) {
      cameraPositions.push(new THREE.Vector3(
        shinDots[i].position.x + flame.position.x,
        shinDots[i].position.y,
        250));
    }

    // 6. Start Flame rotation, Spotlight animation
    //flameRotation();
    /*for (var i = 0; i < spotLights.length; i++) {
      tweenlight(spotLights[i]);
    }*/

  }) // End of load callback

  // 7. Add post processing effect:
  // 7.1 Add unreal bloom effect
  // https://threejs.org/examples/?q=unr#webgl_postprocessing_unreal_bloom
  var renderScene = new THREE.RenderPass(scene, camera);
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.renderToScreen = true;
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  // Add effctFocus
  // https://threejs.org/examples/#webgl_points_dynamic
  var effectFocus = new THREE.ShaderPass(THREE.FocusShader);
  effectFocus.uniforms["screenWidth"].value = window.innerWidth;
  effectFocus.uniforms["screenHeight"].value = window.innerHeight;
  effectFocus.renderToScreen = true;

  composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  // FIXME: Can't add two compose
  composer.addPass(bloomPass);
  //composer.addPass(effectFocus);

  // 8. Add Stats indicator
  // TODO: remove stats indicator in real products
  stats = new Stats();
  container.appendChild(stats.dom);

  // GUI control
  // TODO: Remove GUI control in real products
  var gui = new dat.GUI();
  gui.addColor(params, 'color').onChange(function (value) {
    //AmbientLight.color
  })
  gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });
  gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });
  gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });
  gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
    bloomPass.radius = Number(value);
  });
  gui.add(params, 'rotateY', -1.0, 1.0).step(0.01).onChange(function (value) {
    flame.rotation.y = Number(value);
  });


  // 9. Add EventListener
  addMouseEvents();
  window.addEventListener('resize', onWindowResize, false);

  //10. Add scroll effect
  var controller = new ScrollMagic.Controller();

  // get all slides
  var slides = document.querySelectorAll("section");

  // Create Scene from Section intro
  new ScrollMagic.Scene({
    triggerElement: "#section0",
    duration: windowHalfY -11,//SCREEN_HEIGHT,
    offset: windowHalfY+10,
  })
    .setClassToggle("#section0", "fade-out")
    .on('progress', function (e) {
      cameraInter = 0
      //console.log("Scroll on intro in progress:"+e.progress)
      scrollProgress=e.progress;
    })
    //.addIndicators({}) // add indicators (requires plugin)
    .addTo(controller);

  // create scene from 1st slide
  for (var l = 1; l < slides.length; l++) {
    new ScrollMagic.Scene({
      triggerElement: "#section" + l,
      duration: window.innerHeight - 100,
    })
      .setClassToggle("#section" + l, "fade-in")
      .on('progress', function (e) {
        cameraInter = Math.floor((window.pageYOffset+windowHalfY+10)/SCREEN_HEIGHT);
        console.log("Scroll on intro in progress:"+e)

        scrollProgress=e.progress;
      })
      //.addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  }

}

function animate(time) {
  requestAnimationFrame(animate);
  render();
  TWEEN.update(time);
  stats.update();
}

function render() {
  if(cameraPositions[cameraInter+1] !== undefined && scrollProgress < 1){
      camera.position.x = cameraPositions[cameraInter].x + (cameraPositions[cameraInter+1].x-cameraPositions[cameraInter].x)*scrollProgress;
      camera.position.y = cameraPositions[cameraInter].y + (cameraPositions[cameraInter+1].y-cameraPositions[cameraInter].y)*scrollProgress;
      camera.position.z = cameraPositions[cameraInter].z + (cameraPositions[cameraInter+1].z-cameraPositions[cameraInter].z)*scrollProgress;
  }
  renderer.render(scene, camera);
  composer.render();
}

function flameRotation() {
  if (!rotateTweenL && !rotateTweenR) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: 0 }, 4000)
      .easing(TWEEN.Easing.Linear.None)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.2 }, 4000)
      .easing(TWEEN.Easing.Linear.None)
    rotateTweenL.chain(rotateTweenR);
    rotateTweenR.chain(rotateTweenL);
  }
  rotateTweenL.start();
}

function moveCamera(i) {
  //document.getElementById("console").innerHTML = "Current Story // CameraInter:" + i;
  rotateTweenL.stop();
  rotateTweenR.stop();
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

function addMouseEvents() {
  //document.addEventListener('mousemove', onDocumentMouseMove, false);
  //document.addEventListener('wheel', onDocumentMouseScroll, false);
  //body.addEventListener("scroll", onbodyScroll, false);
  //document.addEventListener('touchstart', touchLock, false);
  //document.addEventListener('mousedown', touchLock, false);
  //document.addEventListener('mouseup', touchMove, false);
  //document.addEventListener('touchend', touchMove, false);
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

function tweenlight(light) {
  new TWEEN.Tween(light.position).to({
    x: (Math.random() * 1000) + 500,
    y: (Math.random() * 2000) - 1000,
    z: (Math.random() * 50) - 50
  }, 5000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(function () {
      tweenlight(light)
    })
    .start();
}
