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
  flame,flameGeometry,
  shinDots = [],
  cameraPositions = [],
  cameraInter = 0,
  rotateTweenL, rotateTweenR

/*
* TODO: parameter for GUI panel remove in production
*/
var params = {
  exposure: 1,
  bloomStrength: 1.2,
  bloomThreshold: 0.4,
  bloomRadius: 0,
  rotateY:0,
};

if ( WEBGL.isWebGLAvailable() === true){
  // User can have full exprience with WebGl, go to WEBGL init()
  init();
  animate();
}
else {
  // go with low bandwidth option;
  document.getElementById('flame-container').appendChild( WEBGL.getWebGLErrorMessage() );
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
  for (var i=0;i<1;i++){
    spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(0,0, 500);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 1000;
    spotLights.push(spotLight);
    scene.add( spotLight );

    //lightHelper = new THREE.SpotLightHelper(spotLight);
    //scene.add( lightHelper);
  }



  var ambientLight = new THREE.AmbientLight(0xffffff);
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
    var gg=g.clone()
    for (var i = 0; i < 10; i++) {
      var scaleSize=1-i*0.01;
      g.merge(gg.clone().translate(0,0,-i*4).scale(scaleSize,scaleSize,scaleSize));
    }

    // Create material
    // https://threejs.org/docs/index.html#api/en/materials/MeshPhongMaterial
    // ## MeshPhongMaterial - A material for shiny surfaces with specular highlights.
    var mashPhoneMatrial = new THREE.MeshPhongMaterial( {
      color: 0xcccccc, specular: 0xffffff, shininess: 250,
      side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    } );

    // Create Flame scuplture - convert normal Geomertery into buffergeometry
    // https://threejs.org/examples/?q=buffer#webgl_buffergeometry
    flameGeometry = new THREE.BufferGeometry();
    var positions = [];
    var normals = [];
    var colors = [], color = new THREE.Color();
    var d , d2;
    var pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3(),
        cb = new THREE.Vector3(), ab = new THREE.Vector3();
    var triangles=g.vertices.length;
    /* draw triangles base on the position of normal geometery */
    for ( var j = 0; j < triangles; j ++ ) {
      d = Math.random()*3; d2 = d / 2;	// individual triangle size
      // positions
      // TODO: Create better triangle shape or round dot
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
      // Todo: Adjust color and bloom param meter make it more pretty
      var vx = 0.5+Math.random()*0.1;
      var vy = 0.7+Math.random()*0.1;
      var vz = 0.9+Math.random()*0.1;
      color.setRGB( vx, vy, vz );
      colors.push( color.r, color.g, color.b );
      colors.push( color.r, color.g, color.b );
      colors.push( color.r, color.g, color.b );
    }
    function disposeArray() { this.array = null; }
    flameGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
    flameGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
    flameGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );

    // Create flame element.
    flame = new THREE.Mesh( flameGeometry, mashPhoneMatrial );

    // 4. Add shinny Particles
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
    // TODO: Conside responsive design
    flame.position.z = i * 12;
    flame.position.y = -50;
    flame.position.x = windowHalfX / 2 - 100;
    flame.rotateY(-0.1);
    flame.scale.multiplyScalar(1.8);

    scene.add(flame);

    // 5. Define animation destination, defer cameraPositions
    cameraPositions.push(new THREE.Vector3(flame.position.x, 0, 1000));
    for (var i = 0; i < shinDots.length; i++) {
      cameraPositions.push(new THREE.Vector3(
        shinDots[i].position.x + flame.position.x,
        shinDots[i].position.y,
        300));
    }

    // 6. Start Flame rotation, Spotlight animation
    flameRotation();
    for(var i=0;i<spotLights.length;i++){
      tweenlight(spotLights[i]);
    }

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
  var effectFocus = new THREE.ShaderPass( THREE.FocusShader );
  effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
  effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;
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
  gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
    renderer.toneMappingExposure = Math.pow( value, 4.0 );
  } );
  gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
    bloomPass.threshold = Number( value );
  } );
  gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
    bloomPass.strength = Number( value );
  } );
  gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
    bloomPass.radius = Number( value );
  } );
  gui.add( params, 'rotateY', -1.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
    flame.rotation.y = Number( value );
  } );


  // 9. Add EventListener
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
  renderer.render(scene, camera);
  composer.render(0.01);
}

function flameRotation() {
  if (!rotateTweenL && !rotateTweenR) {
    rotateTweenL = new TWEEN.Tween(flame.rotation)
      .to({ y: 0 }, 4000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenR = new TWEEN.Tween(flame.rotation)
      .to({ y: -0.2}, 4000)
      .easing(TWEEN.Easing.Quadratic.InOut)
    rotateTweenL.chain(rotateTweenR);
    rotateTweenR.chain(rotateTweenL);
  }
  rotateTweenL.start();
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

function tweenlight( light ) {
  new TWEEN.Tween( light.position ).to( {
    x: ( Math.random() * 1000 ) + 500,
    y: ( Math.random() * 2000 ) - 1000,
    z: ( Math.random() * 300 ) - 150
  }, 5000 )
  .easing( TWEEN.Easing.Quadratic.Out )
  .onComplete(function (){
    tweenlight(light)
  })
  .start();
}
