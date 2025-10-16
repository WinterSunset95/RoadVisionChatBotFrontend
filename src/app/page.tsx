/**
 * @file The root page of the application (route: /).
 * This page simply renders the WelcomeScreen component.
 */
import { WelcomeScreen } from '@/components/welcome-screen';

export default function HomePage() {
  return <WelcomeScreen />;
}