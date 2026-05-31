import { useLocalSearchParams } from 'expo-router';
import { MapScreen } from '@features/map/presentation/Screens/MapScreen';

export default function MapRoute() {
  const params = useLocalSearchParams<{ targetSellerId?: string }>();
  return <MapScreen targetSellerId={params.targetSellerId} />;
}