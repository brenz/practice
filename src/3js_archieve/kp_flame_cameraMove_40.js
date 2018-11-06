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
  camera, scene, renderer, composer, stats, bloomPass, controls,
  uniforms,                                       // shade matirial uniforms
  particles = 100000,                             // number of flame particles, for performance consideration, reduce the particles <100000
  flame, flameGeometry, gv = [],
  shinDots = [],
  cameraPositions = [],
  cameraInter = 0,                                // indicate the current camera position
  rotateTweenL, rotateTweenR, rotateTweenZ, moveCameraTween,    // Tween object
  introPlayed = 0,
  thickNess = 15, thickDis = 0.3, thickScale = 0.001,
  current_section = 0, sections = [], sl = 0

/*
* parameter for GUI panel
* TODO: remove in production
*/
var params = {
  color: [71, 121, 158],
  particlesSize: 1,
  particlesRand: 0.02,
  exposure: 1,
  bloomThreshold: 0.47,
  bloomStrength: 1.5,
  bloomRadius: 0.72,
  rotateY: 0,
  rotateX: 0,
  rotateZ: 0,
  ifRotation: false,
  ifPanCross: false,
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,

};

/*
* WEBGL Supportive detect
*/

document.onreadystatechange = function () {
  if (document.readyState == "interactive") {
    circlar_timeline.init();
    sections = document.querySelectorAll("section");
    sl = sections.length;
    if (WEBGL.isWebGLAvailable() === true) {
      // User can have full exprience with WebGl, go to WEBGL init()
      init();
      animate();
    }
    else {
      // go with low bandwidth option;
      document.getElementById('flame-container').appendChild(WEBGL.getWebGLErrorMessage());
    }
  }
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
*/
function init() {
  var container;
  container = document.getElementById('flame-container');

  camera = new THREE.PerspectiveCamera(40, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 100);
  camera.position.set(0, 0, 50);
  //camera.lookAt(0,0,0);
  //camera.position.z = 1000;

  // 1. Create/Define scene and render
  // TODO: create fog and scence stage?
  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(17,51,128)");

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 1;
  controls.maxDistance = 100;

  // 2 Create Martial, by useing shade matrial
  // https://threejs.org/examples/?q=buff#webgl_buffergeometry_custom_attributes_particles
  // ## shaded martial, uniforms defined in html
  uniforms = {
    texture: { value: new THREE.TextureLoader().load("./img/spark1.png") },
    //texture: { value: new THREE.TextureLoader().load("./img/disc.png") },
    opacity: { value: 0 },
    topColor: { value: new THREE.Color(0x0077ff) },
  };

  uniforms.topColor.value.copy(new THREE.Color(params.color[0] / 255, params.color[1] / 255, params.color[2] / 255));

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
    g.scale(15, 15, 15);
    var gg = g.clone()
    for (var i = 0; i < thickNess; i++) {
      //var scaleSize = 1 + thickScale* Math.sin(i / thickNess * Math.PI);
      //var scaleSize = 1 - thickScale* Math.sin(i / thickNess * Math.PI);
      var scaleSize = 1 - i * thickScale;
      g.merge(gg.clone().translate(0, 0, thickNess * thickDis / 2 - i * thickDis).scale(scaleSize, scaleSize, scaleSize));
    }
    gv = g.vertices
    particles = gv.length;

    // Only bufferGeomerty can take shade matriel, set position from vericles
    for (var j = 0; j < particles; j++) {
      positions.push((gv[j].x) + Math.random() * Math.sin(j) * params.particlesRand);
      positions.push((gv[j].y) + Math.random() * Math.sin(j) * params.particlesRand);
      positions.push((gv[j].z) + Math.random() * Math.sin(j) * params.particlesRand);
      color.setHSL(204 / 360, 0.5 + 0.5 * Math.sin(j), 0.5 + 0.4 * Math.sin(Math.random() * j));
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
    var sectionLength = document.getElementsByTagName("section").length;
    for (var k = 0; k < sectionLength - 1; k++) {
      var shinDot = new THREE.Mesh(sphereGeometry, sphereMaterial);
      var length = Math.floor(Math.random() * g.vertices.length); // Pick up a random dot to perform
      shinDot.position.add(g.vertices[length]);
      flame.add(shinDot);
      shinDot.scale.multiplyScalar(0.01);
      shinDots.push(shinDot);
    }
    shinDots[0].position.x = -82.28272; shinDots[0].position.y = 247.69856; shinDots[0].position.z = -24.3512;
    if(shinDots[1]) { shinDots[1].position.x = 150.0596; shinDots[1].position.y = 107.20472; shinDots[1].position.z = -32.35064; }
    if(shinDots[2]) { shinDots[2].position.x = 100.63136; shinDots[2].position.y = -132.04424; shinDots[2].position.z = -30.85064; }
    if(shinDots[3]) { shinDots[3].position.x = -122.28272; shinDots[3].position.y = -118.68192; shinDots[3].position.z = -32.35064 }

    // 3.4 Adjust flame position
    // TODO: Conside responsive design
    //flame.rotateY(-0.3);
    flame.scale.multiplyScalar(1.5);
    //flame.onAfterRender = animateFlame;
    scene.add(flame);

    // 3.5 Define animation destination, defer cameraPositions
    cameraPositions.push(new THREE.Vector3(
      2.119355686043688,
      2.9570374271116,
      48.111028577450185)); // first position is the start position

    // >> Start
    for (var i = 0; i < shinDots.length; i++) {
      cameraPositions.push(new THREE.Vector3(
        shinDots[i].position.x - windowHalfX / 4 + 250,
        shinDots[i].position.y + windowHalfY / 2,
        10));
    }
    cameraPositions[1].x = -60; cameraPositions[1].y = 500;
    if(cameraPositions[2]) { cameraPositions[2].x = 360.0596; cameraPositions[2].y = 217.20472; }
    if(cameraPositions[3]) { cameraPositions[3].x = 261.63; cameraPositions[3].y = -262.044; }
    if(cameraPositions[4]) { cameraPositions[4].x = -132.282; cameraPositions[4].y = -238.68192;}
    camera.position.x = 2;
    camera.position.y = 1.95;

    camera.rotation.x = -0.036985896349892015
    camera.rotation.y = 0.3001276749428997
    camera.rotation.z = 0.010939143287416674


    // 3.6 Start Flame rotation
    if (params.ifRotation){
      flameRotation();
    }
  }) // End of load callback

  // 4. Add post processing effect:
  // --- Add unreal bloom effect
  // https://threejs.org/examples/?q=unr#webgl_postprocessing_unreal_bloom
  // Add effctFocus
  // https://threejs.org/examples/#webgl_points_dynamic
  var renderScene = new THREE.RenderPass(scene, camera);
  bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
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
  addGuiControl();

  // 7. Add EventListener
  // mouse event listener
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('wheel', wheel_control);

  document.addEventListener('keyup', function (event) {
    if (event.code === 'Tab') {
      var focused = document.activeElement;
      if (!focused || focused == document.body)
        focused = null;
      else if (document.querySelector)
        focused = document.querySelector(":focus");
      if (focused.classList[0] === "scroll_down") {
        var next_section = current_section + 1;
        sectionMovingAnim(current_section, next_section)
      }
      if (focused.classList[0] === "progress-dot" && !focused.classList.contains("active")) {
        var next_section = current_section + 1;
        sectionMovingAnim(current_section, next_section)
      }
    }
    if (event.code === 'ArrowDown') {
      camera.position.y += 2;
      console.log(camera.position);
    }
    if (event.code === 'ArrowUp') {
      camera.position.y -= 2;
      console.log(camera.position);
    }
    if (event.code === 'ArrowLeft') {
      camera.position.x -= 2;
      console.log(camera.position);
    }
    if (event.code === 'ArrowRight') {
      camera.position.x += 2;
      console.log(camera.position);
    }
    if (event.code === 'Escape') {
      camera.position.z += 2;
      console.log(camera.position);
    }
    if (event.code === 'Enter') {
      camera.position.z -= 2;
      console.log(camera.position);
    }
  });
} // End of init()

