import { Link } from 'react-router-dom'

const Logo = ({ dark, onClick }) => (
  <Link to="/" className="flex items-center gap-2.5" onClick={onClick}>
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-shadow ${
        dark
          ? 'bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple/30 hover:shadow-neon-purple/50'
          : 'bg-gradient-to-br from-primary-600 to-accent-500 shadow-primary-500/30 hover:shadow-primary-500/50'
      }`}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="8" rx="2" />
        <rect x="3" y="14" width="10" height="6" rx="2" />
        <path d="M17 15v4M15 17h4" strokeLinecap="round" />
      </svg>
    </span>
    <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
      Tech
      <span
        className={
          dark
            ? 'bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent'
        }
      >
        PC
      </span>
    </span>
  </Link>
)

export default Logo
