import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   Y: RISE OF THE CITY
   WORLD EXPANSION VERSION

   SYSTEMS:
   - 3D City
   - Player
   - Player animation
   - Cars
   - Traffic
   - NPCs
   - Traffic lights
   - Day / Night
   - Rain
   - Missions
   - Combat
   - Health
   - Police
   - Wanted system
   - 4D Reality
   - Future City
   - Portals
   - Jump / Gravity
   - Sprint
   - City props
   - Billboards
   - Collectibles
   - Puddles
   - Drones
   - District system
   - World HUD
   ========================================================= */


/* =========================================================
   HTML ELEMENTS
   ========================================================= */

const container =
    document.getElementById("game-container");

const statusText =
    document.getElementById("game-status");

const interactionText =
    document.getElementById("interaction");


/* =========================================================
   SCENE
   ========================================================= */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);

scene.fog =
    new THREE.Fog(
        0x87ceeb,
        120,
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
        1200
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
        antialias: true,
        powerPreference: "high-performance"
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
    1.0;

renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

container.appendChild(
    renderer.domElement
);


/* =========================================================
   BASIC LIGHTING
   ========================================================= */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.8
    );

scene.add(
    ambientLight
);


const sunlight =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

sunlight.position.set(
    80,
    120,
    50
);

sunlight.castShadow =
    true;

sunlight.shadow.mapSize.width =
    2048;

sunlight.shadow.mapSize.height =
    2048;

sunlight.shadow.camera.left =
    -220;

sunlight.shadow.camera.right =
    220;

sunlight.shadow.camera.top =
    220;

sunlight.shadow.camera.bottom =
    -220;

sunlight.shadow.camera.near =
    1;

sunlight.shadow.camera.far =
    600;

scene.add(
    sunlight
);


const fillLight =
    new THREE.DirectionalLight(
        0x6688aa,
        0.35
    );

fillLight.position.set(
    -80,
    50,
    -60
);

scene.add(
    fillLight
);


const moonLight =
    new THREE.DirectionalLight(
        0x5577aa,
        0.0
    );

moonLight.position.set(
    -70,
    100,
    -40
);

scene.add(
    moonLight
);


/* =========================================================
   DAY / NIGHT
   ========================================================= */

let worldTime =
    10;

const timeSpeed =
    0.04;


const daySky =
    new THREE.Color(
        0x87ceeb
    );

const eveningSky =
    new THREE.Color(
        0xff8b66
    );

const nightSky =
    new THREE.Color(
        0x071326
    );


function updateDayNight(
    delta
) {

    worldTime +=
        delta *
        timeSpeed;

    if (
        worldTime >= 24
    ) {

        worldTime = 0;
    }


    let targetSky;

    let sunIntensity;

    let ambientIntensity;

    let moonIntensity;


    if (
        worldTime >= 6 &&
        worldTime < 17
    ) {

        targetSky =
            daySky;

        sunIntensity =
            1.5;

        ambientIntensity =
            0.8;

        moonIntensity =
            0.0;

    } else if (
        worldTime >= 17 &&
        worldTime < 19
    ) {

        targetSky =
            eveningSky;

        sunIntensity =
            1.0;

        ambientIntensity =
            0.55;

        moonIntensity =
            0.1;

    } else {

        targetSky =
            nightSky;

        sunIntensity =
            0.18;

        ambientIntensity =
            0.22;

        moonIntensity =
            0.45;
    }


    scene.background.lerp(
        targetSky,
        0.03
    );


    if (
        scene.fog
    ) {

        scene.fog.color.copy(
            scene.background
        );
    }


    sunlight.intensity =
        sunIntensity;

    ambientLight.intensity =
        ambientIntensity;

    moonLight.intensity =
        moonIntensity;


    scene.traverse(
        (object) => {

            if (
                object.userData &&
                object.userData.streetLight
            ) {

                const streetLight =
                    object.userData.streetLight;

                if (
                    worldTime >= 19 ||
                    worldTime < 6
                ) {

                    streetLight.intensity =
                        1.8;

                } else {

                    streetLight.intensity =
                        0;
                }
            }
        }
    );
}


/* =========================================================
   MATERIAL HELPERS
   ========================================================= */

function makeStandardMaterial(
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


function makeBasicMaterial(
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
   GLOBAL GAME STATE
   ========================================================= */

const clock =
    new THREE.Clock();


const keys = {};


let gamePaused =
    false;


let money =
    0;


let playerHealth =
    100;


let wantedLevel =
    0;


let shootCooldown =
    0;


let damageCooldown =
    0;


let rainEnabled =
    false;


let mapOpen =
    false;


let mapZoom =
    1;


let cameraYaw =
    0;


let cameraPitch =
    0.28;


let driving =
    false;


let vehicleSpeed =
    0;


/* =========================================================
   PLAYER STATE
   ========================================================= */

let playerModel =
    null;

let playerMixer =
    null;

let playerAnimations =
    {};

let currentPlayerAnimation =
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


const normalSpeed =
    12;


const sprintSpeed =
    21;


let currentMoveSpeed =
    normalSpeed;


let playerWalking =
    false;


let playerSprinting =
    false;


/* =========================================================
   PLAYER LOADER
   ========================================================= */

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

            const desiredHeight =
                1.8;

            const scale =
                desiredHeight /
                size.y;

            playerModel.scale.setScalar(
                scale
            );
        }


        scene.add(
            playerModel
        );


        if (
            gltf.animations &&
            gltf.animations.length > 0
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
                        name.includes("idle")
                    ) {

                        playerAnimations.idle =
                            playerMixer.clipAction(
                                clip
                            );

                    } else if (
                        name.includes("run")
                    ) {

                        playerAnimations.run =
                            playerMixer.clipAction(
                                clip
                            );

                    } else if (
                        name.includes("walk")
                    ) {

                        playerAnimations.walk =
                            playerMixer.clipAction(
                                clip
                            );
                    }
                }
            );


            if (
                playerAnimations.idle
            ) {

                playerAnimations.idle.play();

                currentPlayerAnimation =
                    playerAnimations.idle;
            }
        }

    },

    undefined,

    (error) => {

        console.error(
            "PLAYER GLB LOAD ERROR:",
            error
        );
    }
);


/* =========================================================
   GROUND
   ========================================================= */

const groundMaterial =
    makeStandardMaterial(
        0x505050,
        0.92,
        0
    );


const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            320,
            320
        ),

        groundMaterial
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
    makeStandardMaterial(
        0x202020,
        1,
        0
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


/* MAIN ROADS */

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


/* SECONDARY ROADS */

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
   ROAD MARKINGS
   ========================================================= */

const lineMaterial =
    makeBasicMaterial(
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

            lineMaterial
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


/* vertical road marks */

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


/* horizontal road marks */

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
    makeStandardMaterial(
        0x777777,
        0.85,
        0
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


/* secondary road sidewalks */

createSidewalk(
    -75,
    0,
    3,
    320
);

createSidewalk(
    75,
    0,
    3,
    320
);

createSidewalk(
    0,
    -75,
    3,
    320,
    Math.PI / 2
);

createSidewalk(
    0,
    75,
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

    0x404854,

    0x2e333a
];


const buildingObjects =
    [];


function createBuilding(
    x,
    z,
    width,
    depth,
    height
) {

    const material =
        makeStandardMaterial(

            buildingColors[
                Math.floor(
                    Math.random() *
                    buildingColors.length
                )
            ],

            0.82,
            0.05
        );


    const building =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

            material
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


    buildingObjects.push(
        building
    );


    const windowMaterial =
        makeBasicMaterial(
            0x7fc9ef
        );


    const rows =
        Math.max(
            1,
            Math.floor(
                height / 5
            )
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

            const windowMesh =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.5,
                        1.6,
                        0.15
                    ),

                    windowMaterial
                );


            windowMesh.position.set(

                x + wx,

                y,

                z + depth / 2 + 0.08
            );


            scene.add(
                windowMesh
            );


            /* opposite side */

            const windowBack =
                windowMesh.clone();


            windowBack.position.z =
                z -
                depth / 2 -
                0.08;


            scene.add(
                windowBack
            );
        }
    }


    /* rooftop */

    const rooftop =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width * 0.85,
                0.2,
                depth * 0.85
            ),

            makeStandardMaterial(
                0x15181c,
                0.9,
                0.2
            )
        );


    rooftop.position.set(
        x,
        height + 0.1,
        z
    );


    scene.add(
        rooftop
    );
}


/* north / south blocks */

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


/* east / west blocks */

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
   CITY PLAZA
   ========================================================= */

const plaza =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            18,
            18,
            0.4,
            48
        ),

        makeStandardMaterial(
            0x62666c,
            0.9,
            0
        )
    );


plaza.position.set(
    0,
    0.2,
    0
);


scene.add(
    plaza
);


/* =========================================================
   PLAZA CENTER
   ========================================================= */

const fountainBase =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            6,
            6,
            0.8,
            32
        ),

        makeStandardMaterial(
            0x33373c,
            0.7,
            0.1
        )
    );


fountainBase.position.set(
    0,
    0.6,
    0
);


scene.add(
    fountainBase
);


const fountainWater =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            5.3,
            5.3,
            0.12,
            32
        ),

        new THREE.MeshStandardMaterial({

            color:
                0x2088cc,

            roughness:
                0.15,

            metalness:
                0.15,

            transparent:
                true,

            opacity:
                0.8
        })
    );


fountainWater.position.set(
    0,
    1.03,
    0
);


scene.add(
    fountainWater
);


/* =========================================================
   TREES
   ========================================================= */

const treeObjects =
    [];


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

            makeStandardMaterial(
                0x6b4226,
                0.9,
                0
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

            makeStandardMaterial(
                0x1c7c35,
                0.85,
                0
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


    treeObjects.push(
        {
            group,
            leaves,
            baseY:
                leaves.position.y,
            phase:
                Math.random() *
                Math.PI *
                2
        }
    );
}


/* central trees */

for (
    let i = -120;
    i <= 120;
    i += 20
) {

    createTree(
        -17,
        i,
        0.9 +
            Math.random() * 0.25
    );

    createTree(
        17,
        i,
        0.9 +
            Math.random() * 0.25
    );
}


/* extra trees */

for (
    let i = -120;
    i <= 120;
    i += 30
) {

    createTree(
        -90,
        i,
        1
    );

    createTree(
        90,
        i,
        1
    );
}


/* =========================================================
   STREET LIGHTS
   ========================================================= */

function createStreetLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const poleMaterial =
        makeStandardMaterial(
            0x202020,
            0.8,
            0.3
        );


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.15,
                0.22,
                7,
                8
            ),

            poleMaterial
        );


    pole.position.y =
        3.5;


    pole.castShadow =
        true;


    group.add(
        pole
    );


    const arm =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.6,
                0.15,
                0.15
            ),

            poleMaterial
        );


    arm.position.set(
        0.65,
        6.8,
        0
    );


    group.add(
        arm
    );


    const head =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.1,
                0.3,
                0.7
            ),

            makeStandardMaterial(
                0x111111,
                0.65,
                0.2
            )
        );


    head.position.set(
        1.25,
        6.6,
        0
    );


    group.add(
        head
    );


    const light =
        new THREE.PointLight(
            0xffddaa,
            0,
            28
        );


    light.position.set(
        1.25,
        6.25,
        0
    );


    group.add(
        light
    );


    group.position.set(
        x,
        0,
        z
    );


    group.userData.streetLight =
        light;


    scene.add(
        group
    );
}


/* road lights */

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


/* secondary road lights */

for (
    let z = -140;
    z <= 140;
    z += 30
) {

    createStreetLight(
        -75,
        z
    );

    createStreetLight(
        75,
        z
    );
}


/* =========================================================
   CITY PROPS
   ========================================================= */

const cityProps =
    [];


function addCityProp(
    object,
    x,
    y,
    z,
    rotationY = 0
) {

    object.position.set(
        x,
        y,
        z
    );

    object.rotation.y =
        rotationY;

    scene.add(
        object
    );

    cityProps.push(
        object
    );

    return object;
}


/* =========================================================
   BENCH
   ========================================================= */

function createBench(
    x,
    z,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const wood =
        makeStandardMaterial(
            0x6b3f22,
            0.8,
            0
        );


    const metal =
        makeStandardMaterial(
            0x292929,
            0.65,
            0.35
        );


    const seat =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3,
                0.25,
                0.8
            ),
            wood
        );

    seat.position.y =
        1;


    group.add(
        seat
    );


    const back =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3,
                1,
                0.25
            ),
            wood
        );

    back.position.set(
        0,
        1.5,
        0.3
    );


    group.add(
        back
    );


    for (
        const px of [-1.1, 1.1]
    ) {

        const leg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    1,
                    0.18
                ),
                metal
            );

        leg.position.set(
            px,
            0.5,
            0
        );

        group.add(
            leg
        );
    }


    addCityProp(
        group,
        x,
        0,
        z,
        rotation
    );
}


/* plaza benches */

createBench(
    -10,
    -20,
    0
);

createBench(
    10,
    -20,
    Math.PI
);

createBench(
    -20,
    10,
    Math.PI / 2
);

createBench(
    20,
    -10,
    -Math.PI / 2
);


/* =========================================================
   DUMPSTER
   ========================================================= */

function createDumpster(
    x,
    z,
    rotation = 0
) {

    const bin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.5,
                1.7,
                1.5
            ),

            makeStandardMaterial(
                0x26302b,
                0.9,
                0
            )
        );


    bin.castShadow =
        true;


    addCityProp(
        bin,
        x,
        0.85,
        z,
        rotation
    );


    const lid =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.6,
                0.15,
                1.6
            ),

            makeStandardMaterial(
                0x171b19,
                0.85,
                0
            )
        );


    addCityProp(
        lid,
        x,
        1.75,
        z,
        rotation
    );
}


/* dumpsters */

createDumpster(
    -45,
    -20
);

createDumpster(
    45,
    -20
);

createDumpster(
    -45,
    20
);

createDumpster(
    45,
    20
);


/* =========================================================
   PARKING AREAS
   ========================================================= */

function createParkingLot(
    x,
    z,
    width,
    depth
) {

    const lot =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                0.08,
                depth
            ),

            makeStandardMaterial(
                0x292929,
                0.95,
                0
            )
        );


    lot.position.set(
        x,
        0.05,
        z
    );


    lot.receiveShadow =
        true;


    scene.add(
        lot
    );


    const parkingLineMaterial =
        makeBasicMaterial(
            0xe0e0e0
        );


    const spaces =
        Math.floor(
            width / 6
        );


    for (
        let i = 0;
        i <= spaces;
        i++
    ) {

        const line =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    0.12,
                    depth - 2
                ),

                parkingLineMaterial
            );


        line.rotation.x =
            -Math.PI / 2;


        line.position.set(

            x -
                width / 2 +
                i * 6,

            0.1,

            z
        );


        scene.add(
            line
        );
    }
}


createParkingLot(
    -95,
    55,
    35,
    24
);

createParkingLot(
    95,
    -55,
    35,
    24
);


/* =========================================================
   END OF PART 1
   ========================================================= */
/* =========================================================
   PLAYER + VEHICLE SYSTEM
   ========================================================= */


/* =========================================================
   PLAYER ANIMATION
   ========================================================= */

function playPlayerAnimation(
    name
) {

    if (
        !playerMixer ||
        !playerAnimations[name]
    ) {
        return;
    }

    const nextAction =
        playerAnimations[name];


    if (
        currentPlayerAnimation ===
        nextAction
    ) {
        return;
    }


    if (
        currentPlayerAnimation
    ) {

        currentPlayerAnimation.fadeOut(
            0.2
        );
    }


    nextAction.reset();

    nextAction.fadeIn(
        0.2
    );

    nextAction.play();


    currentPlayerAnimation =
        nextAction;
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(
    delta
) {

    if (
        !playerModel ||
        driving
    ) {

        return;
    }


    const direction =
        new THREE.Vector3();


    let moving =
        false;


    /* forward */

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        direction.z -= 1;

        moving = true;
    }


    /* backward */

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        direction.z += 1;

        moving = true;
    }


    /* left */

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        direction.x -= 1;

        moving = true;
    }


    /* right */

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        direction.x += 1;

        moving = true;
    }


    if (
        direction.lengthSq() >
        0
    ) {

        direction.normalize();


        playerWalking =
            true;


        playerSprinting =
            !!keys["shift"];


        const desiredSpeed =
            playerSprinting
                ? sprintSpeed
                : normalSpeed;


        currentMoveSpeed =
            THREE.MathUtils.lerp(

                currentMoveSpeed,

                desiredSpeed,

                Math.min(
                    delta * 8,
                    1
                )
            );


        playerModel.position.x +=
            direction.x *
            currentMoveSpeed *
            delta;


        playerModel.position.z +=
            direction.z *
            currentMoveSpeed *
            delta;


        /* rotate character */

        const targetRotation =
            Math.atan2(
                direction.x,
                direction.z
            );


        playerModel.rotation.y =
            THREE.MathUtils.lerp(
                playerModel.rotation.y,
                targetRotation,
                Math.min(
                    delta * 10,
                    1
                )
            );


        if (
            playerSprinting
        ) {

            playPlayerAnimation(
                "run"
            );

        } else {

            playPlayerAnimation(
                "walk"
            );
        }

    } else {

        playerWalking =
            false;

        playerSprinting =
            false;


        currentMoveSpeed =
            THREE.MathUtils.lerp(

                currentMoveSpeed,

                normalSpeed,

                Math.min(
                    delta * 7,
                    1
                )
            );


        playPlayerAnimation(
            "idle"
        );
    }


    /* city boundary */

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
   PLAYER PHYSICS
   ========================================================= */

function updatePlayerPhysics(
    delta
) {

    if (
        !playerModel ||
        driving
    ) {

        return;
    }


    playerVerticalVelocity -=
        gravity *
        delta;


    playerModel.position.y +=
        playerVerticalVelocity *
        delta;


    /* normal ground */

    if (
        playerModel.position.y <= 0
    ) {

        playerModel.position.y =
            0;

        playerVerticalVelocity =
            0;

        playerGrounded =
            true;

    } else {

        playerGrounded =
            false;
    }


    /* floating platform collision */

    if (
        realityIndex === 1
    ) {

        checkFuturePlatformLanding(
            delta
        );
    }


    /* safety fall reset */

    if (
        playerModel.position.y <
        -20
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
   JUMP
   ========================================================= */

function playerJump() {

    if (
        !playerModel ||
        driving
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


/* =========================================================
   PLAYER CAR
   ========================================================= */

let car =
    null;


const carObjects =
    [];


function createPlayerCar() {

    const group =
        new THREE.Group();


    group.userData.isPlayerCar =
        true;


    /* body */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.4,
                1.15,
                8
            ),

            makeStandardMaterial(
                0x9d1018,
                0.28,
                0.65
            )
        );


    body.position.y =
        1.05;


    body.castShadow =
        true;


    group.add(
        body
    );


    /* lower body */

    const lowerBody =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.65,
                0.65,
                7.8
            ),

            makeStandardMaterial(
                0x50090d,
                0.32,
                0.55
            )
        );


    lowerBody.position.y =
        0.72;


    group.add(
        lowerBody
    );


    /* cabin */

    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.5,
                1.55,
                3.4
            ),

            makeStandardMaterial(
                0x11161d,
                0.18,
                0.75
            )
        );


    cabin.position.set(
        0,
        2.0,
        -0.15
    );


    cabin.castShadow =
        true;


    group.add(
        cabin
    );


    /* front windshield */

    const windshield =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.0,
                1.0,
                0.08
            ),

            makeBasicMaterial(
                0x172f40,
                true,
                0.78
            )
        );


    windshield.position.set(
        0,
        2.08,
        -1.9
    );


    group.add(
        windshield
    );


    /* rear glass */

    const rearGlass =
        windshield.clone();


    rearGlass.position.z =
        1.6;


    rearGlass.rotation.y =
        Math.PI;


    group.add(
        rearGlass
    );


    /* side windows */

    for (
        const side of [-1, 1]
    ) {

        const sideWindow =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.08,
                    1.0,
                    2.5
                ),

                makeBasicMaterial(
                    0x172f40,
                    true,
                    0.78
                )
            );


        sideWindow.position.set(
            side * 1.76,
            2.08,
            -0.15
        );


        group.add(
            sideWindow
        );
    }


    /* headlights */

    const headlightMaterial =
        makeBasicMaterial(
            0xffffff
        );


    for (
        const side of [-1, 1]
    ) {

        const headlight =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.95,
                    0.32,
                    0.12
                ),

                headlightMaterial
            );


        headlight.position.set(
            side * 1.3,
            1.15,
            -4.02
        );


        group.add(
            headlight
        );


        const point =
            new THREE.PointLight(
                0xddeeff,
                0,
                25
            );


        point.position.set(
            side * 1.3,
            1.2,
            -4.2
        );


        group.add(
            point );


        if (
            !group.userData.headlights
        ) {

            group.userData.headlights =
                [];
        }


        group.userData.headlights.push(
            point
        );
    }


    /* brake lights */

    const brakeMaterial =
        makeBasicMaterial(
            0xff2020
        );


    for (
        const side of [-1, 1]
    ) {

        const brake =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.9,
                    0.3,
                    0.12
                ),

                brakeMaterial
            );


        brake.position.set(
            side * 1.3,
            1.17,
            4.02
        );


        group.add(
            brake
        );
    }


    /* wheels */

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.7,
            0.7,
            0.55,
            20
        );


    const wheelMaterial =
        makeStandardMaterial(
            0x101010,
            0.8,
            0.15
        );


    const wheelPositions = [

        [-2.05, 0.72, -2.55],

        [2.05, 0.72, -2.55],

        [-2.05, 0.72, 2.55],

        [2.05, 0.72, 2.55]
    ];


    group.userData.wheels =
        [];


    wheelPositions.forEach(
        (pos) => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                pos[0],
                pos[1],
                pos[2]
            );


            wheel.castShadow =
                true;


            group.add(
                wheel
            );


            group.userData.wheels.push(
                wheel
            );
        }
    );


    /* spoiler */

    const spoiler =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.0,
                0.25,
                0.35
            ),

            makeStandardMaterial(
                0x161616,
                0.6,
                0.4
            )
        );


    spoiler.position.set(
        0,
        2.55,
        2.8
    );


    group.add(
        spoiler
    );


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


    carObjects.push(
        group
    );
}


