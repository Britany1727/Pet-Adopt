import {createClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

//Supabase espera métodos getItem, setItem e removeItem para expo-secure-store
//expone getItemAsync, setItemAsync e deleteItemAsync -Este adaptador los mapea
const SecureStoreAdapter = {
    getItem: async (key: string) => 
        SecureStore.getItemAsync(key),

    setItem: async (key: string, value: string) =>
        SecureStore.setItemAsync(key, value),

    removeItem: async (key: string) =>
        SecureStore.deleteItemAsync(key),

};

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            storage: SecureStoreAdapter,// tokens guardaddos en almacenamiento del dispositivo
            autoRefreshToken: true,
            persistSession: true,
        },
    }
);