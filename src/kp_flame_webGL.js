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
  flame,flameGeometry,
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
  spotLight.position.set(0, 0, 800);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.05;
  spotLight.decay = 2;
  spotLight.distance = 1000;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 200;
  scene.add( spotLight );

  lightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add( lightHelper);

  var ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // 3.1 Load Json data.
  // https://threejs.org/docs/#api/en/loaders/JSONLoader
  // 3.2 Create flame element by PointsMaterial
  // https://threejs.org/docs/#api/en/materials/PointsMaterial
  var loader = new THREE.JSONLoader();
  uniforms = {
    texture:   { value: new THREE.TextureLoader().load( "img/spark1.png" ) },
    opactiy: {value: 1}
  };
  var shaderMaterial = new THREE.ShaderMaterial( {
    uniforms:       uniforms,
    vertexShader:   document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    blending:       THREE.AdditiveBlending,
    depthTest:      false,
    transparent:    true,
    vertexColors:   true
  });

  loader.load('./data/KPSM_flame.json', function (g, m) {
    g.scale(500, 500, 500);
    var gg=g.clone()
    for (var i = 0; i < 5; i++) {
      g.merge(gg.clone().translate(0,0,-i*12));
    }

    // shaking the particiale
    /*for (var j = 0; j < g.vertices.length; j++) {
      g.vertices[j].x += Math.random() - 1;
      g.vertices[j].y += Math.random() - 1;
      g.vertices[j].z += Math.random() - 1;
    }*/

    // Create matrial
    var pointmaterial = new THREE.PointsMaterial({ color: 0x4d83bb, size: 2 });
    var mashPhoneMatrial = new THREE.MeshPhongMaterial( {
      color: 0xcccccc, specular: 0xffffff, shininess: 250,
      side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    } );
    // Create Flame scuplture;

    flameGeometry = new THREE.BufferGeometry();
    var positions = [];
    var normals = [];
    var colors = [];
    var color = new THREE.Color();
    var n=500;
    var d = 2, d2 = d / 2;	// individual triangle size
    var pA = new THREE.Vector3();
    var pB = new THREE.Vector3();
    var pC = new THREE.Vector3();
    var cb = new THREE.Vector3();
    var ab = new THREE.Vector3();
    //var triangles=flameGeometry.attributes.position.array.length;
    var triangles=g.vertices.length;
    for ( var j = 0; j < triangles; j ++ ) {
      d = Math.random()*3;
      d2 = d / 2;	// individual triangle size
      // positions
      var x = g.vertices[j].x;
      var y = g.vertices[j].y;
      var z = g.vertices[j].z;
      var ax = x + Math.random() * d - d2;
      var ay = y + Math.random() * d - d2;
      var az = z + Math.random() * d - d2;
      var bx = x + Math.random() * d - d2;
      var by = y + Math.random() * d - d2;
      var bz = z + Math.random() * d - d2;
      var cx = x + Math.random() * d - d2;
      var cy = y + Math.random() * d - d2;
      var cz = z + Math.random() * d - d2;
      positions.push( ax, ay, az );
      positions.push( bx, by, bz );
      positions.push( cx, cy, cz );
      // flat face normals
      pA.set( ax, ay, az );
      pB.set( bx, by, bz );
      pC.set( cx, cy, cz );
      cb.subVectors( pC, pB );
      ab.subVectors( pA, pB );
      cb.cross( ab );
      cb.normalize();
      var nx = cb.x;
      var ny = cb.y;
      var nz = cb.z;
      normals.push( nx, ny, nz );
      normals.push( nx, ny, nz );
      normals.push( nx, ny, nz );
      // colors
      var vx = Math.sin(x/n);
      var vy = Math.sin(y/n);
      var vz = Math.sin(z/n);
      color.setRGB( vx, vy, vz );
      colors.push( color.r, color.g, color.b );
      colors.push( color.r, color.g, color.b );
      colors.push( color.r, color.g, color.b );
    }
    function disposeArray() { this.array = null; }
    flameGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
    flameGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
    flameGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );
    //geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
    //flame = new THREE.Points( flameGeometry, pointmaterial);
    flame = new THREE.Mesh( flameGeometry, mashPhoneMatrial );
    //flame = new THREE.Points( flameGeometry, shaderMaterial );

    // 4 Add shinny Particles
    var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (var k=0; k<5; k++){
      var shinDot = new THREE.Mesh(sphereGeometry, sphereMaterial);
      var length = Math.floor(Math.random() * g.vertices.length); // Pick up a random dot to perform
      shinDot.position.add(g.vertices[length]);
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
  }) // End of load callback

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