createPlayerCar();


/* =========================================================
   ENTER VEHICLE
   ========================================================= */

function enterVehicle() {

    if (
        !playerModel ||
        !car
    ) {

        return;
    }


    const distance =
        playerModel.position.distanceTo(
            car.position
        );


    if (
        distance > 6
    ) {

        return;
    }


    driving =
        true;


    playerModel.visible =
        false;


    vehicleSpeed =
        0;


    car.userData.driver =
        true;


    interactionText.style.display =
        "block";


    interactionText.textContent =
        "WASD / ARROWS • DRIVE     E • EXIT";
}


/* =========================================================
   EXIT VEHICLE
   ========================================================= */

function exitVehicle() {

    if (
        !car
    ) {

        return;
    }


    driving =
        false;


    if (
        playerModel
    ) {

        playerModel.visible =
            true;


        playerModel.position.set(

            car.position.x + 4,

            0,

            car.position.z
        );


        playerModel.rotation.y =
            car.rotation.y;
    }


    car.userData.driver =
        false;


    vehicleSpeed =
        0;


    updateInteraction();
}


/* =========================================================
   PLAYER CAR MOVEMENT
   ========================================================= */

function updateCar(
    delta
) {

    if (
        !car
    ) {

        return;
    }


    if (
        !driving
    ) {

        return;
    }


    let throttle =
        0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        throttle +=
            1;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        throttle -=
            1;
    }


    const accelerating =
        throttle !== 0;


    if (
        accelerating
    ) {

        vehicleSpeed +=
            throttle *
            22 *
            delta;

    } else {

        vehicleSpeed =
            THREE.MathUtils.lerp(
                vehicleSpeed,
                0,
                delta * 2
            );
    }


    vehicleSpeed =
        THREE.MathUtils.clamp(
            vehicleSpeed,
            -10,
            32
        );


    let steering =
        0;


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering -=
            1;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering +=
            1;
    }


    if (
        Math.abs(vehicleSpeed) >
        0.2
    ) {

        car.rotation.y -=
            steering *
            1.5 *
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


    /* rotate wheels */

    if (
        car.userData.wheels
    ) {

        car.userData.wheels.forEach(
            (wheel) => {

                wheel.rotation.x +=
                    vehicleSpeed *
                    delta *
                    1.7;
            }
        );
    }


    /* headlights */

    if (
        car.userData.headlights
    ) {

        const lightsOn =
            worldTime >= 18 ||
            worldTime < 6;


        car.userData.headlights.forEach(
            (light) => {

                light.intensity =
                    lightsOn
                        ? 4
                        : 0;
            }
        );
    }
}


/* =========================================================
   TRAFFIC SYSTEM
   ========================================================= */

const trafficCars =
    [];


function createTrafficCar(
    x,
    z,
    axis,
    direction
) {

    const group =
        new THREE.Group();


    const colors = [

        0x174ea6,

        0xd7d7d7,

        0x1c7c35,

        0x8f1717,

        0x9c6b17,

        0x5f5f67
    ];


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.4,
                1.0,
                6.2
            ),

            makeStandardMaterial(

                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

                0.4,

                0.45
            )
        );


    body.position.y =
        0.9;


    body.castShadow =
        true;


    group.add(
        body
    );


    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.6,
                1.2,
                2.7
            ),

            makeStandardMaterial(
                0x252a30,
                0.25,
                0.5
            )
        );


    cabin.position.set(
        0,
        1.75,
        -0.15
    );


    group.add(
        cabin
    );


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.55,
            0.55,
            0.45,
            14
        );


    const wheelMaterial =
        makeStandardMaterial(
            0x101010,
            0.85,
            0
        );


    const wheelPositions = [

        [-1.65, 0.58, -2],

        [1.65, 0.58, -2],

        [-1.65, 0.58, 2],

        [1.65, 0.58, 2]
    ];


    const wheels =
        [];


    wheelPositions.forEach(
        (pos) => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                pos[0],
                pos[1],
                pos[2]
            );


            group.add(
                wheel
            );


            wheels.push(
                wheel
            );
        }
    );


    group.position.set(
        x,
        0,
        z
    );


    group.userData.axis =
        axis;


    group.userData.direction =
        direction;


    group.userData.speed =
        7 +
        Math.random() * 9;


    group.userData.wheels =
        wheels;


    scene.add(
        group
    );


    trafficCars.push(
        group
    );
}


/* =========================================================
   TRAFFIC GENERATION
   ========================================================= */

for (
    let i = 0;
    i < 8;
    i++
) {

    createTrafficCar(
        -8,
        -120 + i * 32,
        "z",
        i % 2 === 0
            ? 1
            : -1
    );


    createTrafficCar(
        8,
        120 - i * 32,
        "z",
        i % 2 === 0
            ? -1
            : 1
    );
}


for (
    let i = 0;
    i < 8;
    i++
) {

    createTrafficCar(
        -120 + i * 32,
        -8,
        "x",
        i % 2 === 0
            ? 1
            : -1
    );


    createTrafficCar(
        120 - i * 32,
        8,
        "x",
        i % 2 === 0
            ? -1
            : 1
    );
}


/* =========================================================
   TRAFFIC UPDATE
   ========================================================= */

function updateTraffic(
    delta
) {

    trafficCars.forEach(
        (traffic) => {

            const axis =
                traffic.userData.axis;


            const direction =
                traffic.userData.direction;


            const speed =
                traffic.userData.speed;


            if (
                axis === "z"
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
                traffic.userData.wheels
            ) {

                traffic.userData.wheels.forEach(
                    (wheel) => {

                        wheel.rotation.x +=
                            speed *
                            delta *
                            1.5;
                    }
                );
            }
        }
    );
}


/* =========================================================
   END OF PART 2
   ========================================================= */
/* =========================================================
   NPC / PEDESTRIAN SYSTEM
   ========================================================= */

const npcs = [];


function createNPC(
    x,
    z,
    destinationX,
    destinationZ
) {

    const group =
        new THREE.Group();


    /* body */

    const bodyColors = [
        0x263238,
        0x37474f,
        0x5d4037,
        0x455a64,
        0x6a1b9a,
        0x1565c0,
        0x2e7d32,
        0xad1457
    ];


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.75,
                1.15,
                0.5
            ),

            makeStandardMaterial(

                bodyColors[
                    Math.floor(
                        Math.random() *
                        bodyColors.length
                    )
                ],

                0.9,
                0
            )
        );


    body.position.y =
        0.95;


    body.castShadow =
        true;


    group.add(
        body
    );


    /* head */

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.34,
                12,
                12
            ),

            makeStandardMaterial(
                0xb8794f,
                0.95,
                0
            )
        );


    head.position.y =
        1.8;


    head.castShadow =
        true;


    group.add(
        head
    );


    /* legs */

    const legMaterial =
        makeStandardMaterial(
            0x1a1a1a,
            0.95,
            0
        );


    for (
        const side of [-1, 1]
    ) {

        const leg =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.22,
                    0.9,
                    0.25
                ),

                legMaterial
            );


        leg.position.set(
            side * 0.2,
            0.42,
            0
        );


        leg.castShadow =
            true;


        group.add(
            leg
        );
    }


    group.position.set(
        x,
        0,
        z
    );


    group.userData.destination =
        new THREE.Vector3(
            destinationX,
            0,
            destinationZ
        );


    group.userData.speed =
        1.8 +
        Math.random() * 1.4;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    group.userData.walkTime =
        0;


    scene.add(
        group
    );


    npcs.push(
        group
    );
}


/* =========================================================
   NPC GENERATION
   ========================================================= */

const npcRoutes = [

    [-18, -55, -18, 55],

    [18, 55, 18, -55],

    [-55, -18, 55, -18],

    [55, 18, -55, 18],

    [-28, 25, 28, 25],

    [28, -25, -28, -25],

    [-90, -20, -90, 50],

    [90, 20, 90, -50]
];


npcRoutes.forEach(
    (route) => {

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const amount =
                i / 4;


            const x =
                THREE.MathUtils.lerp(
                    route[0],
                    route[2],
                    amount
                );


            const z =
                THREE.MathUtils.lerp(
                    route[1],
                    route[3],
                    amount
                );


            createNPC(
                x +
                    (Math.random() -
                        0.5) * 3,

                z +
                    (Math.random() -
                        0.5) * 3,

                route[2],

                route[3]
            );
        }
    }
);


/* =========================================================
   NPC UPDATE
   ========================================================= */

function updateNPCs(
    delta
) {

    npcs.forEach(
        (npc) => {

            const destination =
                npc.userData.destination;


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        destination,
                        npc.position
                    );


            direction.y =
                0;


            const distance =
                direction.length();


            if (
                distance < 2
            ) {

                /* choose reverse destination */

                const oldX =
                    destination.x;

                const oldZ =
                    destination.z;


                const start =
                    npc.position.clone();


                npc.userData.destination =
                    new THREE.Vector3(
                        start.x,
                        0,
                        start.z
                    );


                npc.position.x =
                    oldX;

                npc.position.z =
                    oldZ;


                return;
            }


            direction.normalize();


            npc.position.addScaledVector(
                direction,
                npc.userData.speed *
                    delta
            );


            const targetRotation =
                Math.atan2(
                    direction.x,
                    direction.z
                );


            npc.rotation.y =
                THREE.MathUtils.lerp(
                    npc.rotation.y,
                    targetRotation,
                    delta * 5
                );


            npc.userData.walkTime +=
                delta *
                8;


            /* simple walking movement */

            npc.children.forEach(
                (child, index) => {

                    if (
                        index >= 2
                    ) {

                        child.rotation.x =
                            Math.sin(
                                npc.userData.walkTime +
                                index
                            ) *
                            0.2;
                    }
                }
            );
        }
    );
}


/* =========================================================
   TRAFFIC LIGHT SYSTEM
   ========================================================= */

const trafficLights =
    [];


function createTrafficLight(
    x,
    z,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.14,
                0.18,
                5.5,
                8
            ),

            makeStandardMaterial(
                0x202020,
                0.8,
                0.2
            )
        );


    pole.position.y =
        2.75;


    group.add(
        pole
    );


    const housing =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.6,
                1.8,
                0.6
            ),

            makeStandardMaterial(
                0x111111,
                0.75,
                0.1
            )
        );


    housing.position.y =
        5.3;


    group.add(
        housing
    );


    const lights = [];


    const colors = [
        0xff2020,
        0xffb000,
        0x20ff60
    ];


    colors.forEach(
        (color, index) => {

            const light =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.17,
                        10,
                        10
                    ),

                    new THREE.MeshBasicMaterial({
                        color: color
                    })
                );


            light.position.set(
                0,
                4.72 +
                    index * 0.55,
                0.32
            );


            group.add(
                light
            );


            lights.push(
                light
            );
        }
    );


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    trafficLights.push({

        group,

        lights,

        timer:
            Math.random() * 12
    });
}


/* intersections */

createTrafficLight(
    -12,
    -12
);

createTrafficLight(
    12,
    12,
    Math.PI
);

createTrafficLight(
    -12,
    12,
    Math.PI / 2
);

createTrafficLight(
    12,
    -12,
    -Math.PI / 2
);


createTrafficLight(
    -70,
    -12
);

createTrafficLight(
    70,
    12,
    Math.PI
);

createTrafficLight(
    -70,
    12,
    Math.PI / 2
);

createTrafficLight(
    70,
    -12,
    -Math.PI / 2
);


/* =========================================================
   TRAFFIC LIGHT UPDATE
   ========================================================= */

function updateTrafficLights(
    delta
) {

    trafficLights.forEach(
        (signal) => {

            signal.timer +=
                delta;


            const cycle =
                signal.timer % 15;


            let activeIndex;


            if (
                cycle < 7
            ) {

                activeIndex =
                    2;

            } else if (
                cycle < 9
            ) {

                activeIndex =
                    1;

            } else {

                activeIndex =
                    0;
            }


            signal.lights.forEach(
                (light, index) => {

                    const active =
                        index ===
                        activeIndex;


                    light.scale.setScalar(
                        active
                            ? 1.4
                            : 0.85
                    );


                    light.material.opacity =
                        active
                            ? 1
                            : 0.35;
                }
            );
        }
    );
}


/* =========================================================
   CITY SIGNS
   ========================================================= */

const signObjects =
    [];


function createCitySign(
    x,
    z,
    title,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const board =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.5,
                1.8,
                0.18
            ),

            makeStandardMaterial(
                0x101318,
                0.45,
                0.35
            )
        );


    board.castShadow =
        true;


    group.add(
        board
    );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        512;

    canvas.height =
        180;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#111318";

    ctx.fillRect(
        0,
        0,
        512,
        180
    );


    ctx.strokeStyle =
        "#ff2b2b";

    ctx.lineWidth =
        8;

    ctx.strokeRect(
        8,
        8,
        496,
        164
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 58px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        title,
        256,
        90
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const signFace =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                4.1,
                1.45
            ),

            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            })
        );


    signFace.position.z =
        -0.11;


    group.add(
        signFace
    );


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.12,
                0.14,
                4,
                8
            ),

            makeStandardMaterial(
                0x252525,
                0.7,
                0.25
            )
        );


    pole.position.y =
        -2.4;


    group.add(
        pole
    );


    group.position.set(
        x,
        4,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    signObjects.push(
        group
    );
}


/* district signs */

createCitySign(
    -22,
    -28,
    "CENTRAL",
    0
);


createCitySign(
    22,
    28,
    "NORTH",
    Math.PI
);


createCitySign(
    -82,
    22,
    "WEST",
    Math.PI / 2
);


createCitySign(
    82,
    -22,
    "EAST",
    -Math.PI / 2
);


/* =========================================================
   BILLBOARD SYSTEM
   ========================================================= */

const billboards =
    [];


function createBillboard(
    x,
    z,
    width,
    height,
    text,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const frame =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width + 0.5,
                height + 0.5,
                0.35
            ),

            makeStandardMaterial(
                0x151515,
                0.55,
                0.4
            )
        );


    group.add(
        frame
    );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        768;

    canvas.height =
        384;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#08090c";


    ctx.fillRect(
        0,
        0,
        768,
        384
    );


    ctx.fillStyle =
        "#e52631";


    ctx.fillRect(
        0,
        0,
        768,
        45
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 56px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        text,
        384,
        200
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const screen =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                height
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        );


    screen.position.z =
        -0.2;


    group.add(
        screen
    );


    const support =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.3,
                6,
                0.3
            ),

            makeStandardMaterial(
                0x222222,
                0.75,
                0.2
            )
        );


    support.position.y =
        -height / 2 -
        3;


    group.add(
        support
    );


    group.position.set(
        x,
        13,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    billboards.push({

        group,

        canvas,

        ctx,

        texture,

        text,

        pulse:
            Math.random() *
            Math.PI * 2
    });
}


/* =========================================================
   BILLBOARDS
   ========================================================= */

createBillboard(
    -45,
    -30,
    9,
    4.5,
    "Y CITY",
    Math.PI / 2
);


createBillboard(
    45,
    30,
    9,
    4.5,
    "NEON DISTRICT",
    -Math.PI / 2
);


createBillboard(
    -85,
    -70,
    10,
    5,
    "RISING",
    0
);


createBillboard(
    85,
    70,
    10,
    5,
    "FUTURE",
    Math.PI
);


/* =========================================================
   BILLBOARD ANIMATION
   ========================================================= */

function updateBillboards(
    delta
) {

    billboards.forEach(
        (board) => {

            board.pulse +=
                delta;


            const brightness =
                0.75 +
                Math.sin(
                    board.pulse * 2
                ) * 0.18;


            board.group.children.forEach(
                (child) => {

                    if (
                        child.material &&
                        child.material.emissiveIntensity
                        !== undefined
                    ) {

                        child.material
                            .emissiveIntensity =
                            brightness;
                    }
                }
            );
        }
    );
}


/* =========================================================
   SHOP FRONTS
   ========================================================= */

const shops =
    [];


function createShop(
    x,
    z,
    width,
    depth,
    name,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const base =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                4.5,
                depth
            ),

            makeStandardMaterial(
                0x33363c,
                0.7,
                0.05
            )
        );


    base.position.y =
        2.25;


    base.castShadow =
        true;


    group.add(
        base
    );


    const glass =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width * 0.8,
                2,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x17364a,

                roughness:
                    0.1,

                metalness:
                    0.15,

                transparent:
                    true,

                opacity:
                    0.82
            })
        );


    glass.position.set(
        0,
        2.2,
        depth / 2 + 0.08
    );


    group.add(
        glass
    );


    const sign =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width * 0.82,
                0.7,
                0.14
            ),

            makeBasicMaterial(
                0xff2634
            )
        );


    sign.position.set(
        0,
        4,
        depth / 2 + 0.12
    );


    group.add(
        sign
    );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        512;

    canvas.height =
        128;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#ff2634";


    ctx.fillRect(
        0,
        0,
        512,
        128
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 52px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        name,
        256,
        64
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const signFace =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width * 0.76,
                0.52
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        );


    signFace.position.set(
        0,
        4,
        depth / 2 + 0.2
    );


    group.add(
        signFace
    );


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    shops.push({
        group,
        name
    });
}


/* =========================================================
   SHOPS AROUND CITY
   ========================================================= */

createShop(
    -25,
    -72,
    12,
    7,
    "CAFE",
    0
);


createShop(
    25,
    72,
    12,
    7,
    "MARKET",
    Math.PI
);


createShop(
    -72,
    25,
    12,
    7,
    "GARAGE",
    Math.PI / 2
);


createShop(
    72,
    -25,
    12,
    7,
    "ARCADE",
    -Math.PI / 2
);


/* =========================================================
   PARKING LIGHTS
   ========================================================= */

function createParkingLight(
    x,
    z
) {

    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.12,
                0.18,
                6,
                8
            ),

            makeStandardMaterial(
                0x222222,
                0.8,
                0.25
            )
        );


    pole.position.set(
        x,
        3,
        z
    );


    scene.add(
        pole
    );


    const light =
        new THREE.PointLight(
            0xddeeff,
            0,
            18
        );


    light.position.set(
        x,
        6,
        z
    );


    light.userData.parkingLight =
        true;


    scene.add(
        light
    );
}


createParkingLight(
    -108,
    45
);

createParkingLight(
    -90,
    45
);

createParkingLight(
    90,
    -45
);

createParkingLight(
    108,
    -45
);


/* =========================================================
   CITY WIND ANIMATION
   ========================================================= */

function updateEnvironmentAnimation(
    delta
) {

    const time =
        performance.now() *
        0.001;


    treeObjects.forEach(
        (tree) => {

            const sway =
                Math.sin(
                    time * 1.3 +
                    tree.phase
                ) *
                0.035;


            tree.group.rotation.z =
                sway;


            tree.group.rotation.x =
                Math.cos(
                    time * 0.9 +
                    tree.phase
                ) *
                0.02;
        }
    );
}