function animate() {
  requestAnimationFrame(animate);
  render();
  if (flameGeometry.attributes.size){
    animateFlame();
  }
  TWEEN.update();
  stats.update();
  document.getElementById("control").innerHTML="{camera.postion}: "+
  "<br/> x:"+camera.position.x+
  "<br/> y:"+camera.position.y+
  "<br/> z:"+camera.position.z +
  "<br/> {camera.rotation}: "+
  "<br/> x"+camera.rotation.x+
  "<br/> y:"+camera.rotation.y+
  "<br/> z:"+camera.rotation.z;
}

function render() {
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
  introPlayed = 1;
  anime({
    targets: ["#section0 h1", "#section0 button", ".scroll_down", ".flame_logo"],
    opacity: 1,
    translateY: [20,0],
    duration: 2000,
    delay: 1500,
    easing: 'easeOutQuart'
  });
  anime({
    targets: ["#section0"],
    opacity: 1,
    duration: 2000,
    delay: 1500,
    easing: 'easeOutQuart'
  });


  new TWEEN.Tween(flame.material.uniforms.opacity).to({ value: 1 }, 4000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () { })
    .start();
  moveCamera(0);
}

function animateFlame() {
  var time = Date.now() * 0.002;
  var sizes = flameGeometry.attributes.size.array;
  var positions = flameGeometry.attributes.position.array;
  //var fp = flameGeometry.attributes.position.array
  if (camera.position.z > 800) {
    for (var i = 0; i < particles; i += Math.floor(1500 * Math.random())) {
      //Todo: think about a better animation method
      sizes[i] = Math.random() * params.particlesSize;
    }
    flameGeometry.attributes.size.needsUpdate = true;
  }
  /*if (camera.position.z < 900) {
    for (var j = 0; j < particles; j++) {
      if (Math.abs(positions[j * 3]) < Math.abs(gv[j].x * 2)) { positions[j * 3] += gv[j].x / 100 }
      if (Math.abs(positions[j * 3 + 1]) < Math.abs(gv[j].y * 2)) { positions[j * 3 + 1] += gv[j].y / 100 }
      if (Math.abs(positions[j * 3 + 2]) < Math.abs(gv[j].z * 2)) { positions[j * 3 + 2] += gv[j].z / 100 }
    }
    flameGeometry.attributes.position.needsUpdate = true;
  }
  if (camera.position.z > 900) {
    for (var k = 0; k < particles; k++) {
      if (Math.abs(positions[k * 3]) > Math.abs(gv[k].x)) { positions[k * 3] -= gv[k].x / 100 }
      if (Math.abs(positions[k * 3 + 1]) > Math.abs(gv[k].y )) { positions[k * 3 + 1] -= gv[k].y / 100 }
      if (Math.abs(positions[k * 3 + 2]) > Math.abs(gv[k].z )) { positions[k * 3 + 2] -= gv[k].z / 100 }
    }
    flameGeometry.attributes.position.needsUpdate = true;
  }*/
}

