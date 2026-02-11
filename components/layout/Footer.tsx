import Link from 'next/link'
import { Shield, Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-black/20 border-t border-slate-200 dark:border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Health Buddy</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                            Democratizing healthcare with artificial intelligence. Making accurate diagnosis accessible to everyone, everywhere.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Enterprise</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Customer Stories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">HIPAA</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">© 2024 Health Buddy AI. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook className="w-4 h-4" /></Link>
                        <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Instagram className="w-4 h-4" /></Link>
                        <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