/* =========================================================
   WORLD STATUS HUD
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
        "24px";


    worldHUD.style.top =
        "24px";


    worldHUD.style.padding =
        "12px 16px";


    worldHUD.style.background =
        "rgba(0,0,0,0.72)";


    worldHUD.style.border =
        "1px solid rgba(255,255,255,0.18)";


    worldHUD.style.color =
        "#ffffff";


    worldHUD.style.fontFamily =
        "Arial, sans-serif";


    worldHUD.style.fontSize =
        "13px";


    worldHUD.style.lineHeight =
        "1.55";


    worldHUD.style.zIndex =
        "40";


    worldHUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        worldHUD
    );
}


/* =========================================================
   DISTRICT SYSTEM
   ========================================================= */

function getDistrict(
    x,
    z
) {

    const distance =
        Math.sqrt(
            x * x +
            z * z
        );


    if (
        distance < 28
    ) {

        return "CENTRAL";
    }


    if (
        z < -55
    ) {

        return "SOUTH DISTRICT";
    }


    if (
        z > 55
    ) {

        return "NORTH DISTRICT";
    }


    if (
        x < -55
    ) {

        return "WEST DISTRICT";
    }


    if (
        x > 55
    ) {

        return "EAST DISTRICT";
    }


    return "CITY OUTSKIRTS";
}


/* =========================================================
   WORLD HUD UPDATE
   ========================================================= */

function updateWorldHUD() {

    if (
        !worldHUD
    ) {

        return;
    }


    let x =
        0;

    let z =
        0;


    if (
        driving &&
        car
    ) {

        x =
            car.position.x;

        z =
            car.position.z;

    } else if (
        playerModel
    ) {

        x =
            playerModel.position.x;

        z =
            playerModel.position.z;
    }


    const hours =
        Math.floor(
            worldTime
        );


    const minutes =
        Math.floor(
            (worldTime -
                hours) *
                60
        );


    const timeText =
        String(hours)
            .padStart(
                2,
                "0"
            ) +
        ":" +
        String(minutes)
            .padStart(
                2,
                "0"
            );


    const weather =
        rainEnabled
            ? "RAIN"
            : "CLEAR";


    worldHUD.innerHTML =

        "📍 " +
        getDistrict(
            x,
            z
        ) +

        "<br>🕒 " +
        timeText +

        "<br>🌦️ " +
        weather +

        "<br>💰 ₹" +
        money;
}


/* =========================================================
   END OF PART 3
   ========================================================= */
/* =========================================================
   COLLECTIBLE CITY SHARDS
   ========================================================= */

const cityShards = [];


/* shard material */

const shardMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x31d9ff,

        emissive:
            0x087fa5,

        emissiveIntensity:
            2.2,

        metalness:
            0.4,

        roughness:
            0.22
    });


function createCityShard(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    /* crystal */

    const crystal =
        new THREE.Mesh(

            new THREE.OctahedronGeometry(
                0.75,
                0
            ),

            shardMaterial
        );


    crystal.castShadow =
        true;


    group.add(
        crystal
    );


    /* outer ring */

    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                1.15,
                0.06,
                10,
                32
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x55eaff
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    /* glow */

    const glow =
        new THREE.PointLight(
            0x27dfff,
            1.7,
            10
        );


    glow.position.y =
        0.5;


    group.add(
        glow
    );


    group.position.set(
        x,
        y,
        z
    );


    group.userData.collected =
        false;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    scene.add(
        group
    );


    cityShards.push(
        group
    );
}


/* =========================================================
   SHARD LOCATIONS
   ========================================================= */

const shardPositions = [

    [-28, 2.0, -28],

    [28, 2.0, -28],

    [-28, 2.0, 28],

    [28, 2.0, 28],

    [-62, 2.0, -62],

    [62, 2.0, -62],

    [-62, 2.0, 62],

    [62, 2.0, 62],

    [-112, 2.0, 0],

    [112, 2.0, 0],

    [0, 2.0, -112],

    [0, 2.0, 112]
];


shardPositions.forEach(
    (position) => {

        createCityShard(
            position[0],
            position[1],
            position[2]
        );
    }
);


/* =========================================================
   SHARD UPDATE
   ========================================================= */

function updateCityShards(
    delta
) {

    const time =
        performance.now() *
        0.001;


    cityShards.forEach(
        (shard) => {

            if (
                shard.userData.collected
            ) {

                return;
            }


            shard.rotation.y +=
                delta * 1.8;


            shard.rotation.z =
                Math.sin(
                    time * 1.7 +
                    shard.userData.phase
                ) *
                0.18;


            shard.position.y =
                2 +
                Math.sin(
                    time * 2 +
                    shard.userData.phase
                ) *
                0.35;


            let target =
                null;


            if (
                driving &&
                car
            ) {

                target =
                    car.position;

            } else if (
                playerModel
            ) {

                target =
                    playerModel.position;
            }


            if (
                !target
            ) {

                return;
            }


            const distance =
                target.distanceTo(
                    shard.position
                );


            if (
                distance < 3
            ) {

                collectCityShard(
                    shard
                );
            }
        }
    );
}


/* =========================================================
   COLLECT SHARD
   ========================================================= */

function collectCityShard(
    shard
) {

    if (
        shard.userData.collected
    ) {

        return;
    }


    shard.userData.collected =
        true;


    shard.visible =
        false;


    money +=
        100;


    showWorldMessage(
        "CITY SHARD COLLECTED  +₹100"
    );
}


/* =========================================================
   WORLD MESSAGE
   ========================================================= */

let worldMessage =
    document.getElementById(
        "world-message"
    );


if (
    !worldMessage
) {

    worldMessage =
        document.createElement(
            "div"
        );


    worldMessage.id =
        "world-message";


    worldMessage.style.position =
        "fixed";


    worldMessage.style.left =
        "50%";


    worldMessage.style.bottom =
        "18%";


    worldMessage.style.transform =
        "translateX(-50%)";


    worldMessage.style.padding =
        "14px 24px";


    worldMessage.style.background =
        "rgba(0,0,0,0.8)";


    worldMessage.style.border =
        "1px solid rgba(255,40,40,0.8)";


    worldMessage.style.color =
        "#ffffff";


    worldMessage.style.fontFamily =
        "Arial, sans-serif";


    worldMessage.style.fontWeight =
        "bold";


    worldMessage.style.fontSize =
        "16px";


    worldMessage.style.letterSpacing =
        "1px";


    worldMessage.style.zIndex =
        "100";


    worldMessage.style.pointerEvents =
        "none";


    worldMessage.style.display =
        "none";


    document.body.appendChild(
        worldMessage
    );
}


let worldMessageTimer =
    0;


function showWorldMessage(
    message
) {

    if (
        !worldMessage
    ) {

        return;
    }


    worldMessage.textContent =
        message;


    worldMessage.style.display =
        "block";


    worldMessageTimer =
        2.5;
}


function updateWorldMessage(
    delta
) {

    if (
        worldMessageTimer <= 0
    ) {

        return;
    }


    worldMessageTimer -=
        delta;


    if (
        worldMessageTimer <= 0
    ) {

        worldMessage.style.display =
            "none";
    }
}


/* =========================================================
   RAIN SYSTEM
   ========================================================= */

const rainCount =
    1400;


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
        (Math.random() - 0.5) *
        300;


    rainPositions[
        i * 3 + 1
    ] =
        Math.random() *
        100;


    rainPositions[
        i * 3 + 2
    ] =
        (Math.random() - 0.5) *
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


const rainMaterial =
    new THREE.PointsMaterial({

        color:
            0xbddcff,

        size:
            0.17,

        transparent:
            true,

        opacity:
            0.72,

        depthWrite:
            false
    });


const rain =
    new THREE.Points(

        rainGeometry,

        rainMaterial
    );


rain.visible =
    false;


scene.add(
    rain
);


/* =========================================================
   RAIN PUDDLES
   ========================================================= */

const puddles =
    [];


function createPuddle(
    x,
    z,
    scale = 1
) {

    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x182a34,

            roughness:
                0.08,

            metalness:
                0.7,

            transparent:
                true,

            opacity:
                0.72
        });


    const puddle =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                4 *
                    scale,
                28
            ),

            material
        );


    puddle.rotation.x =
        -Math.PI / 2;


    puddle.position.set(
        x,
        0.08,
        z
    );


    puddle.scale.y =
        0.45;


    puddle.visible =
        false;


    scene.add(
        puddle
    );


    puddles.push(
        puddle
    );
}


/* puddle locations */

createPuddle(
    -20,
    -18,
    1.1
);

createPuddle(
    20,
    -18,
    0.9
);

createPuddle(
    -25,
    25,
    1.2
);

createPuddle(
    25,
    25,
    0.85
);

createPuddle(
    -60,
    12,
    1
);

createPuddle(
    60,
    -12,
    1.15
);

createPuddle(
    -95,
    -42,
    1.25
);

createPuddle(
    95,
    42,
    1.1
);

createPuddle(
    0,
    -90,
    1.3
);

createPuddle(
    0,
    90,
    1.15
);


/* =========================================================
   UPDATE RAIN + PUDDLES
   ========================================================= */

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
            2.0 *
            delta;


        positions[index + 1] -=
            38 *
            delta;


        positions[index + 2] +=
            1.0 *
            delta;


        if (
            positions[index + 1] <
            0
        ) {

            positions[index] =
                (Math.random() - 0.5) *
                300;


            positions[index + 1] =
                80 +
                Math.random() *
                30;


            positions[index + 2] =
                (Math.random() - 0.5) *
                300;
        }
    }


    rainGeometry
        .attributes
        .position
        .needsUpdate =
        true;
}


/* =========================================================
   TOGGLE RAIN
   ========================================================= */

function setRainEnabled(
    enabled
) {

    rainEnabled =
        enabled;


    rain.visible =
        enabled;


    puddles.forEach(
        (puddle) => {

            puddle.visible =
                enabled;
        }
    );


    if (
        enabled
    ) {

        showWorldMessage(
            "RAIN STARTED"
        );

    } else {

        showWorldMessage(
            "RAIN STOPPED"
        );
    }
}


/* =========================================================
   SKY LIGHTNING
   ========================================================= */

let lightningTimer =
    0;


let lightningFlash =
    0;


function updateWeatherEffects(
    delta
) {

    if (
        !rainEnabled
    ) {

        lightningTimer = 0;

        lightningFlash = 0;

        return;
    }


    lightningTimer -=
        delta;


    if (
        lightningTimer <= 0
    ) {

        lightningTimer =
            8 +
            Math.random() * 15;


        if (
            Math.random() >
            0.45
        ) {

            lightningFlash =
                0.2;
        }
    }


    if (
        lightningFlash > 0
    ) {

        lightningFlash -=
            delta;


        const oldIntensity =
            ambientLight.intensity;


        ambientLight.intensity =
            2.4;


        setTimeout(
            () => {

                if (
                    !rainEnabled
                ) {

                    return;
                }


                ambientLight.intensity =
                    oldIntensity;
            },

            70
        );
    }
}


/* =========================================================
   CITY DRONES
   ========================================================= */

const cityDrones =
    [];


function createCityDrone(
    x,
    y,
    z
) {

    const drone =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2,
                0.45,
                1.3
            ),

            makeStandardMaterial(
                0x25282d,
                0.4,
                0.5
            )
        );


    drone.add(
        body
    );


    const armMaterial =
        makeStandardMaterial(
            0x1a1a1a,
            0.55,
            0.3
        );


    for (
        const side of [-1, 1]
    ) {

        const arm =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.4,
                    0.12,
                    0.12
                ),

                armMaterial
            );


        arm.position.x =
            side * 1;


        drone.add(
            arm
        );


        const rotor =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.42,
                    0.42,
                    0.06,
                    20
                ),

                makeBasicMaterial(
                    0xbadfff
                )
            );


        rotor.position.set(
            side * 1.15,
            0.25,
            0
        );


        drone.add(
            rotor
        );


        const rotorBack =
            rotor.clone();


        rotorBack.position.z =
            0.45;


        drone.add(
            rotorBack
        );
    }


    const light =
        new THREE.PointLight(
            0x44ddff,
            1.5,
            10
        );


    light.position.y =
        -0.2;


    drone.add(
        light
    );


    drone.position.set(
        x,
        y,
        z
    );


    drone.userData.baseY =
        y;


    drone.userData.phase =
        Math.random() *
        Math.PI * 2;


    drone.userData.radius =
        20 +
        Math.random() * 30;


    drone.userData.speed =
        0.2 +
        Math.random() * 0.25;


    drone.userData.center =
        new THREE.Vector3(
            x,
            y,
            z
        );


    scene.add(
        drone
    );


    cityDrones.push(
        drone
    );
}


/* =========================================================
   DRONE LOCATIONS
   ========================================================= */

createCityDrone(
    -55,
    28,
    -55
);

createCityDrone(
    55,
    36,
    -45
);

createCityDrone(
    -75,
    32,
    65
);

createCityDrone(
    75,
    30,
    60
);


/* =========================================================
   DRONE UPDATE
   ========================================================= */

function updateCityDrones(
    delta
) {

    const time =
        performance.now() *
        0.001;


    cityDrones.forEach(
        (drone) => {

            const phase =
                drone.userData.phase;


            const radius =
                drone.userData.radius;


            const speed =
                drone.userData.speed;


            const center =
                drone.userData.center;


            const angle =
                time *
                speed +
                phase;


            drone.position.x =
                center.x +
                Math.cos(angle) *
                radius;


            drone.position.z =
                center.z +
                Math.sin(angle) *
                radius;


            drone.position.y =
                drone.userData.baseY +
                Math.sin(
                    time * 1.5 +
                    phase
                ) *
                3;


            drone.rotation.y =
                -angle +
                Math.PI / 2;
        }
    );
}


/* =========================================================
   CITY EVENT SYSTEM
   ========================================================= */

const cityEvents = {

    active:
        false,

    type:
        "",

    timer:
        0,

    position:
        new THREE.Vector3(),

    marker:
        null
};


/* =========================================================
   EVENT MARKER
   ========================================================= */

function createEventMarker() {

    const group =
        new THREE.Group();


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                4,
                0.18,
                12,
                40
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xff3030
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    const pillar =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.12,
                0.12,
                5,
                12
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xff3030,

                transparent:
                    true,

                opacity:
                    0.8
            })
        );


    pillar.position.y =
        2.5;


    group.add(
        pillar
    );


    group.visible =
        false;


    scene.add(
        group
    );


    cityEvents.marker =
        group;
}


createEventMarker();


/* =========================================================
   START RANDOM CITY EVENT
   ========================================================= */

function startRandomCityEvent() {

    if (
        cityEvents.active
    ) {

        return;
    }


    const eventTypes = [

        "CITY ALERT",

        "SUPPLY DROP",

        "NEON RACE",

        "SECURITY EVENT"
    ];


    const type =
        eventTypes[
            Math.floor(
                Math.random() *
                eventTypes.length
            )
        ];


    const x =
        THREE.MathUtils.randFloat(
            -110,
            110
        );


    const z =
        THREE.MathUtils.randFloat(
            -110,
            110
        );


    cityEvents.active =
        true;


    cityEvents.type =
        type;


    cityEvents.timer =
        35;


    cityEvents.position.set(
        x,
        0,
        z
    );


    cityEvents.marker.position.set(
        x,
        0,
        z
    );


    cityEvents.marker.visible =
        true;


    showWorldMessage(
        type +
        " STARTED"
    );
}


/* =========================================================
   CITY EVENT UPDATE
   ========================================================= */

function updateCityEvent(
    delta
) {

    if (
        !cityEvents.active
    ) {

        return;
    }


    cityEvents.timer -=
        delta;


    const time =
        performance.now() *
        0.001;


    if (
        cityEvents.marker
    ) {

        cityEvents.marker.rotation.y +=
            delta * 2;


        cityEvents.marker.children[1]
            .scale.y =
            0.75 +
            Math.sin(
                time * 4
            ) *
            0.3;
    }


    let target =
        null;


    if (
        driving &&
        car
    ) {

        target =
            car.position;

    } else if (
        playerModel
    ) {

        target =
            playerModel.position;
    }


    if (
        target
    ) {

        const distance =
            target.distanceTo(
                cityEvents.position
            );


        if (
            distance < 7
        ) {

            cityEvents.active =
                false;


            cityEvents.marker.visible =
                false;


            money +=
                250;


            showWorldMessage(
                "CITY EVENT COMPLETE  +₹250"
            );


            return;
        }
    }


    if (
        cityEvents.timer <=
        0
    ) {

        cityEvents.active =
            false;


        cityEvents.marker.visible =
            false;


        showWorldMessage(
            "CITY EVENT EXPIRED"
        );
    }
}


/* =========================================================
   EVENT TIMER
   ========================================================= */

let nextEventTimer =
    18;


function updateEventSpawner(
    delta
) {

    if (
        cityEvents.active
    ) {

        return;
    }


    nextEventTimer -=
        delta;


    if (
        nextEventTimer <= 0
    ) {

        nextEventTimer =
            35 +
            Math.random() * 35;


        startRandomCityEvent();
    }
}


/* =========================================================
   NIGHT CITY WINDOWS
   ========================================================= */

const windowMeshes =
    [];


scene.traverse(
    (object) => {

        if (
            object.isMesh &&
            object.material &&
            object.geometry
        ) {

            const position =
                object.position;


            if (
                position.y > 3 &&
                position.y < 80 &&
                position.x !== 0 &&
                position.z !== 0
            ) {

                const material =
                    object.material;


                if (
                    material.color
                ) {

                    const r =
                        material.color.r;


                    const g =
                        material.color.g;


                    const b =
                        material.color.b;


                    if (
                        b >
                            r * 0.8 &&
                        g >
                            r * 0.75
                    ) {

                        windowMeshes.push(
                            object
                        );
                    }
                }
            }
        }
    }
);


/* =========================================================
   ADD SOME EXTRA WINDOWS
   ========================================================= */

function createBuildingWindow(
    x,
    y,
    z,
    rotation = 0
) {

    const window =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.1,
                1.2,
                0.08
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0xf8cc65,

                transparent:
                    true,

                opacity:
                    0.75
            })
        );


    window.position.set(
        x,
        y,
        z
    );


    window.rotation.y =
        rotation;


    scene.add(
        window
    );


    windowMeshes.push(
        window
    );
}


/* extra glowing windows */

for (
    let i = 0;
    i < 30;
    i++
) {

    const side =
        i % 2 === 0
            ? -1
            : 1;


    const x =
        side *
        (
            30 +
            Math.random() * 55
        );


    const z =
        THREE.MathUtils.randFloat(
            -120,
            120
        );


    const y =
        8 +
        Math.floor(
            Math.random() * 5
        ) * 5;


    createBuildingWindow(
        x,
        y,
        z,
        side === 1
            ? Math.PI / 2
            : -Math.PI / 2
    );
}


/* =========================================================
   WINDOW LIGHT UPDATE
   ========================================================= */

function updateBuildingWindows() {

    const night =
        worldTime >= 18 ||
        worldTime < 6;


    windowMeshes.forEach(
        (window) => {

            if (
                !window.material
            ) {

                return;
            }


            window.material.opacity =
                night
                    ? 0.82
                    : 0.08;
        }
    );
}


/* =========================================================
   END OF PART 4
   ========================================================= */
/* =========================================================
   4D REALITY SYSTEM
   =========================================================

   REALITY LAYERS:

   -2 = DEEP 4D
   -1 = DARK CITY
    0 = NORMAL CITY
   +1 = FUTURE CITY
   +2 = HIDDEN DIMENSION

   Q = previous reality
   Z = next reality
   E = use portal
   ========================================================= */


/* =========================================================
   REALITY STATE
   ========================================================= */

let playerW =
    0;

let targetW =
    0;

let realityIndex =
    0;


let realityTransition =
    0;

let realityTransitionActive =
    false;


const realityTransitionDuration =
    1.2;


/* =========================================================
   REALITY OBJECT STORAGE
   ========================================================= */

const realityObjects =
    [];


function addRealityObject(
    object,
    layer,
    alwaysVisible = false
) {

    object.userData.realityLayer =
        layer;

    object.userData.alwaysVisible =
        alwaysVisible;

    realityObjects.push(
        object
    );

    scene.add(
        object
    );


    return object;
}


/* =========================================================
   REALITY VISIBILITY
   ========================================================= */

function updateRealityLayers(
    delta
) {

    playerW =
        THREE.MathUtils.lerp(
            playerW,
            targetW,
            Math.min(
                delta * 4,
                1
            )
        );


    realityIndex =
        Math.round(
            playerW
        );


    realityObjects.forEach(
        (object) => {

            if (
                object.userData.alwaysVisible
            ) {

                object.visible =
                    true;

                return;
            }


            const layer =
                object.userData.realityLayer;


            if (
                layer ===
                realityIndex
            ) {

                object.visible =
                    true;

            } else {

                object.visible =
                    false;
            }
        }
    );


    updateRealityAtmosphere();
}


