import '../components/finance-base.css';
import '../components/finance-modals.css';
import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mi Espacio — Tu vida, en orden',description:'Organiza tu agenda, tareas, metas y finanzas en un solo lugar.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
