import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import BodegaForm from '../molecules/BodegaForm';
import type { BodegaData } from '../../types/bodega.types';
import {
  getBodegas,
  deleteBodega,
} from '../../services/bodegaService';
import Table from '../atoms/Table';
import CustomButton from '../atoms/Boton';

interface BodegaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BodegaModal: React.FC<BodegaModalProps> = ({ isOpen, onClose }) => {
  const [bodegas, setBodegas] = useState<BodegaData[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchBodegas();
    }
  }, [isOpen]);

  const fetchBodegas = async () => {
    try {
      const data = await getBodegas();
      setBodegas(data);
    } catch (err) {
      console.error('Error fetching bodegas:', err);
    }
  };

  const handleEdit = (bodega: BodegaData) => {
    setEditId(bodega.id!);
    // Note: The form will handle the edit logic
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta bodega?')) {
      try {
        await deleteBodega(id);
        fetchBodegas();
        setMessage('Eliminado con éxito');
      } catch (err) {
        setMessage('Error al eliminar');
      }
    }
  };

  const headers = ['Número', 'Nombre', 'Acciones'];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Gestionar Bodegas</h2>
        </ModalHeader>
        <ModalBody>
          <BodegaForm editId={editId} onSuccess={() => { fetchBodegas(); setEditId(null); }} />
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Lista de Bodegas</h3>
            <Table headers={headers}>
              {bodegas.map((bodega) => (
                <tr key={bodega.id}>
                  <td className="px-4 py-2 border-b">{bodega.numero}</td>
                  <td className="px-4 py-2 border-b">{bodega.nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <CustomButton onClick={() => handleEdit(bodega)}>Editar</CustomButton>
                      <CustomButton onClick={() => handleDelete(bodega.id!)} variant="bordered">
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

export default BodegaModal;