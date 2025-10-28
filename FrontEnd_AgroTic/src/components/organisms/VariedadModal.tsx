import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import VariedadForm from '../molecules/VariedadForm';
import type { VariedadData } from '../../types/variedad.types';
import {
  getVariedades,
  deleteVariedad,
} from '../../services/variedad';
import Table from '../atoms/Table';
import CustomButton from '../atoms/Boton';

interface VariedadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VariedadModal: React.FC<VariedadModalProps> = ({ isOpen, onClose }) => {
  const [variedades, setVariedades] = useState<VariedadData[]>([]);
  const [editData, setEditData] = useState<VariedadData | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchVariedades();
    }
  }, [isOpen]);

  const fetchVariedades = async () => {
    try {
      const data = await getVariedades();
      setVariedades(data);
    } catch (err) {
      console.error('Error fetching variedades:', err);
    }
  };

  const handleEdit = (variedad: VariedadData) => {
    setEditData(variedad);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta variedad?')) {
      try {
        await deleteVariedad(id);
        fetchVariedades();
        setMessage('Eliminado con éxito');
      } catch (err) {
        setMessage('Error al eliminar');
      }
    }
  };

  const headers = ['Nombre', 'Tipo de Cultivo', 'Acciones'];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Gestionar Variedades</h2>
        </ModalHeader>
        <ModalBody>
          <VariedadForm editData={editData} onSuccess={() => { fetchVariedades(); setEditData(null); }} />
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Lista de Variedades</h3>
            <Table headers={headers}>
              {variedades.map((variedad) => (
                <tr key={variedad.id}>
                  <td className="px-4 py-2 border-b">{variedad.nombre}</td>
                  <td className="px-4 py-2 border-b">{variedad.tipoCultivo?.nombre || 'N/A'}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <CustomButton onClick={() => handleEdit(variedad)}>Editar</CustomButton>
                      <CustomButton onClick={() => handleDelete(variedad.id!)} variant="bordered">
                        Eliminar
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VariedadModal;