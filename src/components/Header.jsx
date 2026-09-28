import { useEffect, useState } from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'

function getInitialTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Header() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Table</h1>
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    </header>
  )
}
