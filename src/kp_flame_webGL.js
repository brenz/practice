/**
 *  @author Hong Zhang hong.x1.zhang@kp.org
 *  KP Flame element for kp_SOM home page
 */

// Globle parameter
// Todo: factory into object
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  mouseX = 0, mouseY = 0,
  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,
  camera, scene, renderer, composer, spotLight, lightHelper, stats,
  flame,
  shinDots = [],
  cameraPositions = [],
  cameraInter = 0,
  rotateTweenL, rotateTweenR

init();
animate();

// Load once,
// 1. Create scene.
// 2. Create SpotLight
// 3.1. JsonLoader load json data create by Blender
// 3.2. Create Flame elements
// 4. Create shinDots
// 5. Add BloomEffect
// 6. Add status indicator
// 7. Define animation destination, defer cameraPositions
// 8. Add Event Listener
function init() {
  var container;
  container = document.getElementById('flame-container');

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;

  // 1. Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(0,20,40)");

  // 2. Create Spotlight https://threejs.org/docs/#api/en/lights/SpotLight
  spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(0, 0, 500);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.05;
  spotLight.decay = 2;
  spotLight.distance = 1000;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 200;
  // scene.add( spotLight );

  lightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add( lightHelper);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // 3.1 Load Json data.
  // https://threejs.org/docs/#api/en/loaders/JSONLoader
  // 3.2 Create flame element by PointsMaterial
  // https://threejs.org/docs/#api/en/materials/PointsMaterial
  var loader = new THREE.JSONLoader();
  loader.load('./data/KPSM_flame.json', function (g, m) {
    g.scale(500, 500, 500);
    var gg=g.clone()
    for (var i = 0; i < 10; i++) {
      g.merge(gg.clone().translate(0,0,-i*12));
    }

    /* shaking the particiale
    for (var j = 0; j < g.vertices.length; j++) {
      g.vertices[j].x += Math.random() - 1;
      g.vertices[j].y += Math.random() - 1;
      g.vertices[j].z += Math.random() - 1;
    }*/

    var pointmaterial = new THREE.PointsMaterial({ color: 0x4d83bb, size: 2 });

    // Create Flame scuplture;
    flame = new THREE.Points(g, pointmaterial);

    // 4 Add shinny Particles
    var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (var k=0; k<5; k++){
      var shinDot = new THREE.Mesh(sphereGeometry, sphereMaterial);
      var length = Math.floor(Math.random() * flame.geometry.vertices.length); // Pick up a random dot to perform
      shinDot.position.add(flame.geometry.vertices[length]);
      flame.add(shinDot);
      shinDots.push(shinDot);
    }

    // Adjust flame position
    flame.position.z = i * 12;
    flame.position.y = 0;
    flame.position.x = windowHalfX / 2 - 100;
    flame.scale.multiplyScalar(1.8);

    scene.add(flame);

    // Add CamearPosition Query
    cameraPositions.push(new THREE.Vector3(flame.position.x, 0, 1000));
    for (var i = 0; i < shinDots.length; i++) {
      cameraPositions.push(new THREE.Vector3(
        shinDots[i].position.x + flame.position.x,
        shinDots[i].position.y,
        200));
    }

    // 9. Start Flamer rotation
    flameRotation();
  }) // End of load backback

  // 5. Add unreal bloom effect
  // https://threejs.org/examples/?q=unr#webgl_postprocessing_unreal_bloom
  var renderScene = new THREE.RenderPass(scene, camera);
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.renderToScreen = true;
  bloomPass.threshold = 0
  bloomPass.strength = 0.5
  bloomPass.radius = 0.05
  composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // 6. Add Stats indicator
  stats = new Stats();
  container.appendChild(stats.dom);

  // 7. Define animation destination, defer cameraPositions

  // 8. Add EventListener
  addMouseEvents();
  window.addEventListener('resize', onWindowResize, false);
  document.getElementById('imemerse').addEventListener('click', function (e) {
    moveCamera();
  })
}

function animate() {
  requestAnimationFrame(animate);
  render();
  TWEEN.update();
  stats.update();
}

function render() {
  controller();
  //camera.position.x += (mouseX - camera.position.x) * 0.01;
  //camera.position.y += (-mouseY - camera.position.y) * 0.01;
  //camera.lookAt(scene.position);
  renderer.render(scene, camera);
  composer.render();
}
function controller() {
  document.getElementById("camera_position").innerHTML = "{" + camera.position.x + "," + camera.position.y + "," + camera.position.z + "}";
}

// https://medium.com/@lachlantweedie/animation-in-three-js-using-tween-js-with-examples-c598a19b1263
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
function flameRotation() {
  if (!rotateTweenL && !rotateTweenR) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: 0.1 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.1 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenL.chain(rotateTweenR);
    rotateTweenR.chain(rotateTweenL);
  }
  rotateTweenL.start();
}

function addMouseEvents() {
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  document.addEventListener('wheel', onDocumentMouseScroll, false);
}
function removeMouseEvents() {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('touchstart', onDocumentTouchStart, false);
  document.removeEventListener('touchmove', onDocumentTouchMove, false);
  document.removeEventListener('wheel', onDocumentMouseScroll, false);
}
function moveCamera() {
  rotateTweenL.stop();
  rotateTweenR.stop();
  animateVector3(camera.position, cameraPositions[cameraInter], {
    duration: 1000,
    easing: TWEEN.Easing.Quadratic.InOut,
    update: function (d) {},
    callback: function () {
      cameraInter++;
    }
  })
  // }
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentMouseScroll(event) {
  if (event.deltaY > 0) {
    camera.position.z += 10 // (1000 - camera.position.y)*event.deltaY*0.05;
  } else {
    camera.position.z -= 10 // (1000 - camera.position.y)*event.deltaY*0.05;
  }
}
