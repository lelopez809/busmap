
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GeolocationError } from './types'; // GeolocationError might be used for Firebase error display
import { useLocationSharing } from './hooks/useLocationSharing';
import DriverView from './components/DriverView';
import EmployeeView from './components/EmployeeView';
import RoleSelector from './components/RoleSelector';
import { TruckIcon } from './components/Icons';
import { database, BUS_DATA_PATH, FirebaseBusData, initializeBusDataInFirebase, updateFirebaseBusData } from './firebaseService';
// No import 'firebase/compat/app' directly if just using ServerValue through database object
// import firebase from 'firebase/compat/app'; // Only if firebase.database.ServerValue.TIMESTAMP is used directly here

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  
  // States from local hook, primarily for Driver/Collaborator UI
  const {
    busLocation: localBusLocation,
    isSharing: localIsSharing,
    error: localError,
    lastUpdatedAt: localLastUpdatedAt,
    startSharingLocation,
    stopSharingLocation,
    additionalBusStatus: localAdditionalBusStatus,
    reportIncident,
    reportSeatAvailability
  } = useLocationSharing();

  // State for Employee view, fed by Firebase
  const [firebaseBusData, setFirebaseBusData] = useState<FirebaseBusData | null>(null);
  const [firebaseListenerError, setFirebaseListenerError] = useState<string | null>(null);

  // Effect to initialize Firebase data when no role is selected (app start or role reset)
  useEffect(() => {
    if (currentRole === UserRole.NONE) {
      initializeBusDataInFirebase().catch(error => {
        console.error("Error initializing Firebase data when role is NONE:", error);
      });
    }
  }, [currentRole]);

  // Effect for Firebase listener (Employee role)
  useEffect(() => {
    if (currentRole === UserRole.EMPLOYEE) {
      const busDataRef = database.ref(BUS_DATA_PATH);
      const listener = busDataRef.on(
        'value',
        (snapshot) => {
          const data = snapshot.val() as FirebaseBusData;
          if (data) {
            setFirebaseBusData(data);
            setFirebaseListenerError(null);
          } else {
            setFirebaseBusData(null); // No data yet or cleared
            // setFirebaseListenerError("No bus data available from Firebase."); // Or handle as "not sharing"
          }
        },
        (error: Error) => { // Firebase error object is Error, not GeolocationError
          console.error("Firebase read error:", error);
          setFirebaseListenerError(`Error al leer datos: ${error.message}`);
          setFirebaseBusData(null);
        }
      );
      // Cleanup listener on component unmount or role change
      return () => {
        busDataRef.off('value', listener);
      };
    } else {
      setFirebaseBusData(null); // Clear data if not employee
      setFirebaseListenerError(null);
    }
  }, [currentRole]);


  const selectRole = useCallback((role: UserRole) => {
    // If switching from a sharing role, ensure sharing is stopped.
    if (localIsSharing && (currentRole === UserRole.DRIVER || currentRole === UserRole.COLLABORATOR)) {
        stopSharingLocation(); // This will update Firebase to isSharing: false
    }

    setCurrentRole(role); // This will trigger the useEffect if role becomes NONE

    if (role === UserRole.DRIVER || role === UserRole.COLLABORATOR) {
      // When a driver/collaborator starts, ensure `isSharing` is false and `driverReportedError` is cleared
      // before they press "Start Sharing". `initializeBusDataInFirebase` (triggered if previous role was NONE)
      // would have already reset the full Firebase record.
       updateFirebaseBusData({
           isSharing: false, 
           driverReportedError: null,
       });

    } else if (role === UserRole.EMPLOYEE) {
      // Fetch initial data or rely on listener
    }
    // If role is UserRole.NONE, the useEffect for currentRole will handle initialization.
  }, [localIsSharing, currentRole, stopSharingLocation]);


  const resetRole = useCallback(() => {
    if (localIsSharing && (currentRole === UserRole.DRIVER || currentRole === UserRole.COLLABORATOR)) {
      stopSharingLocation(); // This updates local state and Firebase to isSharing: false
    }
    setCurrentRole(UserRole.NONE); // This will trigger the useEffect to call initializeBusDataInFirebase
  }, [localIsSharing, stopSharingLocation, currentRole]);


  const Header: React.FC = () => (
    <div className="bg-gray-800 p-4 shadow-lg flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <TruckIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Localización de la guagua de San Cristóbal</h1>
      </div>
      {currentRole !== UserRole.NONE && (
        <button
          onClick={resetRole}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out"
        >
          Cambiar Rol
        </button>
      )}
    </div>
  );

  const Footer: React.FC = () => (
    <footer className="bg-gray-800 p-4 text-center text-sm text-gray-400 mt-auto">
      © {new Date().getFullYear()} Localización de la guagua de San Cristóbal.
      <p className="text-xs mt-1">Sincronización habilitada con Firebase. Se requiere configuración.</p>
    </footer>
  );
  
  let viewToRender;
  switch (currentRole) {
    case UserRole.NONE:
      viewToRender = <RoleSelector onSelectRole={selectRole} />;
      break;
    case UserRole.DRIVER:
      viewToRender = (
        <DriverView
          roleTitle="Modo Conductor"
          startSharing={startSharingLocation}
          stopSharing={stopSharingLocation}
          isSharing={localIsSharing}
          currentLocation={localBusLocation}
          error={localError}
          lastUpdatedAt={localLastUpdatedAt}
          additionalBusStatus={localAdditionalBusStatus} 
          reportIncident={reportIncident} 
          reportSeatAvailability={reportSeatAvailability} 
        />
      );
      break;
    case UserRole.COLLABORATOR:
      viewToRender = (
        <DriverView
          roleTitle="Modo Colaborador"
          startSharing={startSharingLocation}
          stopSharing={stopSharingLocation}
          isSharing={localIsSharing}
          currentLocation={localBusLocation}
          error={localError}
          lastUpdatedAt={localLastUpdatedAt}
          additionalBusStatus={localAdditionalBusStatus}
          reportIncident={reportIncident}
          reportSeatAvailability={reportSeatAvailability}
        />
      );
      break;
    case UserRole.EMPLOYEE:
      viewToRender = (
        <EmployeeView
          firebaseBusData={firebaseBusData}
          firebaseListenerError={firebaseListenerError}
        />
      );
      break;
    default:
      viewToRender = <RoleSelector onSelectRole={selectRole} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {viewToRender}
      </main>
      <Footer />
    </div>
  );
};

export default App;