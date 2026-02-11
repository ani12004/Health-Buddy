'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Stethoscope, Building2, BadgeCheck, Clock } from 'lucide-react';

export function DoctorForm({ userId, initialData }: { userId: string, initialData?: any }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Parse hours if they exist
    const monHours = initialData?.available_hours?.mon || '09:00-17:00';
    const [start, end] = monHours.split('-');

    const [formData, setFormData] = useState({
        specialization: initialData?.specialization || '',
        license_number: initialData?.license_number || '',
        hospital_affiliation: initialData?.hospital_affiliation || '',
        years_of_experience: initialData?.years_of_experience || '',
        available_hours_start: start || '09:00',
        available_hours_end: end || '17:00'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('doctors')
                .upsert({
                    id: userId,
                    specialization: formData.specialization,
                    license_number: formData.license_number,
                    hospital_affiliation: formData.hospital_affiliation,
                    years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
                    available_hours: {
                        mon: `${formData.available_hours_start}-${formData.available_hours_end}`,
                        tue: `${formData.available_hours_start}-${formData.available_hours_end}`,
                        wed: `${formData.available_hours_start}-${formData.available_hours_end}`,
                        thu: `${formData.available_hours_start}-${formData.available_hours_end}`,
                        fri: `${formData.available_hours_start}-${formData.available_hours_end}`
                    }
                });

            if (error) throw error;

            router.refresh();
            router.push('/doctor');
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
                        <Stethoscope className="w-4 h-4 text-primary" /> Specialization
                    </label>
                    <select
                        required
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.specialization}
                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    >
                        <option value="">Select Specialization</option>
                        <option value="General Practice">General Practice</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Psychiatry">Psychiatry</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-primary" /> License Number
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. MD-123456"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.license_number}
                        onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Hospital/Clinic
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="City General Hospital"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.hospital_affiliation}
                        onChange={e => setFormData({ ...formData, hospital_affiliation: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Years of Experience</label>
                    <input
                        type="number"
                        required
                        placeholder="5"
                        min="0"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.years_of_experience}
                        onChange={e => setFormData({ ...formData, years_of_experience: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Default Available Hours (Mon-Fri)
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="time"
                        className="flex-1 p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.available_hours_start}
                        onChange={e => setFormData({ ...formData, available_hours_start: e.target.value })}
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                        type="time"
                        className="flex-1 p-3 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.available_hours_end}
                        onChange={e => setFormData({ ...formData, available_hours_end: e.target.value })}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Complete Doctor Profile'}
            </button>
        </form>
    );
}
