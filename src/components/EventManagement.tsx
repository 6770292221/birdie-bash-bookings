import { useState } from 'react';
import { Calculator, Clock, DollarSign, Edit2, Save, X, Plus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Event, Court, Player } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface EventManagementProps {
  event: Event;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onClose: () => void;
}

interface CostBreakdown {
  name: string;
  playerId: string;
  startTime: string;
  endTime: string;
  courtFee: number;
  shuttlecockFee: number;
  fine: number;
  total: number;
  hourlyBreakdown?: { hour: string; cost: number }[];
}

const EventManagement = ({ event, onUpdateEvent, onClose }: EventManagementProps) => {
  const [actualCourts, setActualCourts] = useState<Court[]>(event.courts);
  const [shuttlecocksUsed, setShuttlecocksUsed] = useState(event.shuttlecocksUsed || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [isEditingCostPlayers, setIsEditingCostPlayers] = useState(false);
  const [editingPlayers, setEditingPlayers] = useState<Player[]>(event.players);
  const [absentPlayers, setAbsentPlayers] = useState<Set<string>>(new Set());
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const { toast } = useToast();

  const registeredPlayers = editingPlayers.filter(p => p.status === 'registered');
  const cancelledOnEventDay = editingPlayers.filter(p => p.status === 'cancelled' && p.cancelledOnEventDay);

  // Get available times based on court schedules (hourly intervals)
  const getAvailableTimes = () => {
    const times: string[] = [];
    const allStartTimes: number[] = [];
    const allEndTimes: number[] = [];

    actualCourts.forEach(court => {
      const start = new Date(`2000-01-01T${court.startTime}`).getTime();
      const end = new Date(`2000-01-01T${court.endTime}`).getTime();
      allStartTimes.push(start);
      allEndTimes.push(end);
    });

    const earliestStart = Math.min(...allStartTimes);
    const latestEnd = Math.max(...allEndTimes);

    // Generate hourly intervals from earliest start to latest end
    for (let time = earliestStart; time <= latestEnd; time += 60 * 60000) {
      const timeString = new Date(time).toTimeString().slice(0, 5);
      times.push(timeString);
    }

    return times;
  };

  const availableTimes = getAvailableTimes();

  // Get valid start times for a player (must be before their end time)
  const getValidStartTimes = (playerEndTime: string) => {
    const endTime = new Date(`2000-01-01T${playerEndTime}`).getTime();
    return availableTimes.filter(time => {
      const timeMs = new Date(`2000-01-01T${time}`).getTime();
      return timeMs < endTime;
    });
  };

  // Get valid end times for a player (must be after their start time)
  const getValidEndTimes = (playerStartTime: string) => {
    const startTime = new Date(`2000-01-01T${playerStartTime}`).getTime();
    return availableTimes.filter(time => {
      const timeMs = new Date(`2000-01-01T${time}`).getTime();
      return timeMs > startTime;
    });
  };

  const handleCourtTimeChange = (courtIndex: number, field: 'actualStartTime' | 'actualEndTime', value: string) => {
    const updatedCourts = [...actualCourts];
    updatedCourts[courtIndex] = {
      ...updatedCourts[courtIndex],
      [field]: value
    };
    setActualCourts(updatedCourts);
  };

  const handlePlayerChange = (playerId: string, field: 'name' | 'startTime' | 'endTime', value: string) => {
    const updatedPlayers = editingPlayers.map(player => {
      if (player.id === playerId) {
        const updatedPlayer = { ...player, [field]: value };
        
        // If changing start time, ensure end time is still valid
        if (field === 'startTime') {
          const startTime = new Date(`2000-01-01T${value}`).getTime();
          const endTime = new Date(`2000-01-01T${player.endTime}`).getTime();
          
          if (startTime >= endTime) {
            // Find the next available end time after the new start time
            const validEndTimes = getValidEndTimes(value);
            if (validEndTimes.length > 0) {
              updatedPlayer.endTime = validEndTimes[0];
            }
          }
        }
        
        // If changing end time, ensure start time is still valid
        if (field === 'endTime') {
          const playerStartTime = player.startTime || '20:00';
          const startTime = new Date(`2000-01-01T${playerStartTime}`).getTime();
          const endTime = new Date(`2000-01-01T${value}`).getTime();
          
          if (startTime >= endTime) {
            // Find the latest available start time before the new end time
            const validStartTimes = getValidStartTimes(value);
            if (validStartTimes.length > 0) {
              updatedPlayer.startTime = validStartTimes[validStartTimes.length - 1];
            }
          }
        }
        
        return updatedPlayer;
      }
      return player;
    });
    setEditingPlayers(updatedPlayers);
  };

  const handleAbsentToggle = (playerId: string, isAbsent: boolean) => {
    const newAbsentPlayers = new Set(absentPlayers);
    if (isAbsent) {
      newAbsentPlayers.add(playerId);
    } else {
      newAbsentPlayers.delete(playerId);
    }
    setAbsentPlayers(newAbsentPlayers);
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

  const handleCostPlayerTimeChange = (playerId: string, field: 'startTime' | 'endTime', value: string) => {
    const updatedBreakdown = costBreakdown.map(item => 
      item.playerId === playerId ? { ...item, [field]: value } : item
    );
    setCostBreakdown(updatedBreakdown);
  };

  const calculateCosts = () => {
    // Use the current registered players from editingPlayers
    const currentRegisteredPlayers = editingPlayers.filter(p => p.status === 'registered');
    const currentCancelledOnEventDay = editingPlayers.filter(p => p.status === 'cancelled' && p.cancelledOnEventDay);

    // Get event start time from the earliest court start
    const eventStartTime = Math.min(...actualCourts.map(court => {
      const startTime = court.actualStartTime || court.startTime;
      return new Date(`2000-01-01T${startTime}`).getTime();
    }));

    // Get event end time from the latest court end
    const eventEndTime = Math.max(...actualCourts.map(court => {
      const endTime = court.actualEndTime || court.endTime;
      return new Date(`2000-01-01T${endTime}`).getTime();
    }));

    // Calculate shuttlecock cost per player
    const shuttlecockCost = shuttlecocksUsed * event.shuttlecockPrice;
    const shuttlecockCostPerPlayer = currentRegisteredPlayers.length > 0 ? shuttlecockCost / currentRegisteredPlayers.length : 0;

    // Calculate late cancel and absent fines
    const totalFine = currentCancelledOnEventDay.length * 100 + absentPlayers.size * 100;
    const finePerPlayer = currentRegisteredPlayers.length > 0 ? totalFine / currentRegisteredPlayers.length : 0;

    // Calculate individual costs for each player
    const breakdown: CostBreakdown[] = currentRegisteredPlayers.map(player => {
      const playerStartTime = new Date(`2000-01-01T${player.startTime || '20:00'}`).getTime();
      const playerEndTime = new Date(`2000-01-01T${player.endTime}`).getTime();
      let courtFee = 0;
      const hourlyBreakdown: { hour: string; cost: number }[] = [];

      // Calculate cost for each hour the player participates
      for (let time = Math.max(eventStartTime, playerStartTime); time < Math.min(eventEndTime, playerEndTime); time += 60 * 60000) {
        const hourStart = new Date(time).toTimeString().slice(0, 5);
        const hourEnd = new Date(time + 60 * 60000).toTimeString().slice(0, 5);
        
        // Count how many players are playing in this hour
        const playersInThisHour = currentRegisteredPlayers.filter(p => {
          const pStartTime = new Date(`2000-01-01T${p.startTime || '20:00'}`).getTime();
          const pEndTime = new Date(`2000-01-01T${p.endTime}`).getTime();
          return pStartTime <= time && pEndTime > time;
        }).length;

        if (playersInThisHour > 0) {
          const hourCost = event.courtHourlyRate / playersInThisHour;
          courtFee += hourCost;
          hourlyBreakdown.push({
            hour: `${hourStart} - ${hourEnd}`,
            cost: hourCost
          });
        }
      }

      const shuttlecockFee = Math.round(shuttlecockCostPerPlayer * 100) / 100;
      const fine = Math.round(finePerPlayer * 100) / 100;
      const total = Math.round((courtFee + shuttlecockFee + fine) * 100) / 100;
      
      return {
        name: player.name,
        playerId: player.id,
        startTime: player.startTime || '20:00',
        endTime: player.endTime,
        courtFee: Math.round(courtFee * 100) / 100,
        shuttlecockFee,
        fine,
        total,
        hourlyBreakdown
      };
    });

    setCostBreakdown(breakdown);
    
    toast({
      title: "Cost Calculation Complete",
      description: `Total cost: ฿${breakdown.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`,
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

  const handleSavePlayerChanges = () => {
    onUpdateEvent(event.id, {
      players: editingPlayers
    });
    setIsEditingPlayers(false);
    
    toast({
      title: "Players Updated",
      description: "Player information saved successfully",
    });
  };

  const handleSaveCostPlayerTimes = () => {
    // Update the actual players with the new times from cost breakdown
    const updatedPlayers = editingPlayers.map(player => {
      const costPlayer = costBreakdown.find(cp => cp.playerId === player.id);
      if (costPlayer && player.status === 'registered') {
        return {
          ...player,
          startTime: costPlayer.startTime,
          endTime: costPlayer.endTime
        };
      }
      return player;
    });

    onUpdateEvent(event.id, {
      players: updatedPlayers
    });
    setEditingPlayers(updatedPlayers);
    setIsEditingCostPlayers(false);
    
    // Recalculate costs with updated times
    calculateCosts();
    
    toast({
      title: "Player Times Updated",
      description: "Player start and end times updated successfully",
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
                <div className="flex gap-2">
                  {!isEditingPlayers && (
                    <Button onClick={() => setIsEditingPlayers(true)} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Players
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Registered Players ({registeredPlayers.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {registeredPlayers.map(player => (
                      <div key={player.id} className="bg-green-50 p-2 rounded">
                        {isEditingPlayers ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                id={`absent-${player.id}`}
                                checked={absentPlayers.has(player.id)}
                                onCheckedChange={(checked) => handleAbsentToggle(player.id, !!checked)}
                              />
                              <Label htmlFor={`absent-${player.id}`} className="text-xs text-red-600">
                                Mark as absent (100 THB fine)
                              </Label>
                            </div>
                            <div>
                              <Label className="text-xs">Player Name</Label>
                              <Input
                                value={player.name}
                                onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Start Time</Label>
                                <Select 
                                  value={player.startTime || '20:00'} 
                                  onValueChange={(value) => handlePlayerChange(player.id, 'startTime', value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border shadow-lg z-[60]">
                                    {getValidStartTimes(player.endTime).map(time => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">End Time</Label>
                                <Select 
                                  value={player.endTime} 
                                  onValueChange={(value) => handlePlayerChange(player.id, 'endTime', value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border shadow-lg z-[60]">
                                    {getValidEndTimes(player.startTime || '20:00').map(time => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span>{player.name}</span>
                              {absentPlayers.has(player.id) && (
                                <Badge variant="destructive" className="text-xs">
                                  <UserX className="w-3 h-3 mr-1" />
                                  Absent
                                </Badge>
                              )}
                            </div>
                            <span>{player.startTime || '20:00'} - {player.endTime}</span>
                          </div>
                        )}
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

                {absentPlayers.size > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Absent Players ({absentPlayers.size})</h4>
                    <div className="space-y-1">
                      {Array.from(absentPlayers).map(playerId => {
                        const player = registeredPlayers.find(p => p.id === playerId);
                        return player ? (
                          <div key={playerId} className="flex justify-between text-sm bg-red-50 p-2 rounded">
                            <span>{player.name}</span>
                            <Badge variant="destructive" className="text-xs">100 THB Fine</Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {isEditingPlayers && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button onClick={handleSavePlayerChanges} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Players
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingPlayers(false);
                        setEditingPlayers(event.players);
                        setAbsentPlayers(new Set());
                      }} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
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
              <div className="flex gap-2">
                <Button onClick={calculateCosts} className="bg-blue-600 hover:bg-blue-700">
                  Calculate Costs
                </Button>
                {costBreakdown.length > 0 && !isEditingCostPlayers && (
                  <Button onClick={() => setIsEditingCostPlayers(true)} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Times
                  </Button>
                )}
                {isEditingCostPlayers && (
                  <Button onClick={handleSaveCostPlayerTimes} variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Times
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {costBreakdown.length > 0 && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Player</th>
                          <th className="text-center p-2">Start Time</th>
                          <th className="text-center p-2">End Time</th>
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
                            <td className="text-center p-2">
                              {isEditingCostPlayers ? (
                                <Select
                                  value={item.startTime}
                                  onValueChange={(value) => handleCostPlayerTimeChange(item.playerId, 'startTime', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border shadow-lg z-[60]">
                                    {availableTimes.map(time => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                item.startTime
                              )}
                            </td>
                            <td className="text-center p-2">
                              {isEditingCostPlayers ? (
                                <Select
                                  value={item.endTime}
                                  onValueChange={(value) => handleCostPlayerTimeChange(item.playerId, 'endTime', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border shadow-lg z-[60]">
                                    {availableTimes.map(time => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                item.endTime
                              )}
                            </td>
                            <td className="text-right p-2">฿{item.courtFee}</td>
                            <td className="text-right p-2">฿{item.shuttlecockFee}</td>
                            <td className="text-right p-2">฿{item.fine}</td>
                            <td className="text-right p-2 font-bold">฿{item.total}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-400 font-bold">
                          <td className="p-2" colSpan={3}>Total</td>
                          <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.courtFee, 0).toFixed(2)}</td>
                          <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.shuttlecockFee, 0).toFixed(2)}</td>
                          <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.fine, 0).toFixed(2)}</td>
                          <td className="text-right p-2">฿{costBreakdown.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {isEditingCostPlayers && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button onClick={handleSaveCostPlayerTimes} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save Time Changes
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingCostPlayers(false);
                          calculateCosts(); // Recalculate to reset any unsaved changes
                        }} 
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {costBreakdown.some(item => item.hourlyBreakdown && item.hourlyBreakdown.length > 0) && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Hourly Breakdown:</h4>
                      {costBreakdown.map((item, playerIndex) => (
                        item.hourlyBreakdown && item.hourlyBreakdown.length > 0 && (
                          <div key={playerIndex} className="mb-3 p-3 border border-gray-200 rounded">
                            <h5 className="font-medium text-sm mb-2">{item.name} ({item.startTime} - {item.endTime})</h5>
                            <div className="space-y-1">
                              {item.hourlyBreakdown.map((hour, hourIndex) => (
                                <div key={hourIndex} className="flex justify-between text-xs">
                                  <span>{hour.hour}</span>
                                  <span>฿{hour.cost.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
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
