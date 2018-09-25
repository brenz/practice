var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,

  mouseX = 0, mouseY = 0,

  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,

  camera, scene, renderer, stats,

  flame, flames=[]

init();
animate();

function init() {

  var container;

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.background=new THREE.Color("rgb(0,45,95)")

  renderer = new THREE.CanvasRenderer();
  //renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // Flame with point material

  var loader = new THREE.JSONLoader();
  loader.load('./data/KPSM_flame.json', function (g, m) {
    g.scale(500,500,500);

    var pointmaterial = new THREE.PointsMaterial(  { color: 0xffffff ,size:2 } );


  for (var i=0; i<2; i ++){
      var flame=new THREE.Points(g, pointmaterial);
      flame.position.z = i*10;
      flame.position.y = 0;
      flame.position.x = windowHalfX/2-100;
      flame.scale.multiplyScalar(1.5-i*0.01);
      scene.add(flame);
      flames.push(flame);
    }
  })

 addMouseEvents();
  // Stats indicator
  stats = new Stats();
  container.appendChild( stats.dom );

  //

  window.addEventListener('resize', onWindowResize, false);
  document.getElementById('imemerse').addEventListener('click', function(e){
    removeMouseEvents();
  })

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
  stats.update();
}

function render() {
controler();
  camera.position.x += (mouseX - camera.position.x) * 0.01;
  camera.position.y += (- mouseY - camera.position.y) * 0.01;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
function controler() {
  document.getElementById("camera_position_x").innerHTML=camera.position.x;
  document.getElementById("camera_position_y").innerHTML=camera.position.y;
  document.getElementById("camera_position_z").innerHTML=camera.position.z;
}
function addMouseEvents(){
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  document.addEventListener('wheel', onDocumentMouseScroll,false);
}
function removeMouseEvents(){
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('touchstart', onDocumentTouchStart, false);
  document.removeEventListener('touchmove', onDocumentTouchMove, false);
  document.removeEventListener('wheel', onDocumentMouseScroll,false);
}
