import { createFileRoute } from '@tanstack/react-router'
import { MassiveDownloadViewerPage } from '@/features/massive-download/components/massive-download-viewer-page'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export const Route = createFileRoute(
    '/_authenticated/massive-downloads/viewer/$downloadId'
)({
    component: MassiveDownloadViewerRoute,
})

function MassiveDownloadViewerRoute() {
    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <MassiveDownloadViewerPage />
            </Main>
        </>
    )
}
