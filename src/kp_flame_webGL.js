var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,

  mouseX = 0, mouseY = 0,

  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,

  camera, scene, renderer, composer,

  flame,
  curr=0, step=0.01;

init();
animate();


function init() {

  var container, particle;

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.background=new THREE.Color("rgb(0,20,40)")

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // Flame with point material
  // var flame;
  var loader = new THREE.JSONLoader();
  loader.load('blowspoon.json', function (g, m) {
    g.scale(200,200,200);
    for ( var i = 0; i < 5000; i ++ ) {

      var dot = new THREE.Vector3();
      dot.x = THREE.Math.randFloatSpread( 700 );
      dot.y = THREE.Math.randFloatSpread( 700 );
      dot.z = THREE.Math.randFloatSpread( 700 );

      g.vertices.push( dot );

    }

    var pointmaterial = new THREE.PointsMaterial(  { color: 0xb1dfff ,size:2 } );

    flame = new THREE.Points(g, pointmaterial);

    flame.position.z = 0;
    flame.position.y = -600;
    flame.position.x = windowHalfX/2-100;
    //flame.rotation.y = -0.3;
    //cube.scale.set(1,1,1);
    flame.scale.multiplyScalar(1.5);
    scene.add(flame);
  })

  var renderScene = new THREE.RenderPass( scene, camera );
			var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
			bloomPass.renderToScreen = true;
			bloomPass.threshold = 0//params.bloomThreshold;
			bloomPass.strength = 0.5//params.bloomStrength;
			bloomPass.radius = 0.05//params.bloomRadius;
	composer = new THREE.EffectComposer( renderer );
			composer.setSize( window.innerWidth, window.innerHeight );
			composer.addPass( renderScene );
			composer.addPass( bloomPass );

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  document.addEventListener('wheel', onDocumentMouseScroll,false);
  //

  window.addEventListener('resize', onWindowResize, false);


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

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;

  }

}
function onDocumentMouseScroll(event) {
    if (event.deltaY>0){
      camera.position.z += 10//(1000 - camera.position.y)*event.deltaY*0.05;
    }else{
      camera.position.z -= 10//(1000 - camera.position.y)*event.deltaY*0.05;
    }
    controler();
    render();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}


function render() {
  controler();
  //console.log("camera.position.z:::"+camera.position.z);
  camera.position.x += (mouseX - camera.position.x) * 0.01;
  camera.position.y += (- mouseY - camera.position.y) * 0.01;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
  composer.render();

}
function controler() {

  document.getElementById("camera_position_x").innerHTML=camera.position.x;
  document.getElementById("camera_position_y").innerHTML=camera.position.y;
  document.getElementById("camera_position_z").innerHTML=camera.position.z;

}
