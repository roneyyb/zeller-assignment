import App from '@/src/App';

import { View } from 'react-native';
import 'react-native-reanimated';


export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <App />
    </View>
  );
}
