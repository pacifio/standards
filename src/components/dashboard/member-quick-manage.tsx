"use client"

import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CodeXmlIcon,
  CompassIcon,
  EyeIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "cn"

import { CURRENT_USER, MEMBERS } from "@/mock/data"
import { ROLE_LABELS } from "@/mock/types"
import type { Member, Role } from "@/mock/types"
import { useOrg } from "@/lib/org-context"
import { AvatarGroupCount } from "@/components/ui/avatar"
import { AvatarStack } from "@/components/ui/avatar-stack"
import { CardHeader } from "@/components/dashboard/card-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { PersonAvatar } from "@/components/patterns/person-avatar"

/**
 * The team at a glance, and a way to grow it.
 *
 * The top of the card is the team as faces — an avatar stack that springs
 * as the pointer runs across it — with a round + beside it. Inviting is a
 * popover off that button rather than a form sitting open on the dashboard:
 * it is an occasional act, and an always-visible email field made the card
 * read as a form.
 *
 * The list below is read-only. Each role is shown with its glyph rather
 * than as a select — changing someone's role is a settings-page decision,
 * one "Manage" away, not something to do by misclicking a dashboard row.
 */

const ROLE_ICON: Record<Role, typeof ShieldCheckIcon> = {
  admin: ShieldCheckIcon,
  product_owner: CompassIcon,
  developer: CodeXmlIcon,
  member: EyeIcon,
}

const INVITABLE = (Object.keys(ROLE_LABELS) as Array<Role>).filter(
  (r) => r !== "admin"
)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Faces shown before the stack collapses into a "+N". */
const STACK_MAX = 5

function MemberFace({
  member: m,
  size = "md",
}: {
  member: Member
  size?: "sm" | "md" | "lg"
}) {
  return (
    <PersonAvatar size={size} name={m.name} email={m.email} image={m.image} />
  )
}

function MemberQuickManage({ className }: { className?: string }) {
  const { org } = useOrg()
  const [members, setMembers] = useState<Array<Member>>(() =>
    MEMBERS.filter((m) => m.status !== "former")
  )

  const active = members.filter((m) => m.status === "active")
  const pending = members.length - active.length
  const faces = active.slice(0, STACK_MAX)
  const overflow = active.length - faces.length

  function invite(email: string, role: Role) {
    setMembers((prev) => [
      { id: `inv-${email}`, name: "", email, role, status: "invited" },
      ...prev,
    ])
  }

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      <CardHeader
        icon={UsersIcon}
        title="Members"
        description={`${active.length} active${pending > 0 ? ` · ${pending} pending` : ""}`}
        action={
          <Link
            to="/mock/settings/organisation"
            className={buttonVariants({ variant: "ghost", size: "xs" })}
          >
            Manage
            <Icon icon={ArrowRightIcon} size="xs" />
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-3 px-4 pt-1 pb-3.5">
        <AvatarStack>
          {faces.map((m) => (
            <MemberFace key={m.id} member={m} size="lg" />
          ))}
          {overflow > 0 && (
            <AvatarGroupCount className="size-control-xl text-xs ring-0">
              +{overflow}
            </AvatarGroupCount>
          )}
        </AvatarStack>
        <InviteButton
          orgName={org.name}
          taken={members.map((m) => m.email)}
          onInvite={invite}
        />
      </div>

      {/* Scrolls, rather than clipping: every member has to be reachable. */}
      <ScrollFade className="min-h-0 flex-1 border-t border-hairline">
        <ul className="divide-y divide-hairline">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              self={m.email === CURRENT_USER.email}
            />
          ))}
        </ul>
      </ScrollFade>
    </section>
  )
}

/** The round + and the invite form it opens. */
function InviteButton({
  orgName,
  taken,
  onInvite,
}: {
  orgName: string
  taken: Array<string>
  onInvite: (email: string, role: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("developer")

  const address = email.trim().toLowerCase()
  const valid = EMAIL.test(address) && !taken.includes(address)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onInvite(address, role)
    setEmail("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="default"
            size="icon-lg"
            aria-label="Invite a member"
            className="size-control-xl shrink-0"
          >
            <PlusIcon />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Invite to {orgName}</PopoverTitle>
          <PopoverDescription>
            They get an email with a link that expires in 7 days.
          </PopoverDescription>
        </PopoverHeader>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <Input
            type="email"
            size="sm"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            aria-label="Email to invite"
          />
          <div className="flex items-center gap-2">
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
              items={ROLE_LABELS}
            >
              <SelectTrigger size="sm" className="flex-1" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITABLE.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" variant="default" disabled={!valid}>
              Send invite
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function MemberRow({ member: m, self }: { member: Member; self: boolean }) {
  const invited = m.status === "invited"
  const online = m.lastSeen === "Online"
  return (
    <li className="flex items-center gap-2.5 px-4 py-2">
      <span className="relative shrink-0">
        <MemberFace member={m} size="md" />
        {online && (
          <span
            aria-label="Online"
            className="absolute -right-px -bottom-px size-2 rounded-full bg-success ring-2 ring-card"
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-medium text-foreground">
          {m.name || m.email}
          {self && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              You
            </span>
          )}
        </span>
        <span className="truncate text-2xs text-muted-foreground">
          {invited ? "Invite sent" : m.email}
          {!invited && m.lastSeen && !online && ` · ${m.lastSeen}`}
        </span>
      </div>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-2xs text-secondary-foreground",
          invited && "text-muted-foreground"
        )}
      >
        <Icon icon={ROLE_ICON[m.role]} size="xs" />
        {ROLE_LABELS[m.role]}
      </span>
    </li>
  )
}

export { MemberQuickManage }
