export default function UserAvatar({ user }) {
  if (!user) return null;

  const initials = (
    (user.firstName?.[0] || user.name?.split(' ')[0]?.[0] || '') +
    (user.lastName?.[0] || user.name?.split(' ')[1]?.[0] || '')
  ).toUpperCase();

  return (
    <span className="user-avatar" aria-hidden="true">
      {user.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
    </span>
  );
}
