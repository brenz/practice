var cube;
var loader = new THREE.JSONLoader();
loader.load('cube.json',function(g,m){
  cube = new THREE.Mesh(g,m);
  scene.add(cube);

  cube.position.z = -6;
  cube.rotation.z = 0.4
})
