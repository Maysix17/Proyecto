import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import TipoCultivoForm from '../molecules/TipoCultivoForm';
import type { TipoCultivoData } from '../../types/tipoCultivo.types';
import {
  getTipoCultivos,
  deleteTipoCultivo,
} from '../../services/tipoCultivo';
import Table from '../atoms/Table';
import CustomButton from '../atoms/Boton';

interface TipoCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TipoCultivoModal: React.FC<TipoCultivoModalProps> = ({ isOpen, onClose }) => {
  const [cultivos, setCultivos] = useState<TipoCultivoData[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchCultivos();
    }
  }, [isOpen]);

  const fetchCultivos = async () => {
    try {
      const data = await getTipoCultivos();
      setCultivos(data);
    } catch (err) {
      console.error('Error fetching cultivos:', err);
    }
  };

  const handleEdit = (cultivo: TipoCultivoData) => {
    setEditId(cultivo.id!);
    // Note: The form will handle the edit logic
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este tipo de cultivo?')) {
      try {
        await deleteTipoCultivo(id);
        fetchCultivos();
        setMessage('Eliminado con éxito');
      } catch (err) {
        setMessage('Error al eliminar');
      }
    }
  };

  const headers = ['Nombre', 'Acciones'];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Gestionar Tipos de Cultivo</h2>
        </ModalHeader>
        <ModalBody>
          <TipoCultivoForm editId={editId} onSuccess={() => { fetchCultivos(); setEditId(null); }} />
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Lista de Tipos de Cultivo</h3>
            <Table headers={headers}>
              {cultivos.map((cultivo) => (
                <tr key={cultivo.id}>
                  <td className="px-4 py-2 border-b">{cultivo.nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <CustomButton onClick={() => handleEdit(cultivo)}>Editar</CustomButton>
                      <CustomButton onClick={() => handleDelete(cultivo.id!)} variant="bordered">
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

export default TipoCultivoModal;