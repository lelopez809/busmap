import React, { useState } from 'react';
import { AlertTriangleIcon, ClipboardIcon, SpinnerIcon } from './Icons';
import { firebaseConfig } from '../firebaseService';


interface FirebaseErrorDisplayProps {
  error: Error;
}

type VerificationStatus = 'idle' | 'checking' | 'success' | 'failed';

const FirebaseErrorDisplay: React.FC<FirebaseErrorDisplayProps> = ({ error }) => {
  const [copied, setCopied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const isServiceUnavailable = error.message.toLowerCase().includes('service database is not available');

  const handleCopyConfig = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  
  const handleVerifyConnection = async () => {
    setVerificationStatus('checking');
    try {
      // Intentar leer un dato mínimo (la raíz) para ver si el servicio responde.
      // Usamos la API REST, al igual que el resto de la app.
      // `shallow=true` es una optimización para no descargar datos, solo verificar la conectividad.
      const response = await fetch(`${firebaseConfig.databaseURL}/.json?shallow=true`);
      
      if (response.ok) {
        // La conexión es exitosa.
        setVerificationStatus('success');
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      // Si la respuesta no es OK, analizamos el error.
      const errorData = await response.json().catch(() => ({ error: 'Unknown error structure' }));
      const errorMessage = (errorData.error || '').toLowerCase();
      
      // Si el error es "Permission denied", significa que la DB ya existe, ¡lo cual es un éxito para nuestra verificación!
      if (errorMessage.includes('permission denied')) {
        setVerificationStatus('success');
        setTimeout(() => window.location.reload(), 1500);
      } else if (errorMessage.includes('service not available')) {
        // Este es el error original que estamos tratando de resolver. La DB todavía no existe.
        setVerificationStatus('failed');
      } else {
        // Otro tipo de error.
        setVerificationStatus('failed');
        console.error("Verification failed with a different error:", errorMessage);
      }
    } catch (networkError) {
      // Errores de red (e.g., sin internet).
      setVerificationStatus('failed');
      console.error("Verification failed with a network error:", networkError);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 rounded-xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-3xl font-bold text-red-300 mb-2">Error Crítico de Conexión</h1>
          <p className="text-lg text-red-200 mb-6">No se pudo conectar con la base de datos de Firebase.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg text-left mb-6">
          <p className="font-mono text-sm text-gray-300 break-words">
            <span className="font-semibold text-red-400">Detalle del Error:</span> {error.message}
          </p>
        </div>

        <div className="space-y-6">
          {/* PASO 0: CONFIRMAR CÓDIGO OK */}
          <div className="text-left space-y-3 text-gray-200 bg-green-900/40 p-4 rounded-lg border border-green-700">
              <h2 className="text-xl font-semibold text-green-300">Paso 0: ¡Tu Código Funciona!</h2>
              <p className="text-sm">
                  La buena noticia es que este error significa que la aplicación se está ejecutando y las librerías de Firebase se cargaron correctamente. El problema no está en el código (como en la línea `import`), sino en la configuración de tu proyecto en la nube de Firebase.
              </p>
          </div>

          {/* PASO 1: VERIFICAR CONFIG */}
          <div className="text-left space-y-3 text-gray-200 pt-6 border-t border-red-800/50">
              <h2 className="text-xl font-semibold text-yellow-300">Paso 1: Verifica tu Configuración</h2>
              <p className="text-sm">Asegúrate de que la configuración en tu código coincide con la de tu proyecto en Firebase. Ya has confirmado que la URL es correcta.</p>
              <div className="bg-gray-800 p-4 rounded-lg font-mono text-xs sm:text-sm text-gray-300 relative border border-gray-700">
                  <pre className="whitespace-pre-wrap"><code>
                      {`// Configuración usada en la app:
projectId: "${firebaseConfig.projectId}"
databaseURL: "${firebaseConfig.databaseURL}"`}
                  </code></pre>
                  <button onClick={handleCopyConfig} title="Copiar configuración completa" className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-400 hover:text-white transition">
                      {copied ? '¡Copiado!' : <ClipboardIcon className="w-5 h-5" />}
                  </button>
              </div>
          </div>

          {/* PASO 2: ACTIVAR DB */}
          {isServiceUnavailable && (
            <div className="pt-6 border-t border-red-800/50">
              <div className="p-4 rounded-lg border-2 animate-glow">
                <h2 className="text-xl font-semibold text-yellow-300">Paso 2: Activa la Base de Datos (¡Solución Final!)</h2>
                <div className="space-y-3 text-gray-200 mt-3">
                  <p className="text-sm">
                    La URL existe, pero el servicio de base de datos necesita ser "construido".
                  </p>
                  <ol className="list-decimal list-inside space-y-2 bg-gray-800 p-4 rounded-md text-gray-300 text-sm border border-gray-700">
                    <li>En el menú de tu proyecto Firebase, ve a **Build &gt; Realtime Database**.</li>
                    <li>Haz clic en **"Crear base de datos"**.</li>
                    <li>Elige una ubicación y selecciona **"Iniciar en modo de prueba"**.</li>
                    <li>Haz clic en **"Habilitar"**. Después de esto, la página debería mostrar un visor de datos.</li>
                  </ol>
                  <div className="mt-4 text-center">
                     <button
                        onClick={handleVerifyConnection}
                        disabled={verificationStatus === 'checking'}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait"
                    >
                        {verificationStatus === 'checking' && <SpinnerIcon className="w-5 h-5" />}
                        <span>
                            {verificationStatus === 'idle' && 'Verificar Conexión en Vivo'}
                            {verificationStatus === 'checking' && 'Verificando...'}
                            {verificationStatus === 'success' && '¡Éxito! Recargando...'}
                            {verificationStatus === 'failed' && 'Fallo de nuevo. Reintentar'}
                        </span>
                    </button>
                    {verificationStatus === 'failed' && (
                        <p className="text-sm text-red-300 mt-2">La conexión falló. Confirma que has completado el Paso 2 en la consola de Firebase.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: REVISAR REGLAS */}
          <div className="text-left space-y-3 text-gray-200 pt-6 border-t border-red-800/50">
              <h2 className="text-xl font-semibold text-yellow-300">Paso 3: Entiende las Reglas de Seguridad</h2>
              <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 text-sm">
                <p className="font-bold text-gray-200 mb-2">Diferencia Clave de Errores:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong className="text-red-400">"Service database is not available":</strong> Significa que la base de datos NO EXISTE. <span className="font-semibold">La solución está en el Paso 2.</span></li>
                    <li><strong className="text-orange-400">"Permission denied":</strong> Significa que la base de datos SÍ EXISTE, pero tus reglas de seguridad están bloqueando el acceso. <span className="font-semibold">Aquí es donde las reglas importan.</span></li>
                </ul>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseErrorDisplay;
