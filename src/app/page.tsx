import GuestCheckInExperience from '@/components/GuestCheckInExperience';
import { LanguageProvider } from '@/context/LanguageContext';

export default function Home() {
  return (
    <LanguageProvider>
      <GuestCheckInExperience />
    </LanguageProvider>
  );
}