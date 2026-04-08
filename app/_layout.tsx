import App from '@/src/App';

import { View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <App />
    </View>
  );
}
