'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`nav-modern transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-6">
          {/* Centered Navigation Container */}
          <div className="flex justify-center">
            <div className="flex items-center justify-between bg-black/20 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/30 shadow-2xl max-w-6xl w-full">
              {/* Logo - Left Side */}
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    NotesFlow
                  </span>
                </Link>
              </div>
              {/* Center Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/"
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover-lift drop-shadow-md ${
                        pathname === '/'
                          ? 'bg-white/30 text-white shadow-lg'
                          : 'text-white hover:text-white hover:bg-white/20'
                      }`}
                    >
                      Home
                    </Link>
                    <div className="w-px h-5 bg-white/40 mx-2"></div>
                    <Link
                      href="/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover-lift drop-shadow-md ${
                        pathname === '/dashboard'
                          ? 'bg-white/30 text-white shadow-lg'
                          : 'text-white hover:text-white hover:bg-white/20'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover-lift drop-shadow-md ${
                        pathname === '/login'
                          ? 'bg-white/30 text-white shadow-lg'
                          : 'text-white hover:text-white hover:bg-white/20'
                      }`}
                    >
                      Login
                    </Link>
                    <div className="w-px h-5 bg-white/40 mx-2"></div>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover-lift shadow-lg drop-shadow-md"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              {/* User Menu - Right Side */}
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    {/* User Profile */}
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 hover-lift shadow-lg">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="hidden lg:block">
                        <p className="text-white text-sm font-bold drop-shadow-md">
                          {user?.name}
                        </p>
                        <p className="text-white/80 text-xs drop-shadow-md">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      className="px-3 py-2 rounded-lg text-sm font-bold text-white hover:text-white hover:bg-red-500/30 transition-all duration-300 hover-lift flex items-center space-x-2 drop-shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-3 py-2 rounded-lg text-sm font-bold text-white hover:text-white hover:bg-white/20 transition-all duration-300 hover-lift drop-shadow-md"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary text-sm px-4 py-2 font-bold drop-shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:text-white hover:bg-white/20 transition-all duration-300 drop-shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 slide-in-up">
            <div className="glass rounded-2xl p-6 space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/20">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-bold">
                        {user?.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/"
                      className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        pathname === '/'
                          ? 'bg-white/30 text-white'
                          : 'text-white hover:text-white hover:bg-white/20'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/dashboard"
                      className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        pathname === '/dashboard'
                          ? 'bg-white/30 text-white'
                          : 'text-white hover:text-white hover:bg-white/20'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <button
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 rounded-xl text-sm font-bold text-red-300 hover:text-red-200 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      pathname === '/login'
                        ? 'bg-white/30 text-white'
                        : 'text-white hover:text-white hover:bg-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-sm block text-center font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}