
import React, { useState } from 'react';
import { UserRole } from '../types';
import { TruckIcon, UserGroupIcon, KeyIcon } from './Icons';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

// Hardcoded passwords (for simulation purposes) - Solo para Conductor
const PASSWORDS = {
  [UserRole.DRIVER]: 'conductor123',
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const [promptForDriverPassword, setPromptForDriverPassword] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleDriverRoleClick = () => {
    setPromptForDriverPassword(true);
    setPasswordInput('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = () => {
    if (PASSWORDS[UserRole.DRIVER] === passwordInput) {
      onSelectRole(UserRole.DRIVER);
      setPromptForDriverPassword(false);
      setPasswordInput('');
      setPasswordError(null);
    } else {
      setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleCancelPassword = () => {
    setPromptForDriverPassword(false);
    setPasswordInput('');
    setPasswordError(null);
  };
  
  if (promptForDriverPassword) {
    return (
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
            <KeyIcon className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Contraseña para Rol Conductor</h2>
        </div>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Ingresa la contraseña"
          className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handlePasswordSubmit();
            }
          }}
        />
        {passwordError && (
          <p className="text-sm text-red-400">{passwordError}</p>
        )}
        <div className="flex space-x-4">
          <button
            onClick={handlePasswordSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
          >
            Confirmar
          </button>
          <button
            onClick={handleCancelPassword}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl space-y-8">
      <h2 className="text-3xl font-bold text-center text-white">Selecciona Tu Rol</h2>
      <div className="space-y-4">
        <button
          onClick={handleDriverRoleClick}
          className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
        >
          <TruckIcon className="w-6 h-6" />
          <span>Soy el Conductor</span>
        </button>
        <button
          onClick={() => onSelectRole(UserRole.COLLABORATOR)} // Cambio aquí: Colaborador no pide contraseña
          className="w-full flex items-center justify-center space-x-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
        >
          <UserGroupIcon className="w-6 h-6" /> 
          <span>Soy un Colaborador</span>
        </button>
        <button
          onClick={() => onSelectRole(UserRole.EMPLOYEE)}
          className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
        >
          <UserGroupIcon className="w-6 h-6" />
          <span>Soy un Empleado</span>
        </button>
      </div>
      <p className="text-sm text-gray-400 text-center">
        Elige 'Conductor' para compartir la ubicación (requiere contraseña), 'Colaborador' para compartir sin contraseña, o 'Empleado' para ver su posición.
      </p>
    </div>
  );
};

export default RoleSelector;