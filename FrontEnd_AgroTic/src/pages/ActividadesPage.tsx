import React, { useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import ActividadModal from '../components/organisms/ActividadModal';
import ActivityListModal from '../components/organisms/ActivityListModal';
import ActivityDetailModal from '../components/organisms/ActivityDetailModal';
import {
   getActividadesByDateRange,
   getActividadesCountByDate,
   getActividadesByDateWithActive,
   createActividad,
   deleteActividad,
   createUsuarioXActividad,
   createReservationByProduct
 } from '../services/actividadesService';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'es': es,
  },
});

const ActividadesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activityCounts, setActivityCounts] = useState<{[key: string]: number}>({});

  const calendarRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    console.log('Events state updated:', events);
  }, [events]);



  const fetchEvents = async (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    try {
      console.log('Fetching activities for date range:', startStr, 'to', endStr);
      const activities = await getActividadesByDateRange(startStr, endStr);
      console.log('Fetched activities:', activities);
      const formattedEvents = activities.map((activity: any) => ({
        id: activity.id,
        title: activity.descripcion || 'Actividad',
        start: new Date(activity.fechaAsignacion),
        end: new Date(activity.fechaAsignacion),
        resource: activity,
      }));
      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);

      // Fetch activity counts for the month
      const daysInMonth = eachDayOfInterval({ start, end });
      const countsPromises = daysInMonth.map(async (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        try {
          const count = await getActividadesCountByDate(dateStr);
          return { dateStr, count };
        } catch {
          return { dateStr, count: 0 };
        }
      });
      const countsArray = await Promise.all(countsPromises);
      const countsObj = countsArray.reduce((acc, curr) => ({ ...acc, [curr.dateStr]: curr.count }), {});
      setActivityCounts(countsObj);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setActivityCounts({});
    }
  };

  return (
    <div ref={pageRef} className="flex flex-col gap-4 overflow-hidden" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 flex-shrink-0 pt-6">
        <h1 className="text-2xl font-bold text-left whitespace-nowrap">Gestión de Actividades</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Seleccionar Mes:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date || new Date())}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="border border-gray-300 rounded-lg p-2 text-sm w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div ref={calendarRef} className="bg-white p-4 rounded-lg shadow-md w-full overflow-hidden overflow-x-auto flex-1 md:min-w-[768px]">
        <Calendar
          localizer={localizer}
          culture="es"
          views={['month']}
          defaultView="month"
          date={selectedDate}
          onNavigate={(date) => setSelectedDate(date)}
          events={[]}
          components={{
            event: () => null,
            showMore: () => null,
            dateCellWrapper: ({ children, value }) => {
              const dateStr = format(value, 'yyyy-MM-dd');
              const count = activityCounts[dateStr] || 0;
              const today = new Date();
              const isToday = format(value, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              const isOffRange = value.getMonth() !== selectedDate.getMonth();
              return (
                <div
                  className={`relative h-full w-full border border-gray-300 ${isToday ? 'bg-green-100' : ''} ${isOffRange ? 'bg-gray-100 text-gray-400' : ''} cursor-pointer`}
                  style={{ minHeight: '80px' }}
                  onClick={async () => {
                    try {
                      const countClick = await getActividadesCountByDate(dateStr);
                      if (countClick > 0) {
                        const activitiesData = await getActividadesByDateWithActive(dateStr);
                        setActivities(activitiesData);
                        setIsListModalOpen(true);
                      } else {
                        setModalDate(value);
                        setIsModalOpen(true);
                      }
                    } catch (error) {
                      console.error('Error checking activities:', error);
                      setModalDate(value);
                      setIsModalOpen(true);
                    }
                  }}
                >
                  {children}
                  {count > 0 && (
                    <div className="absolute top-1 left-3 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </div>
                  )}
                </div>
              );
            }
          }}
          onSelectSlot={async (slotInfo) => {
            console.log('onSelectSlot triggered, page height before:', pageRef.current?.clientHeight, 'calendar height before:', calendarRef.current?.clientHeight);
            const dateStr = slotInfo.start.toISOString().split('T')[0];

            try {
              const count = await getActividadesCountByDate(dateStr);

              if (count > 0) {
                // Fetch activities and open list modal
                const activitiesData = await getActividadesByDateWithActive(dateStr);
                setActivities(activitiesData);
                console.log('After fetch, page height:', pageRef.current?.clientHeight, 'calendar height:', calendarRef.current?.clientHeight);
                setIsListModalOpen(true);
                console.log('After setIsListModalOpen, page height:', pageRef.current?.clientHeight, 'calendar height:', calendarRef.current?.clientHeight);
              } else {
                // Open create modal
                setModalDate(slotInfo.start);
                setIsModalOpen(true);
              }
            } catch (error) {
              console.error('Error checking activities:', error);
              // Fallback to create modal
              setModalDate(slotInfo.start);
              setIsModalOpen(true);
            }
          }}
          style={{ height: '600px' }}
          messages={{
            allDay: 'Todo el día',
            previous: 'Anterior',
            next: 'Siguiente',
            today: 'Hoy',
            month: 'Mes',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango.',
            showMore: (total: number) => `+ Ver ${total} más`,
          }}
        />
      </div>

      <ActividadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={modalDate}
        onSave={async (data) => {
          try {
            const actividadData = {
              descripcion: data.descripcion,
              fechaAsignacion: data.fecha,
              horasDedicadas: 8, // default
              observacion: data.descripcion,
              estado: true,
              fkCultivoVariedadZonaId: data.lote, // data.lote is cvz.id from search
              fkCategoriaActividadId: data.categoria,
            };

            const actividad = await createActividad(actividadData);

            // Save users
             for (const userId of data.usuarios) {
               await createUsuarioXActividad({ fkUsuarioId: userId, fkActividadId: actividad.id, fechaAsignacion: data.fecha });
             }

            // Save reservations
            console.log('Processing materials:', data.materiales);
            for (const mat of data.materiales) {
                 console.log('Processing material:', mat);
                 await createReservationByProduct(actividad.id, { productId: mat.id, cantidadReservada: mat.qty });
                 console.log('Reservation created for product:', mat.id);
               }

            alert('Actividad guardada exitosamente');

            // Refresh calendar data and close modal
            await fetchEvents(selectedDate);

            // If the activity was created for the same date as currently viewed activities, refresh the list
            const activityDateStr = format(data.fecha, 'yyyy-MM-dd');
            const modalDateStr = format(modalDate, 'yyyy-MM-dd');
            if (activityDateStr === modalDateStr && isListModalOpen) {
              const updatedActivities = await getActividadesByDateWithActive(activityDateStr);
              setActivities(updatedActivities);
            }

            setIsModalOpen(false);
          } catch (error) {
            console.error('Error saving actividad:', error);
            alert('Error al guardar la actividad');
          }
        }}
      />


      <ActivityListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        activities={activities}
        onSelectActivity={(activity) => {
          console.log('Opening detail modal, window.innerWidth:', window.innerWidth);
          console.log('Calendar container width:', calendarRef.current?.clientWidth);
          console.log('Calendar container height:', calendarRef.current?.clientHeight);
          setSelectedActivity(activity);
          setIsDetailModalOpen(true);
          setIsListModalOpen(false);
        }}
        onRegisterNew={() => {
          setModalDate(modalDate); // Keep the same date as the list
          setIsModalOpen(true);
          setIsListModalOpen(false);
        }}
      />

      
       
         <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        activity={selectedActivity}
        onDelete={async (id) => {
          try {
            await deleteActividad(id);
            alert('Actividad eliminada');
            setIsDetailModalOpen(false);
          } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
          }
        }}
      />
        
      

     


    </div>
  );
};

export default ActividadesPage;