/* =========================================================
   REALITY ATMOSPHERE
   ========================================================= */

const normalFogColor =
    new THREE.Color(
        0x87ceeb
    );


const darkFogColor =
    new THREE.Color(
        0x120f22
    );


const futureFogColor =
    new THREE.Color(
        0x162b3d
    );


const deepFogColor =
    new THREE.Color(
        0x05000a
    );


const hiddenFogColor =
    new THREE.Color(
        0x10102a
    );


function updateRealityAtmosphere() {

    if (
        !scene.fog
    ) {

        return;
    }


    let targetColor =
        normalFogColor;


    let near =
        120;

    let far =
        420;


    if (
        realityIndex ===
        -2
    ) {

        targetColor =
            deepFogColor;

        near =
            35;

        far =
            190;

    } else if (
        realityIndex ===
        -1
    ) {

        targetColor =
            darkFogColor;

        near =
            70;

        far =
            280;

    } else if (
        realityIndex ===
        0
    ) {

        targetColor =
            normalFogColor;

        near =
            120;

        far =
            420;

    } else if (
        realityIndex ===
        1
    ) {

        targetColor =
            futureFogColor;

        near =
            90;

        far =
            360;

    } else if (
        realityIndex ===
        2
    ) {

        targetColor =
            hiddenFogColor;

        near =
            55;

        far =
            260;
    }


    scene.fog.color.lerp(
        targetColor,
        0.045
    );


    scene.fog.near =
        THREE.MathUtils.lerp(
            scene.fog.near,
            near,
            0.04
        );


    scene.fog.far =
        THREE.MathUtils.lerp(
            scene.fog.far,
            far,
            0.04
        );
}


/* =========================================================
   REALITY HUD
   ========================================================= */

let realityHUD =
    document.getElementById(
        "reality-hud"
    );


if (
    !realityHUD
) {

    realityHUD =
        document.createElement(
            "div"
        );


    realityHUD.id =
        "reality-hud";


    realityHUD.style.position =
        "fixed";


    realityHUD.style.top =
        "50%";


    realityHUD.style.left =
        "22px";


    realityHUD.style.transform =
        "translateY(-50%)";


    realityHUD.style.padding =
        "14px 18px";


    realityHUD.style.background =
        "rgba(0,0,0,0.72)";


    realityHUD.style.border =
        "1px solid rgba(80,220,255,0.45)";


    realityHUD.style.color =
        "#ffffff";


    realityHUD.style.fontFamily =
        "Arial, sans-serif";


    realityHUD.style.fontSize =
        "13px";


    realityHUD.style.lineHeight =
        "1.55";


    realityHUD.style.zIndex =
        "45";


    realityHUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        realityHUD
    );
}


function getRealityName(
    index
) {

    if (
        index ===
        -2
    ) {

        return "DEEP 4D";
    }


    if (
        index ===
        -1
    ) {

        return "DARK CITY";
    }


    if (
        index ===
        0
    ) {

        return "NORMAL CITY";
    }


    if (
        index ===
        1
    ) {

        return "FUTURE CITY";
    }


    if (
        index ===
        2
    ) {

        return "HIDDEN DIMENSION";
    }


    return "UNKNOWN";
}


function updateRealityHUD() {

    if (
        !realityHUD
    ) {

        return;
    }


    realityHUD.innerHTML =

        "<b>REALITY</b><br>" +

        getRealityName(
            realityIndex
        ) +

        "<br><br>" +

        "W = " +
        realityIndex +

        "<br>" +

        "Q / Z = SHIFT" +

        "<br>" +

        "E = PORTAL";
}


/* =========================================================
   REALITY SHIFT
   ========================================================= */

function shiftReality(
    amount
) {

    const newTarget =
        THREE.MathUtils.clamp(
            targetW + amount,
            -2,
            2
        );


    if (
        newTarget ===
        targetW
    ) {

        return;
    }


    targetW =
        newTarget;


    startRealityTransition();


    showWorldMessage(
        "REALITY SHIFT → " +
        getRealityName(
            newTarget
        )
    );
}


/* =========================================================
   REALITY TRANSITION OVERLAY
   ========================================================= */

let realityOverlay =
    document.getElementById(
        "reality-overlay"
    );


if (
    !realityOverlay
) {

    realityOverlay =
        document.createElement(
            "div"
        );


    realityOverlay.id =
        "reality-overlay";


    realityOverlay.style.position =
        "fixed";


    realityOverlay.style.inset =
        "0";


    realityOverlay.style.background =
        "radial-gradient(circle, rgba(90,220,255,0.35), rgba(0,0,0,0.95))";


    realityOverlay.style.opacity =
        "0";


    realityOverlay.style.pointerEvents =
        "none";


    realityOverlay.style.zIndex =
        "90";


    document.body.appendChild(
        realityOverlay
    );
}


function startRealityTransition() {

    realityTransitionActive =
        true;

    realityTransition =
        realityTransitionDuration;
}


function updateRealityTransition(
    delta
) {

    if (
        !realityTransitionActive
    ) {

        return;
    }


    realityTransition -=
        delta;


    const progress =
        Math.max(
            0,
            realityTransition /
                realityTransitionDuration
        );


    const pulse =
        Math.sin(
            (1 -
                progress) *
                Math.PI
        );


    realityOverlay.style.opacity =
        String(
            pulse * 0.78
        );


    if (
        realityTransition <=
        0
    ) {

        realityTransitionActive =
            false;


        realityOverlay.style.opacity =
            "0";
    }
}


/* =========================================================
   REALITY SHIFT COLORS / LIGHTING
   ========================================================= */

function updateRealityLighting() {

    if (
        realityIndex ===
        1
    ) {

        ambientLight.color.set(
            0x9acbff
        );

        fillLight.color.set(
            0x55cfff
        );


    } else if (
        realityIndex ===
        -1
    ) {

        ambientLight.color.set(
            0x5f4f75
        );

        fillLight.color.set(
            0x54446e
        );


    } else if (
        realityIndex ===
        -2
    ) {

        ambientLight.color.set(
            0x352c52
        );

        fillLight.color.set(
            0x332250
        );


    } else if (
        realityIndex ===
        2
    ) {

        ambientLight.color.set(
            0x6777ff
        );

        fillLight.color.set(
            0x5555bb
        );


    } else {

        ambientLight.color.set(
            0xffffff
        );

        fillLight.color.set(
            0x6688aa
        );
    }
}


/* =========================================================
   FUTURE CITY SYSTEM
   ========================================================= */

const futureEffects =
    [];


/* =========================================================
   FUTURE PILLAR
   ========================================================= */

function createFuturePillar(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pillar =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.8,
                1.2,
                12,
                12
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x168aff,

                emissive:
                    0x0066ff,

                emissiveIntensity:
                    2.5,

                metalness:
                    0.8,

                roughness:
                    0.2
            })
        );


    pillar.castShadow =
        true;


    group.add(
        pillar
    );


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                1.7,
                0.12,
                12,
                36
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x38eaff
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    ring.position.y =
        4;


    group.add(
        ring
    );


    const topLight =
        new THREE.PointLight(
            0x35ddff,
            2.5,
            18
        );


    topLight.position.y =
        6;


    group.add(
        topLight
    );


    group.position.set(
        x,
        6,
        z
    );


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    group.userData.realityLayer =
        1;


    futureEffects.push(
        group
    );


    addRealityObject(
        group,
        1
    );
}


/* =========================================================
   FUTURE CITY PILLARS
   ========================================================= */

createFuturePillar(
    -45,
    -45
);

createFuturePillar(
    45,
    -45
);

createFuturePillar(
    -45,
    45
);

createFuturePillar(
    45,
    45
);

createFuturePillar(
    -90,
    0
);

createFuturePillar(
    90,
    0
);


/* =========================================================
   FUTURE FLOATING PLATFORM
   ========================================================= */

const futurePlatforms =
    [];


function createFuturePlatform(
    x,
    y,
    z,
    width = 7,
    depth = 7
) {

    const group =
        new THREE.Group();


    const platform =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                0.6,
                depth
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x182c4d,

                emissive:
                    0x073d75,

                emissiveIntensity:
                    1.8,

                metalness:
                    0.65,

                roughness:
                    0.25
            })
        );


    group.add(
        platform
    );


    const edge =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width + 0.15,
                0.12,
                depth + 0.15
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x27ddff
            })
        );


    edge.position.y =
        0.35;


    group.add(
        edge
    );


    group.position.set(
        x,
        y,
        z
    );


    group.userData.baseY =
        y;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    group.userData.platformWidth =
        width;


    group.userData.platformDepth =
        depth;


    futurePlatforms.push(
        group
    );


    futureEffects.push(
        group
    );


    addRealityObject(
        group,
        1
    );
}


/* platforms */

createFuturePlatform(
    -18,
    6,
    -55
);

createFuturePlatform(
    18,
    10,
    -75
);

createFuturePlatform(
    -32,
    14,
    50
);

createFuturePlatform(
    35,
    8,
    65
);

createFuturePlatform(
    0,
    18,
    95
);


/* =========================================================
   FUTURE ENERGY RINGS
   ========================================================= */

function createFutureEnergyRing(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    3 +
                        i * 1.2,
                    0.09,
                    12,
                    48
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        i === 0
                            ? 0x38eaff
                            : i === 1
                                ? 0x6c6cff
                                : 0x37ffbc
                })
            );


        ring.rotation.x =
            Math.PI / 2;


        ring.rotation.z =
            i *
            0.35;


        group.add(
            ring
        );
    }


    group.position.set(
        x,
        y,
        z
    );


    group.userData.phase =
        Math.random() *
        Math.PI *
        2;


    futureEffects.push(
        group
    );


    addRealityObject(
        group,
        1
    );
}


createFutureEnergyRing(
    0,
    12,
    -55
);

createFutureEnergyRing(
    0,
    18,
    55
);

createFutureEnergyRing(
    -65,
    10,
    0
);

createFutureEnergyRing(
    65,
    10,
    0
);


/* =========================================================
   FUTURE BEAMS
   ========================================================= */

function createFutureBeam(
    x,
    z
) {

    const beam =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.08,
                0.08,
                35,
                8
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0x5eeaff,

                transparent:
                    true,

                opacity:
                    0.75
            })
        );


    beam.position.set(
        x,
        17.5,
        z
    );


    addRealityObject(
        beam,
        1
    );


    futureEffects.push(
        beam
    );
}


createFutureBeam(
    -100,
    -100
);

createFutureBeam(
    100,
    -100
);

createFutureBeam(
    -100,
    100
);

createFutureBeam(
    100,
    100
);


/* =========================================================
   UPDATE FUTURE CITY
   ========================================================= */

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
                    time * 1.2 +
                    platform.userData.phase
                ) *
                1.2;


            platform.rotation.y =
                Math.sin(
                    time * 0.4 +
                    platform.userData.phase
                ) *
                0.04;
        }
    );


    futureEffects.forEach(
        (object) => {

            if (
                object.userData &&
                object.userData.phase !==
                    undefined
            ) {

                object.rotation.y +=
                    delta *
                    0.35;


                object.position.x +=
                    Math.sin(
                        time * 0.5 +
                        object.userData.phase
                    ) *
                    delta *
                    0.12;
            }
        }
    );
}


/* =========================================================
   FUTURE PLATFORM COLLISION
   ========================================================= */

function checkFuturePlatformLanding(
    delta
) {

    if (
        !playerModel
    ) {

        return;
    }


    if (
        realityIndex !==
        1
    ) {

        return;
    }


    if (
        playerVerticalVelocity >
        0
    ) {

        return;
    }


    const playerX =
        playerModel.position.x;


    const playerZ =
        playerModel.position.z;


    const playerY =
        playerModel.position.y;


    futurePlatforms.forEach(
        (platform) => {

            if (
                !platform.visible
            ) {

                return;
            }


            const platformX =
                platform.position.x;


            const platformZ =
                platform.position.z;


            const platformY =
                platform.position.y;


            const halfWidth =
                (
                    platform.userData
                        .platformWidth
                ) / 2;


            const halfDepth =
                (
                    platform.userData
                        .platformDepth
                ) / 2;


            const insideX =
                Math.abs(
                    playerX -
                    platformX
                ) <
                halfWidth;


            const insideZ =
                Math.abs(
                    playerZ -
                    platformZ
                ) <
                halfDepth;


            if (
                insideX &&
                insideZ &&
                playerY >=
                    platformY - 2 &&
                playerY <=
                    platformY + 2 &&
                playerVerticalVelocity <=
                    0
            ) {

                playerModel.position.y =
                    platformY +
                    0.7;


                playerVerticalVelocity =
                    0;


                playerGrounded =
                    true;
            }
        }
    );
}


/* =========================================================
   DARK CITY REALITY
   ========================================================= */

function createDarkRealityObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const pillar =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2,
                10,
                2
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x160c1f,

                emissive:
                    0x4d003f,

                emissiveIntensity:
                    1.8,

                roughness:
                    0.3
            })
        );


    group.add(
        pillar
    );


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                2,
                0.12,
                12,
                32
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xff2388
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    ring.position.y =
        4;


    group.add(
        ring
    );


    group.position.set(
        x,
        y,
        z
    );


    addRealityObject(
        group,
        -1
    );
}


/* dark reality */

createDarkRealityObject(
    -50,
    5,
    -20
);

createDarkRealityObject(
    50,
    5,
    20
);

createDarkRealityObject(
    20,
    5,
    -50
);

createDarkRealityObject(
    -20,
    5,
    50
);


/* =========================================================
   DEEP 4D OBJECTS
   ========================================================= */

function createDeep4DObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const core =
        new THREE.Mesh(

            new THREE.IcosahedronGeometry(
                2.2,
                1
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x5b00ff,

                emissive:
                    0x2900a8,

                emissiveIntensity:
                    2.8,

                metalness:
                    0.8,

                roughness:
                    0.2
            })
        );


    group.add(
        core
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    3 +
                        i * 0.8,
                    0.07,
                    8,
                    40
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        i % 2 === 0
                            ? 0x8b55ff
                            : 0xff33cc
                })
            );


        ring.rotation.x =
            Math.PI / 2;


        ring.rotation.z =
            i *
            0.5;


        group.add(
            ring
        );
    }


    group.position.set(
        x,
        y,
        z
    );


    addRealityObject(
        group,
        -2
    );
}


/* deep objects */

createDeep4DObject(
    -70,
    5,
    -70
);

createDeep4DObject(
    70,
    5,
    70
);

createDeep4DObject(
    -70,
    5,
    70
);

createDeep4DObject(
    70,
    5,
    -70
);


/* =========================================================
   HIDDEN DIMENSION
   ========================================================= */

function createHiddenDimensionObject(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const cube =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3,
                3,
                3
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x2626b8,

                emissive:
                    0x11117d,

                emissiveIntensity:
                    2,

                metalness:
                    0.85,

                roughness:
                    0.2
            })
        );


    group.add(
        cube
    );


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                3.2,
                0.1,
                10,
                36
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x6c8fff
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    group.position.set(
        x,
        y,
        z
    );


    addRealityObject(
        group,
        2
    );
}


createHiddenDimensionObject(
    -55,
    5,
    -90
);

createHiddenDimensionObject(
    55,
    5,
    90
);

createHiddenDimensionObject(
    -90,
    5,
    55
);

createHiddenDimensionObject(
    90,
    5,
    -55
);


/* =========================================================
   PORTAL SYSTEM
   ========================================================= */

const dimensionPortals =
    [];


function createDimensionPortal(
    x,
    y,
    z,
    targetReality,
    label
) {

    const group =
        new THREE.Group();


    /* outer ring */

    const outer =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                3.2,
                0.22,
                16,
                64
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x30dfff
            })
        );


    group.add(
        outer
    );


    /* inner ring */

    const inner =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                2.5,
                0.1,
                12,
                48
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xff2d67
            })
        );


    group.add(
        inner
    );


    /* portal surface */

    const portalSurface =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                2.35,
                32
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0x141b45,

                transparent:
                    true,

                opacity:
                    0.72,

                side:
                    THREE.DoubleSide
            })
        );


    portalSurface.rotation.y =
        Math.PI / 2;


    group.add(
        portalSurface
    );


    /* center */

    const center =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.45,
                16,
                16
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xffffff
            })
        );


    center.position.z =
        0.25;


    group.add(
        center
    );


    group.position.set(
        x,
        y,
        z
    );


    group.userData.targetReality =
        targetReality;


    group.userData.label =
        label;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    dimensionPortals.push(
        group
    );


    /*
       Portals are visible in every reality.
       They act as gates into another W layer.
    */

    addRealityObject(
        group,
        0,
        true
    );
}


/* =========================================================
   PORTAL LOCATIONS
   ========================================================= */

createDimensionPortal(
    -50,
    4,
    0,
    1,
    "FUTURE CITY"
);

createDimensionPortal(
    50,
    4,
    0,
    -1,
    "DARK CITY"
);

createDimensionPortal(
    0,
    4,
    -50,
    -2,
    "DEEP 4D"
);

createDimensionPortal(
    0,
    4,
    50,
    2,
    "HIDDEN DIMENSION"
);


/* =========================================================
   PORTAL ANIMATION
   ========================================================= */

function updateDimensionPortals(
    delta
) {

    const time =
        performance.now() *
        0.001;


    dimensionPortals.forEach(
        (portal) => {

            portal.rotation.y +=
                delta *
                0.7;


            const scale =
                1 +
                Math.sin(
                    time * 2 +
                    portal.userData.phase
                ) *
                0.06;


            portal.scale.setScalar(
                scale
            );
        }
    );
}


/* =========================================================
   PORTAL INTERACTION
   ========================================================= */

function interactWithPortal() {

    if (
        !playerModel
    ) {

        return false;
    }


    let closestPortal =
        null;


    let closestDistance =
        Infinity;


    dimensionPortals.forEach(
        (portal) => {

            const distance =
                playerModel.position
                    .distanceTo(
                        portal.position
                    );


            if (
                distance < 6 &&
                distance <
                    closestDistance
            ) {

                closestPortal =
                    portal;

                closestDistance =
                    distance;
            }
        }
    );


    if (
        !closestPortal
    ) {

        return false;
    }


    targetW =
        closestPortal.userData
            .targetReality;


    startRealityTransition();


    showWorldMessage(

        "ENTERING " +

        closestPortal.userData.label
    );


    return true;
}


/* =========================================================
   REALITY INTERACTION
   ========================================================= */

function updateRealityInteraction() {

    if (
        !playerModel
    ) {

        return;
    }


    let closestPortal =
        null;


    let closestDistance =
        Infinity;


    dimensionPortals.forEach(
        (portal) => {

            const distance =
                playerModel.position
                    .distanceTo(
                        portal.position
                    );


            if (
                distance < 6 &&
                distance <
                    closestDistance
            ) {

                closestPortal =
                    portal;

                closestDistance =
                    distance;
            }
        }
    );


    if (
        closestPortal
    ) {

        interactionText.style.display =
            "block";


        interactionText.textContent =
            "[ E ] ENTER " +
            closestPortal
                .userData
                .label;


        return;
    }
}


/* =========================================================
   REALITY EFFECT UPDATE
   ========================================================= */

function updateRealitySystems(
    delta
) {

    updateRealityLayers(
        delta
    );


    updateRealityLighting();


    updateRealityHUD();


    updateRealityTransition(
        delta
    );


    updateFutureCity(
        delta
    );


    updateDimensionPortals(
        delta
    );


    updateRealityInteraction();
}


/* =========================================================
   END OF PART 5
   ========================================================= */
/* =========================================================
   ENEMY / COMBAT SYSTEM
   ========================================================= */

const enemies = [];


/* =========================================================
   ENEMY CREATION
   ========================================================= */

function createEnemy(
    x,
    z
) {

    const group =
        new THREE.Group();


    /* body */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.9,
                1.4,
                0.65
            ),

            makeStandardMaterial(
                0x3a1820,
                0.75,
                0.25
            )
        );


    body.position.y =
        1.1;


    body.castShadow =
        true;


    group.add(
        body
    );


    /* head */

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.38,
                14,
                14
            ),

            makeStandardMaterial(
                0x672630,
                0.8,
                0.1
            )
        );


    head.position.y =
        2.05;


    head.castShadow =
        true;


    group.add(
        head
    );


    /* energy core */

    const core =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.16,
                10,
                10
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xff3048
            })
        );


    core.position.set(
        0,
        1.2,
        -0.37
    );


    group.add(
        core
    );


    /* health bar background */

    const healthBackground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1.7,
                0.18
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x190000,

                side:
                    THREE.DoubleSide
            })
        );


    healthBackground.position.set(
        0,
        2.75,
        0
    );


    healthBackground.rotation.y =
        Math.PI;


    group.add(
        healthBackground
    );


    /* health bar */

    const healthBar =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1.55,
                0.11
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x39ff72,

                side:
                    THREE.DoubleSide
            })
        );


    healthBar.position.set(
        0,
        2.75,
        -0.01
    );


    healthBar.rotation.y =
        Math.PI;


    group.add(
        healthBar
    );


    group.position.set(
        x,
        0,
        z
    );


    group.userData.maxHealth =
        100;


    group.userData.health =
        100;


    group.userData.speed =
        2.2 +
        Math.random() * 1.4;


    group.userData.attackCooldown =
        Math.random();


    group.userData.alive =
        true;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    group.userData.healthBar =
        healthBar;


    group.userData.damageTimer =
        0;


    scene.add(
        group
    );


    enemies.push(
        group
    );
}


