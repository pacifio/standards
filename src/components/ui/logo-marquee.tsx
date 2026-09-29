import { cn } from "cn"

import { InfiniteSlider } from "@/components/blocks/infinite-slider"

/**
 * A social-proof logo cloud: an `InfiniteSlider` whose ends fade out on a
 * plain linear mask, so marks slide in and out of transparency rather than
 * being sliced at the edge. A mask rather than a gradient overlay, so it
 * works on any surface without knowing its colour.
 *
 * The marks are the landing site's own files (`public/logos/`), shown in
 * their true brand colours, as the landing page does. Four of them are
 * white-only in their `_dark` form (Cisco, OpenAI, Kilo Code, and AWS's
 * wordmark), which would vanish on the light canvas, so those carry a
 * `srcLight` twin: Cisco blue, AWS squid ink, and black for the two marks
 * whose brand colour is black. Two <img>s swapped by theme rather than a
 * filter, because a filter cannot turn white into a brand colour.
 */

export type Logo = {
  name: string
  src: string
  /** A light-theme variant, for marks whose dark asset is white. */
  srcLight?: string
  height: number
}

const DEFAULT_LOGOS: Array<Logo> = [
  { name: "Netflix", src: "/logos/netflix-icon.svg", height: 30 },
  { name: "Google", src: "/logos/google.svg", height: 26 },
  {
    name: "Kilo Code",
    src: "/logos/kilocode-dark.svg",
    srcLight: "/logos/kilocode-light.svg",
    height: 19,
  },
  { name: "Cloudflare", src: "/logos/cloudflare.svg", height: 26 },
  { name: "Shopify", src: "/logos/shopify.svg", height: 26 },
  {
    name: "Cisco",
    src: "/logos/cisco_dark.svg",
    srcLight: "/logos/cisco_light.svg",
    height: 22,
  },
  { name: "Stripe", src: "/logos/stripe.svg", height: 26 },
  {
    name: "Amazon Web Services",
    src: "/logos/aws_dark.svg",
    srcLight: "/logos/aws_light.svg",
    height: 26,
  },
  {
    name: "OpenAI",
    src: "/logos/openai_dark.svg",
    srcLight: "/logos/openai_light.svg",
    height: 24,
  },
]

function LogoMarquee({
  logos = DEFAULT_LOGOS,
  label = "Trusted by engineers at",
  className,
  trackClassName,
}: {
  logos?: Array<Logo>
  label?: string
  className?: string
  /**
   * On the moving strip only, so it can bleed past its container's padding
   * (`-mx-*`) and fade into the edge of the surface while the label stays
   * on the text column.
   */
  trackClassName?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {label && <p className="micro">{label}</p>}
      <div
        className={cn(
          "mask-x-from-[calc(100%-6rem)] mask-x-to-100%",
          trackClassName
        )}
      >
        <InfiniteSlider gap={56} speed={40} speedOnHover={12}>
          {logos.map((logo) => (
            <span key={logo.name} className="flex shrink-0 items-center">
              <LogoImage
                src={logo.src}
                alt={logo.name}
                height={logo.height}
                className={cn(logo.srcLight && "light:hidden")}
              />
              {logo.srcLight && (
                <LogoImage
                  src={logo.srcLight}
                  alt={logo.name}
                  height={logo.height}
                  className="hidden light:block"
                />
              )}
            </span>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  )
}

function LogoImage({
  src,
  alt,
  height,
  className,
}: {
  src: string
  alt: string
  height: number
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ height }}
      className={cn(
        "w-auto max-w-36 object-contain",
        "duration-base opacity-90 transition-opacity ease-out-strong hover:opacity-100",
        className
      )}
    />
  )
}

export { LogoMarquee }
