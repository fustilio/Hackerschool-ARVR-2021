const BoxLineGeometry = THREE.BoxLineGeometry;
import { VRButton } from './jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './jsm/webxr/XRControllerModelFactory.js';


const clock = new THREE.Clock();

let container;
let camera, scene, raycaster, renderer;

let room;
let INTERSECTED;
const tempMatrix = new THREE.Matrix4();

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
  room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } )
  );
  scene.add( room );
  
  // Step 2.5: Add a AxesHelper object to see the coordinate axes
  const axesHelper = new THREE.AxesHelper( 1 );
  axesHelper.position.x = 0;
  axesHelper.position.y = 1
  axesHelper.position.z = -2;
  scene.add( axesHelper );
  
  // Step 3: prepare some geometry with which we will instantiate a cube
  const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
  const myFirstCube = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
  myFirstCube.userData.velocity = new THREE.Vector3();
  
  room.add( myFirstCube );
  
  // Step 4: Move the cube to somewhere we can see it
  myFirstCube.position.x = 0;
  myFirstCube.position.y = 2;
  myFirstCube.position.z = -2;
  
  // Step 5: Add some lights
  scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

  const light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );

  // Step 7: Add more cubes
  for ( let i = 0; i < 200; i ++ ) {
    const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = Math.random() * 4 - 2;
    object.position.y = Math.random() * 4;
    object.position.z = Math.random() * 4 - 2;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5;
    object.scale.y = Math.random() + 0.5;
    object.scale.z = Math.random() + 0.5;
    
    // Step 8: Make cubes move
    object.userData.velocity = new THREE.Vector3();
    object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    object.userData.velocity.z = Math.random() * 0.01 - 0.005;
    
    room.add( object );
  }
  
  // Step 10: Instantiate Raycaster
  raycaster = new THREE.Raycaster();

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
  const delta = clock.getDelta() * 60;
  let myFirstCube = room.children[0];
  myFirstCube.rotation.x += 0.01 * delta;
  myFirstCube.rotation.y += 0.01 * delta;
  myFirstCube.rotation.z += 0.01 * delta;
  // Step 9: Keep cubes within the room 
  for ( let i = 0; i < room.children.length; i ++ ) {

    const cube = room.children[ i ];

    cube.userData.velocity.multiplyScalar( 1 - ( 0.001 * delta ) );

    cube.position.add( cube.userData.velocity );

    if ( cube.position.x < - 3 || cube.position.x > 3 ) {

      cube.position.x = THREE.MathUtils.clamp( cube.position.x, - 3, 3 );
      cube.userData.velocity.x = - cube.userData.velocity.x;

    }

    if ( cube.position.y < 0 || cube.position.y > 6 ) {

      cube.position.y = THREE.MathUtils.clamp( cube.position.y, 0, 6 );
      cube.userData.velocity.y = - cube.userData.velocity.y;

    }

    if ( cube.position.z < - 3 || cube.position.z > 3 ) {

      cube.position.z = THREE.MathUtils.clamp( cube.position.z, - 3, 3 );
      cube.userData.velocity.z = - cube.userData.velocity.z;

    }

    cube.rotation.x += cube.userData.velocity.x * 2 * delta;
    cube.rotation.y += cube.userData.velocity.y * 2 * delta;
    cube.rotation.z += cube.userData.velocity.z * 2 * delta;

  }
  // Step 11: Find intersection
  tempMatrix.identity().extractRotation( controller.matrixWorld );

  raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
  raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

  const intersects = raycaster.intersectObjects( room.children );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = undefined;

  }
  // Step 12: Create cubes on pressing the screen
  
  // Step 1: render the scene through the camera
  renderer.render( scene, camera );
  
}
