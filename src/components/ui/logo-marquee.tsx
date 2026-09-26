import { cn } from "cn"

/**
 * A social-proof logo cloud that scrolls.
 *
 * The marks are the landing site's own files, copied from
 * `~/Desktop/atlas/landing/logos/` into `public/logos/` so the auth pane and
 * the marketing page show the same companies in the same artwork.
 *
 * The track renders its children twice and translates by exactly -50%, so
 * the second copy lands where the first began and the loop has no seam. That
 * is the whole trick; everything else here is optical correction.
 *
 * Two things are not obvious:
 *
 * 1. PER-MARK HEIGHTS. Logos are not optically equal at a shared height —
 *    an icon-only mark like Netflix reads far smaller than a wordmark like
 *    Cloudflare at the same pixel height. The landing page tunes each one
 *    individually and these are its values.
 *
 * 2. LIGHT MODE. These are the `_dark` assets, with fills baked in: Cisco,
 *    OpenAI and Kilo Code are pure white, and AWS and Cloudflare are colour
 *    with white structural parts. On a light canvas those disappear. There is
 *    no light asset set, so the light theme renders the whole strip
 *    monochrome rather than shipping three invisible logos and two broken
 *    ones. Dark — the primary appearance — gets the full-colour reference.
 */

export type Logo = {
  name: string
  src: string
  /** Optical height in px. See note 1. */
  height: number
}

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
      {label && (
        // Mono and widely tracked, matching the landing page's own label.
        <p className="mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
      )}

      <div className="group/marquee relative overflow-hidden marquee-fade-x">
        <div
          className={cn(
            "flex w-max animate-marquee items-center gap-14",
            "group-hover/marquee:[animation-play-state:paused]",
            "motion-reduce:animate-none"
          )}
        >
          {/* Twice, for the seamless wrap. The duplicate is hidden from the
              accessibility tree so a screen reader reads nine names, not
              eighteen. */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex shrink-0 items-center gap-14"
            >
              {logos.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={copy === 0 ? logo.name : ""}
                  loading="lazy"
                  decoding="async"
                  style={{ height: logo.height }}
                  className={cn(
                    "w-auto max-w-36 shrink-0 object-contain",
                    "duration-base opacity-70 transition-opacity ease-out-strong",
                    "group-hover/marquee:opacity-100",
                    // See note 2 at the top of the file.
                    "light:opacity-45 light:brightness-0"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { LogoMarquee }
