import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './layout/Sidebar'
import { Topbar } from './layout/Topbar'

export default function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                {/* Ambient background for main area */}
                <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Topbar */}
                <Topbar setIsMobileMenuOpen={setIsMobileMenuOpen} />

                <div className="flex-1 overflow-auto px-4 md:px-8 pb-8" id="page-scroll-container">
                    <div className="w-full min-h-full flex flex-col">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
