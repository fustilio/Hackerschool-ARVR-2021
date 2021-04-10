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
  
  // Step 1: Create camera & render the scene
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 0, 1.6, 3 );
  
  // Step 2: Populate the scene with a room that we can look around

  // Step 2.5: Add a AxesHelper object to see the coordinate axes
  
  // Step 3: prepare some geometry with which we will instantiate a cube
  
  // Step 4: Move the cube to somewhere we can see it

  // Step 5: Add some lights

  // Step 7: Add more cubes
  for ( let i = 0; i < 200; i ++ ) {
    // Step 8: Make cubes move
  }

  function onSelectStart() {

    this.userData.isSelecting = true;

  }

  function onSelectEnd() {

    this.userData.isSelecting = false;

  }
  
  document.body.appendChild( VRButton.createButton( renderer ) );
  window.addEventListener( 'resize', onWindowResize );

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
  

  // Step 6: Make the cube spin!
  // Step 9: Keep cubes within the room  
  
  // Step 1: render the scene through the camera
  renderer.render( scene, camera );
  
}
