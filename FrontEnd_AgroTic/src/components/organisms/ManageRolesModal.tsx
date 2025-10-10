import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { getRoles, deleteRole } from '../../services/rolesService';
import CreateRoleModal from './CreateRoleModal';

interface Role {
  id: string;
  nombre: string;
  permisos: any[];
}

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rol?')) return;

    try {
      await deleteRole(roleId);
      fetchRoles(); // Refresh list
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleRoleCreated = () => {
    fetchRoles(); // Refresh list
    setEditingRole(null);
    setIsCreateModalOpen(false);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingRole(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Gestionar Roles</ModalHeader>
          <ModalBody>
            {loading ? (
              <div>Cargando roles...</div>
            ) : (
              <Table aria-label="Roles table">
                <TableHeader>
                  <TableColumn>NOMBRE</TableColumn>
                  <TableColumn>PERMISOS</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.nombre}</TableCell>
                      <TableCell>{role.permisos.length} permisos</TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          <Button size="sm" onPress={() => handleEdit(role)}>Editar</Button>
                          <Button size="sm" color="danger" onPress={() => handleDelete(role.id)}>Eliminar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onRoleCreated={handleRoleCreated}
        editingRole={editingRole}
      />
    </>
  );
};

export default ManageRolesModal;