/* =========================================================
   ENEMY POSITIONS
   ========================================================= */

const enemyPositions = [

    [-35, -60],

    [40, -55],

    [-55, 42],

    [55, 48],

    [-82, -35],

    [82, 35],

    [-100, 80],

    [100, -80]
];


enemyPositions.forEach(
    (position) => {

        createEnemy(
            position[0],
            position[1]
        );
    }
);


/* =========================================================
   ENEMY COUNT
   ========================================================= */

function getAliveEnemyCount() {

    let count =
        0;


    enemies.forEach(
        (enemy) => {

            if (
                enemy.userData.alive
            ) {

                count++;
            }
        }
    );


    return count;
}


/* =========================================================
   ENEMY UPDATE
   ========================================================= */

function updateEnemies(
    delta
) {

    if (
        !playerModel
    ) {

        return;
    }


    const target =
        driving && car
            ? car.position
            : playerModel.position;


    enemies.forEach(
        (enemy) => {

            if (
                !enemy.userData.alive
            ) {

                return;
            }


            enemy.userData.attackCooldown -=
                delta;


            enemy.userData.damageTimer -=
                delta;


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        target,
                        enemy.position
                    );


            direction.y =
                0;


            const distance =
                direction.length();


            if (
                distance > 7
            ) {

                direction.normalize();


                enemy.position.addScaledVector(

                    direction,

                    enemy.userData.speed *
                        delta
                );


                const rotation =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );


                enemy.rotation.y =
                    THREE.MathUtils.lerp(
                        enemy.rotation.y,
                        rotation,
                        delta * 5
                    );


                /* walking animation */

                enemy.children[0].rotation.z =
                    Math.sin(
                        performance.now() *
                            0.006 +
                        enemy.userData.phase
                    ) *
                    0.03;

            } else {

                if (
                    enemy.userData.attackCooldown <=
                    0 &&
                    enemy.userData.damageTimer <=
                    0
                ) {

                    damagePlayer(
                        8
                    );


                    enemy.userData.attackCooldown =
                        1.2;
                }
            }
        }
    );
}


/* =========================================================
   DAMAGE PLAYER
   ========================================================= */

function damagePlayer(amount) {

    // HEALTH LOCK
    // Player health will no longer decrease.

    playerHealth = 100;

    updateHealth();
}    if (
        damageCooldown > 0
    ) {

        return;
    }


    damageCooldown =
        0.7;


    playerHealth -=
        amount;


    playerHealth =
        Math.max(
            0,
            playerHealth
        );

if (
        playerHealth <=
        0
    ) {

        respawnPlayer();
    }
}
 

    


/* =========================================================
   RESPAWN PLAYER
   ========================================================= */

function respawnPlayer() {

    playerHealth =
        100;


    wantedLevel =
        0;


    if (
        driving &&
        car
    ) {

        driving =
            false;

        car.userData.driver =
            false;
    }


    if (
        playerModel
    ) {

        playerModel.visible =
            true;


        playerModel.position.set(
            0,
            0,
            8
        );


        playerModel.rotation.y =
            0;
    }


    vehicleSpeed =
        0;


    showWorldMessage(
        "YOU WERE DOWNED — RESPAWNED"
    );
}


/* =========================================================
   HEALTH HUD
   ========================================================= */

let healthHUD =
    document.getElementById(
        "health-hud"
    );


if (
    !healthHUD
) {

    healthHUD =
        document.createElement(
            "div"
        );


    healthHUD.id =
        "health-hud";


    healthHUD.style.position =
        "fixed";


    healthHUD.style.left =
        "24px";


    healthHUD.style.bottom =
        "24px";


    healthHUD.style.width =
        "250px";


    healthHUD.style.height =
        "22px";


    healthHUD.style.background =
        "rgba(0,0,0,0.72)";


    healthHUD.style.border =
        "1px solid rgba(255,255,255,0.25)";


    healthHUD.style.zIndex =
        "45";


    healthHUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        healthHUD
    );
}


let healthFill =
    document.getElementById(
        "health-fill"
    );


if (
    !healthFill
) {

    healthFill =
        document.createElement(
            "div"
        );


    healthFill.id =
        "health-fill";


    healthFill.style.height =
        "100%";


    healthFill.style.width =
        "100%";


    healthFill.style.background =
        "#39d96b";


    healthFill.style.transition =
        "width 0.2s";


    healthHUD.appendChild(
        healthFill
    );
}


let healthText =
    document.getElementById(
        "health-text"
    );


if (
    !healthText
) {

    healthText =
        document.createElement(
            "div"
        );


    healthText.id =
        "health-text";


    healthText.style.position =
        "absolute";


    healthText.style.left =
        "0";


    healthText.style.top =
        "0";


    healthText.style.width =
        "100%";


    healthText.style.height =
        "100%";


    healthText.style.color =
        "#ffffff";


    healthText.style.fontFamily =
        "Arial, sans-serif";


    healthText.style.fontSize =
        "12px";


    healthText.style.fontWeight =
        "bold";


    healthText.style.display =
        "flex";


    healthText.style.alignItems =
        "center";


    healthText.style.justifyContent =
        "center";


    healthHUD.appendChild(
        healthText
    );
}


/* =========================================================
   UPDATE HEALTH
   ========================================================= */

function updateHealth() {

    const value =
        Math.max(
            0,
            Math.min(
                100,
                playerHealth
            )
        );


    if (
        healthFill
    ) {

        healthFill.style.width =
            value +
            "%";


        if (
            value > 60
        ) {

            healthFill.style.background =
                "#39d96b";

        } else if (
            value > 30
        ) {

            healthFill.style.background =
                "#ffc83d";

        } else {

            healthFill.style.background =
                "#ff3b3b";
        }
    }


    if (
        healthText
    ) {

        healthText.textContent =
            "HEALTH  " +
            Math.round(
                value
            ) +
            " / 100";
    }
}


/* =========================================================
   RAYCAST COMBAT
   ========================================================= */

const combatRaycaster =
    new THREE.Raycaster();


const combatDirection =
    new THREE.Vector3();


const combatOrigin =
    new THREE.Vector3();


function shootPulse() {

    if (
        shootCooldown >
        0
    ) {

        return;
    }


    shootCooldown =
        0.28;


    combatOrigin.set(
        0,
        0,
        0
    );


    if (
        driving &&
        car
    ) {

        combatOrigin.copy(
            car.position
        );

        combatOrigin.y +=
            1.4;

    } else if (
        playerModel
    ) {

        combatOrigin.copy(
            playerModel.position
        );

        combatOrigin.y +=
            1.3;

    } else {

        return;
    }


    camera.getWorldDirection(
        combatDirection
    );


    combatRaycaster.set(
        camera.position,
        combatDirection
    );


    const hitTargets =
        [];


    enemies.forEach(
        (enemy) => {

            if (
                enemy.userData.alive
            ) {

                enemy.traverse(
                    (child) => {

                        if (
                            child.isMesh
                        ) {

                            hitTargets.push(
                                child
                            );
                        }
                    }
                );
            }
        }
    );


    const hits =
        combatRaycaster.intersectObjects(
            hitTargets,
            true
        );


    createPulseTracer(
        camera.position,
        camera.position.clone()
            .add(
                combatDirection
                    .clone()
                    .multiplyScalar(
                        35
                    )
            )
    );


    if (
        hits.length ===
        0
    ) {

        return;
    }


    let enemy =
        hits[0].object;


    while (
        enemy &&
        !enemies.includes(
            enemy
        )
    ) {

        enemy =
            enemy.parent;
    }


    if (
        !enemy ||
        !enemy.userData ||
        !enemy.userData.alive
    ) {

        return;
    }


    damageEnemy(
        enemy,
        35
    );


    wantedLevel =
        Math.min(
            5,
            wantedLevel + 0.25
        );
}


/* =========================================================
   PULSE TRACER
   ========================================================= */

const pulseEffects =
    [];


function createPulseTracer(
    start,
    end
) {

    const direction =
        new THREE.Vector3()
            .subVectors(
                end,
                start
            );


    const length =
        direction.length();


    const beam =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.025,
                0.025,
                length,
                8
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x55eaff
            })
        );


    beam.position
        .copy(start)
        .add(
            end
                .clone()
                .sub(start)
                .multiplyScalar(
                    0.5
                )
        );


    beam.quaternion.setFromUnitVectors(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        direction.normalize()
    );


    scene.add(
        beam
    );


    pulseEffects.push({

        object:
            beam,

        life:
            0.08
    });
}


/* =========================================================
   PULSE EFFECT UPDATE
   ========================================================= */

function updatePulseEffects(
    delta
) {

    for (
        let i =
            pulseEffects.length - 1;

        i >= 0;

        i--
    ) {

        const effect =
            pulseEffects[i];


        effect.life -=
            delta;


        if (
            effect.life <=
            0
        ) {

            scene.remove(
                effect.object
            );


            effect.object.geometry
                .dispose();


            effect.object.material
                .dispose();


            pulseEffects.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   DAMAGE ENEMY
   ========================================================= */

function damageEnemy(
    enemy,
    amount
) {

    if (
        !enemy ||
        !enemy.userData.alive
    ) {

        return;
    }


    enemy.userData.health -=
        amount;


    enemy.userData.damageTimer =
        0.15;


    const healthRatio =
        Math.max(
            0,
            enemy.userData.health /
                enemy.userData.maxHealth
        );


    if (
        enemy.userData.healthBar
    ) {

        enemy.userData.healthBar.scale.x =
            healthRatio;
    }


    /* hit flash */

    enemy.children.forEach(
        (child) => {

            if (
                child.isMesh &&
                child.material &&
                child.material.emissive
            ) {

                child.material
                    .emissive.set(
                        0xff2020
                    );
            }
        }
    );


    setTimeout(
        () => {

            enemy.children.forEach(
                (child) => {

                    if (
                        child.isMesh &&
                        child.material &&
                        child.material.emissive
                    ) {

                        child.material
                            .emissive.set(
                                0x000000
                            );
                    }
                }
            );

        },

        80
    );


    if (
        enemy.userData.health <=
        0
    ) {

        defeatEnemy(
            enemy
        );
    }
}


/* =========================================================
   DEFEAT ENEMY
   ========================================================= */

function defeatEnemy(
    enemy
) {

    if (
        !enemy.userData.alive
    ) {

        return;
    }


    enemy.userData.alive =
        false;


    money +=
        75;


    showWorldMessage(
        "ENEMY DEFEATED  +₹75"
    );


    let fadeTimer =
        0;


    enemy.userData.fadeTimer =
        fadeTimer;


    enemy.userData.defeated =
        true;
}


/* =========================================================
   DEFEATED ENEMY UPDATE
   ========================================================= */

function updateDefeatedEnemies(
    delta
) {

    enemies.forEach(
        (enemy) => {

            if (
                !enemy.userData.defeated
            ) {

                return;
            }


            if (
                enemy.userData.removed
            ) {

                return;
            }


            enemy.rotation.z +=
                delta * 2;


            enemy.position.y -=
                delta * 0.8;


            enemy.scale.multiplyScalar(
                Math.max(
                    0,
                    1 -
                        delta *
                        0.9
                )
            );


            if (
                enemy.scale.x <
                0.05
            ) {

                enemy.userData.removed =
                    true;


                scene.remove(
                    enemy
                );
            }
        }
    );
}


/* =========================================================
   COMBAT HUD
   ========================================================= */

let combatHUD =
    document.getElementById(
        "combat-hud"
    );


if (
    !combatHUD
) {

    combatHUD =
        document.createElement(
            "div"
        );


    combatHUD.id =
        "combat-hud";


    combatHUD.style.position =
        "fixed";


    combatHUD.style.top =
        "50%";


    combatHUD.style.left =
        "50%";


    combatHUD.style.transform =
        "translate(-50%, -50%)";


    combatHUD.style.width =
        "18px";


    combatHUD.style.height =
        "18px";


    combatHUD.style.zIndex =
        "35";


    combatHUD.style.pointerEvents =
        "none";


    combatHUD.innerHTML =

        '<div style="' +

        'position:absolute;' +

        'left:8px;' +

        'top:0;' +

        'width:2px;' +

        'height:18px;' +

        'background:#ffffff;' +

        'box-shadow:0 0 8px #ffffff;' +

        '"></div>' +

        '<div style="' +

        'position:absolute;' +

        'left:0;' +

        'top:8px;' +

        'width:18px;' +

        'height:2px;' +

        'background:#ffffff;' +

        'box-shadow:0 0 8px #ffffff;' +

        '"></div>';


    document.body.appendChild(
        combatHUD
    );
}


/* =========================================================
   COMBAT CONTROLS
   ========================================================= */

window.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !==
            0
        ) {

            return;
        }


        if (
            mapOpen
        ) {

            return;
        }


        shootPulse();
    }
);


/* =========================================================
   SIMPLE CAMERA AIM
   ========================================================= */

let pointerLocked =
    false;


window.addEventListener(
    "click",
    () => {

        if (
            mapOpen
        ) {

            return;
        }


        if (
            renderer.domElement
                .requestPointerLock
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


/* =========================================================
   AIM CAMERA POSITION
   ========================================================= */

function updateCombatCamera(
    delta
) {

    if (
        !playerModel &&
        !car
    ) {

        return;
    }


    if (
        mapOpen
    ) {

        return;
    }


    const target =
        driving && car
            ? car.position
            : playerModel
                ? playerModel.position
                : new THREE.Vector3();


    const cameraDistance =
        driving
            ? 10
            : 7;


    const horizontal =
        Math.cos(
            cameraPitch
        ) *
        cameraDistance;


    const vertical =
        Math.sin(
            cameraPitch
        ) *
        cameraDistance;


    const offset =
        new THREE.Vector3(

            Math.sin(
                cameraYaw
            ) *
            horizontal,

            3.2 +
                vertical,

            Math.cos(
                cameraYaw
            ) *
            horizontal
        );


    const desiredPosition =
        target
            .clone()
            .add(
                offset
            );


    camera.position.lerp(
        desiredPosition,
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
            : 1.25;


    camera.lookAt(
        lookTarget
    );
}


/* =========================================================
   END OF PART 6
   ========================================================= */
/* =========================================================
   FINAL GAME INTEGRATION
   ========================================================= */


/* =========================================================
   MISSION SYSTEM
   ========================================================= */

let missionState =
    0;

/*
   0 = Mission available
   1 = Mission 1 active
   2 = Mission 1 complete
   3 = Combat mission
   4 = Combat complete
   5 = Police escape
   6 = Police escape complete
*/


const missionContactPosition =
    new THREE.Vector3(
        0,
        0,
        3
    );


const missionTargetPosition =
    new THREE.Vector3(
        70,
        0,
        70
    );


const missionContactMarker =
    new THREE.Group();


const missionTargetMarker =
    new THREE.Group();


/* =========================================================
   CREATE MARKER
   ========================================================= */

function createMissionMarker(
    color,
    scale
) {

    const group =
        new THREE.Group();


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                scale,
                0.16,
                12,
                40
            ),

            new THREE.MeshBasicMaterial({
                color:
                    color
            })
        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    const beam =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.08,
                0.08,
                5,
                10
            ),

            new THREE.MeshBasicMaterial({

                color:
                    color,

                transparent:
                    true,

                opacity:
                    0.75
            })
        );


    beam.position.y =
        2.5;


    group.add(
        beam
    );


    return group;
}


/* =========================================================
   MISSION MARKERS
   ========================================================= */

const contactVisual =
    createMissionMarker(
        0xff2020,
        2.2
    );


const targetVisual =
    createMissionMarker(
        0xffdd22,
        2.7
    );


missionContactMarker.add(
    contactVisual
);


missionTargetMarker.add(
    targetVisual
);


missionContactMarker.position.copy(
    missionContactPosition
);


missionTargetMarker.position.copy(
    missionTargetPosition
);


scene.add(
    missionContactMarker
);


scene.add(
    missionTargetMarker
);


missionTargetMarker.visible =
    false;


/* =========================================================
   MISSION HUD
   ========================================================= */

let missionHUD =
    document.getElementById(
        "mission-hud"
    );


if (
    !missionHUD
) {

    missionHUD =
        document.createElement(
            "div"
        );


    missionHUD.id =
        "mission-hud";


    missionHUD.style.position =
        "fixed";


    missionHUD.style.top =
        "25px";


    missionHUD.style.right =
        "25px";


    missionHUD.style.width =
        "300px";


    missionHUD.style.padding =
        "16px 18px";


    missionHUD.style.background =
        "rgba(0,0,0,0.82)";


    missionHUD.style.border =
        "1px solid rgba(255,50,50,0.8)";


    missionHUD.style.color =
        "#ffffff";


    missionHUD.style.fontFamily =
        "Arial, sans-serif";


    missionHUD.style.fontSize =
        "14px";


    missionHUD.style.lineHeight =
        "1.6";


    missionHUD.style.zIndex =
        "50";


    missionHUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        missionHUD
    );
}


/* =========================================================
   MISSION HUD UPDATE
   ========================================================= */

function updateMissionHUD() {

    if (
        !missionHUD
    ) {

        return;
    }


    if (
        missionState ===
        0
    ) {

        missionHUD.innerHTML =

            "<b>MISSION</b><br>" +

            "Find the RED marker.<br>" +

            "Press E to begin.";

    } else if (
        missionState ===
        1
    ) {

        missionHUD.innerHTML =

            "<b>MISSION 1</b><br>" +

            "Reach the YELLOW target.<br>" +

            "Use the car for faster travel.";

    } else if (
        missionState ===
        2
    ) {

        missionHUD.innerHTML =

            "<b>MISSION COMPLETE</b><br>" +

            "Reward: ₹500";

    } else if (
        missionState ===
        3
    ) {

        missionHUD.innerHTML =

            "<b>COMBAT MISSION</b><br>" +

            "Enemies remaining: " +

            getAliveEnemyCount();

    } else if (
        missionState ===
        4
    ) {

        missionHUD.innerHTML =

            "<b>COMBAT COMPLETE</b><br>" +

            "Police response incoming.";

    } else if (
        missionState ===
        5
    ) {

        missionHUD.innerHTML =

            "<b>POLICE ESCAPE</b><br>" +

            "Lose the wanted level.";

    } else {

        missionHUD.innerHTML =

            "<b>CITY FREE ROAM</b><br>" +

            "Explore the city.";
    }
}


/* =========================================================
   START MISSION
   ========================================================= */

function startMission1() {

    if (
        missionState !==
        0
    ) {

        return;
    }


    missionState =
        1;


    missionContactMarker.visible =
        false;


    missionTargetMarker.visible =
        true;


    showWorldMessage(
        "MISSION 1 STARTED"
    );


    updateMissionHUD();
}


/* =========================================================
   COMPLETE MISSION 1
   ========================================================= */

function completeMission1() {

    if (
        missionState !==
        1
    ) {

        return;
    }


    missionState =
        2;


    money +=
        500;


    missionTargetMarker.visible =
        false;


    showWorldMessage(
        "MISSION COMPLETE  +₹500"
    );


    updateMissionHUD();


    setTimeout(
        () => {

            startCombatMission();

        },

        2200
    );
}


/* =========================================================
   START COMBAT MISSION
   ========================================================= */

function startCombatMission() {

    missionState =
        3;


    enemies.forEach(
        (enemy) => {

            if (
                enemy.userData.removed
            ) {

                enemy.userData.removed =
                    false;

                enemy.userData.alive =
                    true;

                enemy.userData.defeated =
                    false;

                enemy.userData.health =
                    enemy.userData.maxHealth;

                enemy.scale.setScalar(
                    1
                );

                enemy.visible =
                    true;
            }
        }
    );


    showWorldMessage(
        "COMBAT MISSION STARTED"
    );


    updateMissionHUD();
}


/* =========================================================
   COMPLETE COMBAT
   ========================================================= */

function completeCombatMission() {

    if (
        missionState !==
        3
    ) {

        return;
    }


    missionState =
        4;


    money +=
        750;


    showWorldMessage(
        "COMBAT COMPLETE  +₹750"
    );


    updateMissionHUD();


    setTimeout(
        () => {

            startPoliceEscape();

        },

        2500
    );
}


