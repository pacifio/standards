import type { ThreeElements } from "@react-three/fiber"

/**
 * React Three Fiber v9 no longer augments JSX globally; it exports the
 * element map and expects the app to wire it in. Without this, `<mesh>`,
 * `<planeGeometry>` and `<shaderMaterial>` are type errors.
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
