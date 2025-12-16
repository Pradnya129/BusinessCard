export default function ThreeDotsLoader() {
  return (
    <div style={styles.container}>
      <div style={{ ...styles.dot, animationDelay: "0s" }}></div>
      <div style={{ ...styles.dot, animationDelay: "0.2s" }}></div>
      <div style={{ ...styles.dot, animationDelay: "0.4s" }}></div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 1; }
          100% { transform: scale(1); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    animation: "pulseDot 0.8s infinite ease-in-out",
  },
};
