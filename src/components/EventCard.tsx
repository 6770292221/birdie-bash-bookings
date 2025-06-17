
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, Player } from '@/pages/Index';

interface EventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
  onCancelRegistration: (eventId: string, playerId: string, isEventDay: boolean) => void;
}

const EventCard = ({ event, onSelectEvent, onCancelRegistration }: EventCardProps) => {
  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const waitlistPlayers = event.players.filter(p => p.status === 'waitlist');
  const totalHours = event.courts.reduce((sum, court) => {
    const start = new Date(`2000-01-01T${court.startTime}`);
    const end = new Date(`2000-01-01T${court.endTime}`);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-blue-900">{event.eventName}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.eventDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800"
          >
            {event.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{event.venue}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-600" />
            <span>{registeredPlayers.length}/{event.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-green-600" />
            <span>{event.courts.length} courts</span>
          </div>
        </div>

        {waitlistPlayers.length > 0 && (
          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800">
              {waitlistPlayers.length} player(s) on waitlist
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Courts & Times:</h4>
          <div className="space-y-1">
            {event.courts.map((court, index) => (
              <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                <span>Court {court.courtNumber}</span>
                <span>{court.startTime} - {court.endTime}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-2 rounded">
          <span>Est. Cost/Player:</span>
          <span className="font-medium">
            ฿{Math.round(((totalHours * event.courtHourlyRate) / Math.max(registeredPlayers.length, 1)) + event.shuttlecockPrice)}
          </span>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          <h4 className="font-medium text-gray-700">Registered Players:</h4>
          {registeredPlayers.length > 0 ? (
            <div className="space-y-1">
              {registeredPlayers.map((player) => (
                <div key={player.id} className="flex justify-between items-center text-xs bg-green-50 p-2 rounded">
                  <span>{player.name}</span>
                  <span className="text-gray-500">Until {player.endTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No players registered yet</p>
          )}
        </div>

        <Button
          onClick={() => onSelectEvent(event)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Manage Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
