import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Apariencia'
      desc='Personaliza la apariencia de la plataforma. Alterna automáticamente entre los temas claro y oscuro.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
