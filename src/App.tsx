import { onMount, createSignal } from "solid-js";
import "./styles/style.css";
import {
  onStart,
  RemoteSkybox,
  WebXR,
  addComponent,
  ContactShadows,
  SceneSwitcher,
  findObjectOfType,
  OrbitControls,
  PostProcessingManager,
  ToneMappingEffect,
  BloomEffect,
  SharpeningEffect,
  ScreenSpaceAmbientOcclusionN8,
  ObjectUtils,
  onUpdate,
  Gizmos,
  getTempVector,
  GroundProjectedEnv,
  fitObjectIntoVolume,
  Antialiasing,
  AnimationUtils,
  Mathf,
  useForAutoFit,
  setAutoFitEnabled,
  Context,
} from "@needle-tools/engine";
import * as THREE from "three";
import { Rotate } from "./scripts/Rotate.js";

export default function App() {
  const [needleContext, setNeedleContext] = createSignal<Context | null>(null);

  onMount(() => {});
  onStart((context) => {
    setNeedleContext(context);
    const scene = context.scene;
    context.mainCamera.position.set(0, 1, 10);
    context.menu.showFullscreenOption(true);

    const contactshadows = ContactShadows.auto();
    contactshadows.darkness = 0.8;
    contactshadows.opacity = 0.9;

    const cylinder = ObjectUtils.createPrimitive("Cylinder", {
      scale: [1, 0.05, 1],
      position: [0, -0.025, 0],
      material: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.8, 0.8, 0.8),
        metalness: 0.1,
        roughness: 0.6,
      }),
    });
    setAutoFitEnabled(cylinder, false);
    scene.add(cylinder);

    const sceneSwitcher = addComponent(scene, SceneSwitcher, {
      autoLoadFirstScene: false,
      createMenuButtons: true,
      clamp: false,
      preloadNext: 1,
      preloadPrevious: 1,
    });
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXBZ21QnG-latest-world/file"
    );
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXBzvPW9-latest-product/file"
    );
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXBZvGGVp-latest-product/file"
    );
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXBZ20RjNk-latest-product/file"
    );
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXB27L6Db-1QlLnf-world/file"
    );
    sceneSwitcher.addScene(
      "https://cloud.needle.tools/-/assets/Z23hmXBZ2sPRdk-world/file"
    );

    sceneSwitcher.sceneLoaded.addEventListener(() => {
      const loaded = sceneSwitcher.currentlyLoadedScene?.asset;
      if (loaded) {
        const volumeSize = new THREE.Vector3(1, 1.5, 1);
        fitObjectIntoVolume(
          loaded,
          new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(0, volumeSize.y * 0.501, 0),
            volumeSize
          )
        );
        contactshadows.fitShadows({
          object: loaded,
          positionOffset: { y: 0.01 },
        });
        AnimationUtils.autoplayAnimations(loaded);
        const orbitControls = findObjectOfType(OrbitControls);
        if (orbitControls) {
          orbitControls.enablePan = true;
          orbitControls.fitCamera({
            objects: loaded,
            immediate: false,
            fitOffset: 1,
            fitDirection: { x: -0.5, y: 0.3, z: 1 },
            relativeTargetOffset: { y: 0 },
            fov: 20,
          });
        }
      }
    });
    sceneSwitcher.select(0);

    const post = addComponent(context.scene, PostProcessingManager);
    post.addEffect(new SharpeningEffect());
    post.addEffect(new ToneMappingEffect()).setMode("AgX");
    post.addEffect(new Antialiasing());
    const bloom = post.addEffect(new BloomEffect());
    bloom.scatter.value = 0.9;
    bloom.threshold.value = 2;
    bloom.intensity.value = 0.2;
  });

  onUpdate((ctx) => {
    const hits = ctx.physics.raycast({ ray: undefined });
    if (hits?.length) {
      const hit = hits[0];
      Gizmos.DrawSphere(hit.point, 0.005, 0x33ff33);
      if (hit.normal) {
        Gizmos.DrawLine(
          hit.point,
          getTempVector(hit.normal).multiplyScalar(0.1).add(hit.point),
          0x33ff33
        );
      }
    }
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Needle Engine als Custom Element */}
      <needle-engine
        src="/assets/basic.glb"
        style="width:100vw;height:100vh;display:block;"
      ></needle-engine>
    </div>
  );
}
