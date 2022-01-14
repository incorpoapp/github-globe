import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
  SphereGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createGlowMesh } from "three-glow-mesh";
import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";
import airportHistory from "./files/my-airports.json";


class Globe {
  constructor(width, height, rendererDomElementId) {
    this.windowHalfX = width / 2;
    this.windowHalfY = height / 2;

    this.width = width;
    this.height = height;

    this.mouseX = 0;
    this.mouseY = 0;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.camera = new PerspectiveCamera();
    this.scene = new Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.rendererDomElementId = rendererDomElementId;
    console.warn("VERSION 1.0");
  }

  init() {
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor( 0xffffff, 0);
    this.renderer.domElement.id = this.rendererDomElementId;

    this.scene.add(new AmbientLight(0xbbbbbb, 0.3));

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    let dLight = new DirectionalLight(0xffffff, 0.8);
    dLight.position.set(-800, 2000, 400);
    this.camera.add(dLight);

    let dLight1 = new DirectionalLight(0x7982f6, 1);
    dLight1.position.set(-200, 500, 200);
    this.camera.add(dLight1);

    let dLight2 = new PointLight(0x8566cc, 0.5);
    dLight2.position.set(-200, 500, 200);
    this.camera.add(dLight2);

    this.camera.position.z = 400;
    this.camera.position.x = 0;
    this.camera.position.y = 0;

    this.scene.add(this.camera);

    this.scene.fog = new Fog(0x535ef3, 400, 2000);

    this.controls.enableDamping = true;
    this.controls.dynamicDampingFactor = 0.01;
    this.controls.enablePan = false;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 500;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 1;
    this.controls.autoRotate = false;
    this.controls.enableZoom = false;

    this.controls.minPolarAngle = Math.PI / 3.5;
    this.controls.maxPolarAngle = Math.PI - Math.PI / 3;

    return this.renderer.domElement;
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  initGlobe() {
    let globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25)
      .hexPolygonColor((e) => {
        if (
          ["KGZ", "KOR", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
            e.properties.ISO_A3
          )
        ) {
          return "rgba(255,255,255, 1)";
        } else return "rgba(255,255,255, 0.7)";
      });

    // NOTE Arc animations are followed after the globe enters the scene
    setTimeout(() => {
      globe.arcsData(travelHistory.flights)
        .arcColor((e) => {
          return e.status ? "#9cff00" : "#FF4000";
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
        .labelColor(() => "#ffcb21")
        .labelDotOrientation((e) => {
          return e.text === "ALA" ? "top" : "right";
        })
        .labelDotRadius(0.3)
        .labelSize((e) => e.size)
        .labelText("city")
        .labelResolution(6)
        .labelAltitude(0.01)
        .pointsData(airportHistory.airports)
        .pointColor(() => "#ffffff")
        .pointsMerge(true)
        .pointAltitude(0.07)
        .pointRadius(0.05);
    }, 1000);

    globe.rotateY(-Math.PI * (5 / 9));
    globe.rotateZ(-Math.PI / 6);

    const globeMaterial = globe.globeMaterial();
    globeMaterial.color = new Color(0x3a228a);
    globeMaterial.emissive = new Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.7;

    // NOTE Cool stuff
    globeMaterial.wireframe = true;

    this.scene.add(globe);
  }

  setAspectSize(width, height) {
    this.width = width
    this.height = height

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.windowHalfX = this.width / 2;
    this.windowHalfY = this.height / 2;
    this.renderer.setSize(this.width, this.height);
  }
}

window.Globe = Globe;

// let g = new Globe(window.innerWidth, window.innerHeight, "globe-canvas");
// let domElement = g.init();
// g.initGlobe();
// g.animate()

// document.body.appendChild(domElement);

// window.addEventListener("resize", () => { g.setAspectSize(window.innerWidth, window.innerHeight) }, false);
