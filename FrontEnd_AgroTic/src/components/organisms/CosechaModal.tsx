import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import TextInput from '../atoms/TextInput';
import type { CreateCosechaDto } from '../../types/cosechas.types';
import { createCosecha } from '../../services/cosechasService';

interface CosechaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvzId: string;
  onSuccess: () => void;
}

const CosechaModal: React.FC<CosechaModalProps> = ({ isOpen, onClose, cvzId, onSuccess }) => {
  const [formData, setFormData] = useState<CreateCosechaDto>({
    unidadMedida: 'kg',
    cantidad: 0,
    fecha: '',
    fkCultivosVariedadXZonaId: cvzId,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, fkCultivosVariedadXZonaId: cvzId }));
    }
  }, [isOpen, cvzId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fkCultivosVariedadXZonaId) return;

    setLoading(true);
    try {
      await createCosecha(formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating cosecha:', error);
      alert('Error al registrar cosecha: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCosechaDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Registrar Cosecha</h2>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.unidadMedida}
                  onChange={(e) => handleChange('unidadMedida', e.target.value)}
                  disabled
                >
                  <option value="kg">Kilogramos</option>
                </select>
              </div>
              <TextInput
                label="Cantidad"
                type="number"
                value={formData.cantidad.toString()}
                onChange={(e) => handleChange('cantidad', parseFloat(e.target.value))}
              />
              <TextInput
                label="Fecha"
                type="date"
                value={formData.fecha || ''}
                onChange={(e) => handleChange('fecha', e.target.value)}
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

export default CosechaModal;