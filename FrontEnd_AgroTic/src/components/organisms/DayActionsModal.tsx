import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@heroui/react';

interface DayActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewList: () => void;
  onCreateNew: () => void;
}

const DayActionsModal: React.FC<DayActionsModalProps> = ({ isOpen, onClose, onViewList, onCreateNew }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-semibold">Acciones para el día</h2>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3">
            <Button onClick={onViewList} className="w-full">
              Ver Lista de Actividades
            </Button>
            <Button onClick={onCreateNew} className="w-full" color="primary">
              Crear Nueva Actividad
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DayActionsModal;