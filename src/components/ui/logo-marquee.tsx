import { cn } from "cn"

import { InfiniteSlider } from "@/components/blocks/infinite-slider"
import { ProgressiveBlur } from "@/components/blocks/progressive-blur"

/**
 * A social-proof logo cloud. natai's hero treatment: an `InfiniteSlider`
 * with a `ProgressiveBlur` at each end, so marks dissolve into the edges
 * instead of being sliced by a hard mask.
 *
 * The marks are the landing site's own files (`public/logos/`). They are
 * the `_dark` assets with fills baked in — Cisco, OpenAI and Kilo Code are
 * pure white, AWS and Cloudflare are colour with white structural parts —
 * so on the light canvas the strip renders monochrome rather than shipping
 * three invisible logos and two broken ones.
 */

export type Logo = { name: string; src: string; height: number }

const DEFAULT_LOGOS: Array<Logo> = [
  { name: "Netflix", src: "/logos/netflix-icon.svg", height: 30 },
  { name: "Google", src: "/logos/google.svg", height: 26 },
  { name: "Kilo Code", src: "/logos/kilocode-dark.svg", height: 19 },
  { name: "Cloudflare", src: "/logos/cloudflare.svg", height: 26 },
  { name: "Shopify", src: "/logos/shopify.svg", height: 26 },
  { name: "Cisco", src: "/logos/cisco_dark.svg", height: 22 },
  { name: "Stripe", src: "/logos/stripe.svg", height: 26 },
  { name: "Amazon Web Services", src: "/logos/aws_dark.svg", height: 26 },
  { name: "OpenAI", src: "/logos/openai_dark.svg", height: 24 },
]

function LogoMarquee({
  logos = DEFAULT_LOGOS,
  label = "Trusted by engineers at",
  className,
}: {
  logos?: Array<Logo>
  label?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {label && <p className="micro">{label}</p>}
      <div className="relative">
        <InfiniteSlider gap={56} speed={40} speedOnHover={12}>
          {logos.map((logo) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              loading="lazy"
              decoding="async"
              style={{ height: logo.height }}
              className={cn(
                "w-auto max-w-36 shrink-0 object-contain",
                "duration-base opacity-70 transition-opacity ease-out-strong hover:opacity-100",
                "light:opacity-45 light:brightness-0"
              )}
            />
          ))}
        </InfiniteSlider>
        <ProgressiveBlur
          direction="left"
          blurIntensity={1}
          className="absolute inset-y-0 left-0 w-20"
        />
        <ProgressiveBlur
          direction="right"
          blurIntensity={1}
          className="absolute inset-y-0 right-0 w-20"
        />
      </div>
    </div>
  )
}

export { LogoMarquee }
