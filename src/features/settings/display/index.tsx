import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Visualización'
      desc='Configura qué elementos y paneles deseas ver activos en la interfaz.'
    >
      <DisplayForm />
    </ContentSection>
  )
}