/* =========================================================
   MISSION UPDATE
   ========================================================= */

function updateMission(
    delta
) {

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

        const distance =
            target.distanceTo(
                missionContactPosition
            );


        if (
            distance < 5
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ E ] START MISSION";
        }
    }


    if (
        missionState ===
        1
    ) {

        const distance =
            target.distanceTo(
                missionTargetPosition
            );


        if (
            distance < 7
        ) {

            completeMission1();
        }
    }


    if (
        missionState ===
        3
    ) {

        if (
            getAliveEnemyCount() ===
            0
        ) {

            completeCombatMission();
        }
    }


    if (
        missionState ===
        5
    ) {

        if (
            wantedLevel <=
            0
        ) {

            completePoliceEscape();
        }
    }
}


/* =========================================================
   POLICE SYSTEM
   ========================================================= */

const policeCars =
    [];


const policeOfficers =
    [];


/* =========================================================
   CREATE POLICE CAR
   ========================================================= */

function createPoliceCar(
    x,
    z
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.1,
                1.1,
                7.4
            ),

            makeStandardMaterial(
                0x15191e,
                0.3,
                0.65
            )
        );


    body.position.y =
        1;


    group.add(
        body
    );


    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3,
                1.1,
                3
            ),

            makeStandardMaterial(
                0xe5e5e5,
                0.4,
                0.35
            )
        );


    roof.position.set(
        0,
        1.85,
        0
    );


    group.add(
        roof
    );


    /* police light bar */

    const bar =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.4,
                0.18,
                0.5
            ),

            makeBasicMaterial(
                0xffffff
            )
        );


    bar.position.y =
        2.55;


    group.add(
        bar
    );


    const redLight =
        new THREE.PointLight(
            0xff2020,
            3,
            15
        );


    redLight.position.set(
        -0.8,
        2.7,
        0
    );


    group.add(
        redLight
    );


    const blueLight =
        new THREE.PointLight(
            0x2070ff,
            3,
            15
        );


    blueLight.position.set(
        0.8,
        2.7,
        0
    );


    group.add(
        blueLight
    );


    const wheels =
        [];


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.58,
            0.58,
            0.45,
            16
        );


    const wheelMaterial =
        makeStandardMaterial(
            0x101010,
            0.9,
            0
        );


    [
        [-1.85, 0.6, -2.3],
        [1.85, 0.6, -2.3],
        [-1.85, 0.6, 2.3],
        [1.85, 0.6, 2.3]
    ].forEach(
        (position) => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                position[0],
                position[1],
                position[2]
            );


            group.add(
                wheel
            );


            wheels.push(
                wheel
            );
        }
    );


    group.position.set(
        x,
        0,
        z
    );


    group.userData.speed =
        10;


    group.userData.wheels =
        wheels;


    group.userData.red =
        redLight;


    group.userData.blue =
        blueLight;


    group.userData.phase =
        Math.random() *
        Math.PI * 2;


    scene.add(
        group
    );


    policeCars.push(
        group
    );
}


/* =========================================================
   CREATE POLICE CARS
   ========================================================= */

createPoliceCar(
    -90,
    -90
);

createPoliceCar(
    90,
    -90
);

createPoliceCar(
    -90,
    90
);

createPoliceCar(
    90,
    90
);


/* =========================================================
   POLICE UPDATE
   ========================================================= */

function updatePolice(
    delta
) {

    if (
        policeCars.length ===
        0
    ) {

        return;
    }


    const target =
        driving && car
            ? car.position
            : playerModel
                ? playerModel.position
                : null;


    if (
        !target
    ) {

        return;
    }


    policeCars.forEach(
        (police) => {

            const active =
                wantedLevel > 0;


            police.visible =
                active;


            if (
                !active
            ) {

                return;
            }


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        target,
                        police.position
                    );


            direction.y =
                0;


            const distance =
                direction.length();


            if (
                distance >
                8
            ) {

                direction.normalize();


                const speed =
                    police.userData.speed +
                    wantedLevel * 1.5;


                police.position.addScaledVector(
                    direction,
                    speed * delta
                );


                police.rotation.y =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );
            }


            police.userData.phase +=
                delta * 8;


            police.userData.red.intensity =
                1.5 +
                Math.sin(
                    police.userData.phase
                ) *
                1.2;


            police.userData.blue.intensity =
                1.5 +
                Math.sin(
                    police.userData.phase +
                    Math.PI
                ) *
                1.2;


            police.userData.wheels.forEach(
                (wheel) => {

                    wheel.rotation.x +=
                        delta * 10;
                }
            );


            if (
                distance < 7 &&
                damageCooldown <=
                    0
            ) {

                damagePlayer(
                    5
                );
            }


            /* keep police inside city */

            police.position.x =
                THREE.MathUtils.clamp(
                    police.position.x,
                    -150,
                    150
                );


            police.position.z =
                THREE.MathUtils.clamp(
                    police.position.z,
                    -150,
                    150
                );
        }
    );
}


/* =========================================================
   WANTED SYSTEM
   ========================================================= */

function updateWanted() {

    /* HUD is created dynamically */

    let wantedHUD =
        document.getElementById(
            "wanted-hud"
        );


    if (
        !wantedHUD
    ) {

        wantedHUD =
            document.createElement(
                "div"
            );


        wantedHUD.id =
            "wanted-hud";


        wantedHUD.style.position =
            "fixed";


        wantedHUD.style.right =
            "25px";


        wantedHUD.style.bottom =
            "25px";


        wantedHUD.style.padding =
            "10px 15px";


        wantedHUD.style.background =
            "rgba(0,0,0,0.75)";


        wantedHUD.style.color =
            "#ffffff";


        wantedHUD.style.fontFamily =
            "Arial, sans-serif";


        wantedHUD.style.fontWeight =
            "bold";


        wantedHUD.style.zIndex =
            "50";


        wantedHUD.style.pointerEvents =
            "none";


        document.body.appendChild(
            wantedHUD
        );
    }


    const stars =
        Math.round(
            wantedLevel
        );


    let starText =
        "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        starText +=
            i < stars
                ? "★"
                : "☆";
    }


    wantedHUD.textContent =
        "WANTED  " +
        starText;
}


/* =========================================================
   WANTED DECAY
   ========================================================= */

let wantedDecayTimer =
    0;


function updateWantedSystem(
    delta
) {

    if (
        wantedLevel <=
        0
    ) {

        wantedLevel =
            0;

        return;
    }


    wantedDecayTimer +=
        delta;


    if (
        wantedDecayTimer >
        5
    ) {

        wantedDecayTimer =
            0;


        wantedLevel -=
            0.2;


        wantedLevel =
            Math.max(
                0,
                wantedLevel
            );
    }
}


/* =========================================================
   START POLICE ESCAPE
   ========================================================= */

function startPoliceEscape() {

    missionState =
        5;


    wantedLevel =
        5;


    showWorldMessage(
        "POLICE ALERT — ESCAPE"
    );


    updateMissionHUD();
}


/* =========================================================
   COMPLETE POLICE ESCAPE
   ========================================================= */

function completePoliceEscape() {

    missionState =
        6;


    wantedLevel =
        0;


    money +=
        1000;


    showWorldMessage(
        "POLICE ESCAPE COMPLETE  +₹1000"
    );


    updateMissionHUD();
}


/* =========================================================
   FULL MAP
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
        "2px solid rgba(255,40,40,0.8)";


    mapCanvas.style.zIndex =
        "200";


    mapCanvas.style.display =
        "none";


    mapCanvas.style.boxShadow =
        "0 0 50px rgba(0,0,0,0.8)";


    document.body.appendChild(
        mapCanvas
    );
}


const mapContext =
    mapCanvas.getContext(
        "2d"
    );


function drawFullMap() {

    if (
        !mapCanvas ||
        !mapContext
    ) {

        return;
    }


    const width =
        mapCanvas.width;


    const height =
        mapCanvas.height;


    mapContext.clearRect(
        0,
        0,
        width,
        height
    );


    /* background */

    mapContext.fillStyle =
        "#090d12";


    mapContext.fillRect(
        0,
        0,
        width,
        height
    );


    const scale =
        1.65 *
        mapZoom;


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    function worldToMap(
        x,
        z
    ) {

        return {

            x:
                centerX +
                x *
                scale,

            y:
                centerY +
                z *
                scale
        };
    }


    /* roads */

    mapContext.strokeStyle =
        "#303841";


    mapContext.lineWidth =
        30;


    [
        0,
        -65,
        65
    ].forEach(
        (x) => {

            const p1 =
                worldToMap(
                    x,
                    -170
                );


            const p2 =
                worldToMap(
                    x,
                    170
                );


            mapContext.beginPath();

            mapContext.moveTo(
                p1.x,
                p1.y
            );

            mapContext.lineTo(
                p2.x,
                p2.y
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

            const p1 =
                worldToMap(
                    -170,
                    z
                );


            const p2 =
                worldToMap(
                    170,
                    z
                );


            mapContext.beginPath();

            mapContext.moveTo(
                p1.x,
                p1.y
            );

            mapContext.lineTo(
                p2.x,
                p2.y
            );

            mapContext.stroke();
        }
    );


    /* buildings */

    mapContext.fillStyle =
        "#46515c";


    for (
        let i = 0;
        i < buildingObjects.length;
        i++
    ) {

        const building =
            buildingObjects[i];


        const p =
            worldToMap(
                building.position.x,
                building.position.z
            );


        const size =
            Math.max(
                5,
                9 *
                mapZoom
            );


        mapContext.fillRect(
            p.x -
                size / 2,
            p.y -
                size / 2,
            size,
            size
        );
    }


    /* shards */

    cityShards.forEach(
        (shard) => {

            if (
                shard.userData.collected
            ) {

                return;
            }


            const p =
                worldToMap(
                    shard.position.x,
                    shard.position.z
                );


            mapContext.fillStyle =
                "#2eeaff";


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


    /* mission */

    const missionPoint =
        missionState ===
            0
            ? missionContactPosition
            : missionTargetPosition;


    const mp =
        worldToMap(
            missionPoint.x,
            missionPoint.z
        );


    if (
        missionState <
        2
    ) {

        mapContext.fillStyle =
            missionState ===
                0
                ? "#ff3030"
                : "#ffdf22";


        mapContext.beginPath();

        mapContext.arc(
            mp.x,
            mp.y,
            9,
            0,
            Math.PI * 2
        );

        mapContext.fill();
    }


    /* player */

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
        worldToMap(
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


    /* map title */

    mapContext.fillStyle =
        "#ffffff";


    mapContext.font =
        "bold 26px Arial";


    mapContext.fillText(
        "Y: RISE OF THE CITY",
        28,
        42
    );


    mapContext.font =
        "15px Arial";


    mapContext.fillText(
        "M = CLOSE   + / - = ZOOM",
        28,
        68
    );
}


/* =========================================================
   MAP TOGGLE
   ========================================================= */

function toggleFullMap() {

    mapOpen =
        !mapOpen;


    mapCanvas.style.display =
        mapOpen
            ? "block"
            : "none";


    if (
        mapOpen &&
        document.pointerLockElement
    ) {

        document.exitPointerLock();
    }


    if (
        mapOpen
    ) {

        drawFullMap();
    }
}


/* =========================================================
   INTERACTION SYSTEM
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

    let nearestPortal =
        null;


    let portalDistance =
        Infinity;


    dimensionPortals.forEach(
        (portal) => {

            const distance =
                playerModel.position.distanceTo(
                    portal.position
                );


            if (
                distance < 6 &&
                distance <
                    portalDistance
            ) {

                portalDistance =
                    distance;

                nearestPortal =
                    portal;
            }
        }
    );


    if (
        nearestPortal
    ) {

        interactionText.style.display =
            "block";


        interactionText.textContent =
            "[ E ] ENTER " +
            nearestPortal
                .userData
                .label;


        return;
    }


    /* mission */

    if (
        missionState ===
        0
    ) {

        const distance =
            playerModel.position.distanceTo(
                missionContactPosition
            );


        if (
            distance < 5
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
        car
    ) {

        const distance =
            playerModel.position.distanceTo(
                car.position
            );


        if (
            distance < 6
        ) {

            interactionText.style.display =
                "block";


            interactionText.textContent =
                "[ E ] ENTER VEHICLE";


            return;
        }
    }


    interactionText.style.display =
        "none";
}


/* =========================================================
   E KEY INTERACTION
   ========================================================= */

function handleGameInteraction() {

    if (
        mapOpen
    ) {

        return;
    }


    if (
        driving
    ) {

        exitVehicle();

        return;
    }


    /* portal first */

    if (
        interactWithPortal()
    ) {

        return;
    }


    /* mission */

    if (
        missionState ===
            0 &&
        playerModel
    ) {

        const distance =
            playerModel.position.distanceTo(
                missionContactPosition
            );


        if (
            distance < 5
        ) {

            startMission1();

            return;
        }
    }


    /* vehicle */

    if (
        playerModel &&
        car
    ) {

        const distance =
            playerModel.position.distanceTo(
                car.position
            );


        if (
            distance < 6
        ) {

            enterVehicle();

            return;
        }
    }
}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        keys[key] =
            true;


        /* prevent browser scrolling */

        if (
            [
                " ",
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(
                key
            )
        ) {

            event.preventDefault();
        }


        /* jump */

        if (
            key ===
            " "
        ) {

            playerJump();
        }


        /* interaction */

        if (
            key ===
            "e"
        ) {

            handleGameInteraction();
        }


        /* rain */

        if (
            key ===
            "r"
        ) {

            setRainEnabled(
                !rainEnabled
            );
        }


        /* reality */

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


        /* map */

        if (
            key ===
            "m"
        ) {

            toggleFullMap();
        }


        /* map zoom */

        if (
            mapOpen &&
            (
                key ===
                    "+" ||
                key ===
                    "="
            )
        ) {

            mapZoom =
                Math.min(
                    2.5,
                    mapZoom + 0.2
                );


            drawFullMap();
        }


        if (
            mapOpen &&
            key ===
                "-"
        ) {

            mapZoom =
                Math.max(
                    0.6,
                    mapZoom - 0.2
                );


            drawFullMap();
        }
    }
);


/* =========================================================
   KEY RELEASE
   ========================================================= */

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
   CAMERA SYSTEM
   ========================================================= */

function updateCamera(
    delta
) {

    updateCombatCamera(
        delta
    );
}


/* =========================================================
   FINAL WORLD UPDATE
   ========================================================= */

function updateAllWorldSystems(
    delta
) {

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


    updateNPCs(
        delta
    );


    updateTraffic(
        delta
    );


    updateTrafficLights(
        delta
    );


    updateRain(
        delta
    );


    updateWeatherEffects(
        delta
    );


    updateEnvironmentAnimation(
        delta
    );


    updateBillboards(
        delta
    );


    updateBuildingWindows();


    updateCityShards(
        delta
    );


    updateCityDrones(
        delta
    );


    updateCityEvent(
        delta
    );


    updateEventSpawner(
        delta
    );


    updateRealitySystems(
        delta
    );


    updateEnemies(
        delta
    );


    updateDefeatedEnemies(
        delta
    );


    updatePolice(
        delta
    );


    updateWantedSystem(
        delta
    );


    updateMission(
        delta
    );


    updatePulseEffects(
        delta
    );


    updateWorldMessage(
        delta
    );


    updateWorldHUD();


    updateHealth();


    updateWanted();


    updateMissionHUD();


    updateInteraction();


    if (
        mapOpen
    ) {

        drawFullMap();
    }
}


/* =========================================================
   MAIN GAME LOOP
   ========================================================= */

function animateGame() {

    requestAnimationFrame(
        animateGame
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


    updateAllWorldSystems(
        delta
    );


    updateCamera(
        delta
    );


    if (
        playerMixer
    ) {

        playerMixer.update(
            delta
        );
    }


    if (
        shootCooldown >
        0
    ) {

        shootCooldown -=
            delta;
    }


    if (
        damageCooldown >
        0
    ) {

        damageCooldown -=
            delta;
    }


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   INITIAL HUD UPDATE
   ========================================================= */

updateHealth();

updateWanted();

updateMissionHUD();

updateWorldHUD();

updateRealityHUD();

updateInteraction();


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


        if (
            mapOpen
        ) {

            drawFullMap();
        }
    }
);


/* =========================================================
   START GAME
   ========================================================= */

console.log(
    "Y: RISE OF THE CITY"
);

console.log(
    "WORLD SYSTEMS ONLINE"
);

console.log(
    "MISSIONS ONLINE"
);

console.log(
    "POLICE ONLINE"
);

console.log(
    "4D REALITY ONLINE"
);

console.log(
    "CITY EVENTS ONLINE"
);

console.log(
    "GAME READY"
);


animateGame();


/* =========================================================
   END OF GAME.JS
   ========================================================= */
/* =========================================================
   STEP 8 - ENTERABLE BUILDINGS / INTERIORS
   ========================================================= */

const enterableBuildings = [];

let currentInterior = null;
let outsidePlayerPosition = new THREE.Vector3();
let outsidePlayerRotation = 0;


/* =========================================================
   INTERIOR MESSAGE
   ========================================================= */

let interiorMessage =
    document.getElementById("interior-message");

if (!interiorMessage) {

    interiorMessage =
        document.createElement("div");

    interiorMessage.id =
        "interior-message";

    interiorMessage.style.position =
        "fixed";

    interiorMessage.style.left =
        "50%";

    interiorMessage.style.bottom =
        "110px";

    interiorMessage.style.transform =
        "translateX(-50%)";

    interiorMessage.style.padding =
        "12px 20px";

    interiorMessage.style.background =
        "rgba(0,0,0,0.8)";

    interiorMessage.style.border =
        "1px solid rgba(255,50,50,0.8)";

    interiorMessage.style.color =
        "#ffffff";

    interiorMessage.style.fontFamily =
        "Arial, sans-serif";

    interiorMessage.style.fontWeight =
        "bold";

    interiorMessage.style.zIndex =
        "120";

    interiorMessage.style.pointerEvents =
        "none";

    interiorMessage.style.display =
        "none";

    document.body.appendChild(
        interiorMessage
    );
}


function showInteriorMessage(text) {

    interiorMessage.textContent =
        text;

    interiorMessage.style.display =
        "block";

    setTimeout(() => {

        if (interiorMessage) {
            interiorMessage.style.display =
                "none";
        }

    }, 1800);
}


/* =========================================================
   CREATE INTERIOR
   ========================================================= */

function createInterior(
    name,
    floorColor,
    accentColor
) {

    const group =
        new THREE.Group();


    /* floor */

    const floor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                0.3,
                20
            ),

            makeStandardMaterial(
                floorColor,
                0.8,
                0
            )
        );

    floor.position.y =
        -0.15;

    group.add(
        floor
    );


    /* walls */

    const wallMaterial =
        makeStandardMaterial(
            0x20242a,
            0.85,
            0
        );


    const backWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                8,
                0.4
            ),

            wallMaterial
        );

    backWall.position.set(
        0,
        4,
        -10
    );

    group.add(
        backWall
    );


    const leftWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.4,
                8,
                20
            ),

            wallMaterial
        );

    leftWall.position.set(
        -12,
        4,
        0
    );

    group.add(
        leftWall
    );


    const rightWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.4,
                8,
                20
            ),

            wallMaterial
        );

    rightWall.position.set(
        12,
        4,
        0
    );

    group.add(
        rightWall
    );


    /* ceiling */

    const ceiling =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                0.3,
                20
            ),

            makeStandardMaterial(
                0x111318,
                0.95,
                0
            )
        );

    ceiling.position.y =
        8;

    group.add(
        ceiling
    );


    /* entrance frame */

    const frame =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4,
                5,
                0.3
            ),

            makeStandardMaterial(
                accentColor,
                0.35,
                0.45
            )
        );

    frame.position.set(
        0,
        2.5,
        9.8
    );

    group.add(
        frame
    );


    /* counter */

    const counter =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                8,
                1.5,
                2
            ),

            makeStandardMaterial(
                0x35383e,
                0.7,
                0.15
            )
        );

    counter.position.set(
        0,
        0.75,
        -4
    );

    group.add(
        counter
    );


    /* accent neon */

    const neon =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                0.12,
                0.12
            ),

            makeBasicMaterial(
                accentColor
            )
        );

    neon.position.set(
        0,
        5.8,
        -9.7
    );

    group.add(
        neon
    );


    /* chairs */

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const chair =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1,
                    1,
                    1
                ),

                makeStandardMaterial(
                    0x4a2e22,
                    0.9,
                    0
                )
            );

        chair.position.set(
            i * 3,
            0.5,
            1
        );

        group.add(
            chair
        );
    }


    return group;
}


