// firebaseService.ts - Versión 2.0 (API REST Directa)

import { LocationData, AdditionalBusStatus, GeolocationError } from './types';

// CONFIGURACIÓN DEL PROYECTO 'busmap-app-nueva'
export const firebaseConfig = {
  apiKey: "AIzaSyCoL-3qWfU7WsHJ1quPjF4VZIXxudb5IKQ",
  authDomain: "busmap-app-nueva.firebaseapp.com",
  databaseURL: "https://busmap-app-nueva-default-rtdb.firebaseio.com/",
  projectId: "busmap-app-nueva",
  storageBucket: "busmap-app-nueva.firebasestorage.app",
  messagingSenderId: "1008846101162",
  appId: "1:1008846101162:web:38886d4cd4f8f69a8a4ed3",
  measurementId: "G-Y301FRLEQD"
};

export const BUS_DATA_PATH = "busData/live";
const FIREBASE_REST_URL = `${firebaseConfig.databaseURL}${BUS_DATA_PATH}.json`;

// Define la estructura de datos que esperamos de Firebase
export interface FirebaseBusData {
    location: LocationData | null;
    isSharing: boolean;
    lastUpdatedAt: number; // Ya no es un objeto, será un timestamp numérico
    additionalStatus: AdditionalBusStatus | null;
    driverReportedError: GeolocationError | null;
}

// Función genérica para manejar las respuestas de fetch
async function handleFetchResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json();
}

// LEE los datos del autobús usando la API REST
export const readBusDataInFirebase = async (): Promise<FirebaseBusData | null> => {
    try {
        const response = await fetch(FIREBASE_REST_URL);
        return await handleFetchResponse(response);
    } catch (error) {
        console.error("Error reading from Firebase REST API:", error);
        throw error;
    }
};

// ACTUALIZA los datos del autobús usando la API REST (método PATCH)
export const updateFirebaseBusData = async (dataToUpdate: Partial<Omit<FirebaseBusData, 'lastUpdatedAt'>>): Promise<void> => {
    const updates = {
        ...dataToUpdate,
        lastUpdatedAt: Date.now(), // Usamos el timestamp del cliente
    };

    try {
        const response = await fetch(FIREBASE_REST_URL, {
            method: 'PATCH', // PATCH actualiza campos, no reemplaza todo el objeto
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        await handleFetchResponse(response);
    } catch (error) {
        console.error("Error updating Firebase data via REST API:", error);
        throw error;
    }
};

// INICIALIZA la estructura de datos si no existe (método PUT)
export const initializeBusDataInFirebase = async (): Promise<void> => {
    const initialData: Omit<FirebaseBusData, 'lastUpdatedAt'> & { lastUpdatedAt: { '.sv': string } } = {
        location: null,
        isSharing: false,
        additionalStatus: {
            incidentReported: null,
            seatsAvailable: null,
            lastStatusUpdate: null,
        },
        driverReportedError: null,
        // Usamos el marcador de tiempo del servidor de la API REST para la inicialización
        lastUpdatedAt: { '.sv': 'timestamp' }, 
    };
    try {
        const response = await fetch(FIREBASE_REST_URL, {
            method: 'PUT', // PUT reemplaza/crea el objeto en la ruta
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialData),
        });
        await handleFetchResponse(response);
    } catch (error) {
        console.error("Error initializing Firebase data via REST API:", error);
        throw error;
    }
};
