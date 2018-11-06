var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,

  mouseX = 0, mouseY = 0,

  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,

  camera, scene, renderer;

init();
animate();

function init() {

  var container, particle;

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 1000;
  scene = new THREE.Scene();
  scene.background=new THREE.Color("rgb(0,45,95)")

  renderer = new THREE.CanvasRenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  // particles

  var PI2 = Math.PI * 2;
  var spMaterial = new THREE.SpriteCanvasMaterial({

    color: 0xffffff,
    program: function (context) {

      context.beginPath();

      var gradient = context.createRadialGradient(1, 1, 0, 1, 1, 1);
      gradient.addColorStop(0, "white");
      gradient.addColorStop(0.3, "white");
      gradient.addColorStop(0.3, "rgba(171,230,255,0.8)");
      //var stopPoint = Math.random()/2+0.5
      gradient.addColorStop(1, "rgba(171,230,255,0)");

      context.fillStyle=gradient;
      context.arc(1, 1, 1, 0, PI2, true);
      context.fill();

    }

  });
  var particles=[]
  for (var i = 0; i < 2000; i++) {

    particle = new THREE.Sprite(spMaterial);
    particle.position.x = Math.random() * 2 - 1;
    particle.position.y = Math.random() * 2 - 1;
    particle.position.z = Math.random() * 2 - 1;
    particle.position.normalize();
    particle.position.multiplyScalar(650);
    particle.scale.multiplyScalar(3);
    particles.push(particle);
    scene.add(particle);

  }

  // lines

  var vertices = [];

  for (var i = 0; i < 300; i++) {

    var vertex = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    vertex.normalize();
    vertex.multiplyScalar(550);

    vertices.push(vertex);

    var vertex2 = vertex.clone();
    vertex2.multiplyScalar(Math.random() * 0.3 + 1);

    vertices.push(vertex2);

  }

  var geometry = new THREE.BufferGeometry().setFromPoints(vertices);

  var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(line);

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
    console.log(event.deltaY);
    //camera.position.y = (1000 - camera.position.y)*event.deltaY*0.05;
    render();

}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * .05;
  camera.position.y += (- mouseY + 200 - camera.position.y) * .05;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
  //composer.render();
}
