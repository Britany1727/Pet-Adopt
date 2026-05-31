import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseMapRepository } from '../../infrastructure/repositories/SupabaseMapRepository';
import { GetProductLocationsUseCase } from '../../application/usecases/GetLocationUseCase';
import { UpdateProductLocationUseCase } from '../../application/usecases/UpdateLocation';
import { GetCurrentUserLocationUseCase } from '../../application/usecases/GetCurrentUserLocationUseCase';
import { CalculateDistanceUseCase } from '../../application/usecases/CalculateDistanceUseCase';

const mapRepo = new SupabaseMapRepository();
const getLocationsUseCase = new GetProductLocationsUseCase(mapRepo);
const updateLocationUseCase = new UpdateProductLocationUseCase(mapRepo);
const getUserLocationUseCase = new GetCurrentUserLocationUseCase(mapRepo);
const calculateDistanceUseCase = new CalculateDistanceUseCase();

export function useMap(userId?: string, gpsLocation?: { latitude: number; longitude: number } | null) {
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['seller-locations'],
    queryFn: () => getLocationsUseCase.execute(),
  });

  const { data: userLocation, isLoading: userLocLoading } = useQuery({
    queryKey: ['user-location', userId],
    queryFn: () => (userId ? getUserLocationUseCase.execute(userId) : null),
    enabled: !!userId,
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ userId, latitude, longitude }: { userId: string; latitude: number; longitude: number }) =>
      updateLocationUseCase.execute(userId, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-locations'] });
      queryClient.invalidateQueries({ queryKey: ['user-location'] });
    },
  });

  const ref = userLocation ?? gpsLocation;

  const getDistance = (lat: number, lng: number): number | null => {
    if (!ref) return null;
    return calculateDistanceUseCase.execute(
      ref.latitude, ref.longitude,
      lat, lng
    );
  };

  const locationsWithDistance = locations.map(loc => ({
    ...loc,
    distance: getDistance(loc.latitude, loc.longitude),
  }));

  return {
    locations: locationsWithDistance,
    userLocation,
    isLoading: isLoading || userLocLoading,
    error,
    updateLocation: updateLocationMutation.mutateAsync,
    isUpdating: updateLocationMutation.isPending,
  };
}
