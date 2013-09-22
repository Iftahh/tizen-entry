//************************************ Global variables
// THREE
var camera, scene, renderer;

// HTML
var container;
var stats;
var render_stats;

// hero
var hero={}
hero.vel_x= 0;
hero.vel_z= 0;
hero.mesh= null;
hero.plights= [];
hero.clock= new THREE.Clock();

// Keyboard state
var isArrowUp, isArrowDown, isArrowLeft, isArrowRight;

// enemies
var spider;
var enemies={};

// constants
var lights_distance= 750;
var dv=2;

// main ;)
gAssetLoader.loadAssets(['atlas/red_spider.json', 'imgs/red_spider.png'], function() {
    init();
    animate(0);
})

//*******************************************************************

function init() {
	// THREE
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
	renderer.shadowMapEnabled=true;
	renderer.shadowMapSoft = true;
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 1800;

	// HTML
	container = document.createElement( 'div' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );
	window.addEventListener( 'resize', onWindowResize, false );
	render_stats= document.getElementById('render_stats');
   
	// STATS
	stats = new Stats();
	container.appendChild( stats.domElement );

	// hero
	var loader = new THREE.JSONLoader( true );
	loader.load( "stork.js", function( geometry ) {
		geometry.computeMorphNormals();
		var hero_material = new THREE.MeshLambertMaterial( { color: 0x1155ff, specular: 0xffffff, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.SmoothShading } );
		hero.mesh = new THREE.MorphAnimMesh( geometry, hero_material );
		hero.mesh.duration = 1000;
		hero.mesh.scale.set( 0.2, 0.2, 0.2 );
		scene.add( hero.mesh );
	} );

	// lights
	plight = new THREE.PointLight( 0xff9999, 5.3, lights_distance );
	plight.position.x=25;
	plight.position.y=85;
	plight.position.z=25;
	scene.add( plight );
	hero.plights.push(plight);

    spider = Spider(120,53, 15);
    scene.add(spider.sprite);

	// shadows
	for (i=0;i<3;i++) {
		plight = new THREE.SpotLight( 0xff9999, 3.1, lights_distance, Math.PI/2,2);
		plight.target.position.x=10000000.0*Math.cos(Math.PI/3*i*2);
		plight.target.position.y=-155;
		plight.target.position.z=10000000.0*Math.sin(Math.PI/3*i*2);
		plight.castShadow= true;
		plight.onlyShadow= true;
		plight.shadowCameraNear=1;
		plight.shadowCameraFar=lights_distance;
		plight.shadowDarkness=0.77;
		plight.shadowCameraFov=120;
		plight.position.x=25;
		plight.position.y=85;
		plight.position.z=25;
		scene.add( plight );
		hero.plights.push(plight);
	}

	add_floor();
	add_walls();
	//add_enemies();
}

function add_floor(){
	var mainFloorGeo= new THREE.Geometry();
	var floorGeo = new THREE.PlaneGeometry( 400, 400,  12,12);
	var floorMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "floor_1.jpg" ) } );
	for (x=0;x<lenx/8;x++) {
		for(z=0;z<lenz/8;z++) {
			var voxel = new THREE.Mesh( floorGeo );
			voxel.rotation.x= -Math.PI/2;
			voxel.position.x=x*400+200-lenx/2*50;
			voxel.position.z=z*400+200-lenz/2*50;
			voxel.position.y=50;
			THREE.GeometryUtils.merge(mainFloorGeo, voxel);
		}
	}	
	var floor= new THREE.Mesh(mainFloorGeo, floorMaterial);
	floor.receiveShadow = true;
	floor.matrixAutoUpdate = false;
	floor.updateMatrix();
	scene.add( floor );
}

function add_walls() {
	var mainWallsGeo= new THREE.Geometry();
	var cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
	var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xbef74c, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "box_3.png" ) } );
	for (x=0;x<lenx;x++) {
		for(z=0;z<lenz;z++) {
			map_val= get_map_xy(x,z);
			if (map_val>0) { 
				for (var j=0; j<map_val; j++) {
					var voxel = new THREE.Mesh( cubeGeo );
					voxel.position.x=x*50+25-lenx/2*50+Math.random()*3-1.5;
					voxel.position.z=z*50+25-lenz/2*50+Math.random()*3-1.5;
					voxel.position.y=25+(j+1)*50;
					voxel.rotation.y+= Math.random()/4-0.125;
					THREE.GeometryUtils.merge(mainWallsGeo, voxel);
				}
			}
		}
	}
	var walls= new THREE.Mesh(mainWallsGeo, cubeMaterial);
	walls.receiveShadow= true;
	walls.castShadow= true;
	walls.matrixAutoUpdate = false;
	walls.updateMatrix();
	scene.add( walls );
}

