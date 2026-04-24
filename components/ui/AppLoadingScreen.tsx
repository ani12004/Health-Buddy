import { Loader3D } from '@/components/ui/Loader3D'

export function AppLoadingScreen() {
    return (
        <Loader3D
            title="Launching Health Buddy"
            subtitle="Building your 3D clinical workspace, loading secure data channels, and preparing personalized insights..."
        />
    )
}
