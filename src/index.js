import ThreeGlobe from "three-globe";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";
import airportHistory from "./files/my-airports.json";

var renderer, camera, scene, controls;
var Globe;

const aspectRatio = 1.61803398875
const container = document.getElementById('map-container');
const canvas = document.createElement('canvas');
const pixelRatio = window.devicePixelRatio

container.appendChild(canvas);

init();
initGlobe();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  canvas.width = container.innerWidth;
  canvas.height = container.innerHeight;
  renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(pixelRatio);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight('white', 0.3));
  scene.background = new Color('white');

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = container.innerWidth / container.innerHeight
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight('white', 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight('white', 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight('white', 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 290;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  scene.fog = new Fog('#0cc', 400, 2000);


  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.dynamicDampingFactor = 0.01;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
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
    .hexPolygonColor(() => {
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
      .labelSize(1)
      .labelText("city")
      .labelResolution(10)
      .labelAltitude((e) => {
        if (e.city === 'Dijon (Bourgogne)') {
          return 0.1
        } else if (e.city === 'Faro') {
          return 0.1
        } else {
          return 0.08
        }
      })
      .pointsData(airportHistory.airports)
      .pointColor(() => "#081c3a")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, 1000);

  Globe.rotation.set(0.3, 1, 0.3);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color('#0cc');
  globeMaterial.emissive = new Color('white');
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(Globe);
}

function onWindowResize() {
  camera.aspect = aspectRatio

  const width = container.clientWidth
  const height = width / aspectRatio

  canvas.width = width / pixelRatio;
  canvas.height = height / pixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  renderer.setSize(width, height, false);

  camera.updateProjectionMatrix();
}

function animate() {
  // Rotate the globe
  Globe.rotation.y += -0.003

  // Update the scene
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
