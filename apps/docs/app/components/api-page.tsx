import { APIPage as FumadocsAPIPage } from 'fumadocs-openapi/ui'
import type { ComponentProps } from 'react'
import { APIPlayground } from 'fumadocs-openapi/scalar'

/**
 * Official Scalar playground inside fumadocs-openapi endpoint pages: the
 * generated MDX renders `<APIPage document operations />`, and this wrapper
 * swaps the try-it console for Scalar's API client (the `useScalar` pattern
 * from the Fumadocs v15 release). Scalar CSS is layered in `globals.css`
 * so it never fights the Fumadocs UI preset.
 */
export function APIPage(props: ComponentProps<typeof FumadocsAPIPage>) {
  return <FumadocsAPIPage {...props} renderer={{ APIPlayground }} />
}
