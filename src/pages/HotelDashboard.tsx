import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import FloorPlanEditor from '@/components/hotel/FloorPlanEditor';
import BookingsList from '@/components/hotel/BookingsList';
import RoomEditModal from '@/components/hotel/RoomEditModal';
import { useHotelFloors } from '@/hooks/useHotelFloors';
import { useRoomDrawing } from '@/hooks/useRoomDrawing';
import { useRoomEditing } from '@/hooks/useRoomEditing';
import { useHotelBookings } from '@/hooks/useHotelBookings';

const HotelDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    floors,
    setFloors,
    currentFloor,
    setCurrentFloor,
    loading,
    setLoading,
    loadFloors,
    handleNewFloorUpload,
    handleDeleteFloor,
    handleDuplicateFloor
  } = useHotelFloors(toast);

  const {
    isDrawing,
    setIsDrawing,
    drawMode,
    setDrawMode,
    polygonPoints,
    setPolygonPoints,
    newRoom,
    setNewRoom,
    areaStart,
    areaEnd,
    isDrawingArea,
    handleCanvasClick,
    handleFinishPolygon,
    handleCancelPolygon,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleCancelArea
  } = useRoomDrawing(floors, setFloors, currentFloor, setLoading, toast);

  const {
    selectedRoom,
    setSelectedRoom,
    editingRoomBorders,
    editPolygonPoints,
    handleRoomClick,
    handleStartEditBorders,
    handleSaveBorders,
    handleCancelEditBorders,
    handleEditPointDrag,
    handleAddEditPoint,
    handleDeleteEditPoint,
    handleUpdateRoom,
    handleDeleteRoom
  } = useRoomEditing(floors, setFloors, setLoading, toast);

  const { bookings, loadBookings } = useHotelBookings(toast);

  useEffect(() => {
    const isAuth = localStorage.getItem('hotel_admin_auth');
    if (!isAuth) {
      navigate('/hotel-admin');
      return;
    }

    loadFloors();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hotel_admin_auth');
    navigate('/hotel-admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon name="Hotel" size={32} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold">IVAN HOTEL</h1>
              <p className="text-sm text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выход
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="floors" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="floors">
              <Icon name="Building" size={16} className="mr-2" />
              Этажи
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Icon name="Calendar" size={16} className="mr-2" />
              Бронирования
            </TabsTrigger>
          </TabsList>

          <TabsContent value="floors">
            <FloorPlanEditor
              floors={floors}
              currentFloor={currentFloor}
              isDrawing={isDrawing}
              drawMode={drawMode}
              polygonPoints={polygonPoints}
              loading={loading}
              newRoom={newRoom}
              editingRoomBorders={editingRoomBorders}
              editPolygonPoints={editPolygonPoints}
              selectedRoomId={selectedRoom?.id}
              areaStart={areaStart}
              areaEnd={areaEnd}
              isDrawingArea={isDrawingArea}
              onFloorChange={setCurrentFloor}
              onNewFloorUpload={handleNewFloorUpload}
              onDeleteFloor={handleDeleteFloor}
              onDuplicateFloor={handleDuplicateFloor}
              onToggleDrawing={() => {
                setIsDrawing(!isDrawing);
                setPolygonPoints([]);
              }}
              onDrawModeChange={setDrawMode}
              onCanvasClick={handleCanvasClick}
              onFinishPolygon={handleFinishPolygon}
              onCancelPolygon={handleCancelPolygon}
              onRoomClick={handleRoomClick}
              onNewRoomChange={setNewRoom}
              onStartEditBorders={handleStartEditBorders}
              onSaveBorders={handleSaveBorders}
              onCancelEditBorders={handleCancelEditBorders}
              onEditPointDrag={handleEditPointDrag}
              onAddEditPoint={handleAddEditPoint}
              onDeleteEditPoint={handleDeleteEditPoint}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onCancelArea={handleCancelArea}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsList
              bookings={bookings}
              loading={loading}
              onRefresh={loadBookings}
            />
          </TabsContent>
        </Tabs>
      </div>

      <RoomEditModal
        selectedRoom={selectedRoom}
        loading={loading}
        onClose={() => setSelectedRoom(null)}
        onUpdate={handleUpdateRoom}
        onDelete={handleDeleteRoom}
        onChange={setSelectedRoom}
        onEditBorders={handleStartEditBorders}
      />
    </div>
  );
};

export default HotelDashboard;