function add_enemies() {
	geometry = new THREE.Geometry();

	for ( i = 0; i < 10000; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = (Math.random()-0.5) * 64*50;
		vertex.z = (Math.random()-0.5) * 64*50;
		vertex.y = Math.random() * 1000 +  50;
		geometry.vertices.push( vertex );
	}

	parameters = [
		[ [1.0, 1, 0.5], 20],
		[ [.95, 1, 0.5], 16 ],
		[ [.90, 1, 0.5], 12 ],
		[ [.85, 1, 0.5], 8 ],
		[ [.80, 1, 0.5], 4 ]
	];

	var materials=[];
	for ( i = 0; i < parameters.length; i ++ ) {

		color = parameters[i][0];
		size  = parameters[i][1];

		materials[i] = new THREE.ParticleBasicMaterial( { size: size } );
		//materials[i].receiveShadow= true;

		particles = new THREE.ParticleSystem( geometry, materials[i] );

		scene.add( particles );

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
		case 40: isArrowDown  = true; break;
		case 38: isArrowUp    = true; break;
		case 39: isArrowRight = true; break;
		case 37: isArrowLeft  = true; break;
	}
}

function onDocumentKeyUp( event ) {
	switch ( event.keyCode ) {
		case 40: isArrowDown  = false; break;
		case 38: isArrowUp    = false; break;
		case 39: isArrowRight = false; break;
		case 37: isArrowLeft  = false; break;
	}
}

// ***********************************************RENDERING
var ti=0;
var cdt=0;
var mdt=0;
function animate(ts) {
	var t0= (new Date()).getTime();
	requestAnimationFrame( animate );

	calc_hero_vel();

	if (hero.mesh) {
		move_hero();
		animate_hero();
		move_camera();
	}

    spider.update(ts);
    stats.update();
	renderer.render( scene, camera );
	var tf=(new Date()).getTime();
	cdt+= tf-t0;
	if ((tf-ti)>5000) {
		mdt= cdt/(tf-ti);
		ti=tf;
		cdt= 0;
		render_stats.textContent= '> '+mdt+' ms per frame'
	}
}

function calc_hero_vel() {
	hero.vel_x=0;
	hero.vel_z=0;
	if (isArrowDown)  hero.vel_x-=dv;
	if (isArrowUp)    hero.vel_x+=dv;
	if (isArrowRight) hero.vel_z+=dv;
	if (isArrowLeft)  hero.vel_z-=dv;
	vr= Math.sqrt(hero.vel_x*hero.vel_x+hero.vel_z*hero.vel_z);
	if (vr>0.00001) {
		hero.vel_x= dv*hero.vel_x/vr;
		hero.vel_z= dv*hero.vel_z/vr;
	}
}

function move_hero() {
	var x=hero.plights[0].position.x;
	var z=hero.plights[0].position.z;

	x_ix= Math.floor((x+lenx/2*50)/50);
	z_ix= Math.floor((z+lenz/2*50)/50);

	tx= x+hero.vel_x*8;
	tz= z+hero.vel_z*8;

	tx_ix= Math.floor((tx+lenx/2*50)/50);
	tz_ix= Math.floor((tz+lenz/2*50)/50);

	var actual_dx=0;
	var actual_dz=0;
	if (get_map_xy(tx_ix,z_ix)==0)
		actual_dx= hero.vel_x;
	if (get_map_xy(x_ix,tz_ix)==0)
		actual_dz= hero.vel_z;

	for (var i=0;i<hero.plights.length;i++) {
			hero.plights[i].position.x+= actual_dx;
			hero.plights[i].position.z+= actual_dz;
	}

	hero.mesh.position.x= hero.plights[0].position.x;
	hero.mesh.position.y= hero.plights[0].position.y-15;
	hero.mesh.position.z= hero.plights[0].position.z;

    //spider.sprite.position.x = hero.mesh.position.x +  20;
    //spider.sprite.position.y = hero.mesh.position.y;
    //spider.sprite.position.z = hero.mesh.position.z;
}

function animate_hero() {
	var delta = hero.clock.getDelta();
	hero.mesh.updateAnimation( 1000 * delta );
	if ((hero.vel_x!=0)||(hero.vel_z!=0))
		var rot_target= Math.atan2(hero.vel_x,hero.vel_z);
		var rot_delta= hero.mesh.rotation.y-rot_target;
		if (rot_delta<-Math.PI*1.2) rot_delta+= 2*Math.PI;
		if ((rot_delta>0.05)||(rot_delta<=0.05))
			hero.mesh.rotation.y-= rot_delta*0.1; 
}

function move_camera() {
	camera.position.x = hero.plights[0].position.x-1000;
	camera.position.z = hero.plights[0].position.z-500;
	camera.lookAt( hero.plights[0].position );	
}
