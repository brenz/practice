//@author Omar Shehata. 2015.
//We are loading the Three.js library from the cdn here: https://cdnjs.com/libraries/three.js/


///////////////////This is the basic scene setup
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

///////////////////This is where we create our off-screen render target
//Create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();
//Create the texture that will store our result
//var bufferTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

//Let's create a red box
var redMaterial = new THREE.MeshBasicMaterial({color:0xF06565});
var boxGeometry = new THREE.BoxGeometry( 5, 5, 5 );
var boxObject = new THREE.Mesh( boxGeometry, redMaterial );
boxObject.position.z = -10;

var loader = new THREE.JSONLoader();

flameGeometry = new THREE.BufferGeometry();
var positions = [];
var colors = [];
var sizes = [];
var color = new THREE.Color();

uniforms = {
  //texture: { value: new THREE.TextureLoader().load("./img/spark1.png") },
  //texture: { value: new THREE.TextureLoader().load("./img/disc.png") },
  texture: { value: new THREE.TextureLoader().load("./img/round_blur.png") },
  texture_overlay: { value: new THREE.TextureLoader().load("./img/turbulent_noise_01.png") },
  opacity: { value: 0 },
  topColor: { value: new THREE.Color(0x0077ff) },
};

uniforms.topColor.value.copy(new THREE.Color(255,255,255));

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

loader.load('./data/KPSM_1D_4.json', function (g, m) {
  //loader.load('./data/KPSM_flame.json', function (g, m) {
    // Create 5 layers by normal geomertery
    g.scale(500, 500, 500);
    var gg = g.clone()
    gv = g.vertices
    particles = gv.length;

    // Only bufferGeomerty can take shade matriel, set position from vericles
    for (var j = 0; j < particles; j++) {
      var size = Math.random() * 40;
      if (size < 1 * 40){
        size=1;
      }else{
        size=size*1.2;
        positions.push((gv[j].x) + Math.random() * Math.sin(j) * 0.1);
        positions.push((gv[j].y) + Math.random() * Math.sin(j) * 0.1);
        positions.push((gv[j].z) + Math.random() * Math.sin(j) * 0.1);
        color.setHSL(204 / 360, 0.5 + 0.5 * Math.sin(j), 0.3 + 0.3 * Math.sin(gv[j].z / ( 15 * 1 ) * Math.PI));
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
    bufferScene.add(flame); //We add it to the bufferScene instead of the normal scene!
    scene.add(flame);
  });


///And a blue plane behind it
var blueMaterial = new THREE.MeshBasicMaterial({color:0x7074FF})
var plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
var planeObject = new THREE.Mesh(plane,blueMaterial);
planeObject.position.z = -15;
bufferScene.add(planeObject);//We add it to the bufferScene instead of the normal scene!

////////////////////////////Now we use our bufferTexture as a material to render it onto our main scene
//var boxMaterial = new THREE.MeshBasicMaterial({map:bufferTexture.texture});
//var boxGeometry2 = new THREE.BoxGeometry( 5, 5, 5 );
//var mainBoxObject = new THREE.Mesh(boxGeometry2,boxMaterial);
//mainBoxObject.position.z = -10;
//scene.add(mainBoxObject);


//Render everything!
function render() {

  requestAnimationFrame( render );

  //Make the box rotate on box axises
  //boxObject.rotation.y += 0.01;
  //boxObject.rotation.x += 0.01;
  //Rotate the main box too
  //mainBoxObject.rotation.y += 0.01;
  //mainBoxObject.rotation.x += 0.01;

  //Render onto our off screen texture
  //renderer.render(bufferScene,camera,bufferTexture);

  //Finally, draw to the screen
  renderer.render( scene, camera );

}
render();
