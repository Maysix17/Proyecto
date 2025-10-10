import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import TextInput from '../atoms/TextInput';
import type { CreateVentaDto } from '../../types/venta.types';
import { createVenta } from '../../services/ventaService';
import type { Cultivo } from '../../types/cultivos.types';

interface VentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: Cultivo | null;
  onSuccess: () => void;
}

const VentaModal: React.FC<VentaModalProps> = ({ isOpen, onClose, cultivo, onSuccess }) => {
  const [formData, setFormData] = useState<CreateVentaDto>({
    cantidad: 0,
    fecha: '',
    fkCosechaId: '', // This needs to be set properly
    precioKilo: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultivo || !cultivo.cosechaid) {
      alert('No se encontró una cosecha para este cultivo');
      return;
    }

    setLoading(true);
    try {
      await createVenta({
        ...formData,
        fkCosechaId: cultivo.cosechaid,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating venta:', error);
      alert('Error al registrar venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateVentaDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Registrar Venta</h2>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <TextInput
                label="Cantidad"
                type="number"
                value={formData.cantidad.toString()}
                onChange={(e) => handleChange('cantidad', parseFloat(e.target.value))}
              />
              <TextInput
                label="Fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
              />
              <TextInput
                label="Precio por Kilo"
                type="number"
                value={formData.precioKilo?.toString() || ''}
                onChange={(e) => handleChange('precioKilo', parseFloat(e.target.value))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <CustomButton type="button" onClick={onClose} variant="bordered">
              Cancelar
            </CustomButton>
            <CustomButton type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </CustomButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default VentaModal;