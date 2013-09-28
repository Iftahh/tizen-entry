
var org_window_v;
//************************************ Global variables
// THREE
var camera, scene, renderer;

// HTML
var container;
var stats;

// hero
var hero={}
hero.vel_x= 0;
hero.vel_z= 0;
hero.mesh= null;
hero.plights= [];
hero.clock= new THREE.Clock();
hero.joystick= null;
var dv=3;
var dr_from_walls=2;

// Keyboard state
var isArrowUp, isArrowDown, isArrowLeft, isArrowRight;

// enemies
var spiders=[];

// food!
var food_grid={};
var food_particle_system;
var new_food_eaten=[];

// constants
var lights_distance= 250;
var shadowDarkness= 0.75;
var main_light_intensity= 2.5;
var main_light_color= 0xffaaaa;
var camera_perspective= 11;
var window_divider= 2;
var FPS = 30;
var shadows=false;
var point_light=true;
var plights_y= 85+20;
var use_joystick=true;
var get_window_aspect_ratio= function() {
	return window.innerWidth / window.innerHeight;
	//return 9/16;
}

// main ;)
gAssetLoader.loadAssets([
        'red_spider.json',
        'red_spider.png',
        'core/BinaryHeap.js',
        'core/DijkstraMap.js',
        'components/TwoDimSprite.js',
        'components/PathFinding.js',
        'components/MovingCollision.js'
    ], function() {
        init();
        animate(0);
    }
)

//*******************************************************************

function init() {
	// THREE
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: false, precision:'lowp' } );
	if (shadows) {
		renderer.shadowMapEnabled=true;
		renderer.shadowMapSoft = true;
	}
	renderer.setSize( window.innerHeight/window_divider*get_window_aspect_ratio(), window.innerHeight/window_divider);
	org_window_v= window.innerHeight;
	camera = new THREE.PerspectiveCamera( camera_perspective, get_window_aspect_ratio(), 1000, 3000 );
	camera.position.y = 1800;

	// HTML
	container = document.createElement( 'div' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	if (!use_joystick) {
		document.addEventListener( 'keydown', onDocumentKeyDown, false );
		document.addEventListener( 'keyup', onDocumentKeyUp, false );
	}
	window.addEventListener( 'resize', onWindowResize, false );
   
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
	hero.joystick= new VirtualJoystick({
				container   : container,
				mouseSupport: true
	});

    initSpritesGrid();

	// lights
	if (point_light) {
		plight = new THREE.PointLight( main_light_color, main_light_intensity, lights_distance );
		plight.position.x=25;
		plight.position.y=plights_y;
		plight.position.z=25;
		scene.add( plight );
		hero.plights.push(plight);
	}
	else {
		var light = new THREE.DirectionalLight( 0xeecccc, 1.2 );
		light.position.set(0.2,1,0.4);
		scene.add( light );
	}

	for (var i=0; i<5; i++) {
		var s=Spider(120+i*100-100, 53+3-i/10, 15);
     	spiders.push(s);
	    scene.add(s.sprite);
	}

	// shadows
	if (shadows) {
		for (i=0;i<3;i++) {
			plight = new THREE.SpotLight( 0xff9999, 3.1, lights_distance, Math.PI/2,2);
			plight.target.position.x=10000000.0*Math.cos(Math.PI/3*i*2);
			plight.target.position.y=-155;
			plight.target.position.z=10000000.0*Math.sin(Math.PI/3*i*2);
			plight.castShadow= true;
			plight.onlyShadow= true;
			plight.shadowCameraNear=1;
			plight.shadowCameraFar=lights_distance;
			plight.shadowDarkness=shadowDarkness;
			plight.shadowCameraFov=120;
			plight.position.x=25;
			plight.position.y=plights_y;
			plight.position.z=25;
			scene.add( plight );
			hero.plights.push(plight);
		}
	}

	add_floor();
	add_walls();
	add_food();
}

function add_floor(){
	var mainFloorGeo= new THREE.Geometry();
	var floorGeo = new THREE.PlaneGeometry( 8*TileDimX, 8*TileDimZ, 4,4);
	var floorMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "floor_1.jpg" ) } );
	for (x=0;x<lenx/8;x++) {
		for(z=0;z<lenz/8;z++) {
			var voxel = new THREE.Mesh( floorGeo );
			voxel.rotation.x= -Math.PI/2;
			voxel.position.x=x*8*TileDimX -lenx/2*TileDimX+200;
			voxel.position.z=z*8*TileDimZ-lenz/2*TileDimZ+200;
			voxel.position.y=TileDimY;
			THREE.GeometryUtils.merge(mainFloorGeo, voxel);
		}
	}	
	var floor= new THREE.Mesh(mainFloorGeo, floorMaterial);
	if (shadows)
		floor.receiveShadow = true;
	floor.matrixAutoUpdate = false;
	floor.updateMatrix();
	scene.add( floor );
}

