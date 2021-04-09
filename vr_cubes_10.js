const BoxLineGeometry = THREE.BoxLineGeometry;
import { VRButton } from './jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './jsm/webxr/XRControllerModelFactory.js';


const clock = new THREE.Clock();

let container;
let camera, scene, raycaster, renderer;

let room;

let controller, controllerGrip;
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


//   for ( let i = 0; i < 200; i ++ ) {

//     const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

//     object.position.x = Math.random() * 4 - 2;
//     object.position.y = Math.random() * 4;
//     object.position.z = Math.random() * 4 - 2;

//     object.rotation.x = Math.random() * 2 * Math.PI;
//     object.rotation.y = Math.random() * 2 * Math.PI;
//     object.rotation.z = Math.random() * 2 * Math.PI;

//     object.scale.x = Math.random() + 0.5;
//     object.scale.y = Math.random() + 0.5;
//     object.scale.z = Math.random() + 0.5;

//     object.userData.velocity = new THREE.Vector3();
//     object.userData.velocity.x = Math.random() * 0.01 - 0.005;
//     object.userData.velocity.y = Math.random() * 0.01 - 0.005;
//     object.userData.velocity.z = Math.random() * 0.01 - 0.005;

//     room.add( object );

//   }

//   raycaster = new THREE.Raycaster();



//   //

//   function onSelectStart() {

//     this.userData.isSelecting = true;

//   }

//   function onSelectEnd() {

//     this.userData.isSelecting = false;

//   }

//   controller = renderer.xr.getController( 0 );
//   controller.addEventListener( 'selectstart', onSelectStart );
//   controller.addEventListener( 'selectend', onSelectEnd );
//   controller.addEventListener( 'connected', function ( event ) {

//     this.add( buildController( event.data ) );

//   } );
//   controller.addEventListener( 'disconnected', function () {

//     this.remove( this.children[ 0 ] );

//   } );
//   scene.add( controller );

//   const controllerModelFactory = new XRControllerModelFactory();

//   controllerGrip = renderer.xr.getControllerGrip( 0 );
//   controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
//   scene.add( controllerGrip );

  window.addEventListener( 'resize', onWindowResize );

  //

  document.body.appendChild( VRButton.createButton( renderer ) );

}

function buildController( data ) {

  let geometry, material;

  switch ( data.targetRayMode ) {

    case 'tracked-pointer':

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

      material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

      return new THREE.Line( geometry, material );

    case 'gaze':

      geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
      material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
      return new THREE.Mesh( geometry, material );

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  renderer.setAnimationLoop( render );

}

function render() {

  const delta = clock.getDelta() * 60;

//   if ( controller.userData.isSelecting === true ) {

//     const cube = room.children[ 0 ];
//     room.remove( cube );

//     cube.position.copy( controller.position );
//     cube.userData.velocity.x = ( Math.random() - 0.5 ) * 0.02 * delta;
//     cube.userData.velocity.y = ( Math.random() - 0.5 ) * 0.02 * delta;
//     cube.userData.velocity.z = ( Math.random() * 0.01 - 0.05 ) * delta;
//     cube.userData.velocity.applyQuaternion( controller.quaternion );
//     room.add( cube );

//   }

//   // find intersections

//   tempMatrix.identity().extractRotation( controller.matrixWorld );

//   raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
//   raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

//   const intersects = raycaster.intersectObjects( room.children );

//   if ( intersects.length > 0 ) {

//     if ( INTERSECTED != intersects[ 0 ].object ) {

//       if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

//       INTERSECTED = intersects[ 0 ].object;
//       INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//       INTERSECTED.material.emissive.setHex( 0xff0000 );

//     }

//   } else {

//     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

//     INTERSECTED = undefined;

//   }

//   // Keep cubes inside room

    // Step 6: Make the cube spin!
    let myFirstCube = room.children[0];
    myFirstCube.rotation.x += 0.01 * delta;
    myFirstCube.rotation.y += 0.01 * delta;
    myFirstCube.rotation.z += 0.01 * delta;
  
//   for ( let i = 0; i < room.children.length; i ++ ) {

//     const cube = room.children[ i ];

//     cube.userData.velocity.multiplyScalar( 1 - ( 0.001 * delta ) );

//     cube.position.add( cube.userData.velocity );

//     if ( cube.position.x < - 3 || cube.position.x > 3 ) {

//       cube.position.x = THREE.MathUtils.clamp( cube.position.x, - 3, 3 );
//       cube.userData.velocity.x = - cube.userData.velocity.x;

//     }

//     if ( cube.position.y < 0 || cube.position.y > 6 ) {

//       cube.position.y = THREE.MathUtils.clamp( cube.position.y, 0, 6 );
//       cube.userData.velocity.y = - cube.userData.velocity.y;

//     }

//     if ( cube.position.z < - 3 || cube.position.z > 3 ) {

//       cube.position.z = THREE.MathUtils.clamp( cube.position.z, - 3, 3 );
//       cube.userData.velocity.z = - cube.userData.velocity.z;

//     }

//     cube.rotation.x += cube.userData.velocity.x * 2 * delta;
//     cube.rotation.y += cube.userData.velocity.y * 2 * delta;
//     cube.rotation.z += cube.userData.velocity.z * 2 * delta;
  

//   }

  // Step 1: render the scene through the camera
  renderer.render( scene, camera );

}
