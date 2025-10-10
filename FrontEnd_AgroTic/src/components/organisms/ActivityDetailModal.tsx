import React, { useState, useEffect } from 'react';
  import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Textarea } from '@heroui/react';
  import { getReservationsByActivity, confirmUsage, finalizarActividad } from '../../services/actividadesService';

interface Reservation {
  id: string;
  cantidadReservada: number;
  cantidadUsada?: number;
  lote?: {
    nombre: string;
    producto: { nombre: string; unidadMedida?: { abreviatura: string } };
  };
  estado?: { nombre: string };
}

interface Activity {
   id: string;
   descripcion: string;
   categoriaActividad: { nombre: string };
   cultivoVariedadZona: {
     zona: { nombre: string };
     cultivoXVariedad: {
       cultivo: { nombre: string; ficha: { numero: string } };
       variedad: { nombre: string; tipoCultivo: { nombre: string } };
     };
   };
   usuariosAsignados?: { usuario: { dni: number; nombres: string; apellidos: string; ficha?: { numero: number } }; activo: boolean }[];
   inventarioUsado?: { inventario: { nombre: string; id: string; categoria: { nombre: string } }; cantidadUsada: number; activo: boolean }[];
   reservations?: Reservation[];
 }

interface ActivityDetailModalProps {
   isOpen: boolean;
   onClose: () => void;
   activity: Activity | null;
   onDelete: (id: string) => void;
 }

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
   isOpen,
   onClose,
   activity,
   onDelete,
 }) => {
  const [categoria, setCategoria] = useState('');
   const [ubicacion, setUbicacion] = useState('');
   const [descripcion, setDescripcion] = useState('');
   const [isEditing, setIsEditing] = useState(false);
   const [reservations, setReservations] = useState<Reservation[]>([]);
   const [isFinalizing, setIsFinalizing] = useState(false);
   const [horas, setHoras] = useState('');
   const [precioHora, setPrecioHora] = useState('');
   const [observacion, setObservacion] = useState('');
   const [evidencia, setEvidencia] = useState<File | null>(null);
   const [returns, setReturns] = useState<{ [key: string]: number }>({});

  useEffect(() => {
     if (activity) {
       console.log('ActivityDetailModal activity:', activity);
       setCategoria(activity.categoriaActividad.nombre);
       const tipoCultivoName = activity.cultivoVariedadZona?.cultivoXVariedad?.variedad?.tipoCultivo?.nombre || 'Tipo Cultivo';
       const variedadName = activity.cultivoVariedadZona?.cultivoXVariedad?.variedad?.nombre || 'Variedad';
       const zoneName = activity.cultivoVariedadZona?.zona?.nombre || 'Zona';
       setUbicacion(`${tipoCultivoName} - ${variedadName} - ${zoneName}`);
       setDescripcion(activity.descripcion);
       setIsFinalizing(false);
       setHoras('');
       setPrecioHora('');
       setObservacion('');
       setEvidencia(null);
       setReturns({});

       // Fetch reservations
       const fetchReservations = async () => {
         try {
           const res = await getReservationsByActivity(activity.id);
           setReservations(res);
         } catch (error) {
           console.error('Error fetching reservations:', error);
           setReservations([]);
         }
       };
       fetchReservations();
     }
   }, [activity]);


  const handleDelete = () => {
     if (activity && confirm('¿Estás seguro de eliminar esta actividad?')) {
       onDelete(activity.id);
       onClose();
     }
   };

   const handleFinalize = async () => {
     if (!activity) return;

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

     // Confirmation for returns
     const hasReturns = Object.values(returns).some(r => r > 0);
     if (hasReturns && !confirm('¿Confirmar devolución de herramientas?')) {
       return;
     }

     try {
       await finalizarActividad(activity.id, {
         horas: horasNum,
         precioHora: precioNum,
         observacion,
         imgUrl: evidencia || undefined,
       });
       alert('Actividad finalizada exitosamente');
       onClose();
     } catch (error) {
       console.error('Error finalizing activity:', error);
       alert('Error al finalizar la actividad');
     }
   };

  if (!activity) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-2xl font-semibold">Actividades</h2>
          <Button variant="light" onClick={onClose}>✕</Button>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Usuarios */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Usuarios Responsables</h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {activity.usuariosAsignados?.filter(u => u.activo).map((uxa, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    {uxa.usuario.dni} - {uxa.usuario.nombres} {uxa.usuario.apellidos}
                  </div>
                )) || <p className="text-gray-500">No hay aprendices</p>}
              </div>
            </div>

            {/* Reservas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Reservas de Insumos</h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {reservations.map((res, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    <div className="flex justify-between items-center">
                      <span>{res.lote?.producto?.nombre}</span>
                      <div className="text-sm">
                        <div>Reservado: {res.cantidadReservada} {res.lote?.producto?.unidadMedida?.abreviatura}</div>
                        <div>Usado: {res.cantidadUsada || 0} {res.lote?.producto?.unidadMedida?.abreviatura}</div>
                        <div>Estado: {res.estado?.nombre}</div>
                      </div>
                    </div>
                    {res.cantidadUsada === undefined && (
                      <Button
                        size="sm"
                        color="primary"
                        className="mt-2"
                        onClick={async () => {
                          const cantidad = prompt(`Confirmar uso para ${res.lote?.producto?.nombre} (Reservado: ${res.cantidadReservada}):`);
                          if (cantidad && !isNaN(Number(cantidad))) {
                            try {
                              await confirmUsage(res.id, { cantidadUsada: Number(cantidad) });
                              // Refresh reservations
                              const updatedRes = await getReservationsByActivity(activity.id);
                              setReservations(updatedRes);
                              alert('Uso confirmado');
                            } catch (error) {
                              console.error('Error confirming usage:', error);
                              alert('Error al confirmar uso');
                            }
                          }
                        }}
                      >
                        Confirmar Uso
                      </Button>
                    )}
                  </div>
                ))}
                {reservations.length === 0 && <p className="text-gray-500">No hay reservas</p>}
              </div>
            </div>

            {/* Fichas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Fichas</h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {(() => {
                  const fichas = activity.usuariosAsignados
                    ?.filter(u => u.activo)
                    .map(u => u.usuario.ficha)
                    .filter(f => f != null)
                    .map(f => f.numero)
                    .filter((numero, index, arr) => arr.indexOf(numero) === index); // unique
                  return fichas && fichas.length > 0
                    ? fichas.map((numero, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          {numero}
                        </div>
                      ))
                    : <p className="text-gray-500">no hay fichas involucradas</p>;
                })()}
              </div>
            </div>
          </div>

          {/* Form bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria de la actividad</label>
                <div className="p-2 border rounded">{categoria}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación del Cultivo</label>
                <div className="p-2 border rounded">{ubicacion}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <div className="p-2 border rounded min-h-[80px]">{descripcion}</div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancelar' : 'Actualizar'}
                </Button>
                <Button color="danger" onClick={handleDelete}>
                  Eliminar
                </Button>
                <Button color="success" onClick={() => setIsFinalizing(!isFinalizing)}>
                  {isFinalizing ? 'Cancelar Finalización' : 'Finalizar Actividad'}
                </Button>
              </div>
            </div>
          </div>

          {/* Finalization Section */}
          {isFinalizing && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Finalizar Actividad</h3>

              {/* Herramientas devueltas */}
              {activity.inventarioUsado && activity.inventarioUsado.filter(i => i.activo && i.inventario?.categoria?.nombre === 'Herramientas').length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Herramientas a devolver</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activity.inventarioUsado
                      .filter(i => i.activo && i.inventario?.categoria?.nombre === 'Herramientas')
                      .map((ixa) => (
                        <div key={ixa.inventario.id} className="flex flex-col">
                          <label className="text-sm font-medium mb-1">{ixa.inventario.nombre}:</label>
                          <Input
                            type="number"
                            value={returns[ixa.inventario.id]?.toString() || ''}
                            onChange={(e) => setReturns({ ...returns, [ixa.inventario.id]: Number(e.target.value) })}
                            min="0"
                            placeholder="Cantidad a devolver"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Horas y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horas dedicadas *</label>
                  <Input
                    type="number"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    min="0"
                    step="0.5"
                    placeholder="Ej: 8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio por hora *</label>
                  <Input
                    type="number"
                    value={precioHora}
                    onChange={(e) => setPrecioHora(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Ej: 15000"
                  />
                </div>
              </div>

              {/* Observación */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Observación</label>
                <Textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>

              {/* Evidencia */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Evidencia</label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
                />
              </div>

              {/* Finalize Button */}
              <div className="flex justify-end">
                <Button color="success" onClick={handleFinalize}>
                  Confirmar Finalización
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ActivityDetailModal;