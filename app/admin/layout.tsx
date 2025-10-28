import { CurrentUser } from "@/components/current-user"
import { ForceLogout } from "@/components/force-logout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <CurrentUser />
      <ForceLogout />
    </>
  )
}