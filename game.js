import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { GLTFLoader } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";


/* =========================================================
   Y: RISE OF THE CITY
   WEB-READY FINAL BUILD

   NO NODE
   NO NPM
   NO BAT
   NO LOCAL SERVER REQUIRED FOR GITHUB PAGES

   FEATURES
   ---------------------------------------------------------
   3D CITY
   PLAYER
   PLAYER GLB
   CARS
   TRAFFIC
   BUSES
   NPCs
   SHOPS
   BUILDING INTERIORS
   GARAGE
   CAR PAINT
   CAR PERFORMANCE
   DAY / NIGHT
   RAIN
   PUDDLES
   CITY SHARDS
   CITY EVENTS
   DRONES
   DISTRICTS
   MAP
   MISSIONS
   4D REALITY
   PORTALS
   FUTURE CITY
   FLOATING PLATFORMS
   ========================================================= */


/* =========================================================
   HTML
   ========================================================= */

const container =
    document.getElementById("game-container");


if (!container) {

    throw new Error(
        "game-container was not found in game.html"
    );
}


const statusText =
    document.getElementById("game-status");


const interactionText =
    document.getElementById("interaction");


/* =========================================================
   BASIC SCENE
   ========================================================= */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x87ceeb
    );


scene.fog =
    new THREE.Fog(
        0x87ceeb,
        100,
        420
    );


/* =========================================================
   CAMERA
   ========================================================= */

const camera =
    new THREE.PerspectiveCamera(

        65,

        window.innerWidth /
        window.innerHeight,

        0.1,

        1400
    );


camera.position.set(
    0,
    5,
    12
);


/* =========================================================
   RENDERER
   ========================================================= */

const renderer =
    new THREE.WebGLRenderer({

        antialias:
            true,

        powerPreference:
            "high-performance"
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1;


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


container.appendChild(
    renderer.domElement
);


/* =========================================================
   LIGHTING
   ========================================================= */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.8
    );

scene.add(
    ambientLight
);


const sunLight =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );


sunLight.position.set(
    80,
    120,
    50
);


sunLight.castShadow =
    true;


sunLight.shadow.mapSize.set(
    2048,
    2048
);


sunLight.shadow.camera.left =
    -220;

sunLight.shadow.camera.right =
    220;

sunLight.shadow.camera.top =
    220;

sunLight.shadow.camera.bottom =
    -220;

sunLight.shadow.camera.near =
    1;

sunLight.shadow.camera.far =
    600;


scene.add(
    sunLight
);


const moonLight =
    new THREE.DirectionalLight(
        0x6688bb,
        0
    );


moonLight.position.set(
    -80,
    100,
    -60
);


scene.add(
    moonLight
);


/* =========================================================
   HELPERS
   ========================================================= */

function standardMaterial(
    color,
    roughness = 0.8,
    metalness = 0
) {

    return new THREE.MeshStandardMaterial({

        color:
            color,

        roughness:
            roughness,

        metalness:
            metalness
    });
}


function basicMaterial(
    color,
    transparent = false,
    opacity = 1
) {

    return new THREE.MeshBasicMaterial({

        color:
            color,

        transparent:
            transparent,

        opacity:
            opacity
    });
}


/* =========================================================
   GAME STATE
   ========================================================= */

const clock =
    new THREE.Clock();


const keys = {};


let worldTime =
    10;


let rainEnabled =
    false;


let money =
    0;


let mapOpen =
    false;


let mapZoom =
    1;


let driving =
    false;


let vehicleSpeed =
    0;


let currentInterior =
    null;


let gamePaused =
    false;


/* =========================================================
   DAY / NIGHT
   ========================================================= */

const daySky =
    new THREE.Color(
        0x87ceeb
    );


const eveningSky =
    new THREE.Color(
        0xff8c68
    );


const nightSky =
    new THREE.Color(
        0x071326
    );


function updateDayNight(
    delta
) {

    worldTime +=
        delta * 0.04;


    if (
        worldTime >= 24
    ) {

        worldTime = 0;
    }


    let sky =
        daySky;


    let sun =
        1.5;


    let ambient =
        0.8;


    let moon =
        0;


    if (
        worldTime >= 17 &&
        worldTime < 19
    ) {

        sky =
            eveningSky;

        sun =
            1;

        ambient =
            0.55;

        moon =
            0.1;

    } else if (
        worldTime >= 19 ||
        worldTime < 6
    ) {

        sky =
            nightSky;

        sun =
            0.15;

        ambient =
            0.2;

        moon =
            0.5;
    }


    scene.background.lerp(
        sky,
        0.025
    );


    scene.fog.color.lerp(
        sky,
        0.025
    );


    sunLight.intensity =
        sun;


    ambientLight.intensity =
        ambient;


    moonLight.intensity =
        moon;
}


/* =========================================================
   GROUND
   ========================================================= */

const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            320,
            320
        ),

        standardMaterial(
            0x505050,
            0.95
        )
    );


ground.rotation.x =
    -Math.PI / 2;


ground.receiveShadow =
    true;


scene.add(
    ground
);


/* =========================================================
   ROADS
   ========================================================= */

const roadMaterial =
    standardMaterial(
        0x202020,
        1
    );


function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const road =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                length
            ),

            roadMaterial
        );


    road.rotation.x =
        -Math.PI / 2;


    road.rotation.z =
        rotation;


    road.position.set(
        x,
        0.02,
        z
    );


    road.receiveShadow =
        true;


    scene.add(
        road
    );
}


createRoad(
    0,
    0,
    22,
    320
);


createRoad(
    0,
    0,
    22,
    320,
    Math.PI / 2
);


createRoad(
    -65,
    0,
    18,
    320
);


createRoad(
    65,
    0,
    18,
    320
);


createRoad(
    0,
    -65,
    18,
    320,
    Math.PI / 2
);


createRoad(
    0,
    65,
    18,
    320,
    Math.PI / 2
);


/* =========================================================
   ROAD LINES
   ========================================================= */

const roadLineMaterial =
    basicMaterial(
        0xffffff
    );


function createRoadLine(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const line =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                length
            ),

            roadLineMaterial
        );


    line.rotation.x =
        -Math.PI / 2;


    line.rotation.z =
        rotation;


    line.position.set(
        x,
        0.045,
        z
    );


    scene.add(
        line
    );
}


for (
    let z = -150;
    z <= 150;
    z += 12
) {

    createRoadLine(
        0,
        z,
        0.35,
        6
    );
}


for (
    let x = -150;
    x <= 150;
    x += 12
) {

    createRoadLine(
        x,
        0,
        6,
        0.35,
        Math.PI / 2
    );
}


/* =========================================================
   SIDEWALKS
   ========================================================= */

const sidewalkMaterial =
    standardMaterial(
        0x777777,
        0.85
    );


function createSidewalk(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const sidewalk =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                0.25,
                length
            ),

            sidewalkMaterial
        );


    sidewalk.rotation.y =
        rotation;


    sidewalk.position.set(
        x,
        0.13,
        z
    );


    sidewalk.receiveShadow =
        true;


    scene.add(
        sidewalk
    );
}


