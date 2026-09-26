import { createFileRoute } from "@tanstack/react-router"
import {
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  UserPlusIcon,
} from "lucide-react"

import { useOrg } from "@/lib/org-context"
import { INVITE_LINKS, MEMBERS } from "@/mock/data"
import { initialsOf } from "@/mock/initials"
import { ROLE_LABELS } from "@/mock/types"
import type { LabelTone, Member, Role } from "@/mock/types"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { Tag } from "@/components/ui/tag"

export const Route = createFileRoute("/mock/settings/organisation")({
  component: OrganisationSettings,
})

// A role is an identity, so it takes a hue, not a status colour.
const ROLE_HUE: Record<Role, LabelTone> = {
  admin: "purple",
  product_owner: "indigo",
  developer: "cyan",
  member: "grey",
}

const MEMBER_COLUMNS: Array<Column<Member>> = [
  {
    id: "member",
    header: "Member",
    cell: (m) => (
      <div
        className={cn(
          "flex items-center gap-2",
          m.status === "former" && "opacity-50"
        )}
      >
        <Avatar size="sm">
          <AvatarFallback>{initialsOf(m.name, m.email)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {m.name || m.email}
            {m.status === "invited" && <Tag hue="amber">Invited</Tag>}
            {m.status === "former" && <Tag hue="grey">Former</Tag>}
          </span>
          {m.name && <span className="caption">{m.email}</span>}
        </div>
      </div>
    ),
    sortValue: (m) => m.name || m.email,
    className: "w-full max-w-0",
  },
  {
    id: "role",
    header: "Role",
    cell: (m) =>
      m.status === "former" ? (
        <span className="caption">{ROLE_LABELS[m.role]}</span>
      ) : (
        <Tag hue={ROLE_HUE[m.role]} dot>
          {ROLE_LABELS[m.role]}
        </Tag>
      ),
    sortValue: (m) => m.role,
    className: "w-36",
  },
  {
    id: "seen",
    header: "Last seen",
    cell: (m) => <span className="caption">{m.lastSeen ?? "—"}</span>,
    align: "right",
    className: "w-24",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: (m) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              icon={MoreHorizontalIcon}
              label={`Actions for ${m.name || m.email}`}
              size="sm"
            />
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Change role…</DropdownMenuItem>
          <DropdownMenuItem>Resend invite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Remove from workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    align: "right",
    className: "w-10",
  },
]

/**
 * Organisation settings.
 *
 * This is the Organisation tab of today's /dashboard, unpacked. It keeps the
 * same three sections — general, members, invite links — but each is now a
 * linkable section of a settings page rather than a panel sharing one tab
 * with Account, AI, Usage and Privacy.
 *
 * The members table: name and email stacked in one cell, role as a hue-coded
 * tag, and the row menu carrying the rest. A
 * former member stays in the list, dimmed — their sessions still reference
 * them, so removing the row would orphan the history.
 */
function OrganisationSettings() {
  const { org } = useOrg()
  const active = MEMBERS.filter((m) => m.status !== "invited")
  const invited = MEMBERS.filter((m) => m.status === "invited")

  return (
    <>
      <PageHeader
        title="Organisation"
        description="Name, members and how people join this workspace."
      />

      <div className="flex flex-col gap-8">
        <section>
          <SectionHeader title="General" />
          <SettingCard>
            <SettingRow
              label="Workspace name"
              description="Shown in the switcher and on invitations."
              control={
                <Input defaultValue={org.name} size="sm" className="w-56" />
              }
            />
            <SettingRow
              label="URL slug"
              description={`atlas.dev/${org.slug}`}
              control={
                <Input defaultValue={org.slug} size="sm" className="w-56" />
              }
            />
            <SettingRow
              label="Default role"
              description="What someone gets when they join by link."
              control={
                <Select
                  defaultValue="developer"
                  items={{
                    member: "Member",
                    developer: "Developer",
                    product_owner: "Product owner",
                  }}
                >
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="product_owner">Product owner</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader
            title="Members"
            description={`${active.length} people, ${invited.length} invited`}
            action={
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="default" size="sm">
                      <UserPlusIcon />
                      Invite
                    </Button>
                  }
                />
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Invite to {org.name}</DialogTitle>
                    <DialogDescription>
                      They will get an email with a link that expires in seven
                      days.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="invite-emails">Email</Label>
                    <Input
                      id="invite-emails"
                      placeholder="name@company.com, second@company.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select
                      defaultValue="developer"
                      items={{
                        member: "Member",
                        developer: "Developer",
                        product_owner: "Product owner",
                        admin: "Admin",
                      }}
                    >
                      <SelectTrigger id="invite-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="product_owner">
                          Product owner
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="default">Send invites</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          />

          <DataTable
            rows={MEMBERS}
            columns={MEMBER_COLUMNS}
            rowId={(m) => m.id}
            footer={
              <span className="tnum">
                {active.length} members · {invited.length} invited
              </span>
            }
          />
        </section>

        <section>
          <SectionHeader
            title="Invite links"
            description="A link lets several people join at once."
            action={
              <Button variant="outline" size="sm">
                <PlusIcon />
                New link
              </Button>
            }
          />
          {INVITE_LINKS.length === 0 ? (
            <div className="rounded-xl bg-card ring-1 ring-foreground/10">
              <EmptyState
                title="No invite links yet"
                description="A link is bounded by how many uses and how long you give it."
              />
            </div>
          ) : (
            <SettingCard>
              {INVITE_LINKS.map((l) => (
                <SettingRow
                  key={l.id}
                  label={`${ROLE_LABELS[l.role]} link`}
                  description={[
                    l.maxUses
                      ? `${l.uses} of ${l.maxUses} uses`
                      : `${l.uses} uses, unlimited`,
                    l.expiresAt ? `expires ${l.expiresAt}` : "never expires",
                  ].join(" · ")}
                  control={
                    <div className="flex items-center gap-1">
                      <IconButton icon={CopyIcon} label="Copy link" size="sm" />
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </div>
                  }
                />
              ))}
            </SettingCard>
          )}
        </section>
      </div>
    </>
  )
}
