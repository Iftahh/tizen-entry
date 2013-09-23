//************************************ Global variables

// just for testing
var birds_as_enemies= false;

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
var spiders=[];
var enemies={};

// constants
var lights_distance= 750;
var dv=2;

// main ;)
gAssetLoader.loadAssets([
        'red_spider.json',
        'red_spider.png',
        'core/BinaryHeap.js',
        'core/DijkstraMap.js',
        'components/TwoDimSprite.js',
        'components/PathFinding.js'
    ], function() {
        init();
        animate(0);
    }
)

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

		if (birds_as_enemies) {
			for (var i=0; i<50; i++) {
				var s=new THREE.MorphAnimMesh( geometry, hero_material );
				s.receiveShadow= true;
				s.duration=1000;
				s.position.set(120+i*10, 55, 15);
				s.scale.set( 0.2, 0.2, 0.2 );
		     	spiders.push(s);
			    scene.add(s);
			}
		}
	} );

	// lights
	plight = new THREE.PointLight( 0xff9999, 5.3, lights_distance );
	plight.position.x=25;
	plight.position.y=85;
	plight.position.z=25;
	scene.add( plight );
	hero.plights.push(plight);

	if (!birds_as_enemies) {
		for (var i=0; i<10; i++) {
			var s=Spider(120+i*100, 53, 15);
	     	spiders.push(s);
		    scene.add(s.sprite);
		}
	}

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
			voxel.position.x=x*400+200-lenx/2*TileDimX;
			voxel.position.z=z*400+200-lenz/2*TileDimZ;
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
					voxel.position.x=x*TileDimX+TileDimX/2-lenx/2*TileDimX+(Math.random()*3-1.5)*(j*3+1);
					voxel.position.z=z*TileDimZ+TileDimZ/2-lenz/2*TileDimZ+(Math.random()*3-1.5)*(j*3+1);
					voxel.position.y=25+(j+1)*50;
					voxel.rotation.y+= (Math.random()/4-0.125)*(j/2+1);
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

	if (birds_as_enemies) {
		var delta = 1/60;
		for(var i=0; i<spiders.length; i++) {
			spiders[i].updateAnimation( 1000 * delta );
			spiders[i].rotation.y+=0.01;
		}
	}
	else {
		for (var i=0; i<spiders.length; i++)
	     	spiders[i].update(ts);

	}

	if (hero.mesh) {
		move_hero();
		animate_hero();
		move_camera();
	}

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

var TileDimX = 50;
var TileDimZ = 50;

var curTileX = -1;
var curTileZ = -1;

function coordinateToTile(x,z) {
    return [
        Math.floor((x   /*- TileDimX/2*/ )/ TileDimX  +lenx/2),
        Math.floor((z   /*- TileDimZ/2*/ )/ TileDimZ  +lenz/2)
    ];
}

function tileToCoordinate(tx,tz) {
    return [
        (tx-lenx/2 +.5)*TileDimX,
        (tz-lenz/2 +.5)*TileDimZ
    ];
}

function move_hero() {
	var x=hero.plights[0].position.x;
	var z=hero.plights[0].position.z;

	var xz_ix= coordinateToTile(x,z);

	var tx= x+hero.vel_x*8;
	var tz= z+hero.vel_z*8;

    var txz_ix = coordinateToTile(tx,tz);

	var actual_dx=0;
	var actual_dz=0;
	if (get_map_xy(txz_ix[0],xz_ix[1])==0)
		actual_dx= hero.vel_x;
	if (get_map_xy(xz_ix[0],txz_ix[1])==0)  // on purpose mix  x of old and z of new?
		actual_dz= hero.vel_z;

	for (var i=0;i<hero.plights.length;i++) {
			hero.plights[i].position.x+= actual_dx;
			hero.plights[i].position.z+= actual_dz;
	}

	hero.mesh.position.x= hero.plights[0].position.x;
	hero.mesh.position.y= hero.plights[0].position.y-15;
	hero.mesh.position.z= hero.plights[0].position.z;

    var tile = coordinateToTile(hero.mesh.position.x, hero.mesh.position.z);
    if (tile[0] != curTileX || tile[1] != curTileZ) {
        curTileX = tile[0];
        curTileZ = tile[1];
        PlayerChaseMap.explore(curTileX, curTileZ, 20);
    }

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