createSidewalk(
    -13,
    0,
    3,
    320
);


createSidewalk(
    13,
    0,
    3,
    320
);


createSidewalk(
    0,
    -13,
    3,
    320,
    Math.PI / 2
);


createSidewalk(
    0,
    13,
    3,
    320,
    Math.PI / 2
);


/* =========================================================
   BUILDINGS
   ========================================================= */

const buildingColors = [

    0x343a40,

    0x495057,

    0x5c6770,

    0x3d4650,

    0x252a30,

    0x404854
];


const buildings = [];


function createBuilding(
    x,
    z,
    width,
    depth,
    height
) {

    const building =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

            standardMaterial(

                buildingColors[
                    Math.floor(
                        Math.random() *
                        buildingColors.length
                    )
                ],

                0.82,

                0.05
            )
        );


    building.position.set(
        x,
        height / 2,
        z
    );


    building.castShadow =
        true;


    building.receiveShadow =
        true;


    scene.add(
        building
    );


    buildings.push(
        building
    );


    const windowMaterial =
        basicMaterial(
            0x7fc9ef
        );


    const rows =
        Math.floor(
            height / 5
        );


    for (
        let y = 3;
        y < rows * 5;
        y += 5
    ) {

        for (
            let wx =
                -width / 2 + 2;

            wx <
                width / 2 - 1;

            wx += 4
        ) {

            const window =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.5,
                        1.5,
                        0.1
                    ),

                    windowMaterial
                );


            window.position.set(
                x + wx,
                y,
                z + depth / 2 + 0.08
            );


            scene.add(
                window
            );
        }
    }
}


for (
    let i = -135;
    i <= 135;
    i += 30
) {

    if (
        Math.abs(i) > 15
    ) {

        createBuilding(
            -38,
            i,
            20,
            24,
            22 +
                Math.random() * 38
        );


        createBuilding(
            38,
            i,
            20,
            24,
            22 +
                Math.random() * 38
        );
    }
}


for (
    let i = -135;
    i <= 135;
    i += 30
) {

    if (
        Math.abs(i) > 15
    ) {

        createBuilding(
            i,
            -38,
            24,
            20,
            18 +
                Math.random() * 42
        );


        createBuilding(
            i,
            38,
            24,
            20,
            18 +
                Math.random() * 42
        );
    }
}


/* =========================================================
   TREES
   ========================================================= */

const trees = [];


function createTree(
    x,
    z,
    scale = 1
) {

    const group =
        new THREE.Group();


    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.7,
                0.9,
                5,
                8
            ),

            standardMaterial(
                0x6b4226
            )
        );


    trunk.position.y =
        2.5;


    trunk.castShadow =
        true;


    group.add(
        trunk
    );


    const leaves =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                3.2,
                12,
                12
            ),

            standardMaterial(
                0x1c7c35
            )
        );


    leaves.position.y =
        6;


    leaves.castShadow =
        true;


    group.add(
        leaves
    );


    group.position.set(
        x,
        0,
        z
    );


    group.scale.setScalar(
        scale
    );


    scene.add(
        group
    );


    trees.push({
        group:
            group,

        phase:
            Math.random() *
            Math.PI * 2
    });
}


for (
    let z = -120;
    z <= 120;
    z += 20
) {

    createTree(
        -17,
        z,
        0.9
    );


    createTree(
        17,
        z,
        0.9
    );
}


/* =========================================================
   STREET LIGHTS
   ========================================================= */

const streetLights = [];


function createStreetLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.15,
                0.22,
                7,
                8
            ),

            standardMaterial(
                0x202020,
                0.8,
                0.2
            )
        );


    pole.position.y =
        3.5;


    group.add(
        pole
    );


    const lamp =
        new THREE.PointLight(
            0xffddaa,
            0,
            28
        );


    lamp.position.y =
        6.4;


    group.add(
        lamp
    );


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );


    streetLights.push(
        lamp
    );
}


for (
    let z = -140;
    z <= 140;
    z += 25
) {

    createStreetLight(
        -11,
        z
    );


    createStreetLight(
        11,
        z
    );
}


for (
    let x = -140;
    x <= 140;
    x += 25
) {

    createStreetLight(
        x,
        -11
    );


    createStreetLight(
        x,
        11
    );
}


/* =========================================================
   PLAYER
   ========================================================= */

let playerModel =
    null;


let playerMixer =
    null;


let playerActions = {};


let currentAction =
    null;


const playerPosition =
    new THREE.Vector3(
        0,
        0,
        8
    );


let playerVerticalVelocity =
    0;


let playerGrounded =
    true;


const gravity =
    28;


const jumpStrength =
    11;


const walkSpeed =
    12;


const sprintSpeed =
    20;


const loader =
    new GLTFLoader();


loader.load(

    "./ASSETS/PLAYER/player.glb",

    (gltf) => {

        playerModel =
            gltf.scene;


        playerModel.position.copy(
            playerPosition
        );


        playerModel.traverse(
            (child) => {

                if (
                    child.isMesh
                ) {

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;
                }
            }
        );


        const box =
            new THREE.Box3()
                .setFromObject(
                    playerModel
                );


        const size =
            new THREE.Vector3();


        box.getSize(
            size
        );


        if (
            size.y > 0
        ) {

            playerModel.scale.setScalar(
                1.8 /
                size.y
            );
        }


        scene.add(
            playerModel
        );


        if (
            gltf.animations.length
        ) {

            playerMixer =
                new THREE.AnimationMixer(
                    playerModel
                );


            gltf.animations.forEach(
                (clip) => {

                    const name =
                        clip.name.toLowerCase();


                    if (
                        name.includes(
                            "idle"
                        )
                    ) {

                        playerActions.idle =
                            playerMixer
                                .clipAction(
                                    clip
                                );

                    } else if (
                        name.includes(
                            "walk"
                        )
                    ) {

                        playerActions.walk =
                            playerMixer
                                .clipAction(
                                    clip
                                );

                    } else if (
                        name.includes(
                            "run"
                        )
                    ) {

                        playerActions.run =
                            playerMixer
                                .clipAction(
                                    clip
                                );
                    }
                }
            );


            playPlayerAnimation(
                "idle"
            );
        }
    },

    undefined,

    (error) => {

        console.error(
            "Player model could not load:",
            error
        );
    }
);


