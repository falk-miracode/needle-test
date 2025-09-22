// src/jsx.d.ts
import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      // Erlaube alle benutzerdefinierten HTML-Elemente (wie needle-engine)
      [elemName: string]: any;
    }
  }
}
