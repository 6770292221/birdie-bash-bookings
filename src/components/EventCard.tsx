import { Calendar, MapPin, Users, Clock, Calculator, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/pages/Index';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onCancelRegistration: (eventId: string, playerId: string, isEventDay: boolean) => void;
}

const EventCard = ({ event, onSelectEvent, onEditEvent }: EventCardProps) => {
  const { t } = useLanguage();
  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const waitlistPlayers = event.players.filter(p => p.status === 'waitlist');
  const isFull = registeredPlayers.length >= event.maxPlayers;
  const hasRegisteredPlayers = registeredPlayers.length > 0;

  // Calculate total court hours for cost estimation
  const totalHours = event.courts.reduce((sum, court) => {
    const start = new Date(`2000-01-01T${court.startTime}`);
    const end = new Date(`2000-01-01T${court.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + Math.max(0, hours);
  }, 0);

  const estimatedCost = totalHours * event.courtHourlyRate;

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
          <div className="flex gap-2 items-center">
            <Badge 
              variant="secondary" 
              className={isFull ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
            >
              {isFull ? t('status.full') : t('status.available')}
            </Badge>
            {onEditEvent && (
              <Button
                onClick={() => onEditEvent(event)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{event.venue}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-green-600" />
            <span>{registeredPlayers.length}/{event.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-600" />
            <span>{totalHours}h • ฿{estimatedCost}</span>
          </div>
        </div>

        {waitlistPlayers.length > 0 && (
          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800">
              {waitlistPlayers.length} {t('status.waitlist')}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Courts:</h4>
          <div className="space-y-1">
            {event.courts.map((court, index) => (
              <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                <span>Court {court.courtNumber}</span>
                <span>{court.startTime} - {court.endTime}</span>
              </div>
            ))}
          </div>
        </div>

        {registeredPlayers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 text-sm">{t('players.registered')} ({registeredPlayers.length}):</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {registeredPlayers.map((player) => (
                <div key={player.id} className="text-xs bg-green-50 p-1 rounded">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-gray-500 ml-2">
                    {player.startTime || '20:00'} - {player.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onSelectEvent(event)}
          disabled={!hasRegisteredPlayers}
          className={`w-full ${hasRegisteredPlayers 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          size="sm"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {t('button.calculate_costs')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
