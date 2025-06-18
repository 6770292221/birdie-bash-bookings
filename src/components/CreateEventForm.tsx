import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, MapPin } from 'lucide-react';
import { Court, Event } from '@/pages/Index';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateEventFormProps {
  onSubmit: (eventData: Omit<Event, 'id' | 'players' | 'status' | 'createdBy'>) => void;
  onCancel: () => void;
}

const CreateEventForm = ({ onSubmit, onCancel }: CreateEventFormProps) => {
  const { t } = useLanguage();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(12);
  const [shuttlecockPrice, setShuttlecockPrice] = useState(20);
  const [courtHourlyRate, setCourtHourlyRate] = useState(150);
  const [courts, setCourts] = useState<Court[]>([
    { courtNumber: 1, startTime: '20:00', endTime: '22:00' }
  ]);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const calculateTotalCourtsHours = () => {
    return courts.reduce((total, court) => {
      const start = new Date(`2000-01-01T${court.startTime}`);
      const end = new Date(`2000-01-01T${court.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + Math.max(0, hours);
    }, 0);
  };

  const addCourt = () => {
    const newCourtNumber = Math.max(...courts.map(c => c.courtNumber), 0) + 1;
    setCourts([...courts, { 
      courtNumber: newCourtNumber, 
      startTime: '20:00', 
      endTime: '22:00' 
    }]);
  };

  const removeCourt = (index: number) => {
    if (courts.length > 1) {
      setCourts(courts.filter((_, i) => i !== index));
    }
  };

  const updateCourt = (index: number, field: keyof Court, value: string | number) => {
    const updatedCourts = courts.map((court, i) => 
      i === index ? { ...court, [field]: value } : court
    );
    setCourts(updatedCourts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      eventName,
      eventDate,
      venue,
      maxPlayers,
      shuttlecockPrice,
      courtHourlyRate,
      courts,
    });
  };

  const totalHours = calculateTotalCourtsHours();
  const estimatedCost = totalHours * courtHourlyRate;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-900">{t('events.create')}</CardTitle>
        <CardDescription>{t('app.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-gray-700 font-medium">{t('form.event_name')}</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Weekly Badminton Session"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-gray-700 font-medium">{t('form.event_date')}</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={today}
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-gray-700 font-medium">{t('form.venue')}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue address or name"
                required
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pricing and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-gray-700 font-medium">{t('form.max_players')}</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min="2"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shuttlecockPrice" className="text-gray-700 font-medium">{t('form.shuttlecock_price')}</Label>
              <Input
                id="shuttlecockPrice"
                type="number"
                value={shuttlecockPrice}
                onChange={(e) => setShuttlecockPrice(Number(e.target.value))}
                min="0"
                step="0.01"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courtHourlyRate" className="text-gray-700 font-medium">{t('form.court_rate')}</Label>
              <Input
                id="courtHourlyRate"
                type="number"
                value={courtHourlyRate}
                onChange={(e) => setCourtHourlyRate(Number(e.target.value))}
                min="0"
                step="0.01"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Courts */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-700 font-medium text-lg">{t('form.courts')}</Label>
              <Button
                type="button"
                onClick={addCourt}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('form.add_court')}
              </Button>
            </div>

            {courts.map((court, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-gray-600">{t('form.court_number')}</Label>
                    <Input
                      type="number"
                      value={court.courtNumber}
                      onChange={(e) => updateCourt(index, 'courtNumber', Number(e.target.value))}
                      min="1"
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">{t('form.start_time')}</Label>
                    <Input
                      type="time"
                      value={court.startTime}
                      onChange={(e) => updateCourt(index, 'startTime', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">{t('form.end_time')}</Label>
                    <Input
                      type="time"
                      value={court.endTime}
                      onChange={(e) => updateCourt(index, 'endTime', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="flex justify-end">
                    {courts.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCourt(index)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Cost Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Cost Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Court Hours:</span>
                  <span className="font-medium">{totalHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Court Cost:</span>
                  <span className="font-medium">฿{estimatedCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cost per player ({maxPlayers} players):</span>
                  <span>฿{(estimatedCost / maxPlayers).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('form.create_event')}
            </Button>
            <Button 
              type="button" 
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-300"
            >
              {t('form.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEventForm;
