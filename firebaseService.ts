

import firebaseInstance from 'firebase/compat/app';
import 'firebase/compat/database'; // For side effect of attaching database to the Firebase app namespace
import { LocationData, AdditionalBusStatus, GeolocationError } from './types';

// IMPORTANT: REPLACE WITH YOUR ACTUAL FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyDkCEveb6EtnC91C2BclrE7-Orkpv_PLBA", 
    authDomain: "busmap-e9b4e.firebaseapp.com", 
    databaseURL: "https://busmap-e9b4e-default-rtdb.firebaseio.com", 
    projectId: "busmap-e9b4e", 
    storageBucket: "busmap-e9b4e.firebaseapp.com", 
    messagingSenderId: "966894015904", 
    appId: "1:966894015904:web:b3209e626ff6625b9a40c5", 
    measurementId: "G-VJ863TSJBT" 
};

let db: firebaseInstance.database.Database | null = null; // MODIFIED HERE
let app: typeof firebaseInstance | null = null;
let initializationError: Error | null = null;

try {
  // Verificar si firebaseInstance (firebase/compat/app) se cargó
  if (!firebaseInstance || typeof firebaseInstance.initializeApp !== 'function') {
    throw new Error("Firebase app instance (from firebase/compat/app) did not load correctly.");
  }
  app = firebaseInstance; // Guardar la instancia cargada

  if (!app.apps.length) {
    app.initializeApp(firebaseConfig);
  }

  // Verificar si el SDK de database se adjuntó correctamente a la instancia de la app
  if (typeof app.database === 'function') {
    db = app.database(); // Obtener la instancia de la base de datos
  } else {
    throw new Error("firebase.database is not a function. Firebase Database SDK (firebase/compat/database) might not be loaded or attached correctly to the app instance.");
  }

  if (!db) { 
      throw new Error("Failed to obtain a valid Firebase Database instance from app.database().");
  }

} catch (e: any) {
  console.error("CRITICAL FIREBASE INITIALIZATION FAILURE (firebaseService.ts):", e);
  initializationError = e instanceof Error ? e : new Error(String(e));
  // db permanecerá null, app podría ser null o parcialmente definido si la primera verificación falló.
}

export const database = db;
export const firebaseApp = app; // Exportar la instancia de la app (puede ser null)

export const BUS_DATA_PATH = "busData/live";

export interface FirebaseBusData {
  location: LocationData | null;
  isSharing: boolean;
  lastUpdatedAt: number | null; 
  additionalStatus: AdditionalBusStatus | null;
  driverReportedError: GeolocationError | null;
}

export type FirebaseBusDataUpdate = Partial<Omit<FirebaseBusData, 'lastUpdatedAt'>> & {
  lastUpdatedAt?: number | null | object;
};

const getFirebaseTimestamp = (): object | number => {
  if (app && typeof app.database === 'function' && app.database.ServerValue && app.database.ServerValue.TIMESTAMP) {
    return app.database.ServerValue.TIMESTAMP;
  }
  console.warn("Firebase ServerValue.TIMESTAMP is not available (app, app.database, or ServerValue is missing). Using local Date.now(). Check Firebase SDK loading and initialization in firebaseService.ts.");
  return Date.now();
};

export const updateFirebaseBusData = (dataToUpdate: FirebaseBusDataUpdate): Promise<void> => {
  if (!database) {
    const errorMsg = "Firebase Database is not initialized. Cannot update data.";
    console.error(errorMsg, initializationError);
    return Promise.reject(initializationError || new Error(errorMsg));
  }

  const updates: FirebaseBusDataUpdate = {
    ...dataToUpdate,
  };
  updates.lastUpdatedAt = getFirebaseTimestamp();

  Object.keys(updates).forEach(key => {
    if (updates[key as keyof FirebaseBusDataUpdate] === undefined) {
      delete updates[key as keyof FirebaseBusDataUpdate];
    }
  });

  return database.ref(BUS_DATA_PATH).update(updates)
    .catch(error => {
      console.error("Error updating Firebase data:", error);
      throw error;
    });
};

export const initializeBusDataInFirebase = (): Promise<void> => {
  if (!database) {
    const errorMsg = "Firebase Database is not initialized. Cannot initialize data.";
    console.error(errorMsg, initializationError);
    return Promise.reject(initializationError || new Error(errorMsg));
  }

  const initialData: FirebaseBusDataUpdate = {
    location: null,
    isSharing: false,
    additionalStatus: {
      incidentReported: null,
      seatsAvailable: null,
      lastStatusUpdate: null,
    },
    driverReportedError: null,
  };
  initialData.lastUpdatedAt = getFirebaseTimestamp();

  return database.ref(BUS_DATA_PATH).set(initialData)
    .catch(error => {
      console.error("Error initializing Firebase data:", error);
      throw error;
    });
};