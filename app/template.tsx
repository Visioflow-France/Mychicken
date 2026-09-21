/* Rémonté à chaque navigation : applique le fondu de page (.page-fade) */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
