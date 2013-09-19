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

var clock = new THREE.Clock();

init();
animate();


function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 1800;

	scene = new THREE.Scene();
      
	// hero

	var loader = new THREE.JSONLoader( true );
	loader.load( "stork.js", function( geometry ) {
		geometry.computeMorphNormals();
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.SmoothShading } );
		heroMesh = new THREE.MorphAnimMesh( geometry, material );
		heroMesh.duration = 1000;
		heroMesh.scale.set( 0.2, 0.2, 0.2 );
		scene.add( heroMesh );
	} );

	// cubes

	cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
	cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xbef74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "box_2.jpg" ) } );
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
		move_light(+2,0,0);
	if (isArrowDown)
		move_light(-2,0,0);
	if (isArrowLeft)
		move_light(0,0,-2);
	if (isArrowRight)
		move_light(0,0,+2);

	camera.position.x = plights[0].position.x-1000;
	camera.position.z = plights[0].position.z-500;
	camera.lookAt( plights[0].position );

	if (heroMesh) {
		heroMesh.position= plights[0].position;
		var delta = clock.getDelta();
		heroMesh.updateAnimation( 1000 * delta );

		if (isArrowUp)
			heroMesh.rotation.y= +4*Math.PI/8;
		else
		if (isArrowDown)
			heroMesh.rotation.y= -4*Math.PI/8;
		else
		if (isArrowLeft)
			heroMesh.rotation.y= -Math.PI;
		else
		if (isArrowRight)
			heroMesh.rotation.y= 0.0;
	}

	renderer.render( scene, camera );

}


function move_light(dx,dy,dz) {

	for (var i=0;i<plights.length;i++) {
		tx= plights[i].position.x+dx*8;
		tx_ix= Math.floor((tx+lenx/2*50)/50);
		tz= plights[i].position.z+dz*8;
		tz_ix= Math.floor((tz+leny/2*50)/50);

		if (get_map_xy(tx_ix,tz_ix)==0) {
			plights[i].position.x+=dx;
			plights[i].position.z+=dz;
		}
	}
}