function playPlayerAnimation(
    name
) {

    if (
        !playerMixer ||
        !playerActions[name]
    ) {

        return;
    }


    const next =
        playerActions[name];


    if (
        currentAction ===
        next
    ) {

        return;
    }


    if (
        currentAction
    ) {

        currentAction.fadeOut(
            0.2
        );
    }


    next.reset()
        .fadeIn(
            0.2
        )
        .play();


    currentAction =
        next;
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(
    delta
) {

    if (
        !playerModel ||
        driving ||
        currentInterior
    ) {

        return;
    }


    const direction =
        new THREE.Vector3();


    if (
        keys.w ||
        keys.arrowup
    ) {

        direction.z -=
            1;
    }


    if (
        keys.s ||
        keys.arrowdown
    ) {

        direction.z +=
            1;
    }


    if (
        keys.a ||
        keys.arrowleft
    ) {

        direction.x -=
            1;
    }


    if (
        keys.d ||
        keys.arrowright
    ) {

        direction.x +=
            1;
    }


    if (
        direction.lengthSq() >
        0
    ) {

        direction.normalize();


        const sprinting =
            keys.shift;


        const speed =
            sprinting
                ? sprintSpeed
                : walkSpeed;


        playerModel.position.addScaledVector(
            direction,
            speed *
                delta
        );


        playerModel.rotation.y =
            THREE.MathUtils.lerp(

                playerModel.rotation.y,

                Math.atan2(
                    direction.x,
                    direction.z
                ),

                Math.min(
                    delta * 10,
                    1
                )
            );


        playPlayerAnimation(
            sprinting
                ? "run"
                : "walk"
        );

    } else {

        playPlayerAnimation(
            "idle"
        );
    }


    playerModel.position.x =
        THREE.MathUtils.clamp(
            playerModel.position.x,
            -150,
            150
        );


    playerModel.position.z =
        THREE.MathUtils.clamp(
            playerModel.position.z,
            -150,
            150
        );
}


/* =========================================================
   JUMP
   ========================================================= */

function jumpPlayer() {

    if (
        !playerModel ||
        driving ||
        currentInterior
    ) {

        return;
    }


    if (
        !playerGrounded
    ) {

        return;
    }


    playerVerticalVelocity =
        jumpStrength;


    playerGrounded =
        false;
}


function updatePlayerPhysics(
    delta
) {

    if (
        !playerModel ||
        driving ||
        currentInterior
    ) {

        return;
    }


    playerVerticalVelocity -=
        gravity *
        delta;


    playerModel.position.y +=
        playerVerticalVelocity *
        delta;


    if (
        playerModel.position.y <=
        0
    ) {

        playerModel.position.y =
            0;

        playerVerticalVelocity =
            0;

        playerGrounded =
            true;
    }
}


/* =========================================================
   PLAYER CAR
   ========================================================= */

let car =
    null;


let carPerformance =
    0;


const carColors = [

    0x9d1018,

    0x1551c7,

    0x159447,

    0xf0b51d,

    0x6e35c9,

    0xe7e7e7
];


let selectedCarColor =
    0;


function createPlayerCar() {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.4,
                1.15,
                8
            ),

            standardMaterial(
                carColors[0],
                0.3,
                0.6
            )
        );


    body.position.y =
        1;


    body.castShadow =
        true;


    group.add(
        body
    );


    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.4,
                1.6,
                3.5
            ),

            standardMaterial(
                0x11161d,
                0.18,
                0.75
            )
        );


    cabin.position.set(
        0,
        2,
        -0.2
    );


    group.add(
        cabin
    );


    const wheels =
        [];


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.7,
            0.7,
            0.55,
            20
        );


    const wheelMaterial =
        standardMaterial(
            0x101010,
            0.85,
            0.15
        );


    [
        [-2.05, 0.7, -2.6],
        [2.05, 0.7, -2.6],
        [-2.05, 0.7, 2.6],
        [2.05, 0.7, 2.6]
    ].forEach(
        (p) => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                p[0],
                p[1],
                p[2]
            );


            group.add(
                wheel
            );


            wheels.push(
                wheel
            );
        }
    );


    group.userData.body =
        body;


    group.userData.wheels =
        wheels;


    group.position.set(
        8,
        0,
        5
    );


    scene.add(
        group
    );


    car =
        group;
}


createPlayerCar();


function enterCar() {

    if (
        !playerModel ||
        !car
    ) {

        return;
    }


    if (
        playerModel.position
            .distanceTo(
                car.position
            ) > 6
    ) {

        return;
    }


    driving =
        true;


    playerModel.visible =
        false;
}


function exitCar() {

    if (
        !car ||
        !playerModel
    ) {

        return;
    }


    driving =
        false;


    playerModel.visible =
        true;


    playerModel.position.set(

        car.position.x + 4,

        0,

        car.position.z
    );


    vehicleSpeed =
        0;
}


/* =========================================================
   CAR MOVEMENT
   ========================================================= */

function updateCar(
    delta
) {

    if (
        !car ||
        !driving
    ) {

        return;
    }


    let acceleration =
        0;


    if (
        keys.w ||
        keys.arrowup
    ) {

        acceleration +=
            22;
    }


    if (
        keys.s ||
        keys.arrowdown
    ) {

        acceleration -=
            18;
    }


    if (
        acceleration ===
        0
    ) {

        vehicleSpeed =
            THREE.MathUtils.lerp(
                vehicleSpeed,
                0,
                delta * 2
            );

    } else {

        vehicleSpeed +=
            acceleration *
            delta;
    }


    const topSpeed =
        32 +
        carPerformance *
        5;


    vehicleSpeed =
        THREE.MathUtils.clamp(
            vehicleSpeed,
            -10,
            topSpeed
        );


    let steering =
        0;


    if (
        keys.a ||
        keys.arrowleft
    ) {

        steering -=
            1;
    }


    if (
        keys.d ||
        keys.arrowright
    ) {

        steering +=
            1;
    }


    if (
        Math.abs(
            vehicleSpeed
        ) > 0.2
    ) {

        car.rotation.y -=
            steering *
            1.4 *
            delta *
            Math.sign(
                vehicleSpeed
            );
    }


    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    forward.applyQuaternion(
        car.quaternion
    );


    car.position.addScaledVector(
        forward,
        vehicleSpeed *
            delta
    );


    car.position.x =
        THREE.MathUtils.clamp(
            car.position.x,
            -150,
            150
        );


    car.position.z =
        THREE.MathUtils.clamp(
            car.position.z,
            -150,
            150
        );


    car.userData.wheels.forEach(
        (wheel) => {

            wheel.rotation.x +=
                vehicleSpeed *
                delta *
                1.5;
        }
    );
}


/* =========================================================
   CAR CUSTOMIZATION
   ========================================================= */

function changeCarPaint() {

    if (
        !car
    ) {

        return;
    }


    selectedCarColor++;


    if (
        selectedCarColor >=
        carColors.length
    ) {

        selectedCarColor =
            0;
    }


    car.userData.body
        .material
        .color.setHex(
            carColors[
                selectedCarColor
            ]
        );


    showMessage(
        "CAR PAINT UPDATED"
    );
}


function upgradeCar() {

    const price =
        300 +
        carPerformance *
        200;


    if (
        carPerformance >=
        3
    ) {

        showMessage(
            "MAX UPGRADE"
        );

        return;
    }


    if (
        money <
        price
    ) {

        showMessage(
            "NEED ₹" +
            price
        );

        return;
    }


    money -=
        price;


    carPerformance++;


    showMessage(
        "CAR PERFORMANCE LV." +
        carPerformance
    );
}


