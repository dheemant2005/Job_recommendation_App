export default function Footer() {
  return (
    <footer>
      <p style={{ margin: 0 }}>
        <span style={{
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 700,
        }}>⚡ TalentSpark</span>
        {" "}· Built with AI · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}