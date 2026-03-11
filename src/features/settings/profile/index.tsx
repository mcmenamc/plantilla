import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil de Usuario'
      desc='Gestiona tu información personal y la forma en que apareces dentro de la plataforma.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
