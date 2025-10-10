import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";

import MapForm from "../molecules/MapForm";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <h2 className="text-lg font-bold">Registrar Mapa</h2>
            </ModalHeader>

            <ModalBody>
              <MapForm />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MapModal;
