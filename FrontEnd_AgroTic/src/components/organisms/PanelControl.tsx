import React, { useState } from 'react';
import InputSearch from '../atoms/buscador';
import CustomButton from '../atoms/Boton';
import Table from '../atoms/Table';
import MobileCard from '../atoms/MobileCard';
import type { CardField, CardAction } from '../../types/MobileCard.types';
import AdminUserForm from './AdminUserForm';
import CreateRoleModal from './CreateRoleModal';
import ManageRolesModal from './ManageRolesModal';
import userSearchService from '../../services/userSearchService';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';

const PanelControl: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userSearchService.searchByDni(searchInput);
      setResults(Array.isArray(data) ? data.slice(0, 8) : [data]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al buscar usuario');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (rol: string) => {
    switch (rol) {
      case 'Aprendiz':
        return 'bg-blue-500 text-white';
      case 'Instructor':
        return 'bg-green-500 text-white';
      case 'Pasante':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const headers = ['N. de documento', 'Nombres', 'Apellidos', 'Correo Electrónico', 'Teléfono', 'ID Ficha', 'Rol', 'Acciones'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-left whitespace-nowrap">Panel de Control</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">Gestión de roles</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Gestión de roles">
              <DropdownItem key="create" onClick={() => setIsRoleModalOpen(true)}>Crear nuevo rol</DropdownItem>
              <DropdownItem key="manage" onClick={() => setIsManageRolesModalOpen(true)}>Gestionar roles</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <CustomButton onClick={() => setIsUserFormOpen(true)}>Nuevo Usuario</CustomButton>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2 items-center">
        <InputSearch
          placeholder="Buscar por DNI..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <CustomButton variant="solid" onClick={handleSearch}>Buscar</CustomButton>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <Table headers={headers}>
            {results.map((user, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{user.numero_documento}</td>
                <td className="px-4 py-2">{user.nombres}</td>
                <td className="px-4 py-2">{user.apellidos}</td>
                <td className="px-4 py-2">{user.correo_electronico}</td>
                <td className="px-4 py-2">{user.telefono}</td>
                <td className="px-4 py-2">{user.id_ficha}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${getBadgeClass(user.rol)}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <CustomButton variant="bordered">Editar</CustomButton>
                  <CustomButton variant="bordered">Eliminar</CustomButton>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No se encontraron resultados.</div>
        ) : (
          results.map((user, index) => {
            const fields: CardField[] = [
              { label: 'DNI', value: user.numero_documento },
              { label: 'Nombres', value: user.nombres },
              { label: 'Apellidos', value: user.apellidos },
              { label: 'Correo', value: user.correo_electronico },
              { label: 'Teléfono', value: user.telefono },
              { label: 'ID Ficha', value: user.id_ficha },
              { label: 'Rol', value: <span className={`px-2 py-1 rounded text-sm ${getBadgeClass(user.rol)}`}>{user.rol}</span> },
            ];

            const actions: CardAction[] = [
              {
                label: 'Editar',
                onClick: () => {}, // Aquí puedes abrir formulario de edición
                size: 'sm',
              },
              {
                label: 'Eliminar',
                onClick: () => {}, // Aquí abrir confirmación
                variant: 'bordered',
                size: 'sm',
              },
            ];

            return <MobileCard key={user.numero_documento || index} fields={fields} actions={actions} />;
          })
        )}
      </div>

      <AdminUserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onUserCreated={() => {
          // Optionally refresh the list or show a message
        }}
      />

      <CreateRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onRoleCreated={() => {
          // Optionally refresh roles or show message
        }}
      />

      <ManageRolesModal
        isOpen={isManageRolesModalOpen}
        onClose={() => setIsManageRolesModalOpen(false)}
      />
    </div>
  );
};

export default PanelControl;