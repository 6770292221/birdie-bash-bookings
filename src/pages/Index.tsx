import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, LogOut, Shield, Menu, CreditCard, History, Activity, TrendingUp, X } from 'lucide-react';
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
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<any>(null);
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
              <i className="fas fa-users text-green-600 mx-auto mb-2 text-2xl"></i>
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
        <Tabs defaultValue={!user ? "upcoming" : (isAdmin ? "management" : "upcoming")} className="space-y-4">
          <TabsList className={`grid w-full ${
            !user ? 'grid-cols-1' : (isAdmin ? 'grid-cols-3' : 'grid-cols-3')
          } bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-lg border-0 h-12`}>
            
            {/* Show only upcoming events if not logged in */}
            {!user ? (
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base w-full"
              >
                <i className="fas fa-calendar-alt w-4 h-4 mr-2"></i>
                อีเวนต์ที่กำลังจะมา
              </TabsTrigger>
            ) : isAdmin ? (
              <>
                <TabsTrigger 
                  value="management" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <i className="fas fa-cog w-4 h-4 mr-2"></i>
                  จัดการกิจกรรม
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <i className="fas fa-credit-card w-4 h-4 mr-2"></i>
                  การชำระเงิน
                </TabsTrigger>
                <TabsTrigger 
                  value="admin-history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <i className="fas fa-history w-4 h-4 mr-2"></i>
                  ประวัติ
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  อีเวนต์ที่กำลังจะมา
                </TabsTrigger>
                <TabsTrigger 
                  value="registration" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <i className="fas fa-user-plus w-4 h-4 mr-2"></i>
                  ลงทะเบียนผู้เล่น
                </TabsTrigger>
                <TabsTrigger 
                  value="user-history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-md text-sm sm:text-base"
                >
                  <i className="fas fa-chart-line w-4 h-4 mr-2"></i>
                  ประวัติ
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

          {/* Admin Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">การชำระเงิน</h2>
            
            {/* Payment Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <i className="fas fa-chart-line text-green-600 mx-auto mb-2 text-2xl"></i>
                  <p className="text-2xl font-bold text-green-700">฿2,450</p>
                  <p className="text-sm text-green-600">ยอดที่เก็บได้แล้ว</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">฿1,200</p>
                  <p className="text-sm text-orange-600">รอจ่ายเงิน</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <i className="fas fa-calculator text-blue-600 mx-auto mb-2 text-2xl"></i>
                  <p className="text-2xl font-bold text-blue-700">฿800</p>
                  <p className="text-sm text-blue-600">รอคำนวณ</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">รายการรอจ่ายเงิน</h3>
              <div className="space-y-3">
                {/* Mock pending payment data */}
                {[
                  { 
                    id: 1, 
                    event: "แบดมินตัน สนามใหญ่", 
                    players: 8, 
                    amount: 1450, 
                    status: 'awaiting_payment',
                    eventDate: "2024-12-30",
                    venue: "สนามกีฬาแห่งชาติ",
                    playerDetails: [
                      { name: "สมชาย ใจดี", amount: 180, status: "pending" },
                      { name: "สมหญิง รักสุข", amount: 180, status: "pending" },
                      { name: "วิชัย สุขใส", amount: 200, status: "pending" },
                      { name: "มานี สวยงาม", amount: 180, status: "pending" },
                      { name: "สมศักดิ์ ดีมาก", amount: 180, status: "pending" },
                      { name: "นิรันดร์ เก่งกาจ", amount: 180, status: "pending" },
                      { name: "ปรีชา ฉลาดเฉลียว", amount: 180, status: "pending" },
                      { name: "สุภาพ อ่อนโยน", amount: 230, status: "pending", note: "มาสาย +50" }
                    ]
                  },
                  { 
                    id: 2, 
                    event: "แบดมินตัน เย็นวันศุกร์", 
                    players: 6, 
                    amount: 1080, 
                    status: 'awaiting_payment',
                    eventDate: "2024-12-27",
                    venue: "สโมสรกีฬาบางแสน",
                    playerDetails: [
                      { name: "อรุณ ใสสด", amount: 180, status: "pending" },
                      { name: "วิมล สดใส", amount: 180, status: "pending" },
                      { name: "กิตติ มั่นใจ", amount: 180, status: "pending" },
                      { name: "อนุชา เด็ดเดี่ยว", amount: 180, status: "pending" },
                      { name: "สุทิน แข็งแกร่ง", amount: 180, status: "pending" },
                      { name: "มงคล เฮงสุด", amount: 180, status: "pending" }
                    ]
                  },
                ].map(payment => (
                  <Card 
                    key={payment.id} 
                    className="bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-all"
                    onClick={() => setSelectedPaymentDetail(payment)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.event}</h4>
                          <p className="text-sm text-gray-600">{payment.players} ผู้เล่น • {payment.eventDate}</p>
                          <p className="text-xs text-gray-500">{payment.venue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-700">฿{payment.amount}</p>
                          <Badge className="bg-orange-100 text-orange-700 text-xs">รอจ่ายเงิน</Badge>
                          <p className="text-xs text-gray-500 mt-1">คลิกดูรายละเอียด</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Calculating Events */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">รายการรอคำนวณ</h3>
              <div className="space-y-3">
                {/* Mock calculating events */}
                {[
                  { id: 1, event: "แบดมินตัน วันเสาร์บ่าย", players: 12, courts: 3, status: 'calculating' },
                  { id: 2, event: "แบดมินตัน อาทิตย์เช้า", players: 10, courts: 3, status: 'calculating' },
                ].map(calc => (
                  <Card key={calc.id} className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{calc.event}</h4>
                          <p className="text-sm text-gray-600">{calc.players} ผู้เล่น • {calc.courts} สนาม</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">กำลังคำนวณ</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Admin History Tab */}
          <TabsContent value="admin-history" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">ประวัติการจัดกิจกรรม</h2>
            
            {/* Mock admin history with enhanced statuses */}
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  eventName: "แบดมินตัน สนามใหญ่",
                  eventDate: "2024-12-15",
                  venue: "สนามกีฬาแห่งชาติ",
                  players: 12,
                  maxPlayers: 14,
                  courts: 3,
                  totalAmount: 1450,
                  status: "completed_paid",
                  statusText: "จบเกม จ่ายเงินแล้ว"
                },
                {
                  id: 2,
                  eventName: "แบดมินตัน เย็นวันศุกร์",
                  eventDate: "2024-12-20",
                  venue: "สโมสรกีฬาบางแสน",
                  players: 8,
                  maxPlayers: 10,
                  courts: 2,
                  totalAmount: 950,
                  status: "completed_unpaid",
                  statusText: "จบเกม รอจ่ายเงิน"
                },
                {
                  id: 3,
                  eventName: "แบดมินตัน วันเสาร์บ่าย",
                  eventDate: "2024-12-25",
                  venue: "ศูนย์กีฬาลำพิมิ",
                  players: 6,
                  maxPlayers: 12,
                  courts: 2,
                  totalAmount: 0,
                  status: "cancelled",
                  statusText: "ยกเลิก"
                },
                {
                  id: 4,
                  eventName: "แบดมินตัน อาทิตย์เช้า",
                  eventDate: "2024-12-30",
                  venue: "สนามกีฬาธรรมศาสตร์",
                  players: 10,
                  maxPlayers: 12,
                  courts: 3,
                  totalAmount: 1200,
                  status: "calculating",
                  statusText: "กำลังคำนวณ"
                }
              ].map(event => (
                <Card key={event.id} className={`transition-all ${
                  event.status === 'completed_paid' ? 'bg-green-50 border-green-200' :
                  event.status === 'completed_unpaid' ? 'bg-orange-50 border-orange-200' :
                  event.status === 'cancelled' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {event.eventName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.eventName}</h3>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {event.eventDate}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.venue}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {event.players}/{event.maxPlayers} คน
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {event.courts} สนาม
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Amount */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {event.totalAmount > 0 ? `฿${event.totalAmount}` : '-'}
                          </div>
                          <div className="text-xs text-gray-500">ยอดรวม</div>
                        </div>
                        <Badge className={`text-xs ${
                          event.status === 'completed_paid' ? 'bg-green-100 text-green-700 border-green-300' :
                          event.status === 'completed_unpaid' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-yellow-100 text-yellow-700 border-yellow-300'
                        }`}>
                          {event.status === 'completed_paid' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {event.status === 'completed_unpaid' && <Clock className="w-3 h-3 mr-1" />}
                          {event.status === 'cancelled' && <Activity className="w-3 h-3 mr-1" />}
                          {event.status === 'calculating' && <Activity className="w-3 h-3 mr-1 animate-spin" />}
                          {event.statusText}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

          {/* User History Tab */}
          <TabsContent value="user-history" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">ประวัติการเล่น</h2>
            
            {/* Mock user history data with different payment statuses */}
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  eventName: "แบดมินตัน สนามใหญ่",
                  eventDate: "2024-12-15",
                  venue: "สนามกีฬาแห่งชาติ",
                  cost: 250,
                  status: "paid",
                  paymentStatus: "ชำระแล้ว",
                  participated: true
                },
                {
                  id: 2,
                  eventName: "แบดมินตัน เย็นวันศุกร์",
                  eventDate: "2024-12-20",
                  venue: "สโมสรกีฬาบางแสน",
                  cost: 180,
                  status: "pending_payment",
                  paymentStatus: "รอจ่ายเงิน",
                  participated: true
                },
                {
                  id: 3,
                  eventName: "แบดมินตัน วันเสาร์บ่าย",
                  eventDate: "2024-12-25",
                  venue: "ศูนย์กีฬาลำพิมิ",
                  cost: 320,
                  status: "fined",
                  paymentStatus: "โดนปรับ",
                  participated: false,
                  fine: 100
                }
              ].map((history) => (
                <Card key={history.id} className={`transition-all ${
                  history.status === 'paid' ? 'bg-green-50 border-green-200' :
                  history.status === 'pending_payment' ? 'bg-orange-50 border-orange-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {history.eventName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{history.eventName}</h3>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {history.eventDate}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {history.venue}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ฿{history.cost}
                            {history.fine && (
                              <span className="text-red-600 text-sm ml-1">(+฿{history.fine} ปรับ)</span>
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${
                              history.status === 'paid' ? 'bg-green-100 text-green-700 border-green-300' :
                              history.status === 'pending_payment' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            }`}>
                              {history.status === 'paid' && <TrendingUp className="w-3 h-3 mr-1" />}
                              {history.status === 'pending_payment' && <Clock className="w-3 h-3 mr-1" />}
                              {history.status === 'fined' && <Activity className="w-3 h-3 mr-1" />}
                              {history.paymentStatus}
                            </Badge>
                            {!history.participated && (
                              <Badge className="bg-gray-100 text-gray-700 text-xs">
                                ไม่ได้เล่น
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty state if no history */}
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>แสดงประวัติการเล่นของคุณที่นี่</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Detail Modal */}
        {selectedPaymentDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <i className="fas fa-credit-card mr-2 text-orange-600"></i>
                      รายละเอียดการชำระเงิน
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedPaymentDetail.event} • {selectedPaymentDetail.eventDate}
                    </CardDescription>
                    <p className="text-sm text-gray-600">{selectedPaymentDetail.venue}</p>
                  </div>
                  <Button 
                    onClick={() => setSelectedPaymentDetail(null)} 
                    variant="outline" 
                    size="sm"
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Summary */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">ยอดรวมทั้งหมด</p>
                      <p className="text-sm text-gray-600">{selectedPaymentDetail.players} ผู้เล่น</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">฿{selectedPaymentDetail.amount}</p>
                  </div>
                </div>

                {/* Player Payment Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">รายละเอียดการจ่ายรายบุคคล</h3>
                  <div className="space-y-2">
                    {selectedPaymentDetail.playerDetails.map((player: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{player.name}</p>
                            {player.note && (
                              <p className="text-xs text-red-600">{player.note}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">฿{player.amount}</p>
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            รอจ่าย
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "ส่งการแจ้งเตือนแล้ว",
                        description: "ส่งการแจ้งเตือนชำระเงินให้ผู้เล่นทั้งหมดแล้ว",
                      });
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    แจ้งเตือนทั้งหมด
                  </Button>
                  <Button 
                    onClick={() => setSelectedPaymentDetail(null)} 
                    variant="outline"
                    className="flex-1"
                  >
                    ปิด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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