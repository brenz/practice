var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,

  mouseX = 0, mouseY = 0,

  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,

  camera, scene, renderer;

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
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);


  var PI2 = Math.PI * 2;
    // spMaterial
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

  // flame with point material
  var flame;
  var loader = new THREE.JSONLoader();
  loader.load('KPSM_flame.json', function (g, m) {
    g.scale(500,500,500);
   /* for ( var i = 0; i < 5000; i ++ ) {

      var dot = new THREE.Vector3();
      //dot.x = THREE.Math.randFloatSpread( 700 );
      //dot.y = THREE.Math.randFloatSpread( 700 );
      //dot.z = THREE.Math.randFloatSpread( 700 );

      g.vertices.push( dot );

    }*/

    var pointmaterial = new THREE.PointsMaterial(  { color: 0xb1dfff ,size:2 } );

    flame = new THREE.Points(g, pointmaterial);

    //flame.position.z = 500;
    flame.position.y = -250;
    //flame.position.x = 400;
    //flame.scale.set(1,1,1);
    flame.scale.multiplyScalar(1);
    scene.add(flame);
  })

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
}
