import { ContentSection } from '../components/content-section'
import { BusinessForm } from './business-form'

export default function SettingsBusiness() {
    return (
        <ContentSection
            title='Empresa'
            desc='Gestiona la información legal de tu negocio para la facturación.'
        >
            <BusinessForm />
        </ContentSection>
    )
}
