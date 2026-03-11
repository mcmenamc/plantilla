import { ContentSection } from '../components/content-section'
import { NotificationsForm } from './notifications-form'

export function SettingsNotifications() {
  return (
    <ContentSection
      title='Notificaciones'
      desc='Configura la forma en que recibes las notificaciones y alertas de sistema.'
    >
      <NotificationsForm />
    </ContentSection>
  )
}