/* =========================================================
   TRAFFIC
   ========================================================= */

const trafficCars =
    [];


function createTrafficCar(
    x,
    z,
    axis,
    direction
) {

    const carObject =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.4,
                1,
                6.2
            ),

            standardMaterial(
                [
                    0x174ea6,
                    0xd7d7d7,
                    0x1c7c35,
                    0x8f1717,
                    0x9c6b17
                ][
                    Math.floor(
                        Math.random() *
                        5
                    )
                ],

                0.4,
                0.4
            )
        );


    body.position.y =
        0.9;


    carObject.add(
        body
    );


    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.5,
                1.2,
                2.6
            ),

            standardMaterial(
                0x22272d,
                0.25,
                0.5
            )
        );


    roof.position.y =
        1.7;


    carObject.add(
        roof
    );


    carObject.position.set(
        x,
        0,
        z
    );


    carObject.userData.axis =
        axis;


    carObject.userData.direction =
        direction;


    carObject.userData.speed =
        7 +
        Math.random() * 7;


    scene.add(
        carObject
    );


    trafficCars.push(
        carObject
    );
}


for (
    let i = 0;
    i < 8;
    i++
) {

    createTrafficCar(
        -8,
        -125 + i * 32,
        "z",
        1
    );


    createTrafficCar(
        8,
        125 - i * 32,
        "z",
        -1
    );


    createTrafficCar(
        -125 + i * 32,
        -8,
        "x",
        1
    );


    createTrafficCar(
        125 - i * 32,
        8,
        "x",
        -1
    );
}


function updateTraffic(
    delta
) {

    trafficCars.forEach(
        (traffic) => {

            const speed =
                traffic.userData.speed;


            const direction =
                traffic.userData.direction;


            if (
                traffic.userData.axis ===
                "z"
            ) {

                traffic.position.z +=
                    direction *
                    speed *
                    delta;

            } else {

                traffic.position.x +=
                    direction *
                    speed *
                    delta;
            }


            if (
                traffic.position.x >
                160
            ) {

                traffic.position.x =
                    -160;
            }


            if (
                traffic.position.x <
                -160
            ) {

                traffic.position.x =
                    160;
            }


            if (
                traffic.position.z >
                160
            ) {

                traffic.position.z =
                    -160;
            }


            if (
                traffic.position.z <
                -160
            ) {

                traffic.position.z =
                    160;
            }
        }
    );
}


/* =========================================================
   NPCs
   ========================================================= */

const npcs = [];


function createNPC(
    x,
    z
) {

    const npc =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                1.15,
                0.5
            ),

            standardMaterial(
                0x355070
            )
        );


    body.position.y =
        0.95;


    npc.add(
        body
    );


    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.34,
                12,
                12
            ),

            standardMaterial(
                0xb8794f
            )
        );


    head.position.y =
        1.8;


    npc.add(
        head
    );


    npc.position.set(
        x,
        0,
        z
    );


    npc.userData.target =
        new THREE.Vector3(
            x,
            0,
            z +
            20
        );


    npc.userData.speed =
        1.5 +
        Math.random();


    scene.add(
        npc
    );


    npcs.push(
        npc
    );
}


for (
    let i = 0;
    i < 25;
    i++
) {

    createNPC(

        THREE.MathUtils.randFloat(
            -110,
            110
        ),

        THREE.MathUtils.randFloat(
            -110,
            110
        )
    );
}


function updateNPCs(
    delta
) {

    npcs.forEach(
        (npc) => {

            const target =
                npc.userData.target;


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        target,
                        npc.position
                    );


            direction.y =
                0;


            const distance =
                direction.length();


            if (
                distance < 2
            ) {

                npc.userData.target =
                    new THREE.Vector3(

                        THREE.MathUtils.randFloat(
                            -120,
                            120
                        ),

                        0,

                        THREE.MathUtils.randFloat(
                            -120,
                            120
                        )
                    );

                return;
            }


            direction.normalize();


            npc.position.addScaledVector(
                direction,
                npc.userData.speed *
                delta
            );


            npc.rotation.y =
                Math.atan2(
                    direction.x,
                    direction.z
                );
        }
    );
}


/* =========================================================
   BUSES
   ========================================================= */

const buses =
    [];


const busStops =
    [];


function createBusStop(
    x,
    z
) {

    const group =
        new THREE.Group();


    const shelter =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                5,
                2.8,
                2
            ),

            standardMaterial(
                0x252a30,
                0.7,
                0.25
            )
        );


    shelter.position.y =
        1.4;


    group.add(
        shelter
    );


    const sign =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.8,
                2,
                0.15
            ),

            basicMaterial(
                0xffd21f
            )
        );


    sign.position.set(
        2.2,
        3,
        0
    );


    group.add(
        sign
    );


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );


    busStops.push(
        group
    );
}


function createBus(
    x,
    z,
    horizontal = false
) {

    const bus =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                horizontal
                    ? 11
                    : 4,

                2.8,

                horizontal
                    ? 4
                    : 11
            ),

            standardMaterial(
                0xd02b32,
                0.35,
                0.4
            )
        );


    bus.position.set(
        x,
        2,
        z
    );


    bus.castShadow =
        true;


    bus.userData.horizontal =
        horizontal;


    bus.userData.speed =
        7;


    scene.add(
        bus
    );


    buses.push(
        bus
    );
}


createBusStop(
    -50,
    -14
);

createBusStop(
    50,
    14
);

createBusStop(
    -14,
    -50
);

createBusStop(
    14,
    50
);


createBus(
    -5,
    -120,
    false
);

createBus(
    120,
    5,
    true
);


function updateBuses(
    delta
) {

    buses.forEach(
        (bus) => {

            if (
                bus.userData.horizontal
            ) {

                bus.position.x +=
                    bus.userData.speed *
                    delta;


                if (
                    bus.position.x >
                    150
                ) {

                    bus.position.x =
                        -150;
                }

            } else {

                bus.position.z +=
                    bus.userData.speed *
                    delta;


                if (
                    bus.position.z >
                    150
                ) {

                    bus.position.z =
                        -150;
                }
            }
        }
    );
}


/* =========================================================
   CITY SHARDS
   ========================================================= */

const shards = [];


function createShard(
    x,
    z
) {

    const shard =
        new THREE.Mesh(

            new THREE.OctahedronGeometry(
                0.75
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x31d9ff,

                emissive:
                    0x087fa5,

                emissiveIntensity:
                    2,

                metalness:
                    0.4,

                roughness:
                    0.2
            })
        );


    shard.position.set(
        x,
        2,
        z
    );


    scene.add(
        shard
    );


    shards.push(
        shard
    );
}


[
    [-28, -28],
    [28, -28],
    [-28, 28],
    [28, 28],
    [-90, 0],
    [90, 0],
    [0, -90],
    [0, 90]
].forEach(
    (p) => {

        createShard(
            p[0],
            p[1]
        );
    }
);


