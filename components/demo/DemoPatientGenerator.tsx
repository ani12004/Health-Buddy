'use client'

import { motion } from 'framer-motion'

interface PatientPreset {
    name: string
    description: string
    data: any
}

const PRESETS: PatientPreset[] = [
    {
        name: "Healthy Athlete",
        description: "Low risk across all metrics. High activity, clean history.",
        data: {
            age: 28, sex: 'Female', bmi: 21.0, waist: 72,
            systolic_bp: 115, diastolic_bp: 75, heart_rate: 58, history: 'None',
            total_cholesterol: 170, ldl: 90, hdl: 65,
            triglycerides: 80, fasting_glucose: 85, hba1c: 5.1,
            smoking: 'Non-Smoker', activity: 'Very Active',
            stress: 'Low', salt_intake: 'Low'
        }
    },
    {
        name: "Sedentary Executive",
        description: "Moderate risk. High stress, high BMI, low activity.",
        data: {
            age: 45, sex: 'Male', bmi: 30.5, waist: 98,
            systolic_bp: 138, diastolic_bp: 88, heart_rate: 78, history: 'None',
            total_cholesterol: 230, ldl: 145, hdl: 42,
            triglycerides: 180, fasting_glucose: 105, hba1c: 5.8,
            smoking: 'Former Smoker', activity: 'Sedentary',
            stress: 'High', salt_intake: 'High'
        }
    },
    {
        name: "At-Risk Patient",
        description: "High risk. Smoker, hypertension history, high glucose.",
        data: {
            age: 58, sex: 'Male', bmi: 33.2, waist: 108,
            systolic_bp: 158, diastolic_bp: 98, heart_rate: 84, history: 'Yes',
            total_cholesterol: 275, ldl: 185, hdl: 32,
            triglycerides: 240, fasting_glucose: 145, hba1c: 7.5,
            smoking: 'Regular Smoker', activity: 'Light',
            stress: 'High', salt_intake: 'High'
        }
    }
]

interface DemoPatientGeneratorProps {
    onSelect: (data: any) => void
}

export function DemoPatientGenerator({ onSelect }: DemoPatientGeneratorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {PRESETS.map((preset, i) => (
                <motion.button
                    key={i}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(preset.data)}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                            i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <h4 className="font-bold text-slate-800">{preset.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
                </motion.button>
            ))}
        </div>
    )
}
