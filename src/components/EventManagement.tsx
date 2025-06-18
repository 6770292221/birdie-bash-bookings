
import { useState } from 'react';
import { Calculator, Clock, DollarSign, Edit2, Save, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, Court } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface EventManagementProps {
  event: Event;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onClose: () => void;
}

interface CostBreakdown {
  name: string;
  playerId: string;
  courtFee: number;
  shuttlecockFee: number;
  fine: number;
  total: number;
}

const EventManagement = ({ event, onUpdateEvent, onClose }: EventManagementProps) => {
  const [actualCourts, setActualCourts] = useState<Court[]>(event.courts);
  const [shuttlecocksUsed, setShuttlecocksUsed] = useState(event.shuttlecocksUsed || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const { toast } = useToast();

  const registeredPlayers = event.players.filter(p => p.status === 'registered');
  const cancelledOnEventDay = event.players.filter(p => p.status === 'cancelled' && p.cancelledOnEventDay);

  const handleCourtTimeChange = (courtIndex: number, field: 'actualStartTime' | 'actualEndTime', value: string) => {
    const updatedCourts = [...actualCourts];
    updatedCourts[courtIndex] = {
      ...updatedCourts[courtIndex],
      [field]: value
    };
    setActualCourts(updatedCourts);
  };

  const addNewCourt = () => {
    const newCourtNumber = Math.max(...actualCourts.map(c => c.courtNumber)) + 1;
    const newCourt: Court = {
      courtNumber: newCourtNumber,
      startTime: '20:00',
      endTime: '22:00',
      actualStartTime: '20:00',
      actualEndTime: '22:00'
    };
    setActualCourts([...actualCourts, newCourt]);
  };

  const removeCourt = (courtIndex: number) => {
    if (actualCourts.length > 1) {
      const updatedCourts = actualCourts.filter((_, index) => index !== courtIndex);
      setActualCourts(updatedCourts);
    }
  };

  const calculateCosts = () => {
    // Calculate total court cost based on actual usage
    const courtCostTotal = actualCourts.reduce((sum, court) => {
      const startTime = court.actualStartTime || court.startTime;
      const endTime = court.actualEndTime || court.endTime;
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + (hours * event.courtHourlyRate);
    }, 0);

    // Calculate total player hours
    const eventStartTime = Math.min(...actualCourts.map(court => {
      const startTime = court.actualStartTime || court.startTime;
      return new Date(`2000-01-01T${startTime}`).getTime();
    }));

    const totalPlayerHours = registeredPlayers.reduce((sum, player) => {
      const playerEndTime = new Date(`2000-01-01T${player.endTime}`).getTime();
      const playerHours = (playerEndTime - eventStartTime) / (1000 * 60 * 60);
      return sum + Math.max(0, playerHours);
    }, 0);

    // Calculate shuttlecock cost
    const shuttlecockCost = shuttlecocksUsed * event.shuttlecockPrice;
    const shuttlecockCostPerPlayer = shuttlecockCost / registeredPlayers.length;

    // Calculate late cancel fine total
    const totalFine = cancelledOnEventDay.length * 100;
    const finePerPlayer = totalFine / registeredPlayers.length;

    // Calculate individual costs
    const breakdown: CostBreakdown[] = registeredPlayers.map(player => {
      const playerEndTime = new Date(`2000-01-01T${player.endTime}`).getTime();
      const playerHours = Math.max(0, (playerEndTime - eventStartTime) / (1000 * 60 * 60));
      
      const individualCourtCost = totalPlayerHours > 0 
        ? (playerHours / totalPlayerHours) * courtCostTotal 
        : courtCostTotal / registeredPlayers.length;

      const courtFee = Math.round(individualCourtCost);
      const shuttlecockFee = Math.round(shuttlecockCostPerPlayer);
      const fine = Math.round(finePerPlayer);
      
      return {
        name: player.name,
        playerId: player.id,
        courtFee,
        shuttlecockFee,
        fine,
        total: courtFee + shuttlecockFee + fine
      };
    });

    setCostBreakdown(breakdown);
    
    toast({
      title: "Cost Calculation Complete",
      description: `Total cost: ฿${breakdown.reduce((sum, item) => sum + item.total, 0)}`,
    });
  };

  const handleSaveActualUsage = () => {
    onUpdateEvent(event.id, {
      courts: actualCourts,
      shuttlecocksUsed: shuttlecocksUsed,
      status: 'completed' as const
    });
    setIsEditing(false);
    
    toast({
      title: "Event Updated",
      description: "Actual court usage and shuttlecock count saved successfully",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.eventName}</h2>
              <p className="text-gray-600">Event Management & Cost Calculation</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actual Court Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Actual Court Usage
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {isEditing && (
                    <Button onClick={addNewCourt} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Court
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {actualCourts.map((court, index) => (
                  <div key={index} className="border border-gray-200 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Court {court.courtNumber}</h4>
                      {isEditing && actualCourts.length > 1 && (
                        <Button 
                          onClick={() => removeCourt(index)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Reserved: {court.startTime} - {court.endTime}
                    </div>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Actual Start</Label>
                          <Input
                            type="time"
                            value={court.actualStartTime || court.startTime}
                            onChange={(e) => handleCourtTimeChange(index, 'actualStartTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Actual End</Label>
                          <Input
                            type="time"
                            value={court.actualEndTime || court.endTime}
                            onChange={(e) => handleCourtTimeChange(index, 'actualEndTime', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium">
                        Actual: {court.actualStartTime || court.startTime} - {court.actualEndTime || court.endTime}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t pt-4">
                  <Label>Shuttlecocks Used</Label>
                  <Input
                    type="number"
                    value={shuttlecocksUsed}
                    onChange={(e) => setShuttlecocksUsed(Number(e.target.value))}
                    min="0"
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveActualUsage} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Players & Cancellations */}
            <Card>
              <CardHeader>
                <CardTitle>Players & Cancellations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Registered Players ({registeredPlayers.length})</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {registeredPlayers.map(player => (
                      <div key={player.id} className="flex justify-between text-sm bg-green-50 p-2 rounded">
                        <span>{player.name}</span>
                        <span>Until {player.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {cancelledOnEventDay.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Same-Day Cancellations ({cancelledOnEventDay.length})</h4>
                    <div className="space-y-1">
                      {cancelledOnEventDay.map(player => (
                        <div key={player.id} className="flex justify-between text-sm bg-red-50 p-2 rounded">
                          <span>{player.name}</span>
                          <Badge variant="destructive" className="text-xs">100 THB Fine</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost Calculation */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Cost Calculation
              </CardTitle>
              <Button onClick={calculateCosts} className="bg-blue-600 hover:bg-blue-700">
                Calculate Costs
              </Button>
            </CardHeader>
            <CardContent>
              {costBreakdown.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Player</th>
                        <th className="text-right p-2">Court Fee</th>
                        <th className="text-right p-2">Shuttlecock</th>
                        <th className="text-right p-2">Fine</th>
                        <th className="text-right p-2 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBreakdown.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="text-right p-2">฿{item.courtFee}</td>
                          <td className="text-right p-2">฿{item.shuttlecockFee}</td>
                          <td className="text-right p-2">฿{item.fine}</td>
                          <td className="text-right p-2 font-bold">฿{item.total}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-400 font-bold">
                        <td className="p-2">Total</td>
                        <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.courtFee, 0)}</td>
                        <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.shuttlecockFee, 0)}</td>
                        <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.fine, 0)}</td>
                        <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.total, 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
