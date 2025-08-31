import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, LogOut, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CreateEventForm from '@/components/CreateEventForm';
import EventCard from '@/components/EventCard';
import PlayerRegistration from '@/components/PlayerRegistration';
import EventManagement from '@/components/EventManagement';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AuthButtons from '@/components/AuthButtons';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface Court {
  id?: string;
  courtNumber: number;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  startTime?: string;
  endTime: string;
  registrationTime: Date;
  status: 'registered' | 'waitlist' | 'cancelled';
  cancelledOnEventDay?: boolean;
  userId?: string;
}

export interface Event {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  maxPlayers: number;
  shuttlecockPrice: number;
  courtHourlyRate: number;
  courts: Court[];
  players: Player[];
  shuttlecocksUsed?: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in_progress' | 'calculating' | 'awaiting_payment';
  createdBy: string;
}

const IndexContent = () => {
  const { t } = useLanguage();
  const { user, logout, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      eventName: 'ทัวร์นาเมนต์แบดมินตันประจำเดือน',
      eventDate: '2024-01-20',
      venue: 'สนามแบดมินตัน ABC',
      maxPlayers: 12,
      shuttlecockPrice: 20,
      courtHourlyRate: 150,
      shuttlecocksUsed: 8,
      status: 'upcoming',
      createdBy: 'bc235d14-40db-4bd7-82d6-edeb0a19c48e',
      courts: [
        {
          id: '1',
          courtNumber: 1,
          startTime: '09:00',
          endTime: '12:00',
          actualStartTime: '09:15',
          actualEndTime: '11:45'
        },
        {
          id: '2',
          courtNumber: 2,
          startTime: '09:00',
          endTime: '12:00'
        }
      ],
      players: [
        {
          id: '1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          startTime: '09:00',
          endTime: '12:00',
          registrationTime: new Date('2024-01-15T10:00:00'),
          status: 'registered',
          userId: 'bc235d14-40db-4bd7-82d6-edeb0a19c48e'
        },
        {
          id: '2',
          name: 'สมหญิง รักเกม',
          email: 'somying@example.com',
          startTime: '09:00',
          endTime: '12:00',
          registrationTime: new Date('2024-01-15T11:00:00'),
          status: 'registered'
        }
      ]
    },
    {
      id: '2',
      eventName: 'เทรนนิ่งแบดมินตันเข้มข้น',
      eventDate: '2024-01-10',
      venue: 'สนามแบดมินตัน XYZ',
      maxPlayers: 8,
      shuttlecockPrice: 25,
      courtHourlyRate: 200,
      shuttlecocksUsed: 12,
      status: 'completed',
      createdBy: 'bc235d14-40db-4bd7-82d6-edeb0a19c48e',
      courts: [
        {
          id: '3',
          courtNumber: 1,
          startTime: '18:00',
          endTime: '21:00',
          actualStartTime: '18:00',
          actualEndTime: '21:00'
        }
      ],
      players: [
        {
          id: '3',
          name: 'วิชัย ซ้อมหนัก',
          email: 'wichai@example.com',
          startTime: '18:00',
          endTime: '21:00',
          registrationTime: new Date('2024-01-08T10:00:00'),
          status: 'registered'
        }
      ]
    }
  ]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  if (loading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'players' | 'status' | 'createdBy'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events",
        variant: "destructive",
      });
      return;
    }

    const newEvent: Event = {
      ...eventData,
      id: String(events.length + 1),
      players: [],
      status: 'upcoming',
      createdBy: user.id,
    };

    setEvents([...events, newEvent]);
    setShowCreateForm(false);
    
    toast({
      title: "Success",
      description: "Event created successfully",
    });
  };

  const handlePlayerRegistration = (eventId: string, playerData: Omit<Player, 'id' | 'registrationTime' | 'status'>) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const isWaitlist = event.players.filter(p => p.status === 'registered').length >= event.maxPlayers;
    
    const newPlayer: Player = {
      ...playerData,
      id: String(Date.now()),
      registrationTime: new Date(),
      status: isWaitlist ? 'waitlist' : 'registered',
      userId: user?.id,
    };

    const updatedEvents = events.map(e => 
      e.id === eventId 
        ? { ...e, players: [...e.players, newPlayer] }
        : e
    );
    
    setEvents(updatedEvents);
    
    toast({
      title: "Registration Successful", 
      description: isWaitlist ? "You've been added to the waitlist" : "You've been registered for the event",
    });
  };

  const handleCancelRegistration = (eventId: string, playerId: string, isEventDay: boolean = false) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        const updatedPlayers = e.players.map(p => 
          p.id === playerId 
            ? { ...p, status: 'cancelled' as const, cancelledOnEventDay: isEventDay }
            : p
        );
        
        // If someone cancelled and there are waitlist players, move the first waitlist player to registered
        const waitlistPlayers = updatedPlayers.filter(p => p.status === 'waitlist');
        if (waitlistPlayers.length > 0) {
          const firstWaitlist = waitlistPlayers.find(p => p.status === 'waitlist');
          if (firstWaitlist) {
            firstWaitlist.status = 'registered';
          }
        }
        
        return { ...e, players: updatedPlayers };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    
    toast({
      title: "Registration Cancelled",
      description: isEventDay 
        ? "Registration cancelled. 100 THB fine applied for same-day cancellation."
        : "Registration cancelled successfully.",
      variant: isEventDay ? "destructive" : "default",
    });
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<Event>) => {
    const updatedEvents = events.map(e => 
      e.id === eventId 
        ? { ...e, ...updates }
        : e
    );
    
    setEvents(updatedEvents);
    
    toast({
      title: "Success",
      description: "Event updated successfully",
    });
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowManagement(true);
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Mobile Header */}
        <div className="mb-6">
          {/* Mobile Top Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
            </div>
            
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {t('app.title')}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {user ? (
                <Button onClick={logout} variant="outline" size="sm" className="p-2 sm:px-3">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">ออกจากระบบ</span>
                </Button>
              ) : (
                <AuthButtons />
              )}
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
              {isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </Badge>
              )}
              <span className="text-sm text-gray-600">สวัสดี, {user.name}</span>
            </div>
          )}

          {/* Subtitle */}
          <p className="text-center text-lg sm:text-xl text-gray-600 mb-6">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Admin Access Notice */}
        {!isAdmin && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">การจัดการอีเวนต์สำหรับแอดมินเท่านั้น</p>
                    <p className="text-sm text-amber-600">กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินเพื่อจัดการอีเวนต์</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/mock-accounts">
                    <Button size="sm" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                      ดูบัญชีทดสอบ
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/login">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                        เข้าสู่ระบบ
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              <p className="text-xs sm:text-sm text-gray-600">{t('events.upcoming')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {upcomingEvents.reduce((sum, event) => sum + event.players.filter(p => p.status === 'registered').length, 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t('events.total_players')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {upcomingEvents.reduce((sum, event) => sum + event.courts.length, 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t('events.courts_booked')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedEvents.length}</p>
              <p className="text-xs sm:text-sm text-gray-600">{t('events.completed')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tab Interface */}
        <Tabs defaultValue={isAdmin ? "management" : "upcoming"} className="space-y-4">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-3'} bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-lg border-0 h-12`}>
            {isAdmin ? (
              <>
                <TabsTrigger 
                  value="management" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  🎯 จัดการกิจกรรม
                </TabsTrigger>
                <TabsTrigger 
                  value="admin-history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  📊 ประวัติ
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  📅 อีเวนต์ที่กำลังจะมา
                </TabsTrigger>
                <TabsTrigger 
                  value="registration" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  ✏️ ลงทะเบียนผู้เล่น
                </TabsTrigger>
                <TabsTrigger 
                  value="user-history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  📋 ประวัติ
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Admin Management Tab */}
          <TabsContent value="management" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {t('events.management')}
              </h2>
              {isAdmin && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('events.create')}
                </Button>
              )}
            </div>

            {isAdmin && showCreateForm && (
              <CreateEventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelectEvent={isAdmin ? handleSelectEvent : undefined}
                  onCancelRegistration={isAdmin ? handleCancelRegistration : undefined}
                  showAdminFeatures={isAdmin}
                />
              ))}
            </div>

            {upcomingEvents.length === 0 && !showCreateForm && (
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">{t('events.no_events')}</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">{t('events.no_events_desc')}</p>
                  {isAdmin && (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                      size="lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('events.create')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Admin History Tab */}
          <TabsContent value="admin-history" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">ประวัติการจัดกิจกรรม</h2>
            <div className="space-y-4">
              {[...events].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()).map(event => (
                <div key={event.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.eventName}</h3>
                      <p className="text-sm text-gray-600">{event.eventDate} • {event.venue}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={`text-xs ${
                          event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                          event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'calculating' ? 'bg-yellow-100 text-yellow-700' :
                          event.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t(`events.${event.status}`)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.players.filter(p => p.status === 'registered').length}/{event.maxPlayers} ผู้เล่น
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-700">
                        {event.status === 'completed' ? 
                          `฿${((event.courts.reduce((sum, court) => {
                            const hours = (new Date(`2000-01-01T${court.endTime}`).getTime() - 
                                        new Date(`2000-01-01T${court.startTime}`).getTime()) / (1000 * 60 * 60);
                            return sum + hours;
                          }, 0) * event.courtHourlyRate) + 
                          ((event.shuttlecocksUsed || 0) * event.shuttlecockPrice)).toFixed(0)}` 
                          : '-'
                        }
                      </div>
                      <div className="text-xs text-gray-500">ยอดรวม</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* User Upcoming Events Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">อีเวนต์ที่กำลังจะมาถึง</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full border-0 shadow-lg rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{event.eventName}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {event.eventDate}
                        </p>
                      </div>
                      <Badge className={`${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                        event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        event.status === 'calculating' ? 'bg-yellow-100 text-yellow-700' :
                        event.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`events.${event.status}`)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.players.filter(p => p.status === 'registered').length}/{event.maxPlayers}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {event.courts.length} สนาม
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="registration" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('registration')}</h2>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {upcomingEvents.map(event => (
                  <PlayerRegistration
                    key={event.id}
                    event={event}
                    onRegister={handlePlayerRegistration}
                    onCancelRegistration={handleCancelRegistration}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">{t('registration.no_events')}</h3>
                  <p className="text-gray-500 text-sm sm:text-base">{t('registration.no_events_desc')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Event Management Modal - Admin Only */}
        {isAdmin && showManagement && selectedEvent && (
          <EventManagement
            event={selectedEvent}
            onUpdateEvent={handleUpdateEvent}
            onClose={() => {
              setShowManagement(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <IndexContent />
    </LanguageProvider>
  );
};

export default Index;