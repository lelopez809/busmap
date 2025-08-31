import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import RoleSelector from './components/RoleSelector';
import DriverView from './components/DriverView';
import EmployeeView from './components/EmployeeView';
import { useLocationSharing } from './hooks/useLocationSharing';
import { FirebaseBusData, initializeBusDataInFirebase, readBusDataInFirebase } from './firebaseService';

const POLLING_INTERVAL = 5000; // 5 seconds

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const { 
    busLocation, isSharing, error, lastUpdatedAt, startSharingLocation, stopSharingLocation, 
    additionalBusStatus, reportIncident, reportSeatAvailability 
  } = useLocationSharing();

  const [firebaseBusData, setFirebaseBusData] = useState<FirebaseBusData | null>(null);
  const [firebaseListenerError, setFirebaseListenerError] = useState<string | null>(null);
  
  // A one-time check on mount to ensure the initial data structure exists.
  useEffect(() => {
    const checkAndInitialize = async () => {
      try {
        const data = await readBusDataInFirebase();
        if (data === null) {
          console.log("No initial data found in Firebase. Creating structure via REST...");
          await initializeBusDataInFirebase();
        }
      } catch (err: any) {
        console.error("Failed to check/initialize Firebase structure:", err);
        setFirebaseListenerError("No se pudo conectar o inicializar la estructura de datos.");
      }
    };
    checkAndInitialize();
  }, []);


  // Effect for Employee role to listen via Polling
  useEffect(() => {
    if (role !== UserRole.EMPLOYEE) {
      return; // Do nothing if not an employee
    }

    let isMounted = true;
    let intervalId: number;

    const fetchData = async () => {
      try {
        const data = await readBusDataInFirebase();
        if (isMounted) {
            setFirebaseBusData(data);
            setFirebaseListenerError(null);
        }
      } catch (err: any) {
        console.error("Firebase polling error:", err);
        if (isMounted) {
            setFirebaseListenerError(`Error al obtener datos: ${err.message}`);
        }
      }
    };

    // Fetch immediately and then start polling
    fetchData();
    intervalId = window.setInterval(fetchData, POLLING_INTERVAL);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [role]); // Rerun this effect if the role changes


  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };
  
  const handleBackToSelector = () => {
    // If the driver was sharing, stop it before changing roles.
    if (isSharing) {
        stopSharingLocation();
    }
    setRole(UserRole.NONE);
  };

  const renderContent = () => {
    switch (role) {
      case UserRole.DRIVER:
        return (
          <DriverView
            roleTitle="Modo Conductor"
            startSharing={startSharingLocation}
            stopSharing={stopSharingLocation}
            isSharing={isSharing}
            currentLocation={busLocation}
            error={error}
            lastUpdatedAt={lastUpdatedAt}
            additionalBusStatus={additionalBusStatus}
            reportIncident={reportIncident}
            reportSeatAvailability={reportSeatAvailability}
          />
        );
       case UserRole.COLLABORATOR:
        return (
          <DriverView
            roleTitle="Modo Colaborador"
            startSharing={startSharingLocation}
            stopSharing={stopSharingLocation}
            isSharing={isSharing}
            currentLocation={busLocation}
            error={error}
            lastUpdatedAt={lastUpdatedAt}
            additionalBusStatus={additionalBusStatus}
            reportIncident={reportIncident}
            reportSeatAvailability={reportSeatAvailability}
          />
        );
      case UserRole.EMPLOYEE:
        return <EmployeeView firebaseBusData={firebaseBusData} firebaseListenerError={firebaseListenerError} />;
      case UserRole.NONE:
      default:
        return <RoleSelector onSelectRole={handleSelectRole} />;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4 font-sans">
        <div className="relative w-full max-w-xl flex items-center justify-center">
            {role !== UserRole.NONE && (
                <button
                    onClick={handleBackToSelector}
                    className="absolute top-0 -mt-12 left-0 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out text-sm"
                    aria-label="Volver al selector de roles"
                >
                   &larr; Volver
                </button>
            )}
            {renderContent()}
        </div>
    </main>
  );
};

export default App;