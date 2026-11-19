import { Screen } from '@/src/ui/primitives/Screen';
import { ClosingScreen } from '@/src/components/closing/ClosingScreen';

export default function Index() {
  return (
    <Screen scroll edges={['left', 'right']}>
      <ClosingScreen />
    </Screen>
  );
}
