'use client';

import { useState, useEffect } from 'react';
import { getFullUserProfile, updateDoctorProfile } from '@/lib/actions/profile';
import { GlassGroup, HealthCell, EditCell, PageHeader } from '@/components/profile/shared-components';
import { Loader2, Camera, User, BookOpen, Clock, Building2, Globe, Sparkles, Award, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            try {
                const res = await getFullUserProfile();
                if (res) {
                    setData(res);
                    setFormData({
                        ...res.roleData,
                        full_name: res.profile.full_name,
                        // Initialize new fields
                        bio: res.roleData.bio || '',
                        languages_spoken: res.roleData.languages_spoken || []
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const doctorUpdate = {
                specialization: formData.specialization,
                license_number: formData.license_number,
                hospital_affiliation: formData.hospital_affiliation,
                years_of_experience: formData.years_of_experience,
                bio: formData.bio,
                languages_spoken: Array.isArray(formData.languages_spoken) ? formData.languages_spoken : formData.languages_spoken?.split(',').map((s: string) => s.trim())
            };

            await updateDoctorProfile(doctorUpdate);

            setIsEditing(false);
            setData((prev: any) => ({
                ...prev,
                roleData: { ...prev.roleData, ...doctorUpdate },
                profile: { ...prev.profile, full_name: formData.full_name } // Ideally update full profile too if name changed
            }));
        } catch (e) {
            console.error(e);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-background" />;
    if (!data) return <div>Error loading profile.</div>;

    const { profile, roleData } = data;

    return (
        <div className="min-h-screen bg-background pb-32">
            <PageHeader
                title="Doctor Profile"
                subtitle="Professional Qualifications"
                action={
                    isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-medium text-[15px] hover:bg-slate-300 transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-full bg-primary text-white font-medium text-[15px] hover:bg-primary/90 transition-colors flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Done'}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )
                }
            />

            <main className="px-4 space-y-8 max-w-2xl mx-auto mt-4">
                {/* Hero Card */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassGroup className="flex flex-col items-center py-8 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <Award className="w-3 h-3" /> VERIFIED
                        </div>
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 border-2 border-primary/20">
                            👨‍⚕️
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Dr. {profile.full_name?.replace('Dr. ', '')}</h2>
                        <div className="text-muted-foreground mt-1 font-medium">{roleData.specialization}</div>
                    </GlassGroup>
                </motion.div>

                {/* Professional Bio */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">About</h3>
                    <GlassGroup>
                        {isEditing ? (
                            <div className="p-4">
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Brief professional biography..."
                                    className="w-full bg-primary/5 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-foreground min-h-[100px]"
                                />
                            </div>
                        ) : (
                            <div className="p-5 text-[17px] text-foreground leading-relaxed">
                                {roleData.bio || "No biography added yet."}
                            </div>
                        )}
                    </GlassGroup>
                </motion.div>

                {/* Details */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Professional Details</h3>
                    <GlassGroup>
                        {isEditing ? (
                            <>
                                <EditCell label="Hospital" value={formData.hospital_affiliation} onChange={(v) => setFormData({ ...formData, hospital_affiliation: v })} placeholder="Hospital Name" />
                                <EditCell label="License #" value={formData.license_number} onChange={(v) => setFormData({ ...formData, license_number: v })} placeholder="License ID" />
                                <EditCell label="Experience (Yrs)" value={formData.years_of_experience} onChange={(v) => setFormData({ ...formData, years_of_experience: v })} type="number" />
                                <EditCell label="Languages" value={Array.isArray(formData.languages_spoken) ? formData.languages_spoken.join(', ') : formData.languages_spoken} onChange={(v) => setFormData({ ...formData, languages_spoken: v })} placeholder="English, Spanish" />
                            </>
                        ) : (
                            <>
                                <HealthCell icon={<Building2 className="w-5 h-5" />} label="Hospital" value={roleData.hospital_affiliation} />
                                <HealthCell icon={<Award className="w-5 h-5" />} label="License #" value={roleData.license_number} />
                                <HealthCell icon={<Clock className="w-5 h-5" />} label="Experience" value={`${roleData.years_of_experience} Years`} />
                                <HealthCell icon={<Globe className="w-5 h-5" />} label="Languages" value={roleData.languages_spoken?.join(', ')} />
                            </>
                        )}
                    </GlassGroup>
                </motion.div>
            </main>
        </div>
    );
}