/* =========================================================
   BUILD INTERIOR
   ========================================================= */

function registerEnterableBuilding(
    name,
    x,
    z,
    interiorColor,
    accentColor
) {

    const interior =
        createInterior(
            name,
            interiorColor,
            accentColor
        );


    interior.visible =
        false;


    scene.add(
        interior
    );


    const entrance =
        new THREE.Vector3(
            x,
            0,
            z
        );


    enterableBuildings.push({

        name,

        entrance,

        interior
    });
}


/* =========================================================
   ENTERABLE LOCATIONS
   ========================================================= */

registerEnterableBuilding(
    "CAFE",
    -25,
    -72,
    0x4b403b,
    0xff8c42
);

registerEnterableBuilding(
    "MARKET",
    25,
    72,
    0x3d453c,
    0x67ff8a
);

registerEnterableBuilding(
    "GARAGE",
    -72,
    25,
    0x36383d,
    0x3bc7ff
);

registerEnterableBuilding(
    "ARCADE",
    72,
    -25,
    0x342b46,
    0xd84cff
);


/* =========================================================
   ENTER BUILDING
   ========================================================= */

function enterBuilding(
    building
) {

    if (
        !playerModel ||
        currentInterior
    ) {

        return;
    }


    outsidePlayerPosition.copy(
        playerModel.position
    );


    outsidePlayerRotation =
        playerModel.rotation.y;


    playerModel.position.set(
        0,
        0,
        5
    );


    playerModel.rotation.y =
        Math.PI;


    building.interior.visible =
        true;


    currentInterior =
        building;


    showInteriorMessage(
        "ENTERED " +
        building.name
    );
}


/* =========================================================
   EXIT BUILDING
   ========================================================= */

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
        outsidePlayerPosition
    );


    playerModel.rotation.y =
        outsidePlayerRotation;


    currentInterior =
        null;


    showInteriorMessage(
        "EXITED BUILDING"
    );
}


/* =========================================================
   BUILDING INTERACTION
   ========================================================= */

function updateBuildingInteraction() {

    if (
        !playerModel ||
        driving
    ) {

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


    let nearest =
        null;

    let nearestDistance =
        Infinity;


    enterableBuildings.forEach(
        (building) => {

            const distance =
                playerModel.position
                    .distanceTo(
                        building.entrance
                    );


            if (
                distance < 5 &&
                distance <
                    nearestDistance
            ) {

                nearest =
                    building;

                nearestDistance =
                    distance;
            }
        }
    );


    if (
        nearest
    ) {

        interactionText.style.display =
            "block";

        interactionText.textContent =
            "[ F ] ENTER " +
            nearest.name;
    }
}


/* =========================================================
   F KEY
   ========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key.toLowerCase() !==
            "f"
        ) {

            return;
        }


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
            !playerModel ||
            driving
        ) {

            return;
        }


        let nearest =
            null;

        let nearestDistance =
            Infinity;


        enterableBuildings.forEach(
            (building) => {

                const distance =
                    playerModel.position
                        .distanceTo(
                            building.entrance
                        );


                if (
                    distance < 5 &&
                    distance <
                        nearestDistance
                ) {

                    nearest =
                        building;

                    nearestDistance =
                        distance;
                }
            }
        );


        if (
            nearest
        ) {

            enterBuilding(
                nearest
            );
        }
    }
);


/* =========================================================
   INTERIOR VISUAL EFFECT
   ========================================================= */

let interiorClock =
    0;


function updateInteriors(
    delta
) {

    if (
        !currentInterior
    ) {

        return;
    }


    interiorClock +=
        delta;


    const interior =
        currentInterior.interior;


    interior.rotation.y =
        Math.sin(
            interiorClock *
            0.25
        ) * 0.002;
}


/* =========================================================
   BUILDING WORLD UPDATE
   ========================================================= */

function updateBuildingWorld(
    delta
) {

    updateBuildingInteraction();

    updateInteriors(
        delta
    );
}


/* =========================================================
   CONNECT TO WORLD LOOP
   ========================================================= */

const originalUpdateAllWorldSystems =
    updateAllWorldSystems;


updateAllWorldSystems =
    function(delta) {

        originalUpdateAllWorldSystems(
            delta
        );

        updateBuildingWorld(
            delta
        );
    };


console.log(
    "ENTERABLE BUILDINGS ONLINE"
);
/* =========================================================
   STEP 8
   CITY ACTIVITIES
   SHOPS
   GARAGE
   CAR CUSTOMIZATION
   NPC ACTIVITY POINTS
   ========================================================= */


/* =========================================================
   ACTIVITY HUD
   ========================================================= */

let activityHUD =
    document.getElementById(
        "activity-hud"
    );


if (!activityHUD) {

    activityHUD =
        document.createElement(
            "div"
        );

    activityHUD.id =
        "activity-hud";

    activityHUD.style.position =
        "fixed";

    activityHUD.style.left =
        "50%";

    activityHUD.style.bottom =
        "60px";

    activityHUD.style.transform =
        "translateX(-50%)";

    activityHUD.style.padding =
        "14px 22px";

    activityHUD.style.background =
        "rgba(0,0,0,0.86)";

    activityHUD.style.border =
        "1px solid rgba(255,50,50,0.8)";

    activityHUD.style.color =
        "#ffffff";

    activityHUD.style.fontFamily =
        "Arial, sans-serif";

    activityHUD.style.fontSize =
        "14px";

    activityHUD.style.fontWeight =
        "bold";

    activityHUD.style.lineHeight =
        "1.6";

    activityHUD.style.textAlign =
        "center";

    activityHUD.style.zIndex =
        "140";

    activityHUD.style.pointerEvents =
        "none";

    activityHUD.style.display =
        "none";

    document.body.appendChild(
        activityHUD
    );
}


function showActivityHUD(
    text
) {

    activityHUD.innerHTML =
        text;

    activityHUD.style.display =
        "block";
}


function hideActivityHUD() {

    activityHUD.style.display =
        "none";
}


/* =========================================================
   SHOP STATE
   ========================================================= */

let shopInteraction =
    null;

let garageOpen =
    false;

let cafeHealthRestore =
    25;


/* =========================================================
   SHOP POSITIONS
   ========================================================= */

const cityShopActivities = [

    {
        name:
            "CAFE",

        position:
            new THREE.Vector3(
                -25,
                0,
                -72
            ),

        price:
            50
    },

    {
        name:
            "MARKET",

        position:
            new THREE.Vector3(
                25,
                0,
                72
            ),

        price:
            100
    },

    {
        name:
            "GARAGE",

        position:
            new THREE.Vector3(
                -72,
                0,
                25
            ),

        price:
            0
    },

    {
        name:
            "ARCADE",

        position:
            new THREE.Vector3(
                72,
                0,
                -25
            ),

        price:
            50
    }
];


/* =========================================================
   ACTIVITY MARKERS
   ========================================================= */

function createActivityMarker(
    x,
    z,
    color
) {

    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                1.8,
                0.08,
                10,
                32
            ),

            new THREE.MeshBasicMaterial({
                color:
                    color
            })
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.set(
        x,
        0.18,
        z
    );

    scene.add(
        ring
    );

    return ring;
}


const activityMarkers = [];


activityMarkers.push(
    createActivityMarker(
        -25,
        -72,
        0xff9933
    )
);


activityMarkers.push(
    createActivityMarker(
        25,
        72,
        0x55ff88
    )
);


activityMarkers.push(
    createActivityMarker(
        -72,
        25,
        0x38ccff
    )
);


activityMarkers.push(
    createActivityMarker(
        72,
        -25,
        0xdd44ff
    )
);


/* =========================================================
   CAR UPGRADE STATE
   ========================================================= */

let carPerformanceLevel =
    0;

let carPaintIndex =
    0;


const carPaintColors = [

    0x9d1018,

    0x1551c7,

    0x159447,

    0xf0b51d,

    0x6e35c9,

    0xe7e7e7
];


/* =========================================================
   FIND CAR BODY
   ========================================================= */

function getPlayerCarBody() {

    if (
        !car
    ) {

        return null;
    }


    for (
        let i = 0;
        i < car.children.length;
        i++
    ) {

        const child =
            car.children[i];


        if (
            child.isMesh &&
            child.geometry &&
            child.geometry.type ===
                "BoxGeometry"
        ) {

            return child;
        }
    }


    return null;
}


/* =========================================================
   CHANGE CAR PAINT
   ========================================================= */

function changeCarPaint() {

    if (
        !car
    ) {

        return;
    }


    const body =
        getPlayerCarBody();


    if (
        !body ||
        !body.material
    ) {

        return;
    }


    carPaintIndex++;

    if (
        carPaintIndex >=
        carPaintColors.length
    ) {

        carPaintIndex =
            0;
    }


    body.material.color.setHex(
        carPaintColors[
            carPaintIndex
        ]
    );


    showWorldMessage(
        "CAR PAINT UPDATED"
    );
}


/* =========================================================
   REPAIR CAR
   ========================================================= */

function repairPlayerCar() {

    if (
        !car
    ) {

        return;
    }


    if (
        money < 150
    ) {

        showWorldMessage(
            "NOT ENOUGH MONEY"
        );

        return;
    }


    money -=
        150;


    vehicleSpeed =
        0;


    showWorldMessage(
        "CAR REPAIRED  -₹150"
    );
}


/* =========================================================
   PERFORMANCE UPGRADE
   ========================================================= */

function upgradeCarPerformance() {

    if (
        !car
    ) {

        return;
    }


    if (
        carPerformanceLevel >=
        3
    ) {

        showWorldMessage(
            "MAX PERFORMANCE REACHED"
        );

        return;
    }


    const price =
        300 +
        carPerformanceLevel *
        200;


    if (
        money <
        price
    ) {

        showWorldMessage(
            "NEED ₹" +
            price
        );

        return;
    }


    money -=
        price;


    carPerformanceLevel++;


    showWorldMessage(
        "CAR PERFORMANCE LV." +
        carPerformanceLevel
    );
}


/* =========================================================
   APPLY PERFORMANCE
   ========================================================= */

function getCarTopSpeed() {

    return (
        32 +
        carPerformanceLevel *
        5
    );
}


/* =========================================================
   CAFE
   ========================================================= */

function useCafe() {

    if (
        money <
        50
    ) {

        showWorldMessage(
            "CAFE: NEED ₹50"
        );

        return;
    }


    money -=
        50;


    playerHealth =
        Math.min(
            100,
            playerHealth +
                cafeHealthRestore
        );


    showWorldMessage(
        "CAFE DRINK  +HEALTH"
    );


    updateHealth();
}


/* =========================================================
   MARKET
   ========================================================= */

function useMarket() {

    if (
        money <
        100
    ) {

        showWorldMessage(
            "MARKET: NEED ₹100"
        );

        return;
    }


    money -=
        100;


    playerHealth =
        Math.min(
            100,
            playerHealth +
                10
        );


    showWorldMessage(
        "SUPPLY PACK PURCHASED"
    );


    updateHealth();
}


/* =========================================================
   ARCADE
   ========================================================= */

function useArcade() {

    if (
        money <
        50
    ) {

        showWorldMessage(
            "ARCADE: NEED ₹50"
        );

        return;
    }


    money -=
        50;


    showWorldMessage(
        "ARCADE ACTIVITY COMPLETE"
    );
}


/* =========================================================
   GARAGE HUD
   ========================================================= */

function showGarageMenu() {

    garageOpen =
        true;


    showActivityHUD(

        "<div style='font-size:18px;'>" +
        "🔧 GARAGE" +
        "</div>" +

        "<br>" +

        "[1] Change Paint" +
        "<br>" +

        "[2] Performance Upgrade" +
        "<br>" +

        "[3] Repair Car — ₹150" +
        "<br><br>" +

        "ESC = Close"
    );
}


/* =========================================================
   CLOSE GARAGE
   ========================================================= */

function closeGarageMenu() {

    garageOpen =
        false;

    hideActivityHUD();
}


/* =========================================================
   SHOP ACTIVITY CHECK
   ========================================================= */

function findNearbyActivity() {

    if (
        !playerModel ||
        driving ||
        currentInterior
    ) {

        return null;
    }


    let closest =
        null;


    let closestDistance =
        Infinity;


    cityShopActivities.forEach(
        (activity) => {

            const distance =
                playerModel.position
                    .distanceTo(
                        activity.position
                    );


            if (
                distance <
                    5 &&
                distance <
                    closestDistance
            ) {

                closest =
                    activity;

                closestDistance =
                    distance;
            }
        }
    );


    return closest;
}


/* =========================================================
   ACTIVITY INTERACTION
   ========================================================= */

function updateActivityInteraction() {

    if (
        garageOpen
    ) {

        return;
    }


    const activity =
        findNearbyActivity();


    if (
        !activity
    ) {

        return;
    }


    interactionText.style.display =
        "block";


    if (
        activity.name ===
        "CAFE"
    ) {

        interactionText.textContent =
            "[ E ] BUY CAFE DRINK — ₹50";

    } else if (
        activity.name ===
        "MARKET"
    ) {

        interactionText.textContent =
            "[ E ] BUY SUPPLY — ₹100";

    } else if (
        activity.name ===
        "GARAGE"
    ) {

        interactionText.textContent =
            "[ E ] OPEN GARAGE";

    } else {

        interactionText.textContent =
            "[ E ] PLAY ARCADE — ₹50";
    }
}


/* =========================================================
   ACTIVITY INPUT
   ========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        /* garage */

        if (
            garageOpen
        ) {

            if (
                key === "escape"
            ) {

                closeGarageMenu();

                return;
            }


            if (
                key === "1"
            ) {

                changeCarPaint();

                return;
            }


            if (
                key === "2"
            ) {

                upgradeCarPerformance();

                return;
            }


            if (
                key === "3"
            ) {

                repairPlayerCar();

                return;
            }


            return;
        }


        if (
            key !==
            "e"
        ) {

            return;
        }


        if (
            !playerModel ||
            driving
        ) {

            return;
        }


        if (
            currentInterior
        ) {

            if (
                currentInterior.name ===
                "CAFE"
            ) {

                useCafe();

                return;
            }


            if (
                currentInterior.name ===
                "MARKET"
            ) {

                useMarket();

                return;
            }


            if (
                currentInterior.name ===
                "ARCADE"
            ) {

                useArcade();

                return;
            }


            if (
                currentInterior.name ===
                "GARAGE"
            ) {

                showGarageMenu();

                return;
            }
        }
    }
);


/* =========================================================
   NPC ACTIVITY POINTS
   ========================================================= */

const npcActivityPoints = [

    {
        name:
            "CAFE",
        position:
            new THREE.Vector3(
                -25,
                0,
                -69
            )
    },

    {
        name:
            "MARKET",
        position:
            new THREE.Vector3(
                25,
                0,
                69
            )
    },

    {
        name:
            "ARCADE",
        position:
            new THREE.Vector3(
                69,
                0,
                -25
            )
    }
];


/* =========================================================
   NPC ACTIVITY STATE
   ========================================================= */

npcs.forEach(
    (npc) => {

        npc.userData.activityTimer =
            Math.random() *
            8;

        npc.userData.activityTarget =
            null;

        npc.userData.activityMode =
            false;
    }
);


/* =========================================================
   FIND NPC ACTIVITY
   ========================================================= */

function findNearestNPCActivity(
    npc
) {

    let nearest =
        null;


    let distance =
        Infinity;


    npcActivityPoints.forEach(
        (point) => {

            const d =
                npc.position.distanceTo(
                    point.position
                );


            if (
                d <
                    distance
            ) {

                distance =
                    d;

                nearest =
                    point;
            }
        }
    );


    if (
        distance <
        18
    ) {

        return nearest;
    }


    return null;
}


/* =========================================================
   NPC ACTIVITY UPDATE
   ========================================================= */

function updateNPCActivities(
    delta
) {

    npcs.forEach(
        (npc) => {

            npc.userData.activityTimer -=
                delta;


            if (
                npc.userData.activityTimer <=
                0
            ) {

                npc.userData.activityTimer =
                    8 +
                    Math.random() * 10;


                if (
                    Math.random() <
                    0.3
                ) {

                    npc.userData.activityTarget =
                        findNearestNPCActivity(
                            npc
                        );
                }
            }


            const activity =
                npc.userData.activityTarget;


            if (
                !activity
            ) {

                return;
            }


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        activity.position,
                        npc.position
                    );


            direction.y =
                0;


            const distance =
                direction.length();


            if (
                distance >
                3
            ) {

                direction.normalize();


                npc.position.addScaledVector(
                    direction,
                    npc.userData.speed *
                        delta *
                        0.8
                );


                npc.rotation.y =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );

            } else {

                npc.userData.activityTarget =
                    null;

                npc.userData.activityMode =
                    true;
            }
        }
    );
}


/* =========================================================
   ACTIVITY MARKER ANIMATION
   ========================================================= */

function updateActivityMarkers(
    delta
) {

    const time =
        performance.now() *
        0.001;


    activityMarkers.forEach(
        (marker, index) => {

            marker.rotation.z +=
                delta *
                0.8;


            marker.position.y =
                0.18 +
                Math.sin(
                    time * 2 +
                    index
                ) *
                0.08;
        }
    );
}


/* =========================================================
   UPDATE CAR SPEED
   ========================================================= */

function getUpdatedCarSpeed() {

    return getCarTopSpeed();
}


/* =========================================================
   OVERRIDE CAR UPDATE SPEED LIMIT
   ========================================================= */

const previousCarUpdate =
    updateCar;


updateCar =
    function(delta) {

        previousCarUpdate(delta);


        if (
            car &&
            driving
        ) {

            const topSpeed =
                getUpdatedCarSpeed();


            if (
                vehicleSpeed >
                topSpeed
            ) {

                vehicleSpeed =
                    topSpeed;
            }
        }
    };


/* =========================================================
   EXTEND WORLD UPDATE
   ========================================================= */

const previousWorldUpdate =
    updateAllWorldSystems;


updateAllWorldSystems =
    function(delta) {

        previousWorldUpdate(
            delta
        );


        updateActivityMarkers(
            delta
        );


        updateNPCActivities(
            delta
        );


        updateActivityInteraction();
    };


/* =========================================================
   GARAGE MESSAGE
   ========================================================= */

console.log(
    "CITY ACTIVITIES ONLINE"
);

console.log(
    "CAFE ONLINE"
);

console.log(
    "MARKET ONLINE"
);

console.log(
    "GARAGE ONLINE"
);

console.log(
    "ARCADE ONLINE"
);

console.log(
    "CAR CUSTOMIZATION ONLINE"
);


/* =========================================================
   END STEP 8
   ========================================================= */
/* =========================================================
   STEP 9
   SMART TRAFFIC + PEDESTRIAN BEHAVIOR
   ========================================================= */


/* =========================================================
   SMART TRAFFIC STATE
   ========================================================= */

const smartTrafficSettings = {

    stopDistance: 18,

    slowDistance: 32,

    stopSpeed: 0,

    slowFactor: 0.35,

    normalFactor: 1
};


/* =========================================================
   FIND NEAREST TRAFFIC LIGHT
   ========================================================= */

function getNearestTrafficLight(
    vehicle
) {

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    trafficLights.forEach(
        (signal) => {

            const distance =
                vehicle.position.distanceTo(
                    signal.group.position
                );


            if (
                distance <
                    nearestDistance
            ) {

                nearest =
                    signal;

                nearestDistance =
                    distance;
            }
        }
    );


    if (
        nearestDistance >
        35
    ) {

        return null;
    }


    return {

        signal:
            nearest,

        distance:
            nearestDistance
    };
}


/* =========================================================
   GET TRAFFIC LIGHT STATE
   ========================================================= */

function getTrafficLightState(
    signal
) {

    if (
        !signal
    ) {

        return "green";
    }


    const cycle =
        signal.timer % 15;


    if (
        cycle < 7
    ) {

        return "green";
    }


    if (
        cycle < 9
    ) {

        return "yellow";
    }


    return "red";
}


/* =========================================================
   SMART TRAFFIC DECISION
   ========================================================= */

function getTrafficSpeedMultiplier(
    vehicle
) {

    const nearby =
        getNearestTrafficLight(
            vehicle
        );


    if (
        !nearby
    ) {

        return 1;
    }


    const state =
        getTrafficLightState(
            nearby.signal
        );


    const distance =
        nearby.distance;


    if (
        state ===
            "red" &&
        distance <
            smartTrafficSettings
                .stopDistance
    ) {

        return 0;
    }


    if (
        state ===
            "yellow" &&
        distance <
            smartTrafficSettings
                .slowDistance
    ) {

        return smartTrafficSettings
            .slowFactor;
    }


    if (
        state ===
            "red" &&
        distance <
            smartTrafficSettings
                .slowDistance
    ) {

        return 0.15;
    }


    return 1;
}


