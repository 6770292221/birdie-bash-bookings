
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, Player } from '@/pages/Index';

interface PlayerRegistrationProps {
  event: Event;
  onRegister: (eventId: string, playerData: Omit<Player, 'id' | 'registrationTime' | 'status'>) => void;
}

const PlayerRegistration = ({ event, onRegister }: PlayerRegistrationProps) => {
  const [showForm, setShowForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [endTime, setEndTime] = useState('');

  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const waitlistPlayers = event.players.filter(p => p.status === 'waitlist');
  const isFull = registeredPlayers.length >= event.maxPlayers;

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
      email: playerEmail,
      endTime,
    });
    setPlayerName('');
    setPlayerEmail('');
    setEndTime('');
    setShowForm(false);
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
              <Label htmlFor="playerEmail" className="text-gray-700">Email</Label>
              <Input
                id="playerEmail"
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                placeholder="Enter your email"
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
          <div className="space-y-2 max-h-24 overflow-y-auto">
            <h4 className="font-medium text-gray-700 text-sm">Registered:</h4>
            <div className="space-y-1">
              {registeredPlayers.slice(0, 3).map((player) => (
                <div key={player.id} className="flex justify-between items-center text-xs bg-green-50 p-1 rounded">
                  <span>{player.name}</span>
                  <span className="text-gray-500">Until {player.endTime}</span>
                </div>
              ))}
              {registeredPlayers.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{registeredPlayers.length - 3} more players
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerRegistration;
