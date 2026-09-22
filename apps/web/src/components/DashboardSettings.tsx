import type { ComponentType, SVGProps } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BellIcon, CreditCardIcon, KeyIcon, LinkIcon } from '@heroicons/react/24/outline'
import { DashboardSettingsBilling } from './DashboardSettingsBilling'
import { DashboardSettingsConnections } from './DashboardSettingsConnections'
import { DashboardSettingsIngest } from './DashboardSettingsIngest'
import { DashboardSettingsNotifications } from './DashboardSettingsNotifications'
import { DashboardTab } from './DashboardTab'

type TabIcon = ComponentType<SVGProps<SVGSVGElement>>
type SettingsTabId = 'connections' | 'ingest' | 'notifications' | 'billing'

function SettingsTab({
  label,
  active,
  Icon,
  onClick,
}: {
  label: string
  active: boolean
  Icon: TabIcon
  onClick?: () => void
}) {
  return (
    <DashboardTab
      label={label}
      icon={<Icon aria-hidden="true" className="size-4" />}
      active={active}
      onClick={onClick}
      endAdornment={
        !onClick ? (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold">Soon</span>
        ) : undefined
      }
    />
  )
}

export function DashboardSettings() {
  // The active tab lives in the URL (?tab=…) so links can deep-link straight
  // to a tab — the header's "Connect your Socials" lands on connections.
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab: SettingsTabId =
    requested === 'ingest' || requested === 'notifications' || requested === 'billing' || requested === 'connections'
      ? requested
      : 'connections'

  const selectTab = (next: SettingsTabId) => {
    setSearchParams(next === 'connections' ? {} : { tab: next })
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary">Manage how ListeningKit connects.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <SettingsTab label="Connections" active={tab === 'connections'} Icon={LinkIcon} onClick={() => selectTab('connections')} />
        <SettingsTab label="Send posts in" active={tab === 'ingest'} Icon={KeyIcon} onClick={() => selectTab('ingest')} />
        <SettingsTab label="Notifications" active={tab === 'notifications'} Icon={BellIcon} onClick={() => selectTab('notifications')} />
        <SettingsTab label="Billing" active={tab === 'billing'} Icon={CreditCardIcon} onClick={() => selectTab('billing')} />
      </div>
      {tab === 'connections' ? <DashboardSettingsConnections /> : null}
      {tab === 'ingest' ? <DashboardSettingsIngest /> : null}
      {tab === 'notifications' ? <DashboardSettingsNotifications /> : null}
      {tab === 'billing' ? <DashboardSettingsBilling /> : null}
    </div>
  )
}