function add_walls() {
	var mainWallsGeo= new THREE.Geometry();
	var cubeGeo = new THREE.CubeGeometry( TileDimX, TileDimY, TileDimZ );
	var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xbef74c, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "box_3.png" ) } );
    var randomMove = Math.min(TileDimX,TileDimZ)*3/50;
    for(z=0;z<lenz;z++) {
        for (x=0;x<lenx;x++) {
			var map_val= get_map_xz(x,z);
			if (map_val>0) {
				for (var j=0; j<map_val; j++) {
					var voxel = new THREE.Mesh( cubeGeo );
					voxel.position.x=x*TileDimX+TileDimX/2-lenx/2*TileDimX+(Math.random()*randomMove-1.5)*(j*randomMove+1);
					voxel.position.z=z*TileDimZ+TileDimZ/2-lenz/2*TileDimZ+(Math.random()*randomMove-1.5)*(j*randomMove+1);
					voxel.position.y=TileDimY/2+(j+1)*TileDimY;
					voxel.rotation.y+= (Math.random()/4-0.125)*(j/2+1);
					THREE.GeometryUtils.merge(mainWallsGeo, voxel);
				}
			}
		}
	}
	var walls= new THREE.Mesh(mainWallsGeo, cubeMaterial);
	if (shadows) {
		walls.receiveShadow= true;
		walls.castShadow= true;
	}
	walls.matrixAutoUpdate = false;
	walls.updateMatrix();
	scene.add( walls );
}



function add_food() {
	geometry = new THREE.Geometry();

	for ( i = 0; i < 500; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = (Math.random()-0.5) * 64*TileDimX;
		vertex.z = (Math.random()-0.5) * 64*TileDimZ;
		vertex.y = TileDimY + 15;
		vertex.eaten= false;
		geometry.vertices.push( vertex );
		var currTile= coordinateToTile(vertex.x,vertex.z);
	    var ctx= currTile[0];
	    var ctz= currTile[1];
	    if (get_map_xz(ctx,ctz)>0)
	    	continue;
		inx= ctx+lenx*ctz;
		if (!(inx in food_grid))
			food_grid[inx]= [vertex];
		else 
			food_grid[inx].push(vertex);
	}

	var material = new THREE.ParticleBasicMaterial({
	    color: 0xff9999,
	    size: 70,
	    map: THREE.ImageUtils.loadTexture("food.png"),
	    blending: THREE.AdditiveBlending,
	    transparent: true
	});

	food_particle_system = new THREE.ParticleSystem( geometry, material );

	scene.add( food_particle_system );
}

function onWindowResize() {
	renderer.setSize( window.innerHeight/window_divider*get_window_aspect_ratio(), window.innerHeight/window_divider);
	camera.aspect= get_window_aspect_ratio();
	camera.fov= camera_perspective/org_window_v*window.innerHeight;
	camera.updateProjectionMatrix();
}

