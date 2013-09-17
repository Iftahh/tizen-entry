var container;
var camera, scene, renderer;
var projector, plane, cube;
var mouse2D, mouse3D, raycaster,
rollOveredFace, isShiftDown = false,
theta = 45 * 0.5, isCtrlDown = false;
var isArrowUp, isArrowDown, isArrowLeft, isArrowRight=false;

var rollOverMesh, rollOverMaterial;
var heroMesh;
var voxelPosition = new THREE.Vector3(), tmpVec = new THREE.Vector3(), normalMatrix = new THREE.Matrix3();
var cubeGeo, cubeMaterial;
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

	// roll-over helpers

	rollOverGeo = new THREE.CubeGeometry( 50, 50, 50 );
	rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.3, transparent: true } );
	rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	scene.add( rollOverMesh );

	// hero

	heroGeo = new THREE.SphereGeometry( 10 );
	heroMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.3, transparent: true } );
	heroMesh = new THREE.Mesh( heroGeo, heroMaterial );
	scene.add( heroMesh );

	// cubes

	cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
	cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "square-outline-textured.png" ) } );
	cubeMaterial.ambient = cubeMaterial.color;

	// picking

	projector = new THREE.Projector();

	// Floor

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial({color:0x000000}) );
	plane.rotation.x = - Math.PI / 2;
	plane.visible = true;
	scene.add( plane );

	mouse2D = new THREE.Vector3( 0, 10000, 0.5 );

	// Lights

	//var ambientLight = new THREE.AmbientLight( 0x101010 );
	//scene.add( ambientLight );

	//plight = new THREE.PointLight( 0xff9999, 2.3, 400 );
	plight = new THREE.SpotLight( 0xff9999, 1.5, 400, Math.PI/3.9, 3);
	plight.target.position.x=27;
	plight.target.position.y=-1000;
	plight.target.position.z=3;
	plight.position.x=25;
	plight.position.y=355;
	plight.position.z=25;
	scene.add( plight );
	plights.push(plight);
	for (i=0;i<8;i++) {
		plight = new THREE.SpotLight( 0xff9999, 7.1, 400, Math.PI/3.6, 3);
		plight.target.position.x=100000.0*Math.cos(Math.PI/3.6*i);
		plight.target.position.y=-1000;
		plight.target.position.z=100000.0*Math.sin(Math.PI/3.6*i);
		plight.castShadow= true;
		plight.position.x=25;
		plight.position.y=55;
		plight.position.z=25;
		scene.add( plight );
		plights.push(plight);
	}

	//var directionalLight = new THREE.DirectionalLight( 0x777777 );
	//directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	//scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
	renderer.shadowMapEnabled=true;
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );

	// add a floor
	for (x=-50;x<50;x++) {
		for(z=-50;z<50;z++) {
			var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
			voxel.position.x=x*50+25;
			voxel.position.z=z*50+25;
			voxel.position.y=25;
			voxel.receiveShadow = true;
			voxel.matrixAutoUpdate = false;
			voxel.updateMatrix();
			scene.add( voxel );
		}
	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function getRealIntersector( intersects ) {

	for( i = 0; i < intersects.length; i++ ) {

		intersector = intersects[ i ];

		if ( intersector.object != rollOverMesh ) {

			return intersector;

		}

	}

	return null;

}

function setVoxelPosition( intersector ) {

	normalMatrix.getNormalMatrix( intersector.object.matrixWorld );

	tmpVec.copy( intersector.face.normal );
	tmpVec.applyMatrix3( normalMatrix ).normalize();

	voxelPosition.addVectors( intersector.point, tmpVec );

	voxelPosition.x = Math.floor( voxelPosition.x / 50 ) * 50 + 25;
	voxelPosition.y = Math.floor( voxelPosition.y / 50 ) * 50 + 25;
	voxelPosition.z = Math.floor( voxelPosition.z / 50 ) * 50 + 25;

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	var intersects = raycaster.intersectObjects( scene.children );

	if ( intersects.length > 0 ) {

		intersector = getRealIntersector( intersects );

		// delete cube

		if ( isCtrlDown ) {

			if ( intersector.object != plane ) {

				scene.remove( intersector.object );

			}

		// create cube

		} else {

			setVoxelPosition( intersector );

			console.log('voxelpos='+voxelPosition)

			var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
			voxel.castShadow= true;
			voxel.receiveShadow= true;
			voxel.position.copy( voxelPosition );
			voxel.matrixAutoUpdate = false;
			voxel.updateMatrix();
			scene.add( voxel );

		}

	}
}

function onDocumentKeyDown( event ) {
	console.log(event.keyCode);

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

//

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {

	heroMesh.position= plight.position;
	if ( isShiftDown ) {

		theta += mouse2D.x * 1.5;

	}

	raycaster = projector.pickingRay( mouse2D.clone(), camera );

	var intersects = raycaster.intersectObjects( scene.children );

	if ( intersects.length > 0 ) {

		intersector = getRealIntersector( intersects );
		if ( intersector ) {
			setVoxelPosition( intersector );
			rollOverMesh.position = voxelPosition;
		}

	}

	camera.position.x = 1400 * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = 1400 * Math.cos( THREE.Math.degToRad( theta ) );

	camera.lookAt( scene.position );

	if (isArrowUp) {
		for (var i=0;i<plights.length;i++)
			plights[i].position.z-=5;
	}
	if (isArrowDown) {
		for (var i=0;i<plights.length;i++)
			plights[i].position.z+=5;
	}
	if (isArrowLeft) {
		for (var i=0;i<plights.length;i++)
			plights[i].position.x-=5;
	}
	if (isArrowRight) {
		for (var i=0;i<plights.length;i++)
			plights[i].position.x+=5;
	}
	plights[0].target.position.x= plights[0].position.x;
	plights[0].target.position.z= plights[0].position.z;

	renderer.render( scene, camera );
}
