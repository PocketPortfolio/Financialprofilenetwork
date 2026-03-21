/**
 * Challenge route fills the flex main region above TabBar/GlobalFooter (root layout).
 */
export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}
