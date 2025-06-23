import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, LogOut, Shield } from 'lucide-react';
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

export interface Court {
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
  status: 'upcoming' | 'completed' | 'cancelled';
  createdBy: string;
}

const IndexContent = () => {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'players' | 'status' | 'createdBy'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      players: [],
      status: 'upcoming',
      createdBy: 'Group Leader',
    };
    setEvents([...events, newEvent]);
    setShowCreateForm(false);
  };

  const handlePlayerRegistration = (eventId: string, playerData: Omit<Player, 'id' | 'registrationTime' | 'status'>) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isWaitlist = event.players.filter(p => p.status === 'registered').length >= event.maxPlayers;
        const newPlayer: Player = {
          ...playerData,
          id: Date.now().toString(),
          registrationTime: new Date(),
          status: isWaitlist ? 'waitlist' : 'registered',
        };
        return {
          ...event,
          players: [...event.players, newPlayer],
        };
      }
      return event;
    }));
  };

  const handleCancelRegistration = (eventId: string, playerId: string, isEventDay: boolean = false) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const updatedPlayers = event.players.map(player => {
          if (player.id === playerId) {
            return {
              ...player,
              status: 'cancelled' as const,
              cancelledOnEventDay: isEventDay,
            };
          }
          return player;
        });

        // Move first waitlist player to registered if someone cancelled
        const waitlistPlayers = updatedPlayers.filter(p => p.status === 'waitlist');
        if (waitlistPlayers.length > 0) {
          const firstWaitlist = waitlistPlayers[0];
          firstWaitlist.status = 'registered';
        }

        return {
          ...event,
          players: updatedPlayers,
        };
      }
      return event;
    }));
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowManagement(true);
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              {user && (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">สวัสดี, {user.name}</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('app.title')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              ) : (
                <AuthButtons />
              )}
            </div>
          </div>
        </div>

        {/* Admin Access Notice */}
        {!isAdmin && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">การจัดการอีเวนต์สำหรับแอดมินเท่านั้น</p>
                  <p className="text-sm text-amber-600">กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินเพื่อจัดการอีเวนต์</p>
                </div>
              </div>
              {!user && (
                <Link to="/login">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-600">{t('events.upcoming')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingEvents.reduce((sum, event) => sum + event.players.filter(p => p.status === 'registered').length, 0)}
                </p>
                <p className="text-sm text-gray-600">{t('events.total_players')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardContent className="flex items-center p-6">
              <MapPin className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingEvents.reduce((sum, event) => sum + event.courts.length, 0)}
                </p>
                <p className="text-sm text-gray-600">{t('events.courts_booked')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedEvents.length}</p>
                <p className="text-sm text-gray-600">{t('events.completed')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="events" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {isAdmin ? t('events.management') : 'ดูอีเวนต์'}
            </TabsTrigger>
            <TabsTrigger value="registration" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              {t('registration')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isAdmin ? t('events.management') : 'อีเวนต์ที่กำลังจะมาถึง'}
              </h2>
              {isAdmin && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('events.no_events')}</h3>
                  <p className="text-gray-500 mb-4">{t('events.no_events_desc')}</p>
                  {isAdmin && (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('events.create')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registration" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">{t('registration')}</h2>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('registration.no_events')}</h3>
                  <p className="text-gray-500">{t('registration.no_events_desc')}</p>
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