/*
* Start the flame shimm
*/
function flameRotation() {
  //console.log("flame start rotation");
  if (!rotateTweenL && !rotateTweenR && flame != undefined) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.1 }, 18000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.3 }, 18000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenL.chain(rotateTweenR);
    rotateTweenR.chain(rotateTweenL);
    rotateTweenL.start();
  } else if (rotateTweenL && rotateTweenR) {
    rotateTweenL.start();
  }
}

/*
* Stop the flame shimm
*/
function flameRotationStop() {
  //console.log("flame stop rotation");
  if (rotateTweenL || rotateTweenR) {
    rotateTweenL.stop();
    rotateTweenR.stop();
  }
}

/*
* Start the flame Pan Cross
*/
function flamePanCross() {
  //console.log("flame start rotation");
  if (!rotateTweenZ && flame != undefined) {
    rotateTweenZ = new TWEEN.Tween(flame.rotation)
      .to({ z: -0.5 }, 50000)
      .easing(TWEEN.Easing.Linear.None)
      rotateTweenZ.start();
  } else if (rotateTweenZ) {
    rotateTweenZ.start();
  }
}

/*
* Stop the flame pan Cross
*/
function flamePanCrossStop() {
  //console.log("flame stop rotation");
  if (rotateTweenZ ) {
    rotateTweenZ.stop();
  }
}


/**
 * Init animation move camera to destination
 * @param {int} i camera position
 */
function moveCamera(i) {
  //flameRotationStop();
  if (i === undefined) {
    i = cameraInter;
  }
  moveCameraTween = animateVector3(camera.position, cameraPositions[i], {
    duration: 3000,
    easing: TWEEN.Easing.Quadratic.InOut,
    update: function (d) { },
    onStart: function () {
      window.removeEventListener('wheel', wheel_control);
    },
    onComplete: function () {
      window.addEventListener('wheel', wheel_control);
    },
    onUpdate: function() {
      console.log(camera.position);
    }
  })
}
function flameRotationUp() {
  var flameRotationTween = new TWEEN.Tween(flame.rotation)
    .to({ x: 0.05, y: -0.45 }, 3000)
    .easing(TWEEN.Easing.Quartic.Out);
  flameRotationTween.start();
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
    easing = options.easing || TWEEN.Easing.Quadratic.Out,
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
    .onStart(function () {
      if (options.onStart) options.onStart();
    })
    .onComplete(function () {
      if (options.onComplete) options.onComplete();
    });
  // start the tween
  tweenVector3.start();
  // return the tween in case we want to manipulate it later on
  return tweenVector3;
}

/**
 * Event handler for Wheel
 * @param {Event} e
 */
