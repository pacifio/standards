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
import type { Role } from "@/mock/types"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createFileRoute("/mock/settings/organisation")({
  component: OrganisationSettings,
})

const ROLE_BADGE: Record<Role, "default" | "info" | "secondary"> = {
  admin: "default",
  product_owner: "info",
  developer: "secondary",
  member: "secondary",
}

/**
 * Organisation settings.
 *
 * This is the Organisation tab of today's /dashboard, unpacked. It keeps the
 * same three sections — general, members, invite links — but each is now a
 * linkable section of a settings page rather than a panel sharing one tab
 * with Account, AI, Usage and Privacy.
 *
 * The members table is Linear's: name and email stacked in one cell, role as a
 * select the admin can change in place, and the row menu carrying the rest. A
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

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="w-40">Role</TableHead>
                  <TableHead className="w-24">Last seen</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {MEMBERS.map((m) => (
                  <TableRow
                    key={m.id}
                    className={m.status === "former" ? "opacity-50" : undefined}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {initialsOf(m.name, m.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-1.5 truncate text-xs font-medium">
                            {m.name || m.email}
                            {m.status === "invited" && (
                              <Badge variant="outline" size="sm">
                                Invited
                              </Badge>
                            )}
                            {m.status === "former" && (
                              <Badge variant="outline" size="sm">
                                Former member
                              </Badge>
                            )}
                          </span>
                          {m.name && <span className="caption">{m.email}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {m.status === "former" ? (
                        <span className="caption">{ROLE_LABELS[m.role]}</span>
                      ) : (
                        <Badge variant={ROLE_BADGE[m.role]}>
                          {ROLE_LABELS[m.role]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="caption tnum">
                      {m.lastSeen ?? "—"}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            <div className="rounded-md border border-border bg-card">
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
