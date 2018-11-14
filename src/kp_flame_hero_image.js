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
  camera, scene, renderer, composer,
  uniforms,                                       // shade matirial uniforms
  particles = 100000,                             // number of flame particles, for performance consideration, reduce the particles <100000
  flame, flameGeometry, gv = [],
  cameraPositions = [], cameraRotation = [],
  cameraInter = 0,                                // indicate the current camera position
  rotateTweenL, rotateTweenR, rotateTweenZ, moveCameraTween, rotateCamereTween,    // Tween object
  introPlayed = 0,
  thickNess = 15, thickDis = 14, thickScale = 0,
  current_section = 0, sections = []

/*
* parameter for GUI panel
* TODO: remove in production
*/
var params = {
  color: [98, 155, 207],
  overlayColor: [255, 200, 200],
  particlesSize: 35,
  particlesRand: 0.5,
  reducePecentage: 0.8,
  exposure: 1,
  bloomThreshold: 0.5,
  bloomStrength: 0.6,
  bloomRadius: 0.3,
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
    //circlar_timeline.init();
    sections = document.querySelectorAll("section");
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
* 2. Create Martial, by useing shade matrial
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

  camera = new THREE.PerspectiveCamera(40, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 10000);
  camera.position.set(0, 0, 2000);

  resizeCircle();

  // 1. Create/Define scene and render
  // TODO: create fog and scence stage?
  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(17,51,128)");
  bufferScene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);



  // 2 Create Martial, by useing shade matrial
  // https://threejs.org/examples/?q=buff#webgl_buffergeometry_custom_attributes_particles
  // ## shaded martial, uniforms defined in html
  uniforms = {
    texture: { value: new THREE.TextureLoader().load("./img/round_blur.png") },
    opacity: {
      value: 1
    },
    topColor: { value: new THREE.Color(0x0077ff) },
  };

  uniforms.topColor.value.copy(new THREE.Color(params.color[0] / 255, params.color[1] / 255, params.color[2] / 255));

  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    //blending: THREE.NormalBlending,
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
    // Create {thickNess} layers by normal geomertery
    g.scale(500, 500, 500);
    var gg = g.clone()
    for (var i = 0; i < thickNess; i++) {
      var scaleSize = 1 - i * thickScale;
      g.merge(gg.clone().translate(0, 0, thickNess * thickDis / 2 - i * thickDis).scale(scaleSize, scaleSize, scaleSize));
    }
    gv = g.vertices
    particles = gv.length;

    // Only bufferGeomerty can take shade matriel, set position from vericles
    for (var j = 0; j < particles; j++) {
      var size = Math.random() * params.particlesSize;
      if (size < params.reducePecentage * params.particlesSize) {
        size = 1;
      } else {
        size = size * 1.2;
        positions.push((gv[j].x) + Math.random() * Math.sin(j) * params.particlesRand);
        positions.push((gv[j].y) + Math.random() * Math.sin(j) * params.particlesRand);
        positions.push((gv[j].z) + Math.random() * Math.sin(j) * params.particlesRand);

        color.setHSL(204 / 360, 0.5 + 0.5 * Math.sin(j), 0.3 + 0.3 * Math.sin(gv[j].z / (thickNess * thickDis) * Math.PI));
        colors.push(color.r, color.g, color.b);
        sizes.push(size);
      }
    }
    // 3.2 create flame geomertery
    flameGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    flameGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    flameGeometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setDynamic(true));
    flameGeometry.computeBoundingSphere();

    flame = new THREE.Points(flameGeometry, shaderMaterial);

    // 3.4 Adjust flame position
    // TODO: Conside responsive design

    flame.scale.multiplyScalar(2);
    //flame.onAfterRender = animateFlame;
    //scene.add(planeflame);
    scene.add(flame);

    // 3.6 Start Flame rotation
    if (params.ifRotation) {
      flameRotation();
    }
  }) // End of load callback
  camera.position.x = 0;
  camera.position.y = 200;
  camera.position.z = 700;


  // 7. Add EventListener
  // mouse event listener
  window.addEventListener('resize', onWindowResize, false);
  /*
    document.addEventListener('keyup', function (event) {
      if (event.code === 'Tab') {
        var focused = document.activeElement;
        if (!focused || focused == document.body)
          focused = null;
        else if (document.querySelector)
          focused = document.querySelector(":focus");
        if (focused.classList[0] === "scroll_down") {
          var next_section = current_section + 1;
          //sectionMovingAnim(current_section, next_section)
        }
        if (focused.classList[0] === "progress-dot" && !focused.classList.contains("active")) {
          var next_section = current_section + 1;
          //sectionMovingAnim(current_section, next_section)
        }
      }
      if (event.code === 'ArrowDown') {
        camera.position.y += 10;
        console.log(camera.position);
      }
      if (event.code === 'ArrowUp') {
        camera.position.y -= 10;
        console.log(camera.position);
      }
      if (event.code === 'ArrowLeft') {
        camera.position.x -= 10;
        console.log(camera.position);
      }
      if (event.code === 'ArrowRight') {
        camera.position.x += 10;
        console.log(camera.position);
      }
      if (event.code === 'Escape') {
        camera.position.z += 50;
        console.log(camera.position);
      }
      if (event.code === 'Enter') {
        camera.position.z -= 50;
        console.log(camera.position);
      }
    });*/
} // End of init()

function animate() {
  requestAnimationFrame(animate);
  render();
  if (flameGeometry.attributes.size) {
    animateFlame(animate);
  }
  TWEEN.update();
}

function render() {
  renderer.render(scene, camera);
}


function animateFlame() {
  var time = Date.now() * 0.001;
  var positions = flameGeometry.attributes.position.array;
  var colors = flameGeometry.attributes.color.array;

  //if (!moveCameraTween.isPlaying()){
  for (var j = 0; j < particles; j++) {
    var vx = positions[j * 3];
    var vy = positions[j * 3 + 1];
    var vz = positions[j * 3 + 2];
    var h = 204 / 360; // ( 360 * ( 1.0 + time ) % 360 ) / 360;
    var s = 0.8 + 0.2 * Math.sin(j);
    //( 0.5 + 0.5* Math.sin(time)) //0.3 + 0.3 * Math.sin(gv[j].z / ( thickNess * thickDis ) * Math.PI) ;
    var l = 0.3 +
      0.2 * Math.sin(vy * 10 * Math.PI + time) +
      0.2 * Math.sin(vx * 10 * Math.PI + time) +
      0.3 * Math.sin(vz / (thickNess * thickDis) * Math.PI);

    var color = new THREE.Color();
    color.setHSL(h, s, l);
    colors[j * 3] = color.r;
    colors[j * 3 + 1] = color.g;
    colors[j * 3 + 2] = color.b;
  }
  flameGeometry.attributes.color.needsUpdate = true;
}

/*
* Start the flame shimm
*/
function flameRotation() {
  //console.log("flame start rotation");
  if (!rotateTweenL && !rotateTweenR && flame != undefined) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.1 }, 7500)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: 0.1 }, 7500)
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

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  SCREEN_HEIGHT = window.innerHeight;
  SCREEN_WIDTH = window.innerWidth;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCircle();
}
function resizeCircle() {
  var circle;
  var radius = 2000;
  var bk_lg = 457;
  var yIndent = -radius + bk_lg;

  circle = document.getElementById('hero_clip').getElementsByTagName("circle")[0];
  circle.setAttribute("cx", windowHalfX);
  circle.setAttribute("cy", yIndent);
  circle.setAttribute("r", radius);
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



