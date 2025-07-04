import * as React from 'react'

declare module 'react' {
  // lucide-react@0.460 currently expects `ReactSVG` to be exported from react types (dropped in @types/react@19).
  // Provide a minimal compatible alias so TypeScript can compile.
  export type ReactSVG = React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}