function updateShards(
    delta
) {

    shards.forEach(
        (shard) => {

            if (
                !shard.visible
            ) {

                return;
            }


            shard.rotation.y +=
                delta * 2;


            shard.position.y =
                2 +
                Math.sin(
                    performance.now() *
                    0.002 +
                    shard.position.x
                ) *
                0.3;


            if (
                playerModel &&
                playerModel.position
                    .distanceTo(
                        shard.position
                    ) <
                    3
            ) {

                shard.visible =
                    false;


                money +=
                    100;


                showMessage(
                    "CITY SHARD +₹100"
                );
            }
        }
    );
}


/* =========================================================
   RAIN
   ========================================================= */

const rainCount =
    1200;


const rainPositions =
    new Float32Array(
        rainCount * 3
    );


for (
    let i = 0;
    i < rainCount;
    i++
) {

    rainPositions[
        i * 3
    ] =
        (Math.random() -
        0.5) *
        300;


    rainPositions[
        i * 3 + 1
    ] =
        Math.random() *
        100;


    rainPositions[
        i * 3 + 2
    ] =
        (Math.random() -
        0.5) *
        300;
}


const rainGeometry =
    new THREE.BufferGeometry();


rainGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(
        rainPositions,
        3
    )
);


const rain =
    new THREE.Points(

        rainGeometry,

        new THREE.PointsMaterial({

            color:
                0xbddcff,

            size:
                0.18,

            transparent:
                true,

            opacity:
                0.7,

            depthWrite:
                false
        })
    );


rain.visible =
    false;


scene.add(
    rain
);


function updateRain(
    delta
) {

    if (
        !rainEnabled
    ) {

        return;
    }


    const positions =
        rainGeometry
            .attributes
            .position
            .array;


    for (
        let i = 0;
        i < rainCount;
        i++
    ) {

        const index =
            i * 3;


        positions[index] +=
            1.5 *
            delta;


        positions[index + 1] -=
            35 *
            delta;


        if (
            positions[index + 1] <
            0
        ) {

            positions[index] =
                (Math.random() -
                0.5) *
                300;


            positions[index + 1] =
                80 +
                Math.random() *
                30;


            positions[index + 2] =
                (Math.random() -
                0.5) *
                300;
        }
    }


    rainGeometry
        .attributes
        .position
        .needsUpdate =
        true;
}


function toggleRain() {

    rainEnabled =
        !rainEnabled;


    rain.visible =
        rainEnabled;


    showMessage(
        rainEnabled
            ? "RAIN ON"
            : "RAIN OFF"
    );
}


/* =========================================================
   4D REALITY
   ========================================================= */

let realityIndex =
    0;


let targetReality =
    0;


const realityObjects =
    [];


const portals =
    [];


function addRealityObject(
    object,
    layer
) {

    object.userData.realityLayer =
        layer;


    realityObjects.push(
        object
    );


    scene.add(
        object
    );
}


function createRealityObject(
    x,
    y,
    z,
    layer,
    color
) {

    const object =
        new THREE.Mesh(

            new THREE.IcosahedronGeometry(
                2.5,
                1
            ),

            new THREE.MeshStandardMaterial({

                color:
                    color,

                emissive:
                    color,

                emissiveIntensity:
                    1.8,

                metalness:
                    0.7,

                roughness:
                    0.25
            })
        );


    object.position.set(
        x,
        y,
        z
    );


    addRealityObject(
        object,
        layer
    );
}


/* dark */

createRealityObject(
    -60,
    4,
    -40,
    -1,
    0xff267d
);


createRealityObject(
    60,
    4,
    40,
    -1,
    0xff267d
);


/* deep */

createRealityObject(
    -80,
    5,
    -80,
    -2,
    0x7e45ff
);


createRealityObject(
    80,
    5,
    80,
    -2,
    0x7e45ff
);


/* hidden */

createRealityObject(
    -80,
    5,
    80,
    2,
    0x4855ff
);


createRealityObject(
    80,
    5,
    -80,
    2,
    0x4855ff
);


/* =========================================================
   FUTURE CITY
   ========================================================= */

const futurePlatforms =
    [];


function createFuturePlatform(
    x,
    y,
    z
) {

    const platform =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                8,
                0.6,
                8
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x182c4d,

                emissive:
                    0x073d75,

                emissiveIntensity:
                    1.8,

                metalness:
                    0.7,

                roughness:
                    0.25
            })
        );


    platform.position.set(
        x,
        y,
        z
    );


    platform.userData.baseY =
        y;


    platform.userData.phase =
        Math.random() *
        Math.PI * 2;


    addRealityObject(
        platform,
        1
    );


    futurePlatforms.push(
        platform
    );
}


createFuturePlatform(
    -20,
    7,
    -55
);


createFuturePlatform(
    20,
    11,
    -75
);


createFuturePlatform(
    -30,
    13,
    55
);


createFuturePlatform(
    30,
    9,
    75
);


function updateFutureCity(
    delta
) {

    const time =
        performance.now() *
        0.001;


    futurePlatforms.forEach(
        (platform) => {

            platform.position.y =
                platform.userData.baseY +

                Math.sin(
                    time * 1.3 +
                    platform.userData.phase
                ) *
                1.1;
        }
    );
}


/* =========================================================
   PORTALS
   ========================================================= */

function createPortal(
    x,
    z,
    target,
    label
) {

    const group =
        new THREE.Group();


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                3,
                0.22,
                16,
                64
            ),

            basicMaterial(
                0x38eaff
            )
        );


    group.add(
        ring
    );


    const inner =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                2.5,
                32
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0x18234e,

                transparent:
                    true,

                opacity:
                    0.8,

                side:
                    THREE.DoubleSide
            })
        );


    inner.rotation.y =
        Math.PI / 2;


    group.add(
        inner
    );


    group.position.set(
        x,
        4,
        z
    );


    group.userData.target =
        target;


    group.userData.label =
        label;


    scene.add(
        group
    );


    portals.push(
        group
    );
}


createPortal(
    -50,
    0,
    1,
    "FUTURE CITY"
);


createPortal(
    50,
    0,
    -1,
    "DARK CITY"
);


createPortal(
    0,
    -50,
    -2,
    "DEEP 4D"
);


createPortal(
    0,
    50,
    2,
    "HIDDEN DIMENSION"
);


function updateReality(
    delta
) {

    targetReality =
        THREE.MathUtils.clamp(
            targetReality,
            -2,
            2
        );


    const diff =
        targetReality -
        realityIndex;


    if (
        Math.abs(diff) >
        0.01
    ) {

        realityIndex =
            THREE.MathUtils.lerp(
                realityIndex,
                targetReality,
                delta * 4
            );
    }


    const rounded =
        Math.round(
            realityIndex
        );


    realityObjects.forEach(
        (object) => {

            object.visible =
                object.userData
                    .realityLayer ===
                rounded;
        }
    );


    futurePlatforms.forEach(
        (platform) => {

            platform.visible =
                rounded === 1;
        }
    );


    portals.forEach(
        (portal) => {

            portal.rotation.y +=
                delta * 0.7;
        }
    );
}