// ***********************************************KEYBOARD
var total_key_down=0;
function onDocumentKeyDown( event ) {
	switch( event.keyCode ) {
		case 40: isArrowDown  = true; total_key_down++; break;
		case 38: isArrowUp    = true; total_key_down++; break;
		case 39: isArrowRight = true; total_key_down++; break;
		case 37: isArrowLeft  = true; total_key_down++; break;
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
var last_time= new Date().getTime();
var delay_for_next_time= 1000/FPS;
function animate(ts) {
	if (FPS<59.9) {
		var curr_time= new Date().getTime();
		delay_for_next_time-= (curr_time-last_time) - 1000/FPS;
		if (delay_for_next_time<=0)
			delay_for_next_time= 1;
		last_time= curr_time;
		setTimeout( function() {
        	requestAnimationFrame( animate );
    	}, delay_for_next_time );
	}
	else
       	requestAnimationFrame( animate );

	calc_hero_vel();

	for (var i=0; i<spiders.length; i++)
     	spiders[i].update(ts);

	if (hero.mesh) {
		move_hero();
		animate_hero();
		move_camera();
	}

	animate_food();

    stats.update();
	renderer.render( scene, camera );
}

function calc_hero_vel() {
	hero.vel_x=0;
	hero.vel_z=0;
	if (!use_joystick) {
		if (isArrowDown)  hero.vel_x-=dv;
		if (isArrowUp)    hero.vel_x+=dv;
		if (isArrowRight) hero.vel_z+=dv;
		if (isArrowLeft)  hero.vel_z-=dv;
	}
	else {
		hero.vel_x= -hero.joystick.deltaY();
		hero.vel_z= hero.joystick.deltaX();
	}
	vr= Math.sqrt(hero.vel_x*hero.vel_x+hero.vel_z*hero.vel_z);
	if (vr>0.00001) {
		hero.vel_x= dv*hero.vel_x/vr;
		hero.vel_z= dv*hero.vel_z/vr;
	}
}

var TileDimX = 50;
var TileDimY = 50;
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

var framecount=0;
function move_hero() {
	var x=hero.mesh.position.x;
	var z=hero.mesh.position.z;

	var xz_ix= coordinateToTile(x,z);

	var tx= x+hero.vel_x*8*dr_from_walls/dv;
	var tz= z+hero.vel_z*8*dr_from_walls/dv;

    var txz_ix = coordinateToTile(tx,tz);

	var actual_dx=0;
	var actual_dz=0;
	if (get_map_xz(txz_ix[0],xz_ix[1])==0)
		actual_dx= hero.vel_x;
	if (get_map_xz(xz_ix[0],txz_ix[1])==0)  // on purpose mix  x of old and z of new?
		actual_dz= hero.vel_z;

	hero.mesh.position.x+= actual_dx;
	hero.mesh.position.y= 70;
	hero.mesh.position.z+= actual_dz;
	for (var i=0;i<hero.plights.length;i++) {
			hero.plights[i].position.x= hero.mesh.position.x;
			hero.plights[i].position.z= hero.mesh.position.z;
			hero.plights[i].position.y= plights_y;
	}

    var tile = coordinateToTile(hero.mesh.position.x, hero.mesh.position.z);
    if (tile[0] != curTileX || tile[1] != curTileZ) {
        curTileX = tile[0];
        curTileZ = tile[1];
        PlayerChaseMap.explore(curTileX, curTileZ, 20);
    }

    // food!
 	framecount++;
 	if (framecount % 5 == 0) {
		var currTile= coordinateToTile(x,z);
	    var ctx= currTile[0];
	    var ctz= currTile[1];
	    for (ix=ctx-1; ix<=ctx+1; ix++) {
	    	if (ix<0 || ix>= lenx) continue;
		    for (iz=ctz-1; iz<=ctz+1; iz++) {
		    	if (iz<0 || iz>= lenz) continue;
	    		var inx= ix+lenx*iz; 
	    		if (!(inx in food_grid)) continue;
	    		var varr= food_grid[inx];
	    		var ixs_to_remove=[];
			    for (var i=0; i<varr.length; i++) {
			    	v= varr[i];
			    	if (v.eaten) continue;
			    	dx= v.x-x;
			    	dz= v.z-z;
			    	r2= dx*dx+dz*dz;
			    	if (r2<70*70) {
			    		new_food_eaten.push(v);
			    		v.eaten= true;
			    		ixs_to_remove.push(i);
			    	}
			    }
				for (var i=0; i<ixs_to_remove.length; i++)
					food_grid[inx].splice(ixs_to_remove[i], 1);			    
	    	}
	    }
	}
}

function animate_hero() {
	var delta = hero.clock.getDelta();
	hero.mesh.updateAnimation( 1000 * delta );
	if ((hero.vel_x!=0)||(hero.vel_z!=0)) {
		var rot_target= Math.atan2(hero.vel_x,hero.vel_z);
		var rot_delta= hero.mesh.rotation.y-rot_target;
		if (rot_delta<-Math.PI*1.01) rot_delta+= 2*Math.PI;
		if ((rot_delta>0.05)||(rot_delta<=0.05))
			if (!use_joystick)
				hero.mesh.rotation.y-= rot_delta*0.1; 
			else
				hero.mesh.rotation.y-= rot_delta; 
	}
}

function animate_food() {
	var ixs_to_remove=[];
	for (var i=0; i<new_food_eaten.length; i++) {
		v= new_food_eaten[i];
		dx= hero.mesh.position.x-v.x;
		dz= hero.mesh.position.z-v.z;
		v.x+= 0.2*dx;
		v.z+= 0.2*dz;
		food_particle_system.geometry.verticesNeedUpdate=true;
		dr2= dx*dx+dz*dz;
		if (dr2<0.001) {
			ixs_to_remove.push(i);
			v.y=-10;
		}
	}
	for (var i=0; i<ixs_to_remove.length; i++)
		new_food_eaten.splice(ixs_to_remove[i], 1);
}

function move_camera() {
	camera.position.x = hero.mesh.position.x-1000;
	camera.position.z = hero.mesh.position.z-500;
	camera.lookAt( hero.mesh.position );	
}