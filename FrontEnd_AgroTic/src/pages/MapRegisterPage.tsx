import { useState } from "react";
import MapModal from "../components/organisms/MapModal";
import CustomButton from "../components/atoms/Boton";

const MapRegisterPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Botón para abrir modal */}
      <CustomButton text="Abrir Modal Mapa" onClick={() => setIsOpen(true)} />

      {/* Modal con formulario */}
      <MapModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default MapRegisterPage;

