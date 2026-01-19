'use client';

import { useState, useEffect } from 'react';
import { getFullUserProfile, updatePatientProfile } from '@/lib/actions/profile';
import { GlassGroup, HealthCell, EditCell, PageHeader } from '@/components/profile/shared-components';
import { Loader2, Camera, Calendar, Activity, AlertCircle, FileText, Smartphone, Globe, Save, X as XIcon, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner'; // Assuming we might want toasts later, but for now using simple alerts or inline states
import { useRouter } from 'next/navigation';

// We need to fetch data in a server component mostly, but for inline editing, client component is easier to manage state.
// To keep it clean, I'll fetch data in a wrapper or useEffect for now since I'm rewriting the page.
// Limitation: efficient fetching was setup for server usage. 
// Let's use a specialized Client Wrapper pattern or just fetch in useEffect since we are 'use client'.

export default function PatientProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [formData, setFormData] = useState<any>(null);
    const router = useRouter();

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
                        email: res.profile.email,
                        phone: res.roleData.phone || '', // New field
                        preferred_language: res.roleData.preferred_language || 'English', // New field
                        emergency_contact_name: res.roleData.emergency_contact?.name || '',
                        emergency_contact_phone: res.roleData.emergency_contact?.phone || ''
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
            // Prepare update payload
            // We update patient specific fields
            const patientUpdate = {
                date_of_birth: formData.date_of_birth,
                blood_type: formData.blood_type,
                height_cm: formData.height_cm,
                weight_kg: formData.weight_kg,
                phone: formData.phone,
                preferred_language: formData.preferred_language,
                emergency_contact: {
                    name: formData.emergency_contact_name,
                    phone: formData.emergency_contact_phone,
                    relation: 'Emergency Contact' // Simplify for now
                },
                medical_history: formData.medical_history,
                allergies: Array.isArray(formData.allergies) ? formData.allergies : (formData.allergies?.split(',').map((s: string) => s.trim()) || [])
            };

            await updatePatientProfile(patientUpdate);

            // Re-fetch or simplistic update
            setIsEditing(false);
            setData((prev: any) => ({
                ...prev,
                roleData: { ...prev.roleData, ...patientUpdate }
            }));

            // Show auto-save success logic visually ideally
        } catch (e) {
            console.error("Save failed", e);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!data) return <div>Error loading profile.</div>;

    const { profile, roleData } = data;

    return (
        <div className="min-h-screen bg-background pb-32">
            <PageHeader
                title="Profile"
                subtitle="Your health identity"
                action={
                    isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsEditing(false); setFormData({ ...roleData, full_name: profile.full_name, email: profile.email }); }}
                                className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-medium text-[15px] hover:bg-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 rounded-full bg-primary text-white font-medium text-[15px] hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Done'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )
                }
            />

            <main className="px-4 space-y-8 max-w-2xl mx-auto mt-4">

                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <GlassGroup className="flex flex-col items-center py-8">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 relative">
                            {/* Avatar Placeholder */}
                            👤
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <span>{new Date().getFullYear() - new Date(roleData.date_of_birth).getFullYear()} years</span>
                            <span>•</span>
                            <span>{roleData.blood_type || 'A+'}</span>
                        </div>
                    </GlassGroup>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Personal Information</h3>
                    <GlassGroup>
                        {isEditing ? (
                            <>
                                <EditCell label="Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} type="tel" placeholder="+1 234 567 8900" />
                                <EditCell label="Language" value={formData.preferred_language} onChange={(v) => setFormData({ ...formData, preferred_language: v })} type="select" options={['English', 'Spanish', 'French', 'German']} />
                                <EditCell label="Emergency Contact" value={formData.emergency_contact_name} onChange={(v) => setFormData({ ...formData, emergency_contact_name: v })} placeholder="Name" />
                                <EditCell label="Emergency Phone" value={formData.emergency_contact_phone} onChange={(v) => setFormData({ ...formData, emergency_contact_phone: v })} type="tel" placeholder="Phone" />
                            </>
                        ) : (
                            <>
                                <HealthCell
                                    icon={<Smartphone className="w-5 h-5" />}
                                    label="Phone"
                                    value={roleData.phone || 'Add phone number'}
                                    className={!roleData.phone ? 'opacity-60' : ''}
                                />
                                <HealthCell
                                    icon={<Globe className="w-5 h-5" />}
                                    label="Language"
                                    value={roleData.preferred_language || 'English'}
                                />
                                <HealthCell
                                    icon={<AlertCircle className="w-5 h-5" />}
                                    label="Emergency Contact"
                                    value={roleData.emergency_contact?.name || 'Add contact'}
                                    subValue={roleData.emergency_contact?.phone}
                                    className={!roleData.emergency_contact?.name ? 'opacity-60' : ''}
                                />
                            </>
                        )}
                    </GlassGroup>
                </motion.div>

                {/* Health Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Body Measurements</h3>
                    <GlassGroup>
                        {isEditing ? (
                            <>
                                <EditCell label="Height (cm)" value={formData.height_cm} onChange={(v) => setFormData({ ...formData, height_cm: v })} type="number" />
                                <EditCell label="Weight (kg)" value={formData.weight_kg} onChange={(v) => setFormData({ ...formData, weight_kg: v })} type="number" />
                                <EditCell label="Blood Type" value={formData.blood_type} onChange={(v) => setFormData({ ...formData, blood_type: v })} type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                            </>
                        ) : (
                            <>
                                <HealthCell icon={<Activity className="w-5 h-5" />} label="Height" value={`${roleData.height_cm} cm`} />
                                <HealthCell icon={<Activity className="w-5 h-5" />} label="Weight" value={`${roleData.weight_kg} kg`} />
                                <HealthCell icon={<Activity className="w-5 h-5" />} label="Blood Type" value={roleData.blood_type} />
                            </>
                        )}
                    </GlassGroup>
                </motion.div>

                {/* Medical History */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-4 mb-3">Medical History</h3>
                    <GlassGroup>
                        {isEditing ? (
                            <>
                                <div className="p-4 border-b border-black/5">
                                    <label className="text-[15px] text-muted-foreground block mb-2">Conditions</label>
                                    <textarea
                                        value={formData.medical_history}
                                        onChange={e => setFormData({ ...formData, medical_history: e.target.value })}
                                        className="w-full bg-primary/5 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        rows={3}
                                    />
                                </div>
                                <div className="p-4">
                                    <label className="text-[15px] text-muted-foreground block mb-2">Allergies (comma separated)</label>
                                    <input
                                        value={Array.isArray(formData.allergies) ? formData.allergies.join(', ') : formData.allergies}
                                        onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                        className="w-full bg-primary/5 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <HealthCell
                                    icon={<FileText className="w-5 h-5" />}
                                    label="Conditions"
                                    value={roleData.medical_history ? 'View details' : 'None listed'}
                                    isLink
                                    onClick={() => isEditing && alert("Click Edit to modify")}
                                />
                                <HealthCell
                                    icon={<AlertCircle className="w-5 h-5" />}
                                    label="Allergies"
                                    value={roleData.allergies?.length > 0 ? `${roleData.allergies.length} active` : 'None'}
                                    subValue={roleData.allergies?.join(', ')}
                                />
                            </>
                        )}
                    </GlassGroup>
                </motion.div>

                <div className="h-12" /> {/* Spacer */}
            </main>
        </div>
    );
}
