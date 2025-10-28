import React from "react";
import {
  Modal,
  ModalContent,
  Button,
} from "@heroui/react";
import { usePermission } from "../../contexts/PermissionContext";
import { useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const { user, hasPermission, logout } = usePermission();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page
    console.log('Edit profile');
  };

  const handleControlPanel = () => {
    navigate('/app/panel-control');
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout(); // Logout now handles redirect internally
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement="center"
      size="5xl"
      className="max-w-[400px] md:max-w-[820px]"
    >
      <ModalContent className="bg-white border border-gray-200 rounded-[18px] shadow-lg p-4 md:p-6 max-h-[calc(100vh-40px)] overflow-auto">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-center md:text-left">Datos del usuario</h1>
              <p className="text-gray-600 text-sm text-center md:text-left">Información básica</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7 mt-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Nombre</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.nombres}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Apellidos</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.apellidos}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg col-span-1 md:col-span-2">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">N. deeeecumento de identidad</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.dni}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Correo</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.correo}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Teléfono</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.telefono}</div>
                </div>

                {user.ficha && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">ID ficha</div>
                    <div className="text-base font-bold text-gray-900 break-words">{user.ficha.numero}</div>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg col-span-1 md:col-span-2">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Rol</div>
                  <div className="text-base font-bold text-gray-900 break-words">{user.rol.nombre}</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 justify-between items-center mt-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-none shadow-md hover:shadow-lg px-4 py-2 rounded-lg font-bold w-full md:w-auto"
                  >
                    Editar perfil
                  </Button>
                  {hasPermission('Usuarios', 'panel de control', 'ver') && (
                    <Button
                      onClick={handleControlPanel}
                      className="bg-transparent text-emerald-600 border border-emerald-200 hover:border-emerald-300 px-4 py-2 rounded-lg font-bold w-full md:w-auto"
                    >
                      Panel de control
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-red-500 text-white border-none shadow-md hover:shadow-lg px-4 py-2 rounded-lg font-bold w-full md:w-auto flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;