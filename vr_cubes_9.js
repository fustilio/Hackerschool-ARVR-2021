const BoxLineGeometry = THREE.BoxLineGeometry;
import { VRButton } from './jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './jsm/webxr/XRControllerModelFactory.js';


const clock = new THREE.Clock();

let container;
let camera, scene, raycaster, renderer;

let room;

init();
animate();

function init() {

  // Just some HTML stuff
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  // Just some THREE js stuff
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild( renderer.domElement );

  // Step 0: Instantiate a new scene with which we will populate with various things
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x505050 );
  
  // Step 0+: You don't actually see anything, just a black screen
  
  // Step 1: Create camera & render the scene
  // Camera is the eyes through which we observe the scene
  // As with every other thing in this project, you must first create it, then add it to the scene explicitly
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 0, 1.6, 3 );
  scene.add( camera );
  // Step 1+: Don't forget to actually render something to camera

  // Great we got a grey screen now, we can actually look around the scene in VR but it's not
  // very interesting since everything is grey; we have no point of reference!
  // Step 2: Populate the scene with a room that we can look around
  // Now we're getting somewhere..
  room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } )
  );
  scene.add( room );

  // Step 2.5: Add a AxesHelper object to see the coordinate axes
  // The X axis is red. The Y axis is green. The Z axis is blue.
  const axesHelper = new THREE.AxesHelper( 1 );
  axesHelper.position.x = 0;
  axesHelper.position.y = 1
  axesHelper.position.z = -2;
  scene.add( axesHelper );
  
  // Step 3: prepare some geometry with which we will instantiate a cube
  const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
  const myFirstCube = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
  myFirstCube.userData.velocity = new THREE.Vector3();
  // if you look at the scene now, you'll find that the cube is directly below you
  
  room.add( myFirstCube );
  
  // Step 4: lets move the cube to a better position, right above the axes helper
  myFirstCube.position.x = 0;
  myFirstCube.position.y = 2;
  myFirstCube.position.z = -2;

  
  // the cube is supposed to be red, what happened? 
  // Step 5: Add some lights
  scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

  const light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );


  window.addEventListener( 'resize', onWindowResize );

  document.body.appendChild( VRButton.createButton( renderer ) );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  renderer.setAnimationLoop( render );

}

function render() {

  const delta = clock.getDelta() * 60;

  // Step 6: Make the cube spin!
  let myFirstCube = room.children[0];
  myFirstCube.rotation.x += 0.01 * delta;
  myFirstCube.rotation.y += 0.01 * delta;
  myFirstCube.rotation.z += 0.01 * delta;

  // Step 1: render the scene through the camera
  renderer.render( scene, camera );

}