function shiftReality(
    amount
) {

    targetReality =
        THREE.MathUtils.clamp(
            targetReality +
            amount,
            -2,
            2
        );


    showMessage(
        "REALITY → " +
        targetReality
    );
}


function enterNearestPortal() {

    if (
        !playerModel
    ) {

        return false;
    }


    let nearest =
        null;


    let nearestDistance =
        6;


    portals.forEach(
        (portal) => {

            const distance =
                playerModel.position
                    .distanceTo(
                        portal.position
                    );


            if (
                distance <
                nearestDistance
            ) {

                nearest =
                    portal;

                nearestDistance =
                    distance;
            }
        }
    );


    if (
        !nearest
    ) {

        return false;
    }


    targetReality =
        nearest.userData.target;


    showMessage(
        "ENTERING " +
        nearest.userData.label
    );


    return true;
}


/* =========================================================
   ENTERABLE BUILDINGS
   ========================================================= */

const enterableBuildings = [];


function createInterior(
    color,
    accent
) {

    const group =
        new THREE.Group();


    const floor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                0.3,
                20
            ),

            standardMaterial(
                color
            )
        );


    group.add(
        floor
    );


    const wallMaterial =
        standardMaterial(
            0x20242a
        );


    const back =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                8,
                0.4
            ),

            wallMaterial
        );


    back.position.set(
        0,
        4,
        -10
    );


    group.add(
        back
    );


    const left =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.4,
                8,
                20
            ),

            wallMaterial
        );


    left.position.set(
        -12,
        4,
        0
    );


    group.add(
        left
    );


    const right =
        left.clone();


    right.position.x =
        12;


    group.add(
        right
    );


    const neon =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                0.12,
                0.12
            ),

            basicMaterial(
                accent
            )
        );


    neon.position.set(
        0,
        6,
        -9.7
    );


    group.add(
        neon
    );


    return group;
}


function registerBuilding(
    name,
    x,
    z,
    floorColor,
    accent
) {

    const interior =
        createInterior(
            floorColor,
            accent
        );


    interior.visible =
        false;


    scene.add(
        interior
    );


    enterableBuildings.push({

        name,

        entrance:
            new THREE.Vector3(
                x,
                0,
                z
            ),

        interior
    });
}


registerBuilding(
    "CAFE",
    -25,
    -72,
    0x4b403b,
    0xff8c42
);


registerBuilding(
    "MARKET",
    25,
    72,
    0x3d453c,
    0x67ff8a
);


registerBuilding(
    "GARAGE",
    -72,
    25,
    0x36383d,
    0x3bc7ff
);


registerBuilding(
    "ARCADE",
    72,
    -25,
    0x342b46,
    0xd84cff
);


let outsidePosition =
    new THREE.Vector3();


function enterBuilding(
    building
) {

    if (
        !playerModel
    ) {

        return;
    }


    outsidePosition.copy(
        playerModel.position
    );


    playerModel.position.set(
        0,
        0,
        4
    );


    building.interior.visible =
        true;


    currentInterior =
        building;


    showMessage(
        "ENTERED " +
        building.name
    );
}


function exitBuilding() {

    if (
        !currentInterior ||
        !playerModel
    ) {

        return;
    }


    currentInterior.interior.visible =
        false;


    playerModel.position.copy(
        outsidePosition
    );


    currentInterior =
        null;


    showMessage(
        "EXITED BUILDING"
    );
}


/* =========================================================
   MISSIONS
   ========================================================= */

let missionState =
    0;


const missionStart =
    new THREE.Vector3(
        0,
        0,
        3
    );


const missionTarget =
    new THREE.Vector3(
        70,
        0,
        70
    );


const missionStartMarker =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            2,
            0.15,
            10,
            36
        ),

        basicMaterial(
            0xff2020
        )
    );


missionStartMarker.rotation.x =
    Math.PI / 2;


missionStartMarker.position.copy(
    missionStart
);


scene.add(
    missionStartMarker
);


const missionTargetMarker =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            3,
            0.18,
            10,
            36
        ),

        basicMaterial(
            0xffdc22
        )
    );


missionTargetMarker.rotation.x =
    Math.PI / 2;


missionTargetMarker.position.copy(
    missionTarget
);


missionTargetMarker.visible =
    false;


scene.add(
    missionTargetMarker
);


function updateMission(
    delta
) {

    missionStartMarker.rotation.z +=
        delta;


    missionTargetMarker.rotation.z -=
        delta;


    if (
        !playerModel
    ) {

        return;
    }


    const target =
        driving && car
            ? car.position
            : playerModel.position;


    if (
        missionState ===
        0
    ) {

        if (
            target.distanceTo(
                missionStart
            ) < 5
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ E ] START MISSION";
        }

        return;
    }


    if (
        missionState ===
        1
    ) {

        if (
            target.distanceTo(
                missionTarget
            ) < 7
        ) {

            missionState =
                2;


            missionTargetMarker.visible =
                false;


            money +=
                500;


            showMessage(
                "MISSION COMPLETE +₹500"
            );
        }
    }
}


function startMission() {

    if (
        missionState !==
        0
    ) {

        return;
    }


    missionState =
        1;


    missionStartMarker.visible =
        false;


    missionTargetMarker.visible =
        true;


    showMessage(
        "MISSION STARTED"
    );
}


/* =========================================================
   MAP
   ========================================================= */

let mapCanvas =
    document.getElementById(
        "full-map"
    );


if (
    !mapCanvas
) {

    mapCanvas =
        document.createElement(
            "canvas"
        );


    mapCanvas.id =
        "full-map";


    mapCanvas.width =
        900;


    mapCanvas.height =
        700;


    mapCanvas.style.position =
        "fixed";


    mapCanvas.style.left =
        "50%";


    mapCanvas.style.top =
        "50%";


    mapCanvas.style.transform =
        "translate(-50%, -50%)";


    mapCanvas.style.width =
        "90vw";


    mapCanvas.style.height =
        "85vh";


    mapCanvas.style.background =
        "rgba(5,8,12,0.97)";


    mapCanvas.style.border =
        "2px solid #ff3333";


    mapCanvas.style.zIndex =
        "200";


    mapCanvas.style.display =
        "none";


    document.body.appendChild(
        mapCanvas
    );
}


const mapContext =
    mapCanvas.getContext(
        "2d"
    );