function wheel_control(e) {
  var next_section;
  if (e.deltaY < 0) {
    //console.log('scrolling up:::' + "current_section:" + current_section);
    next_section = current_section - 1;
  } else if (e.deltaY > 0) {
    //console.log('scrolling down:::' + "current_section:" + current_section);
    next_section = current_section + 1;
  } else {
    return 0;
  }
  if (next_section < 0) { return 0 } // nothing can scroll up on first page
  if (next_section === sl) { return 0 } // nothing can scroll donw on last page

  sectionMovingAnim(current_section, next_section)
}

/**
 * Animation between each section
 * @param {num} current_section ... current_section is global
 * @param {num} next_section ... next_section is a local parameter
 */
function sectionMovingAnim(cs, ns) {
  var current_shindot = cs - 1;
  var next_shindot = ns - 1;
  //Todo: revisit the logic
  if (ns > 0) { // rest of page set dot position
    circlar_timeline.setDot(ns - 1);
  }
  // Todo: adjust this
  // Todo: revisit the timeline
  var moveAnim = anime.timeline({
    duration: 2000,
    easing: 'easeOutQuart',
    elasticity: 0
  });
  moveAnim.add({
    targets: ["#section" + cs + " h2", "#section" + cs + " .divider", "#section" + cs + " .flame_logo","#section" + cs + " p", "#section" + cs + " h1", "#section" + cs + " button"],
    opacity: 0,
    translateY: 20,
    offset: 0
  })
  moveAnim.add({ // fade out scroll icon
    targets: [".scroll_down"],
    opacity: 0,
    translateY: 0,
    offset: 0
  })
  moveAnim.add({
    targets: ["#section" + cs],
    opacity: 0,
    offset: 500
  })
  // TODO: adujust image shrink logic
  moveAnim.add({
    targets: ["#section" + cs + " img"],
    opacity: 0,
    offset: 0,
    duration: 800
  })
  moveAnim.add({
    targets: '#circleimage_mask circle',
    cx: [0,300],
    r: [721,0],
    offset: 0,
    duration:800
  })
  if (current_shindot >= 0) { // first page dont have shindot can shrink
    moveAnim.add({
      targets: shinDots[current_shindot].scale,
      x: 0.01, y: 0.01, z: 0.01,
      offset: 300,
      duration: 400,
      easing: 'easeOutCubic'
    })
  }
  if (ns === 0) { // first page dont have right side dot
    moveAnim.add({
      targets: circlar_timeline.container,
      opacity: 0,
      offset: 0
    })
  }
  moveAnim.add({ // make the light up the background light
    targets: bloomPass,
    threshold: params.bloomThreshold,
    offset: 900
  })

  // fade out currect section done
  // start fade in next section
  moveAnim.add({
    targets: ["#section" + ns],
    opacity: 1,
    offset: 2000
  })
  moveAnim.add({
    targets: ["#section" + ns + " h2", "#section" + ns + " .divider", "#section" + ns + " .flame_logo", "#section" + ns + " p", "#section" + ns + " h1", "#section" + ns + " button"],
    opacity: 1,
    translateY: 0,
    offset: 2000
  })
  if (ns > 0 && circlar_timeline.isShow() === '0') { // right side pin show up
    moveAnim.add({
      targets: circlar_timeline.container,
      opacity: 1,
      offset: 2500
    })
  }
  if (ns < sl - 1) { // last page dont have scroll down button
    moveAnim.add({
      targets: [".scroll_down"],
      opacity: 1,
      translateY: -20,
      offset: 2500
    })
  }

  moveAnim.add({
    targets: ["#section" + ns + " img"],
    height:  [{ value: 0, duration: 0 },
      { value: 200, duration: 400 },
      { value: SCREEN_HEIGHT, duration: 800 }],
    opacity: [{ value: 0, duration: 0 },
      { value: 0.1, duration: 700 },
      { value: 1, duration: 1300 }],
    offset: 2200,

  })
  moveAnim.add({
    targets: '#circleimage_mask circle',
    cx: [{ value: 300, duration: 0 },
        { value: 300, duration: 700 },
        { value: 0, duration: 1300 }],
    cy: [windowHalfY, windowHalfY],
    r: [
      { value: 0, duration: 0 },
      { value: 200, duration: 600 },
      { value: 721, duration: 1400 }
    ],
    offset: 2200,

  })
  if (next_shindot >= 0) { //first page dont have shotDot
    moveAnim.add({
      targets: shinDots[next_shindot].scale,
      x: 1, y: 1, z: 1,
      offset: (cs === 0 && ns === 1) ? 500 : 2000, // first section show shinedot quicker, rest of section show shinedot slower
      duration:(cs === 0 && ns === 1) ? 3000 : 1500,
      easing: 'easeInCubic'
    })
  }
  if (ns != 0) {
    moveAnim.add({ // Dim the background light
      targets: bloomPass,
      threshold: 0.9,
      offset: 2400
    })
  }
  //flameRotationUp();
  if (ns == 0) {
    flameRotation();
  }
  if (ns >= 1) {
    flameRotationStop();
  }
  moveCamera(ns);
  current_section = ns;
}

