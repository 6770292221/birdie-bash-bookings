
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, Player } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface PlayerRegistrationProps {
  event: Event;
  onRegister: (eventId: string, playerData: Omit<Player, 'id' | 'registrationTime' | 'status'>) => void;
  onCancelRegistration: (eventId: string, playerId: string, isEventDay: boolean) => void;
}

const PlayerRegistration = ({ event, onRegister, onCancelRegistration }: PlayerRegistrationProps) => {
  const [showForm, setShowForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [endTime, setEndTime] = useState('');
  const { toast } = useToast();

  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const waitlistPlayers = event.players.filter(p => p.status === 'waitlist');
  const isFull = registeredPlayers.length >= event.maxPlayers;

  // Check if it's event day
  const isEventDay = new Date().toDateString() === new Date(event.eventDate).toDateString();

  // Get available end times based on court schedules
  const getAvailableEndTimes = () => {
    const times: string[] = [];
    event.courts.forEach(court => {
      const start = new Date(`2000-01-01T${court.startTime}`);
      const end = new Date(`2000-01-01T${court.endTime}`);
      
      // Generate 30-minute intervals from start to end
      for (let time = new Date(start.getTime() + 30 * 60000); time <= end; time.setMinutes(time.getMinutes() + 30)) {
        const timeString = time.toTimeString().slice(0, 5);
        if (!times.includes(timeString)) {
          times.push(timeString);
        }
      }
    });
    return times.sort();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(event.id, {
      name: playerName,
      email: '', // No longer required
      endTime,
    });
    setPlayerName('');
    setEndTime('');
    setShowForm(false);
    
    toast({
      title: "Registration Successful",
      description: isFull ? "You've been added to the waitlist" : "You've been registered for the event",
    });
  };

  const handleCancelRegistration = (playerId: string, playerName: string) => {
    onCancelRegistration(event.id, playerId, isEventDay);
    
    toast({
      title: "Registration Cancelled",
      description: isEventDay 
        ? `${playerName}'s registration cancelled. 100 THB fine applied for same-day cancellation.`
        : `${playerName}'s registration cancelled successfully.`,
      variant: isEventDay ? "destructive" : "default",
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-green-900">{event.eventName}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.eventDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={isFull ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
          >
            {isFull ? 'Full' : 'Available'}
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
            <Users className="w-4 h-4 mr-2 text-green-600" />
            <span>{registeredPlayers.length}/{event.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-600" />
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
          <h4 className="font-medium text-gray-700">Playing Times:</h4>
          <div className="space-y-1">
            {event.courts.map((court, index) => (
              <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                <span>Court {court.courtNumber}</span>
                <span>{court.startTime} - {court.endTime}</span>
              </div>
            ))}
          </div>
        </div>

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {isFull ? 'Join Waitlist' : 'Register to Play'}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-gray-700">Your Name</Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-gray-700">Play Until</Label>
              <Select value={endTime} onValueChange={setEndTime} required>
                <SelectTrigger className="border-green-200 focus:border-green-500">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEndTimes().map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {isFull ? 'Join Waitlist' : 'Register'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 border-gray-300"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {registeredPlayers.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <h4 className="font-medium text-gray-700 text-sm">Registered Players:</h4>
            <div className="space-y-1">
              {registeredPlayers.map((player) => (
                <div key={player.id} className="flex justify-between items-center text-xs bg-green-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-gray-500 ml-2">Until {player.endTime}</span>
                  </div>
                  <Button
                    onClick={() => handleCancelRegistration(player.id, player.name)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {waitlistPlayers.length > 0 && (
          <div className="space-y-2 max-h-24 overflow-y-auto">
            <h4 className="font-medium text-gray-700 text-sm">Waitlist:</h4>
            <div className="space-y-1">
              {waitlistPlayers.map((player) => (
                <div key={player.id} className="flex justify-between items-center text-xs bg-yellow-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-gray-500 ml-2">Until {player.endTime}</span>
                  </div>
                  <Button
                    onClick={() => handleCancelRegistration(player.id, player.name)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerRegistration;
