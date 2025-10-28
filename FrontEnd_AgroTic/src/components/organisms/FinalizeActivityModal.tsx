import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Textarea } from '@heroui/react';

const styles = `
  body {
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    font-family: Arial, sans-serif;
    padding: 20px;
  }

  .modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
    border: 1px solid #ddd;
  }

  h1 {
    text-align: center;
    margin-bottom: 25px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  h3 {
    font-size: 18px;
    font-weight: bold;
    color: #555;
    margin-bottom: 10px;
  }

  .section {
    margin-bottom: 20px;
    border: none;
    box-shadow: none;
  }

  .activity-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: none;
    background: transparent;
  }

  .form-group.full-width {
    /* Ocupa el ancho completo */
  }

  label {
    margin-bottom: 5px;
    font-size: 14px;
    color: #555;
  }

  input[type="number"],
  input[type="text"],
  textarea {
    border-radius: 8px;
    transition: border-color 0.3s;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
  }

  input:focus,
  textarea:focus {
    border-color: #6a6a6a;
    outline: none;
  }

  input, textarea {
    background-color: white !important;
  }

  input[readonly] {
    background-color: #f7f7f7;
    color: #777;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .file-upload-box {
    border: 2px dashed #ccc;
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s, background-color 0.3s;
    position: relative;
    overflow: hidden;
    background-color: #f9f9f9;
  }

  .file-upload-box:hover {
    border-color: #999;
    background-color: #f0f0f0;
  }

  .file-upload-box p {
    margin-top: 10px;
    color: #777;
    font-size: 14px;
  }

  .upload-icon {
    width: 40px;
    height: 40px;
    color: #a0a0a0;
    margin-top: 5px;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    grid-column: span 2;
  }

  .save-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 30px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.1s;
  }

  .save-button:hover {
    background-color: #45a049;
  }

  .save-button:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    .modal-content {
      padding: 20px;
      margin: 10px;
    }

    .form-group-pair {
      grid-template-columns: 1fr;
    }

    .form-group.full-width {
      /* Ya es full width */
    }

    .button-container {
      justify-content: center;
      grid-column: span 1;
    }
  }
`;

interface Activity {
  id: string;
  descripcion: string;
  inventarioUsado?: { inventario: { nombre: string; id: string; categoria: { nombre: string } }; cantidadUsada: number; activo: boolean }[];
  usuariosAsignados?: { usuario: { nombres: string; apellidos: string; id: string }; activo: boolean }[];
  reservas?: {
    id: string;
    cantidadReservada: number;
    lote: {
      producto: {
        nombre: string;
        unidadMedida: { nombre: string; abreviatura: string };
      };
    };
  }[];
}

interface FinalizeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSave: (data: {
    actividadId: string;
    reservas: { reservaId: string; cantidadDevuelta: number }[];
    horas: number;
    precioHora: number;
    observacion: string;
    imgUrl?: File;
  }) => void;
}

const FinalizeActivityModal: React.FC<FinalizeActivityModalProps> = ({ isOpen, onClose, activity, onSave }) => {
  const [returnedQuantities, setReturnedQuantities] = useState<{ [key: string]: number }>({});
  const [horas, setHoras] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [observacion, setObservacion] = useState('');
  const [evidencia, setEvidencia] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && activity) {
      // Reset states
      setReturnedQuantities({});
      setHoras('');
      setPrecioHora('');
      setObservacion('');
      setEvidencia(null);
    }
  }, [isOpen, activity]);

  const handleSave = () => {
    // Validation
    const horasNum = parseFloat(horas);
    const precioNum = parseFloat(precioHora);
    if (!horas || horasNum <= 0) {
      alert('Horas dedicadas es requerido y debe ser un número positivo');
      return;
    }
    if (!precioHora || isNaN(precioNum) || precioNum <= 0) {
      alert('Precio por hora es requerido y debe ser un monto válido');
      return;
    }

    const reservas = activity?.reservas?.map(reserva => ({
      reservaId: reserva.id,
      cantidadDevuelta: returnedQuantities[reserva.id] || 0,
    })) || [];

    const data = {
      actividadId: activity!.id,
      reservas,
      horas: horasNum,
      precioHora: precioNum,
      observacion,
      imgUrl: evidencia || undefined,
    };
    onSave(data);
    onClose();
  };

  if (!activity) return null;


  return (
    <>
      <style>{styles}</style>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
        <ModalContent className="modal-content">
        <ModalHeader>
          <h1 className="text-2xl font-bold text-center">Finalizar actividad</h1>
          <Button isIconOnly variant="light" onClick={onClose}>
            ✕
          </Button>
        </ModalHeader>
        <ModalBody>
          <form className="activity-form">
            {/* Reservas realizadas */}
            <div className="section">
              <h3>Reservas realizadas</h3>
              <div className="reservas-container">
                <div className="form-group-pair">
                  {activity?.reservas?.map((reserva) => (
                    <div key={reserva.id} className="form-group">
                      <label htmlFor={`return-${reserva.id}`}>
                        {reserva.cantidadReservada} {reserva.lote.producto.unidadMedida.abreviatura} de {reserva.lote.producto.nombre}
                      </label>
                      <Input
                        id={`return-${reserva.id}`}
                        type="number"
                        placeholder="Cantidad a devolver"
                        value={returnedQuantities[reserva.id]?.toString() || ''}
                        onChange={(e) => setReturnedQuantities({ ...returnedQuantities, [reserva.id]: Number(e.target.value) })}
                        min="0"
                        max={reserva.cantidadReservada}
                        className="border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Horas y Precio */}
            <div className="section">
              <h3>Información de finalización</h3>
              <div className="form-group-pair">
                <div className="form-group">
                  <label htmlFor="horas">Horas dedicadas *</label>
                  <Input
                    id="horas"
                    type="number"
                    placeholder="Ej: 8"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    min="0"
                    step="0.5"
                    className="border-gray-300"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="precioHora">Precio por hora *</label>
                  <Input
                    id="precioHora"
                    type="number"
                    placeholder="Ej: 15000"
                    value={precioHora}
                    onChange={(e) => setPrecioHora(e.target.value)}
                    min="0"
                    step="0.01"
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Observación */}
            <div className="section">
              <h3>Observación</h3>
              <div className="form-group full-width">
                <Textarea
                  placeholder="Observaciones adicionales..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  className="border-gray-300"
                />
              </div>
            </div>

            {/* Evidencia */}
            <div className="section">
              <h3>Evidencia</h3>
              <div className="form-group full-width">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
                  className="border-gray-300"
                />
              </div>
            </div>

            {/* Botón */}
            <div className="button-container">
              <Button type="button" className="save-button" onClick={handleSave}>
                Finalizar Actividad
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
};

export default FinalizeActivityModal;