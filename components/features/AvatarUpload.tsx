'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateAvatarUrl } from '@/lib/actions/profiles'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface AvatarUploadProps {
    currentUrl?: string
    userId: string
    onUploadSuccess?: (url: string) => void
    className?: string
}

export function AvatarUpload({ currentUrl, userId, onUploadSuccess, className }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        // Auto upload
        uploadImage(file)
    }

    const uploadImage = async (file: File) => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update profile via server action
            const res = await updateAvatarUrl(publicUrl)
            
            if (res.success) {
                toast.success('Profile picture updated')
                if (onUploadSuccess) onUploadSuccess(publicUrl)
            } else {
                throw new Error(res.error)
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Failed to upload image')
            setPreview(null) // Reset preview on error
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={cn("relative group", className)}>
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-surface-dark bg-slate-200 dark:bg-slate-700 shadow-md overflow-hidden relative">
                {preview || currentUrl ? (
                    <img src={preview || currentUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-10 h-10 text-slate-400" />
                    </div>
                )}
                
                {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}
            </div>

            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 group-hover:scale-110 active:scale-95"
                title="Change Avatar"
            >
                <Camera className="w-4 h-4" />
            </button>

            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}
