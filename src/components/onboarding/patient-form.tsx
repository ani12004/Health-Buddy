'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Calendar, FileText, Activity, AlertCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientForm({ userId, initialData }: { userId: string, initialData?: any }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        date_of_birth: initialData?.date_of_birth || '',
        blood_type: initialData?.blood_type || '',
        height_cm: initialData?.height_cm || '',
        weight_kg: initialData?.weight_kg || '',
        medical_history: initialData?.medical_history || '',
        allergies: initialData?.allergies?.join(', ') || '',
        current_medications: initialData?.current_medications?.join(', ') || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update Patients Table
            const { error: patientError } = await supabase
                .from('patients')
                .upsert({
                    id: userId,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    date_of_birth: formData.date_of_birth,
                    blood_type: formData.blood_type,
                    height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
                    weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
                    medical_history: formData.medical_history,
                    allergies: formData.allergies ? formData.allergies.split(',').map((s: string) => s.trim()) : [],
                    current_medications: formData.current_medications ? formData.current_medications.split(',').map((s: string) => s.trim()) : [],
                    name: `${formData.first_name} ${formData.last_name}`.trim() // Legacy support
                });

            if (patientError) throw patientError;

            // 2. Update Profiles Table (Sync name)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: `${formData.first_name} ${formData.last_name}`.trim()
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            router.refresh();
            router.push('/patient');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> First Name
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="John"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Doe"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Date of Birth
                    </label>
                    <input
                        type="date"
                        required
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.date_of_birth}
                        onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Blood Type
                    </label>
                    <select
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.blood_type}
                        onChange={e => setFormData({ ...formData, blood_type: e.target.value })}
                    >
                        <option value="">Select Type</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Height (cm)</label>
                    <input
                        type="number"
                        placeholder="175"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.height_cm}
                        onChange={e => setFormData({ ...formData, height_cm: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Weight (kg)</label>
                    <input
                        type="number"
                        placeholder="70"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.weight_kg}
                        onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Medical History
                </label>
                <textarea
                    rows={3}
                    placeholder="Any chronic conditions, past surgeries, etc."
                    className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    value={formData.medical_history}
                    onChange={e => setFormData({ ...formData, medical_history: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary" /> Allergies
                    </label>
                    <input
                        type="text"
                        placeholder="Peanuts, Penicillin (comma separated)"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.allergies}
                        onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Current Medications</label>
                    <input
                        type="text"
                        placeholder="Aspirin, Vitamin D (comma separated)"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.current_medications}
                        onChange={e => setFormData({ ...formData, current_medications: e.target.value })}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Complete Profile'}
            </button>
        </form>
    );
}