/* =========================================================
   TRAFFIC STOP SMOOTHING
   ========================================================= */

trafficCars.forEach(
    (traffic) => {

        traffic.userData.currentTrafficSpeed =
            traffic.userData.speed;
    }
);


/* =========================================================
   SMART TRAFFIC UPDATE
   ========================================================= */

function updateSmartTraffic(
    delta
) {

    trafficCars.forEach(
        (traffic) => {

            if (
                !traffic ||
                !traffic.userData
            ) {

                return;
            }


            const multiplier =
                getTrafficSpeedMultiplier(
                    traffic
                );


            const wantedSpeed =
                traffic.userData.speed *
                multiplier;


            if (
                traffic.userData
                    .currentTrafficSpeed ===
                    undefined
            ) {

                traffic.userData
                    .currentTrafficSpeed =
                    traffic.userData.speed;
            }


            traffic.userData
                .currentTrafficSpeed =
                THREE.MathUtils.lerp(

                    traffic.userData
                        .currentTrafficSpeed,

                    wantedSpeed,

                    Math.min(
                        delta * 5,
                        1
                    )
                );


            traffic.userData.smartSpeed =
                traffic.userData
                    .currentTrafficSpeed;
        }
    );
}


/* =========================================================
   SMART TRAFFIC MOVEMENT
   ========================================================= */

function updateSmartTrafficMovement(
    delta
) {

    trafficCars.forEach(
        (traffic) => {

            if (
                !traffic ||
                !traffic.userData
            ) {

                return;
            }


            const axis =
                traffic.userData.axis;


            const direction =
                traffic.userData.direction;


            const speed =
                traffic.userData
                    .smartSpeed !==
                    undefined

                    ? traffic.userData
                        .smartSpeed

                    : traffic.userData
                        .speed;


            if (
                axis ===
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


            /* world wrap */

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


            /* wheels */

            if (
                traffic.userData.wheels
            ) {

                traffic.userData
                    .wheels
                    .forEach(
                        (wheel) => {

                            wheel.rotation.x +=
                                speed *
                                delta *
                                1.4;
                        }
                    );
            }
        }
    );
}


/* =========================================================
   PEDESTRIAN CROSSING SYSTEM
   ========================================================= */

const pedestrianCrossings = [

    {
        x: 0,
        z: -18,
        width: 18,
        depth: 5
    },

    {
        x: 0,
        z: 18,
        width: 18,
        depth: 5
    },

    {
        x: -18,
        z: 0,
        width: 5,
        depth: 18
    },

    {
        x: 18,
        z: 0,
        width: 5,
        depth: 18
    },

    {
        x: 0,
        z: -70,
        width: 18,
        depth: 5
    },

    {
        x: 0,
        z: 70,
        width: 18,
        depth: 5
    }
];


/* =========================================================
   CREATE CROSSWALK
   ========================================================= */

function createCrosswalk(
    crossing
) {

    const stripes =
        7;


    for (
        let i = 0;
        i < stripes;
        i++
    ) {

        const stripe =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    crossing.width,
                    0.03,
                    0.45
                ),

                makeBasicMaterial(
                    0xe8e8e8
                )
            );


        stripe.position.set(

            crossing.x,

            0.085,

            crossing.z -
                crossing.depth / 2 +
                i *
                    (
                        crossing.depth /
                        stripes
                    )
        );


        scene.add(
            stripe
        );
    }
}


pedestrianCrossings.forEach(
    createCrosswalk
);


/* =========================================================
   NPC WAITING STATE
   ========================================================= */

npcs.forEach(
    (npc) => {

        npc.userData.crossingWait =
            0;

        npc.userData.waitingForLight =
            false;

        npc.userData.normalNPCSpeed =
            npc.userData.speed;
    }
);


/* =========================================================
   NEAREST CROSSING
   ========================================================= */

function getNearestCrossing(
    npc
) {

    let nearest =
        null;

    let distance =
        Infinity;


    pedestrianCrossings.forEach(
        (crossing) => {

            const dx =
                npc.position.x -
                crossing.x;


            const dz =
                npc.position.z -
                crossing.z;


            const d =
                Math.sqrt(
                    dx * dx +
                    dz * dz
                );


            if (
                d <
                    distance
            ) {

                distance =
                    d;

                nearest =
                    crossing;
            }
        }
    );


    if (
        distance >
        14
    ) {

        return null;
    }


    return {

        crossing,

        distance
    };
}


/* =========================================================
   CHECK SAFE CROSSING
   ========================================================= */

function isCrossingSafe() {

    for (
        const signal
        of trafficLights
    ) {

        const state =
            getTrafficLightState(
                signal
            );


        if (
            state ===
            "green"
        ) {

            return false;
        }
    }


    return true;
}


/* =========================================================
   SMART NPC MOVEMENT
   ========================================================= */

function updateSmartNPCs(
    delta
) {

    npcs.forEach(
        (npc) => {

            if (
                !npc
            ) {

                return;
            }


            const crossing =
                getNearestCrossing(
                    npc
                );


            if (
                crossing &&
                crossing.distance <
                    5
            ) {

                const safe =
                    isCrossingSafe();


                if (
                    !safe
                ) {

                    npc.userData
                        .waitingForLight =
                        true;


                    npc.userData
                        .crossingWait +=
                        delta;


                    npc.userData.speed =
                        0;


                    return;
                }


                npc.userData
                    .waitingForLight =
                    false;


                npc.userData
                    .speed =

                    npc.userData
                        .normalNPCSpeed;
            }


            if (
                npc.userData
                    .waitingForLight
            ) {

                if (
                    isCrossingSafe()
                ) {

                    npc.userData
                        .waitingForLight =
                        false;


                    npc.userData.speed =
                        npc.userData
                            .normalNPCSpeed;
                } else {

                    npc.userData.speed =
                        0;

                    return;
                }
            }
        }
    );
}


/* =========================================================
   CITY TRAFFIC DETAIL
   ========================================================= */

const trafficBrakeLights =
    [];


function createTrafficBrakeLight(
    carObject
) {

    if (
        !carObject
    ) {

        return;
    }


    const material =
        makeBasicMaterial(
            0xff2020
        );


    const left =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.65,
                0.18,
                0.08
            ),

            material
        );


    const right =
        left.clone();


    left.position.set(
        -1.05,
        1.05,
        3.12
    );


    right.position.set(
        1.05,
        1.05,
        3.12
    );


    carObject.add(
        left
    );

    carObject.add(
        right
    );


    trafficBrakeLights.push({

        car:
            carObject,

        left,

        right
    });
}


trafficCars.forEach(
    (traffic) => {

        createTrafficBrakeLight(
            traffic
        );
    }
);


/* =========================================================
   BRAKE LIGHT UPDATE
   ========================================================= */

function updateTrafficBrakeLights() {

    trafficBrakeLights.forEach(
        (item) => {

            if (
                !item.car ||
                !item.car.userData
            ) {

                return;
            }


            const current =
                item.car.userData
                    .smartSpeed;


            const normal =
                item.car.userData
                    .speed;


            const braking =
                current <
                normal *
                    0.45;


            item.left.visible =
                braking;


            item.right.visible =
                braking;
        }
    );
}


/* =========================================================
   EXTRA PARKED CARS
   ========================================================= */

const parkedCars =
    [];


function createParkedCar(
    x,
    z,
    rotation = 0
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.2,
                0.9,
                5.5
            ),

            makeStandardMaterial(
                0x3c4650,
                0.45,
                0.4
            )
        );


    body.position.y =
        0.75;


    group.add(
        body
    );


    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.4,
                1,
                2.3
            ),

            makeStandardMaterial(
                0x1c242c,
                0.25,
                0.55
            )
        );


    roof.position.y =
        1.55;


    group.add(
        roof
    );


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    parkedCars.push(
        group
    );
}


/* =========================================================
   PARKED CAR LOCATIONS
   ========================================================= */

createParkedCar(
    -100,
    50,
    Math.PI / 2
);

createParkedCar(
    -92,
    50,
    Math.PI / 2
);

createParkedCar(
    100,
    -50,
    -Math.PI / 2
);

createParkedCar(
    92,
    -50,
    -Math.PI / 2
);

createParkedCar(
    48,
    105,
    Math.PI
);

createParkedCar(
    58,
    105,
    Math.PI
);


/* =========================================================
   TRAFFIC / NPC WORLD UPDATE
   ========================================================= */

function updateSmartCityTraffic(
    delta
) {

    updateSmartTraffic(
        delta
    );


    updateSmartTrafficMovement(
        delta
    );


    updateSmartNPCs(
        delta
    );


    updateTrafficBrakeLights();
}


/* =========================================================
   CONNECT WITHOUT REASSIGNING CONST FUNCTIONS
   =========================================================

   IMPORTANT:
   Instead of replacing updateAllWorldSystems,
   we call this function from the main loop below.
   ========================================================= */


/* =========================================================
   MAIN LOOP PATCH
   ========================================================= */

const originalAnimateGame =
    animateGame;


function smartAnimateGame() {

    requestAnimationFrame(
        smartAnimateGame
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


    updateAllWorldSystems(
        delta
    );


    updateSmartCityTraffic(
        delta
    );


    updateCamera(
        delta
    );


    if (
        playerMixer
    ) {

        playerMixer.update(
            delta
        );
    }


    if (
        shootCooldown >
        0
    ) {

        shootCooldown -=
            delta;
    }


    if (
        damageCooldown >
        0
    ) {

        damageCooldown -=
            delta;
    }


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   START SMART GAME LOOP
   ========================================================= */

console.log(
    "SMART TRAFFIC ONLINE"
);

console.log(
    "PEDESTRIAN CROSSINGS ONLINE"
);

console.log(
    "BRAKE LIGHT SYSTEM ONLINE"
);

console.log(
    "PARKED CARS ONLINE"
);


/* =========================================================
   END STEP 9
   ========================================================= */
/* =========================================================
   STEP 10
   PUBLIC TRANSPORT / CITY BUSES
   ========================================================= */


/* =========================================================
   BUS SYSTEM
   ========================================================= */

const cityBuses = [];
const busStops = [];


/* =========================================================
   BUS STOP CREATION
   ========================================================= */

function createBusStop(
    x,
    z,
    rotation = 0
) {

    const group =
        new THREE.Group();


    /* shelter */

    const shelter =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                5,
                2.8,
                2.2
            ),

            makeStandardMaterial(
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


    /* roof */

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                5.5,
                0.18,
                2.7
            ),

            makeStandardMaterial(
                0x14171b,
                0.6,
                0.4
            )
        );


    roof.position.y =
        2.9;


    group.add(
        roof
    );


    /* seat */

    const seat =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.3,
                0.22,
                0.65
            ),

            makeStandardMaterial(
                0x6a4228,
                0.85,
                0
            )
        );


    seat.position.set(
        0,
        1,
        0
    );


    group.add(
        seat
    );


    /* sign pole */

    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.08,
                0.1,
                3.5,
                8
            ),

            makeStandardMaterial(
                0x303030,
                0.8,
                0.2
            )
        );


    pole.position.set(
        2.3,
        1.75,
        -0.4
    );


    group.add(
        pole
    );


    /* sign */

    const sign =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.0,
                1.0,
                0.15
            ),

            makeBasicMaterial(
                0xffd21f
            )
        );


    sign.position.set(
        2.3,
        3.45,
        -0.4
    );


    group.add(
        sign
    );


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        rotation;


    scene.add(
        group
    );


    busStops.push({

        group,

        position:
            group.position.clone(),

        waitingNPCs:
            []
    });
}


/* =========================================================
   BUS STOP LOCATIONS
   ========================================================= */

createBusStop(
    -48,
    -14,
    Math.PI / 2
);

createBusStop(
    48,
    14,
    -Math.PI / 2
);

createBusStop(
    -14,
    -48,
    0
);

createBusStop(
    14,
    48,
    Math.PI
);

createBusStop(
    -78,
    14,
    -Math.PI / 2
);

createBusStop(
    78,
    -14,
    Math.PI / 2
);


/* =========================================================
   BUS CREATION
   ========================================================= */

function createCityBus(
    x,
    z,
    routeOffset = 0
) {

    const group =
        new THREE.Group();


    /* main bus body */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.1,
                2.8,
                11
            ),

            makeStandardMaterial(
                0xd02b32,
                0.35,
                0.45
            )
        );


    body.position.y =
        2;


    body.castShadow =
        true;


    group.add(
        body
    );


    /* lower section */

    const lower =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.25,
                0.75,
                10.8
            ),

            makeStandardMaterial(
                0x22272d,
                0.7,
                0.3
            )
        );


    lower.position.y =
        0.7;


    group.add(
        lower
    );


    /* windows */

    const windowMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x153344,

            roughness:
                0.08,

            metalness:
                0.4
        });


    for (
        let i = -2;
        i <= 2;
        i++
    ) {

        const sideWindow =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.08,
                    1.45,
                    1.45
                ),

                windowMaterial
            );


        sideWindow.position.set(
            2.06,
            2.2,
            i * 1.9
        );


        group.add(
            sideWindow
        );


        const otherWindow =
            sideWindow.clone();


        otherWindow.position.x =
            -2.06;


        group.add(
            otherWindow
        );
    }


    /* front windshield */

    const frontWindow =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3.0,
                1.5,
                0.08
            ),

            windowMaterial
        );


    frontWindow.position.set(
        0,
        2.2,
        -5.52
    );


    group.add(
        frontWindow
    );


    /* bus headlights */

    for (
        const side of [-1, 1]
    ) {

        const lamp =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.65,
                    0.3,
                    0.1
                ),

                makeBasicMaterial(
                    0xffffdd
                )
            );


        lamp.position.set(
            side * 1.25,
            1.25,
            -5.55
        );


        group.add(
            lamp
        );
    }


    /* wheels */

    const wheels =
        [];


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.72,
            0.72,
            0.55,
            18
        );


    const wheelMaterial =
        makeStandardMaterial(
            0x111111,
            0.85,
            0
        );


    const wheelPositions = [

        [-2.1, 0.7, -3.5],
        [2.1, 0.7, -3.5],
        [-2.1, 0.7, 3.2],
        [2.1, 0.7, 3.2]
    ];


    wheelPositions.forEach(
        (position) => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                position[0],
                position[1],
                position[2]
            );


            group.add(
                wheel
            );


            wheels.push(
                wheel
            );
        }
    );


    /* roof lights */

    const roofLight =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.2,
                0.18,
                0.45
            ),

            makeBasicMaterial(
                0xffdb32
            )
        );


    roofLight.position.y =
        3.45;


    group.add(
        roofLight
    );


    group.position.set(
        x,
        0,
        z
    );


    group.userData.routeOffset =
        routeOffset;


    group.userData.routePosition =
        routeOffset;


    group.userData.speed =
        8;


    group.userData.wheels =
        wheels;


    group.userData.stopTimer =
        0;


    group.userData.nextStop =
        0;


    group.userData.stopped =
        false;


    scene.add(
        group
    );


    cityBuses.push(
        group
    );
}


/* =========================================================
   CREATE BUSES
   ========================================================= */

createCityBus(
    -5,
    -100,
    0
);

createCityBus(
    100,
    5,
    0.5
);

createCityBus(
    5,
    100,
    1
);


/* =========================================================
   BUS ROUTE
   ========================================================= */

const busRoute = [

    new THREE.Vector3(
        -5,
        0,
        -120
    ),

    new THREE.Vector3(
        -5,
        0,
        120
    ),

    new THREE.Vector3(
        5,
        0,
        120
    ),

    new THREE.Vector3(
        5,
        0,
        -120
    )
];


/* =========================================================
   SECOND BUS ROUTE
   ========================================================= */

const busRoute2 = [

    new THREE.Vector3(
        -120,
        0,
        5
    ),

    new THREE.Vector3(
        120,
        0,
        5
    ),

    new THREE.Vector3(
        120,
        0,
        -5
    ),

    new THREE.Vector3(
        -120,
        0,
        -5
    )
];


/* =========================================================
   GET ROUTE POSITION
   ========================================================= */

function getPointOnBusRoute(
    route,
    distance
) {

    let remaining =
        distance;


    for (
        let i = 0;
        i < route.length;
        i++
    ) {

        const start =
            route[i];


        const end =
            route[
                (i + 1) %
                route.length
            ];


        const segmentLength =
            start.distanceTo(
                end
            );


        if (
            remaining <=
            segmentLength
        ) {

            const ratio =
                remaining /
                segmentLength;


            return start.clone().lerp(
                end,
                ratio
            );
        }


        remaining -=
            segmentLength;
    }


    return route[0].clone();
}


/* =========================================================
   BUS UPDATE
   ========================================================= */

function updateCityBuses(
    delta
) {

    cityBuses.forEach(
        (bus, index) => {

            const route =
                index % 2 === 0
                    ? busRoute
                    : busRoute2;


            bus.userData.routePosition +=
                bus.userData.speed *
                delta;


            let totalLength =
                0;


            route.forEach(
                (point, i) => {

                    totalLength +=
                        point.distanceTo(
                            route[
                                (i + 1) %
                                route.length
                            ]
                        );
                }
            );


            if (
                bus.userData.routePosition >=
                totalLength
            ) {

                bus.userData.routePosition -=
                    totalLength;
            }


            const current =
                getPointOnBusRoute(
                    route,
                    bus.userData.routePosition
                );


            const ahead =
                getPointOnBusRoute(
                    route,
                    bus.userData.routePosition +
                        1
                );


            const direction =
                new THREE.Vector3()
                    .subVectors(
                        ahead,
                        current
                    )
                    .normalize();


            bus.position.copy(
                current
            );


            bus.position.y =
                0;


            if (
                direction.lengthSq() >
                0
            ) {

                bus.rotation.y =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );
            }


            if (
                bus.userData.wheels
            ) {

                bus.userData.wheels
                    .forEach(
                        (wheel) => {

                            wheel.rotation.x +=
                                bus.userData
                                    .speed *
                                delta;
                        }
                    );
            }
        }
    );
}


/* =========================================================
   BUS STOP LIGHTS
   ========================================================= */

function updateBusStopLights() {

    const night =
        worldTime >= 18 ||
        worldTime < 6;


    busStops.forEach(
        (stop) => {

            stop.group.traverse(
                (object) => {

                    if (
                        object.isMesh &&
                        object.material &&
                        object.material.color
                    ) {

                        /*
                           Sign stays visible,
                           but shelter receives
                           a subtle night effect.
                        */
                    }
                }
            );
        }
    );
}


/* =========================================================
   NPC BUS STOP BEHAVIOR
   ========================================================= */

function updateNPCBusStops(
    delta
) {

    npcs.forEach(
        (npc) => {

            if (
                !npc ||
                npc.userData
                    .activityTarget
            ) {

                return;
            }


            let nearestStop =
                null;


            let nearestDistance =
                Infinity;


            busStops.forEach(
                (stop) => {

                    const distance =
                        npc.position
                            .distanceTo(
                                stop.position
                            );


                    if (
                        distance <
                            8 &&
                        distance <
                            nearestDistance
                    ) {

                        nearestStop =
                            stop;

                        nearestDistance =
                            distance;
                    }
                }
            );


            if (
                !nearestStop
            ) {

                return;
            }


            /*
               Occasionally make an NPC
               wait at the bus stop.
            */

            if (
                Math.random() <
                delta * 0.025
            ) {

                npc.userData
                    .busWaiting =
                    4 +
                    Math.random() * 5;

                npc.userData
                    .busStop =
                    nearestStop;
            }


            if (
                npc.userData
                    .busWaiting >
                0
            ) {

                npc.userData
                    .busWaiting -=
                    delta;


                npc.userData.speed =
                    0;


                if (
                    npc.userData
                        .busWaiting <=
                    0
                ) {

                    npc.userData.speed =
                        npc.userData
                            .normalNPCSpeed;

                    npc.userData
                        .busStop =
                        null;
                }
            }
        }
    );
}


/* =========================================================
   BUS WORLD UPDATE
   ========================================================= */

function updatePublicTransport(
    delta
) {

    updateCityBuses(
        delta
    );


    updateBusStopLights();


    updateNPCBusStops(
        delta
    );
}


/* =========================================================
   ADD TO SMART CITY LOOP
   ========================================================= */

const previousSmartCityTraffic =
    updateSmartCityTraffic;


updateSmartCityTraffic =
    function(delta) {

        previousSmartCityTraffic(
            delta
        );


        updatePublicTransport(
            delta
        );
    };


/* =========================================================
   BUS STATUS
   ========================================================= */

console.log(
    "PUBLIC TRANSPORT ONLINE"
);

console.log(
    "BUS STOPS ONLINE"
);

console.log(
    "CITY BUSES ONLINE"
);


/* =========================================================
   END STEP 10
   ========================================================= */