function drawMap() {

    mapContext.fillStyle =
        "#080c11";


    mapContext.fillRect(
        0,
        0,
        900,
        700
    );


    const centerX =
        450;


    const centerY =
        350;


    const scale =
        1.4 *
        mapZoom;


    const toMap =
        (x, z) => ({

            x:
                centerX +
                x *
                scale,

            y:
                centerY +
                z *
                scale
        });


    mapContext.strokeStyle =
        "#353b44";


    mapContext.lineWidth =
        28;


    [
        0,
        -65,
        65
    ].forEach(
        (x) => {

            const a =
                toMap(
                    x,
                    -160
                );


            const b =
                toMap(
                    x,
                    160
                );


            mapContext.beginPath();

            mapContext.moveTo(
                a.x,
                a.y
            );

            mapContext.lineTo(
                b.x,
                b.y
            );

            mapContext.stroke();
        }
    );


    [
        0,
        -65,
        65
    ].forEach(
        (z) => {

            const a =
                toMap(
                    -160,
                    z
                );


            const b =
                toMap(
                    160,
                    z
                );


            mapContext.beginPath();

            mapContext.moveTo(
                a.x,
                a.y
            );

            mapContext.lineTo(
                b.x,
                b.y
            );

            mapContext.stroke();
        }
    );


    mapContext.fillStyle =
        "#59636d";


    buildings.forEach(
        (building) => {

            const p =
                toMap(
                    building.position.x,
                    building.position.z
                );


            mapContext.fillRect(
                p.x - 5,
                p.y - 5,
                10,
                10
            );
        }
    );


    shards.forEach(
        (shard) => {

            if (
                !shard.visible
            ) {

                return;
            }


            const p =
                toMap(
                    shard.position.x,
                    shard.position.z
                );


            mapContext.fillStyle =
                "#39eaff";


            mapContext.beginPath();

            mapContext.arc(
                p.x,
                p.y,
                5,
                0,
                Math.PI * 2
            );

            mapContext.fill();
        }
    );


    const px =
        driving && car
            ? car.position.x
            : playerModel
                ? playerModel.position.x
                : 0;


    const pz =
        driving && car
            ? car.position.z
            : playerModel
                ? playerModel.position.z
                : 0;


    const playerMap =
        toMap(
            px,
            pz
        );


    mapContext.fillStyle =
        "#ffffff";


    mapContext.beginPath();

    mapContext.arc(
        playerMap.x,
        playerMap.y,
        8,
        0,
        Math.PI * 2
    );

    mapContext.fill();


    mapContext.fillStyle =
        "#ffffff";


    mapContext.font =
        "bold 25px Arial";


    mapContext.fillText(
        "Y: RISE OF THE CITY",
        25,
        38
    );


    mapContext.font =
        "14px Arial";


    mapContext.fillText(
        "M = CLOSE    + / - = ZOOM",
        25,
        62
    );
}


function toggleMap() {

    mapOpen =
        !mapOpen;


    mapCanvas.style.display =
        mapOpen
            ? "block"
            : "none";


    if (
        mapOpen
    ) {

        drawMap();
    }
}


/* =========================================================
   HUD
   ========================================================= */

let worldHUD =
    document.getElementById(
        "world-hud"
    );


if (
    !worldHUD
) {

    worldHUD =
        document.createElement(
            "div"
        );


    worldHUD.id =
        "world-hud";


    worldHUD.style.position =
        "fixed";


    worldHUD.style.left =
        "20px";


    worldHUD.style.top =
        "20px";


    worldHUD.style.padding =
        "12px 16px";


    worldHUD.style.background =
        "rgba(0,0,0,0.72)";


    worldHUD.style.color =
        "#ffffff";


    worldHUD.style.fontFamily =
        "Arial";


    worldHUD.style.fontSize =
        "13px";


    worldHUD.style.lineHeight =
        "1.5";


    worldHUD.style.zIndex =
        "40";


    worldHUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        worldHUD
    );
}


let messageHUD =
    document.getElementById(
        "world-message"
    );


if (
    !messageHUD
) {

    messageHUD =
        document.createElement(
            "div"
        );


    messageHUD.id =
        "world-message";


    messageHUD.style.position =
        "fixed";


    messageHUD.style.left =
        "50%";


    messageHUD.style.bottom =
        "15%";


    messageHUD.style.transform =
        "translateX(-50%)";


    messageHUD.style.padding =
        "12px 20px";


    messageHUD.style.background =
        "rgba(0,0,0,0.85)";


    messageHUD.style.border =
        "1px solid #ff3333";


    messageHUD.style.color =
        "#ffffff";


    messageHUD.style.fontFamily =
        "Arial";


    messageHUD.style.fontWeight =
        "bold";


    messageHUD.style.zIndex =
        "150";


    messageHUD.style.pointerEvents =
        "none";


    messageHUD.style.display =
        "none";


    document.body.appendChild(
        messageHUD
    );
}


let messageTimer =
    0;


function showMessage(
    message
) {

    messageHUD.textContent =
        message;


    messageHUD.style.display =
        "block";


    messageTimer =
        2.2;
}


function updateMessage(
    delta
) {

    if (
        messageTimer <=
        0
    ) {

        return;
    }


    messageTimer -=
        delta;


    if (
        messageTimer <=
        0
    ) {

        messageHUD.style.display =
            "none";
    }
}


function updateWorldHUD() {

    if (
        !worldHUD
    ) {

        return;
    }


    const hours =
        Math.floor(
            worldTime
        );


    const minutes =
        Math.floor(
            (
                worldTime -
                hours
            ) *
            60
        );


    const x =
        driving && car
            ? car.position.x
            : playerModel
                ? playerModel.position.x
                : 0;


    const z =
        driving && car
            ? car.position.z
            : playerModel
                ? playerModel.position.z
                : 0;


    worldHUD.innerHTML =

        "<b>Y: RISE OF THE CITY</b><br>" +

        "DISTRICT: " +
        getDistrict(
            x,
            z
        ) +

        "<br>TIME: " +
        String(hours)
            .padStart(2, "0") +
        ":" +
        String(minutes)
            .padStart(2, "0") +

        "<br>WEATHER: " +
        (
            rainEnabled
                ? "RAIN"
                : "CLEAR"
        ) +

        "<br>REALITY: " +
        Math.round(
            realityIndex
        ) +

        "<br>MONEY: ₹" +
        money;
}


function getDistrict(
    x,
    z
) {

    if (
        Math.sqrt(
            x * x +
            z * z
        ) < 28
    ) {

        return "CENTRAL";
    }


    if (
        z > 55
    ) {

        return "NORTH";
    }


    if (
        z < -55
    ) {

        return "SOUTH";
    }


    if (
        x > 55
    ) {

        return "EAST";
    }


    if (
        x < -55
    ) {

        return "WEST";
    }


    return "OUTSKIRTS";
}


/* =========================================================
   INTERACTION
   ========================================================= */

function updateInteraction() {

    if (
        !interactionText
    ) {

        return;
    }


    if (
        mapOpen
    ) {

        interactionText.style.display =
            "none";

        return;
    }


    if (
        currentInterior
    ) {

        interactionText.style.display =
            "block";


        interactionText.textContent =
            "[ F ] EXIT " +
            currentInterior.name;


        return;
    }


    if (
        driving
    ) {

        interactionText.style.display =
            "block";


        interactionText.textContent =
            "WASD = DRIVE   E = EXIT";

        return;
    }


    if (
        !playerModel
    ) {

        return;
    }


    /* portal */

    for (
        const portal of portals
    ) {

        if (
            playerModel.position
                .distanceTo(
                    portal.position
                ) < 6
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ E ] ENTER " +
                portal.userData.label;


            return;
        }
    }


    /* mission */

    if (
        missionState ===
        0
    ) {

        if (
            playerModel.position
                .distanceTo(
                    missionStart
                ) < 5
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ E ] START MISSION";


            return;
        }
    }


    /* car */

    if (
        car &&
        playerModel.position
            .distanceTo(
                car.position
            ) < 6
    ) {

        interactionText.style.display =
            "block";


        interactionText.textContent =
            "[ E ] ENTER VEHICLE";


        return;
    }


    /* building */

    for (
        const building of
        enterableBuildings
    ) {

        if (
            playerModel.position
                .distanceTo(
                    building.entrance
                ) < 5
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ F ] ENTER " +
                building.name;


            return;
        }
    }


    interactionText.style.display =
        "none";
}


