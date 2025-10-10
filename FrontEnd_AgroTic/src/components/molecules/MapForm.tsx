import React, { useState } from "react";
import TextInput from "../atoms/TextInput";
import CustomButton from "../atoms/Boton";
import ImageUpload from "../atoms/ImagenUpload";
import { registerMap } from "../../services/mapService";
import type { MapData } from "../../types/map.types";

const MapForm = () => {
  const [mapData, setMapData] = useState<MapData>({ nombre: "", imagen: null });
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await registerMap(mapData);
      setMessage(response.message);
    } catch (error) {
      setMessage("Error al registrar el mapa.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <TextInput
        label="Nombre Mapa"
        placeholder="Ingrese nombre del mapa"
        value={mapData.nombre}
        onChange={(e) => setMapData({ ...mapData, nombre: e.target.value })}
      />

      <div className="flex flex-col gap-2">
        <label className="text-gray-700 text-sm mb-1">Imagen</label>
        <ImageUpload onFileSelect={(file) => setMapData({ ...mapData, imagen: file })} />
      </div>

      {message && <p className="text-center text-red-500">{message}</p>}

      <CustomButton
        type="submit"
        text="Registrar"
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 w-full"
      />
    </form>
  );
};

export default MapForm;
