import { Gesture } from "@use-gesture/vanilla";
import { isNumber } from "lodash";
import { filter, merge, interval, fromEvent, scan, map, Subscription, throttleTime, Subject } from "rxjs";
import { filterNullish } from "@latticexyz/utils";
import { PhaserLayer } from "../../types";
import { GestureState } from "phaserx/src/types";

export function registerCameraControls(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, camera },
    },
    api: {
      mapInteraction: { mapInteractionEnabled },
    },
  } = layer;

  // default zoom
  camera.setZoom(2.0);

  const createZoomStages = () => {
    const zoomStages = [2.8, 2.4, 2.0, 1.6];

    let current = 2;

    function zoomIn() {
      current = Math.max(current - 1, 0);
      return zoomStages[current];
    }

    function zoomOut() {
      current = Math.min(current + 1, zoomStages.length - 1);
      return zoomStages[current];
    }

    function findClosestZoomStage(rawZoom: number) {
      const zoom = Math.min(Math.max(rawZoom, zoomStages[0]), zoomStages[zoomStages.length - 1]);

      return zoomStages.reduce((prev, curr) => {
        return Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev;
      });
    }

    return {
      zoomStages,
      current,
      getCurrentZoom: () => zoomStages[current],
      zoomIn,
      zoomOut,
      findClosestZoomStage,
    };
  };

  const zoomStages = createZoomStages();

  const EDGE_SCROLL_SPEED = 6;
  const EDGE_PIXEL_SIZE = 100;

  const wheelStream$ = new Subject<GestureState<"onWheel">>();
  new Gesture(
    camera.phaserCamera.scene.game.canvas,
    {
      onWheel: (state) => wheelStream$.next(state),
    },
    {}
  );

  wheelStream$
    .pipe(
      filter((state) => !state.pinching),
      throttleTime(500),
      filter(() => mapInteractionEnabled()),
      filter((state) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return state.axis === "y";
      })
    )
    .subscribe((state) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { direction } = state;
      const yDirection = direction[1];

      lerpZoom(yDirection > 0 ? "out" : "in");
    });

  input.pointermove$
    .pipe(
      filter(() => mapInteractionEnabled()),
      filter(({ pointer }) => pointer.isDown)
    )
    .subscribe(({ pointer }) => {
      camera.setScroll(
        camera.phaserCamera.scrollX - ((pointer.x - pointer.prevPosition.x) * 1.7) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - ((pointer.y - pointer.prevPosition.y) * 1.7) / camera.phaserCamera.zoom
      );
    });

  const lerpZoom = (direction: "in" | "out") => {
    if (!mapInteractionEnabled()) return;

    const { getCurrentZoom, zoomIn, zoomOut } = zoomStages;

    const currentZoom = getCurrentZoom();
    const zoom = direction === "in" ? zoomIn() : zoomOut();
    const difference = zoom - currentZoom;

    const zoomDuration = 200;
    const zoomInterval = 10;
    const zoomSteps = zoomDuration / zoomInterval;
    const zoomStep = difference / zoomSteps;

    let zoomStepCount = 0;
    const zoomIntervalId = setInterval(() => {
      camera.setZoom(camera.phaserCamera.zoom + zoomStep);
      zoomStepCount++;

      if (zoomStepCount === zoomSteps) {
        clearInterval(zoomIntervalId);
      }
    }, zoomInterval);
  };

  input.onKeyPress(
    (keys) => keys.has("PLUS"),
    () => lerpZoom("in")
  );

  input.onKeyPress(
    (keys) => keys.has("MINUS"),
    () => lerpZoom("out")
  );

  input.onKeyPress(
    (keys) => {
      return (keys.has("ENTER") && keys.has("CTRL")) || keys.has("SPACE");
    },
    () => {
      if (!mapInteractionEnabled()) return;

      const isFullscreen = !!document.fullscreenElement;
      const body = document.getElementsByTagName("body")[0];
      isFullscreen ? document.exitFullscreen() : body.requestFullscreen({ navigationUI: "hide" });
    }
  );

  const getCameraMovementFromPointerPosition = (event: MouseEvent) => {
    const cameraMovement = { x: 0, y: 0 };
    let closestDistanceToEdge = Infinity;

    if (event.clientX < EDGE_PIXEL_SIZE) {
      cameraMovement.x = -1;
      const distanceToEdge = event.clientX;
      if (distanceToEdge < closestDistanceToEdge) {
        closestDistanceToEdge = distanceToEdge;
      }
    }
    if (event.clientY < EDGE_PIXEL_SIZE) {
      cameraMovement.y = -1;
      const distanceToEdge = event.clientY;
      if (distanceToEdge < closestDistanceToEdge) {
        closestDistanceToEdge = distanceToEdge;
      }
    }
    if (event.clientX > window.innerWidth - EDGE_PIXEL_SIZE) {
      cameraMovement.x = 1;
      const distanceToEdge = window.innerWidth - event.clientX;
      if (distanceToEdge < closestDistanceToEdge) {
        closestDistanceToEdge = distanceToEdge;
      }
    }
    if (event.clientY > window.innerHeight - EDGE_PIXEL_SIZE) {
      cameraMovement.y = 1;
      const distanceToEdge = window.innerHeight - event.clientY;
      if (distanceToEdge < closestDistanceToEdge) {
        closestDistanceToEdge = distanceToEdge;
      }
    }

    return new Phaser.Math.Vector2(cameraMovement)
      .normalize()
      .scale((EDGE_PIXEL_SIZE - closestDistanceToEdge) / EDGE_PIXEL_SIZE);
  };

  const rawMouseMove$ = fromEvent<MouseEvent>(document, "mousemove");
  const screenEdgeCameraMovement$ = merge(interval(2), rawMouseMove$).pipe(
    filter(() => !!document.fullscreenElement),
    throttleTime(2),
    scan<number | MouseEvent, MouseEvent | undefined>((acc, event) => {
      if (isNumber(event)) return acc;

      return event;
    }, undefined),
    map((event) => {
      if (!event) return undefined;

      return getCameraMovementFromPointerPosition(event);
    }),
    filterNullish()
  );

  let screenEdgeCameraMoveSub: Subscription | undefined;
  rawMouseMove$.subscribe((event) => {
    const movement = getCameraMovementFromPointerPosition(event as MouseEvent);

    if (movement.length() > 0) {
      if (screenEdgeCameraMoveSub !== undefined) return;

      screenEdgeCameraMoveSub = screenEdgeCameraMovement$.subscribe((cameraMovement) => {
        camera.setScroll(
          Math.floor(camera.phaserCamera.scrollX + cameraMovement.x * EDGE_SCROLL_SPEED),
          Math.floor(camera.phaserCamera.scrollY + cameraMovement.y * EDGE_SCROLL_SPEED)
        );
      });
    } else if (screenEdgeCameraMoveSub !== undefined) {
      screenEdgeCameraMoveSub?.unsubscribe();
      screenEdgeCameraMoveSub = undefined;
    }
  });
}