/**
 * Add Gui control in init
 * @param
 * TODO: remove in real product
 */
function addGuiControl() {
  var gui = new dat.GUI();
  var f1 = gui.addFolder('flame shape and color');
  f1.addColor(params, 'color').onChange(function (value) {
    uniforms.topColor.value = new THREE.Color(value[0] / 255, value[1] / 255, value[2] / 255)
  })
  f1.add(params, 'particlesSize', 1, 50).step(1).onChange(function (value) {
    params.particlesSize = Number(value);
    var sizes = flameGeometry.attributes.size.array
    for (var i = 0; i < particles; i++) {
      sizes[i] = Math.random() * params.particlesSize;
    }
    flameGeometry.attributes.size.needsUpdate = true;
  });
  f1.add(params, 'particlesRand', 0.01, 12).step(0.01).onChange(function (value) {
    particlesRandSpread(value, 1);
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
  f3.add(params, 'rotateX', -1.0, 1.0).step(0.01).onChange(function (value) {
    flame.rotation.x = Number(value);
  });
  f3.add(params, 'rotateY', -1.0, 1.0).step(0.01).onChange(function (value) {
    flame.rotation.y = Number(value);
  });
  f3.add(params, 'rotateZ', -1.0, 1.0).step(0.01).onChange(function (value) {
    flame.rotation.z = Number(value);
  });
  f3.add(params, 'ifRotation').onChange(function (value) {
    if (value) {
      flameRotation();
    } else {
      flameRotationStop();
    }
  })
  f3.add(params, 'ifPanCross').onChange(function (value) {
    if (value) {
      flamePanCross();
    } else {
      flamePanCrossStop();
    }
  })
  f3.add(params, 'cameraRotationX', -1.0, 1.0).step(0.01).onChange(function (value) {
    camera.rotation.x = Number(value);
  });
  f3.add(params, 'cameraRotationY', -1.0, 1.0).step(0.01).onChange(function (value) {
    camera.rotation.y = Number(value);
  });
  f3.add(params, 'cameraRotationZ', -1.0, 1.0).step(0.01).onChange(function (value) {
    camera.rotation.z = Number(value);
  });
}

function particlesRandSpread(value, density) {
  if (!density) { density = 100 }
  params.particlesRand = Number(value);
  var positions = flameGeometry.attributes.position.array;
  for (var j = 0; j < particles; j += Math.ceil(density * Math.random())) {
    positions[j * 3] = (gv[j].x) + Math.random() * Math.sin(j) * params.particlesRand;
    positions[j * 3 + 1] = (gv[j].y) + Math.random() * Math.sin(j) * params.particlesRand;
    positions[j * 3 + 2] = (gv[j].z) + Math.random() * Math.sin(j) * params.particlesRand;
  }
  flameGeometry.attributes.position.needsUpdate = true;
}
function particlesOutSpread(value, density) {
  if (!density) { density = 1 }
  if (!value) { value = 1.1 }
  var positions = flameGeometry.attributes.position.array;
  for (var j = 0; j < particles; j += density) {
    positions[j * 3] += gv[j].x * value;
    positions[j * 3 + 1] += gv[j].y * value;
    positions[j * 3 + 2] += gv[j].z * value;
  }
  flameGeometry.attributes.position.needsUpdate = true;
}

function particlesRandSpreadTween(value) {
  params.particlesRand = Number(value);
  var positions = flameGeometry.attributes.position.array;
  for (var j = 0; j < particles; j++) {
    var spreadX = new TWEEN.Tween(positions[j * 3])
      .to((gv[j].x) + Math.random() * Math.sin(j) * params.particlesRand)
      .onUpdate(function () {
        flameGeometry.attributes.position.needsUpdate = true;
      });
    var spreadY = new TWEEN.Tween(positions[j * 3 + 1])
      .to((gv[j].y) + Math.random() * Math.sin(j) * params.particlesRand);
    var spreadZ = new TWEEN.Tween(positions[j * 3 + 2])
      .to((gv[j].z) + Math.random() * Math.sin(j) * params.particlesRand);
    spreadX.chain(spreadY);
    spreadX.chain(spreadZ);
    spreadX.start()
  }
}
