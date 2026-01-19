'use client';

import { useState, useEffect } from 'react';
import { getFullUserProfile, updateUserSettings } from '@/lib/actions/profile';
import { GlassGroup, HealthCell, LavenderSwitch, PageHeader } from '@/components/profile/shared-components';
import { Bell, FileText, Lock, MessageSquare, ChevronRight, LogOut, Moon, Activity, Eye, Shield, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PatientSettingsPage() {
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
        // Optimistic UI interaction
        const oldSettings = { ...settings };
        setSettings({ ...settings, [key]: value });

        try {
            await updateUserSettings({ [key]: value });
        } catch (e) {
            console.error("Failed to save setting", e);
            // Revert on failure
            setSettings(oldSettings);
            alert("Failed to update setting");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Refresh capabilities
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen bg-background" />;

    return (
        <div className="min-h-screen bg-background pb-32">
            <PageHeader title="Settings" subtitle="Preferences & Security" />

            <main className="px-4 space-y-8 max-w-2xl mx-auto mt-4">

                {/* AI Preferences */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">AI Personalization</h3>
                    <GlassGroup>
                        <HealthCell
                            icon={<Activity className="w-5 h-5" />}
                            label="Enable AI Suggestions"
                            rightElement={<LavenderSwitch checked={settings?.ai_enabled} onChange={(v) => handleToggle('ai_enabled', v)} />}
                        />
                        <HealthCell
                            icon={<MessageSquare className="w-5 h-5" />}
                            label="Detail Level"
                            value={settings?.ai_detail_level === 'detailed' ? 'Detailed' : 'Concise'}
                            isLink
                            onClick={() => handleToggle('ai_detail_level', settings?.ai_detail_level === 'detailed' ? 'concise' : 'detailed' as any)} // Hacky toggle for enum
                        />
                        <HealthCell
                            icon={<Eye className="w-5 h-5" />}
                            label="Explain Results Simply"
                            rightElement={<LavenderSwitch checked={true} onChange={() => { }} />} // Mock for now
                        />
                    </GlassGroup>
                </motion.div>

                {/* Notifications */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Notifications</h3>
                    <GlassGroup>
                        <HealthCell
                            icon={<Bell className="w-5 h-5" />}
                            label="Push Notifications"
                            rightElement={<LavenderSwitch checked={settings?.notifications_push} onChange={(v) => handleToggle('notifications_push', v)} />}
                        />
                        <HealthCell
                            icon={<FileText className="w-5 h-5" />}
                            label="Email Reports"
                            rightElement={<LavenderSwitch checked={settings?.notifications_email} onChange={(v) => handleToggle('notifications_email', v)} />}
                        />
                    </GlassGroup>
                </motion.div>

                {/* Account & Security */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Account</h3>
                    <GlassGroup>
                        <HealthCell
                            icon={<Lock className="w-5 h-5" />}
                            label="Change Password"
                            isLink
                            onClick={() => alert("Password reset flow would start here.")}
                        />
                        <HealthCell
                            icon={<Shield className="w-5 h-5" />}
                            label="Privacy & Data"
                            isLink
                        />
                        <HealthCell
                            icon={<Globe className="w-5 h-5" />}
                            label="Display Language"
                            value="System Default"
                            isLink
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
                    <p className="text-center text-xs text-muted-foreground mt-4">Health Buddy v0.1.0 (Build 2026.1)</p>
                </motion.div>
            </main>
        </div>
    );
}
