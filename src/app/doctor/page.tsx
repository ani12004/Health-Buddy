'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/dashboard/user-menu';
import { Sparkles, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DoctorDashboard() {
    const [name, setName] = useState('Dr. Smith');
    const supabase = createClient();

    useEffect(() => {
        async function fetchName() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch role-specific name
                const { data } = await supabase.from('doctors').select('name').eq('id', user.id).single();
                if (data?.name) {
                    setName(data.name);
                } else {
                    // Fallback
                    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                    if (profile?.full_name) setName(profile.full_name);
                }
            }
        }
        fetchName();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{name}</h1>
                    <p className="text-muted-foreground">You have 3 pending reviews</p>
                </div>
                <UserMenu role="doctor" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="glass col-span-2 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Urgent Patients</h2>
                        <button className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-colors">
                            <Sparkles className="w-3 h-3" />
                            Analyze All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-border group">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 flex items-center justify-center">👤</div>
                                    <div>
                                        <h3 className="font-medium">Patient #{i}</h3>
                                        <p className="text-xs text-muted-foreground">High stress reported</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg">High Risk</span>
                                    <Link href={`/chat?patientId=${i}`}>
                                        <button className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Chat
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="glass p-6 rounded-3xl space-y-4">
                    <h2 className="text-xl font-semibold">Today</h2>
                    <div className="text-center py-8">
                        <div className="text-4xl font-bold text-primary">12</div>
                        <div className="text-sm text-muted-foreground">Appointments</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-xl">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            AI Insight
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            "Patient #2 is showing recurring stress patterns. Recommended to discuss sleep hygiene."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
