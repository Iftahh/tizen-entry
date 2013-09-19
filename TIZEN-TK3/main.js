var container;
var camera, scene, renderer;
var projector, plane, cube;
var mouse2D, mouse3D, raycaster,
isShiftDown = false,
theta = 45 * 0.5, isCtrlDown = false;
var isArrowUp, isArrowDown, isArrowLeft, isArrowRight=false;

var heroMesh;
var voxelPosition = new THREE.Vector3(), tmpVec = new THREE.Vector3(), normalMatrix = new THREE.Matrix3();
var cubeGeo, cubeMaterial;
var floorGeo, floorMaterial;
var i, intersector;
var plights=[];

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 1800;

	scene = new THREE.Scene();
      
	// hero

	heroGeo = new THREE.SphereGeometry( 10 );
	heroMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.3, transparent: true } );
	heroMesh = new THREE.Mesh( heroGeo, heroMaterial );
	scene.add( heroMesh );

	// cubes

	cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
	cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "square-outline-textured.png" ) } );
	cubeMaterial.ambient = cubeMaterial.color;

	// floor

	floorGeo = new THREE.CubeGeometry( 400, 50, 400 );
	floorMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "floor_1.jpg" ) } );
	floorMaterial.ambient = floorMaterial.color;

	plight = new THREE.PointLight( 0xff9999, 7.3, 400 );
	plight.distance=400;
	plight.position.x=25;
	plight.position.y=85;
	plight.position.z=25;
	scene.add( plight );
	plights.push(plight);

	for (i=0;i<3;i++) {
		plight = new THREE.SpotLight( 0xff9999, 5.1, 400, Math.PI/2,2);
		plight.target.position.x=10000000.0*Math.cos(Math.PI/3*i*2);
		plight.target.position.y=-155;
		plight.target.position.z=10000000.0*Math.sin(Math.PI/3*i*2);
		plight.castShadow= true;
		plight.onlyShadow= true;
		plight.shadowCameraNear=1;
		plight.shadowCameraFar=400;
		plight.shadowDarkness=0.77;
		plight.shadowCameraFov=120;
		plight.position.x=25;
		plight.position.y=85;
		plight.position.z=25;
		scene.add( plight );
		plights.push(plight);
	}

	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
	renderer.shadowMapEnabled=true;
	renderer.shadowMapSoft = true;
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );

	// add a floor
	for (x=0;x<lenx/8;x++) {
		for(z=0;z<leny/8;z++) {
			var voxel = new THREE.Mesh( floorGeo, floorMaterial );
			voxel.position.x=x*400+25-lenx/2*50;
			voxel.position.z=z*400+25-leny/2*50;
			voxel.position.y=25;
			voxel.receiveShadow = true;
			voxel.matrixAutoUpdate = false;
			voxel.updateMatrix();
			scene.add( voxel );
		}
	}

	// add walls
	for (x=0;x<lenx;x++) {
		for(z=0;z<leny;z++) {
			if (get_map_xy(x,z)>0) { 
				var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
				voxel.position.x=x*50+25-lenx/2*50;
				voxel.position.z=z*50+25-leny/2*50;
				voxel.position.y=25+50;
				voxel.receiveShadow = true;
				voxel.castShadow = true;
				voxel.matrixAutoUpdate = false;
				voxel.updateMatrix();
				scene.add( voxel );
				var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
				voxel.position.x=x*50+25-lenx/2*50;
				voxel.position.z=z*50+25-leny/2*50;
				voxel.position.y=25+100;
				voxel.receiveShadow = true;
				voxel.castShadow = true;
				voxel.matrixAutoUpdate = false;
				voxel.updateMatrix();
				scene.add( voxel );
			}
		}
	}

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// ***********************************************KEYBOARD

function onDocumentKeyDown( event ) {
	switch( event.keyCode ) {
		case 16: isShiftDown = true; break;
		case 17: isCtrlDown = true; break;
		case 40: isArrowDown = true; break;
		case 38: isArrowUp = true; break;
		case 39: isArrowRight = true; break;
		case 37: isArrowLeft = true; break;
	}
}

function onDocumentKeyUp( event ) {
	switch ( event.keyCode ) {
		case 16: isShiftDown = false; break;
		case 17: isCtrlDown = false; break;
		case 40: isArrowDown = false; break;
		case 38: isArrowUp = false; break;
		case 39: isArrowRight = false; break;
		case 37: isArrowLeft = false; break;
	}
}

// ***********************************************RENDERING

function animate() {
	requestAnimationFrame( animate );

	if (isArrowUp)
		move_light(+5,0,0);
	if (isArrowDown)
		move_light(-5,0,0);
	if (isArrowLeft)
		move_light(0,0,-5);
	if (isArrowRight)
		move_light(0,0,+5);

	camera.position.x = plights[0].position.x-1000;
	camera.position.z = plights[0].position.z-500;
	camera.lookAt( plights[0].position );

	heroMesh.position= plights[0].position;

	renderer.render( scene, camera );

}


function move_light(dx,dy,dz) {

	for (var i=0;i<plights.length;i++) {
		tx= plights[i].position.x+dx*3;
		tx_ix= Math.floor((tx+lenx/2*50)/50);
		tz= plights[i].position.z+dz*3;
		tz_ix= Math.floor((tz+leny/2*50)/50);

		if (get_map_xy(tx_ix,tz_ix)==0) {
			plights[i].position.x+=dx;
			plights[i].position.z+=dz;
		}
	}
}