/**
 * Profile Header Component
 * Displays user avatar, username, and global rank
 */

export interface ProfileHeaderProps {
  username: string
  globalRank: number | null
}

export function ProfileHeader({ username, globalRank }: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <div className="profile-avatar">
        <span className="avatar-initial">{username.charAt(0).toUpperCase()}</span>
      </div>
      <div className="profile-info">
        <h1 className="profile-username">{username}</h1>
        {globalRank && (
          <span className="profile-rank">Global Rank: #{globalRank}</span>
        )}
      </div>
    </header>
  )
}

export default ProfileHeader
