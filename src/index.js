import ThreeGlobe from "three-globe";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
  // Euler,
  // AxesHelper,
  // DirectionalLightHelper,
  // CameraHelper,
  // SphereGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { createGlowMesh } from "three-glow-mesh";
import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";
import airportHistory from "./files/my-airports.json";
var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var Globe;

var canvas = document.getElementById('map-container');

init();
initGlobe();
onWindowResize();
animate();


// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // document.body.appendChild(renderer.domElement);

  // renderer.setSize(500, 500)
  // renderer.setSize(mapContainer.offsetWidth, mapContainer.offsetHeight);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight("#fff", 0.3));
  scene.background = new Color('#fff');

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight('<div id="fff"></div>', 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight('#fff', 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog('#0cc', 400, 2000);

  // Helpers
  // const axesHelper = new AxesHelper(800);
  // // scene.add(axesHelper);
  // // var helper = new DirectionalLightHelper(dLight);
  // // scene.add(helper);
  // // var helperCamera = new CameraHelper(dLight.shadow.camera);
  // // scene.add(helperCamera);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.autoRotate = false;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

// SECTION Globe
function initGlobe() {
  // Initialize the Globe
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor('#0cc')
    .atmosphereAltitude(0.25)
    .hexPolygonColor((e) => {
      return "rgba(0,0,0, 1)";
    });

  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe.arcsData(travelHistory.flights)
      .arcColor((e) => {
        return e.status ? "#081c3a" : "#FF4000";
      })
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap((e) => e.order * 1)
      .labelsData(airportHistory.airports)
      .labelColor(() => "#081c3a")
      .labelDotOrientation((e) => {
        return e.text === "ALA" ? "top" : "right";
      })
      .labelDotRadius(0.3)
      .labelSize((e) => e.size)
      .labelText("city")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData(airportHistory.airports)
      .pointColor(() => "#081c3a")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, 1000);

  // const xEuler = -0.10995641289245754
  // const yEuler = -0.8097109043738395
  // const zEuler = -0.10995641289245754
  // const euler = new Euler(xEuler, yEuler, zEuler, "XYZ");

  // camera.setRotationFromEuler(euler);
  // camera.matrixWorldNeedsUpdate = true

  // camera.rotation.y = -0.8097109043738395
  // camera.rotation.z = -0.10995641289245754
  // Globe.rotateY(-Math.PI * (5 / 2));
  // Globe.rotateX(Math.PI / 6);
  // Globe.rotateZ(-Math.PI / 6);
  Globe.rotation.set(0, 1, 0);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color('#0cc');
  globeMaterial.emissive = new Color('#fff');
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  // NOTE Cool stuff
  // globeMaterial.wireframe = true;

  scene.add(Globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
  // console.log("x: " + mouseX + " y: " + mouseY);
}

function onWindowResize() {
  const width = canvas.offsetWidth
  const height = canvas.offsetHeight
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;
  renderer.setSize(width, height);
}

function animate() {
  // camera.position.x +=
  //   Math.abs(mouseX) <= windowHalfX / 2
  //     ? (mouseX / 2 - camera.position.x) * 0.005
  //     : 0;
  // camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  // camera.lookAt(scene.position);
  // controls.update();
  // renderer.render(scene, camera);
  // requestAnimationFrame(animate);

  // Rotate the globe
  Globe.rotation.y += -0.003
  console.log(camera.rotation)

  // Update the scene
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
