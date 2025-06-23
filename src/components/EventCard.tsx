
import React from 'react';
import { Calendar, MapPin, Users, Clock, Settings, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/pages/Index';

interface EventCardProps {
  event: Event;
  onSelectEvent?: (event: Event) => void;
  onCancelRegistration?: (eventId: string, playerId: string, isEventDay: boolean) => void;
  showAdminFeatures?: boolean;
}

const EventCard = ({ event, onSelectEvent, onCancelRegistration, showAdminFeatures = false }: EventCardProps) => {
  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const waitlistPlayers = event.players.filter(p => p.status === 'waitlist');
  const cancelledPlayers = event.players.filter(p => p.status === 'cancelled');

  return (
    <Card className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{event.eventName}</CardTitle>
            <CardDescription className="flex items-center text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {event.eventDate}
            </CardDescription>
          </div>
          <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
            {event.status === 'upcoming' ? 'กำลังมา' : 'เสร็จสิ้น'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{event.venue}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {event.courts.map(court => `Court ${court.courtNumber}: ${court.startTime} - ${court.endTime}`).join(', ')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{registeredPlayers.length}/{event.maxPlayers} ลงทะเบียน</span>
          </div>
          {waitlistPlayers.length > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              รอ {waitlistPlayers.length} คน
            </Badge>
          )}
        </div>

        {/* Player List - Show different info based on user role */}
        <div className="space-y-2">
          <h4 className="font-medium text-green-700">ผู้เล่นที่ลงทะเบียน:</h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {registeredPlayers.map(player => (
              <div key={player.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{player.name}</span>
                {showAdminFeatures ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {player.startTime || '20:00'} - {player.endTime}
                    </span>
                    <Button
                      onClick={() => onCancelRegistration?.(event.id, player.id, true)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 p-1 h-auto"
                    >
                      <UserX className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    {player.startTime || '20:00'} - {player.endTime}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Management Button */}
        {showAdminFeatures && onSelectEvent && (
          <Button 
            onClick={() => onSelectEvent(event)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            จัดการอีเวนต์
          </Button>
        )}

        {/* Cost Summary for completed events */}
        {event.status === 'completed' && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div>ค่าคอร์ท: ฿{event.courtHourlyRate}/ชั่วโมง</div>
              <div>ลูกขนไก่ใช้: {event.shuttlecocksUsed || 0} ลูก</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
