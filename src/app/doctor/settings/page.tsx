'use client';

import { useState, useEffect } from 'react';
import { getFullUserProfile, updateUserSettings } from '@/lib/actions/profile';
import { GlassGroup, HealthCell, LavenderSwitch, PageHeader } from '@/components/profile/shared-components';
import { Bell, Lock, Calendar, MessageSquare, LogOut, FileBarChart, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DoctorSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getFullUserProfile();
                if (res?.settings) {
                    setSettings(res.settings);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const handleToggle = async (key: string, value: boolean) => {
        const oldSettings = { ...settings };
        setSettings({ ...settings, [key]: value });
        try {
            await updateUserSettings({ [key]: value });
        } catch (e) {
            setSettings(oldSettings);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen bg-background" />;

    return (
        <div className="min-h-screen bg-background pb-32">
            <PageHeader title="Settings" subtitle="Practice Management" />

            <main className="px-4 space-y-8 max-w-2xl mx-auto mt-4">

                {/* Practice Controls */}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Practice & Availability</h3>
                <GlassGroup>
                    <HealthCell
                        icon={<Calendar className="w-5 h-5" />}
                        label="Manage Schedule"
                        isLink
                        onClick={() => alert("Schedule grid management would open here.")}
                    />
                    <HealthCell
                        icon={<MessageSquare className="w-5 h-5" />}
                        label="Accept New Patients"
                        rightElement={<LavenderSwitch checked={true} onChange={() => { }} />}
                    />
                </GlassGroup>

                {/* AI & Compliance */}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">AI Assistance</h3>
                <GlassGroup>
                    <HealthCell
                        icon={<FileBarChart className="w-5 h-5" />}
                        label="Patient Pre-Analysis"
                        rightElement={<LavenderSwitch checked={settings?.ai_enabled} onChange={(v) => handleToggle('ai_enabled', v)} />}
                    />
                    <HealthCell
                        icon={<Users className="w-5 h-5" />}
                        label="Clinical Detail Level"
                        value={settings?.ai_detail_level === 'detailed' ? 'High' : 'Standard'}
                        isLink
                        onClick={() => handleToggle('ai_detail_level', settings?.ai_detail_level === 'detailed' ? 'concise' : 'detailed' as any)}
                    />
                </GlassGroup>

                {/* Notifications */}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Notifications</h3>
                <GlassGroup>
                    <HealthCell
                        icon={<Bell className="w-5 h-5" />}
                        label="Urgent Alerts"
                        rightElement={<LavenderSwitch checked={settings?.notifications_push} onChange={(v) => handleToggle('notifications_push', v)} />}
                    />
                    <HealthCell
                        icon={<Lock className="w-5 h-5" />}
                        label="Secure Messages"
                        rightElement={<LavenderSwitch checked={settings?.notifications_email} onChange={(v) => handleToggle('notifications_email', v)} />}
                    />
                </GlassGroup>

                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white/60 backdrop-blur-xl rounded-[16px] border border-white/40 shadow-sm py-4 text-red-600 font-medium text-[17px] active:scale-98 transition-transform"
                    >
                        Log Out
                    </button>
                </div>
            </main>
        </div>
    );
}