/* =========================================================
   KEYBOARD
   ========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        keys[key] =
            true;


        if (
            key ===
            " "
        ) {

            event.preventDefault();

            jumpPlayer();
        }


        if (
            key ===
            "m"
        ) {

            toggleMap();
        }


        if (
            key ===
            "r"
        ) {

            toggleRain();
        }


        if (
            key ===
            "q"
        ) {

            shiftReality(
                -1
            );
        }


        if (
            key ===
            "z"
        ) {

            shiftReality(
                1
            );
        }


        if (
            key ===
            "e"
        ) {

            handleE();
        }


        if (
            key ===
            "f"
        ) {

            handleF();
        }


        if (
            mapOpen &&
            (
                key ===
                    "=" ||
                key ===
                    "+"
            )
        ) {

            mapZoom =
                Math.min(
                    2.5,
                    mapZoom +
                    0.2
                );


            drawMap();
        }


        if (
            mapOpen &&
            key ===
                "-"
        ) {

            mapZoom =
                Math.max(
                    0.6,
                    mapZoom -
                    0.2
                );


            drawMap();
        }


        if (
            currentInterior ===
            null
        ) {

            return;
        }


        if (
            currentInterior.name ===
            "GARAGE"
        ) {

            if (
                key ===
                "1"
            ) {

                changeCarPaint();
            }


            if (
                key ===
                "2"
            ) {

                upgradeCar();
            }


            if (
                key ===
                "escape"
            ) {

                exitBuilding();
            }
        }
    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] =
            false;
    }
);


/* =========================================================
   E
   ========================================================= */

function handleE() {

    if (
        mapOpen
    ) {

        return;
    }


    if (
        driving
    ) {

        exitCar();

        return;
    }


    if (
        enterNearestPortal()
    ) {

        return;
    }


    if (
        missionState ===
        0 &&
        playerModel &&
        playerModel.position
            .distanceTo(
                missionStart
            ) < 5
    ) {

        startMission();

        return;
    }


    if (
        playerModel &&
        car &&
        playerModel.position
            .distanceTo(
                car.position
            ) < 6
    ) {

        enterCar();

        return;
    }
}


/* =========================================================
   F
   ========================================================= */

function handleF() {

    if (
        mapOpen
    ) {

        return;
    }


    if (
        currentInterior
    ) {

        exitBuilding();

        return;
    }


    if (
        !playerModel
    ) {

        return;
    }


    for (
        const building of
        enterableBuildings
    ) {

        if (
            playerModel.position
                .distanceTo(
                    building.entrance
                ) < 5
        ) {

            enterBuilding(
                building
            );


            return;
        }
    }
}


/* =========================================================
   CAMERA
   ========================================================= */

let cameraYaw =
    0;


let cameraPitch =
    0.25;


let pointerLocked =
    false;


renderer.domElement.addEventListener(
    "click",
    () => {

        if (
            !mapOpen
        ) {

            renderer.domElement
                .requestPointerLock();
        }
    }
);


document.addEventListener(
    "pointerlockchange",
    () => {

        pointerLocked =
            document.pointerLockElement ===
            renderer.domElement;
    }
);


document.addEventListener(
    "mousemove",
    (event) => {

        if (
            !pointerLocked
        ) {

            return;
        }


        cameraYaw -=
            event.movementX *
            0.002;


        cameraPitch -=
            event.movementY *
            0.002;


        cameraPitch =
            THREE.MathUtils.clamp(
                cameraPitch,
                -0.25,
                0.8
            );
    }
);


function updateCamera(
    delta
) {

    const target =
        driving && car
            ? car.position
            : playerModel
                ? playerModel.position
                : new THREE.Vector3();


    const distance =
        driving
            ? 10
            : 7;


    const horizontal =
        Math.cos(
            cameraPitch
        ) *
        distance;


    const vertical =
        Math.sin(
            cameraPitch
        ) *
        distance;


    const offset =
        new THREE.Vector3(

            Math.sin(
                cameraYaw
            ) *
            horizontal,

            3 +
            vertical,

            Math.cos(
                cameraYaw
            ) *
            horizontal
        );


    const desired =
        target
            .clone()
            .add(
                offset
            );


    camera.position.lerp(
        desired,
        Math.min(
            delta * 7,
            1
        )
    );


    const lookTarget =
        target
            .clone();


    lookTarget.y +=
        driving
            ? 1.5
            : 1.2;


    camera.lookAt(
        lookTarget
    );
}


/* =========================================================
   ENVIRONMENT ANIMATION
   ========================================================= */

function updateTrees() {

    const time =
        performance.now() *
        0.001;


    trees.forEach(
        (tree) => {

            tree.group.rotation.z =
                Math.sin(
                    time * 1.2 +
                    tree.phase
                ) *
                0.025;
        }
    );
}


/* =========================================================
   STREET LIGHT UPDATE
   ========================================================= */

function updateStreetLights() {

    const night =
        worldTime >= 19 ||
        worldTime < 6;


    streetLights.forEach(
        (light) => {

            light.intensity =
                night
                    ? 1.8
                    : 0;
        }
    );
}


/* =========================================================
   MAIN LOOP
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (
        gamePaused
    ) {

        return;
    }


    updateDayNight(
        delta
    );


    updatePlayer(
        delta
    );


    updatePlayerPhysics(
        delta
    );


    updateCar(
        delta
    );


    updateTraffic(
        delta
    );


    updateNPCs(
        delta
    );


    updateBuses(
        delta
    );


    updateShards(
        delta
    );


    updateRain(
        delta
    );


    updateReality(
        delta
    );


    updateFutureCity(
        delta
    );


    updateMission(
        delta
    );


    updateTrees();


    updateStreetLights();


    updateMessage(
        delta
    );


    updateInteraction();


    updateWorldHUD();


    if (
        playerMixer
    ) {

        playerMixer.update(
            delta
        );
    }


    if (
        mapOpen
    ) {

        drawMap();
    }


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1.5
            )
        );
    }
);


/* =========================================================
   START
   ========================================================= */

console.log(
    "Y: RISE OF THE CITY"
);


console.log(
    "WEB BUILD READY"
);


console.log(
    "THREE.JS CDN ONLINE"
);


console.log(
    "CITY SYSTEM ONLINE"
);


animate();