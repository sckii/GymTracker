import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { generateUUID } from './lib/uuid';
import { ArrowLeft } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import PlanList from './components/PlanList';
import PlanEditor from './components/PlanEditor';
import NotificationToast from './components/NotificationToast';
import ConfirmModal from './components/ConfirmModal';
import ActiveWorkoutSelector from './components/ActiveWorkoutSelector';
import WorkoutSession from './components/WorkoutSession';
import StatsView from './components/StatsView';
import InstallPrompt from './components/InstallPrompt';
import LoginScreen from './components/LoginScreen';
import UserProfile from './components/UserProfile';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'plan-list', 'plan-editor', 'start-workout', 'workout-session', 'stats'
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]); // Store workout logs
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Auth & Data Subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data when Session exists
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      // Fetch Plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: true });

      if (plansData) {
        // Map snake_case DB columns to camelCase App properties
        const mappedPlans = plansData.map(p => ({
          ...p,
          isActive: p.is_active,
          startDate: p.start_date || p.startDate // Handle both for safety
        }));
        setPlans(mappedPlans);
      } else if (plansError) {
        console.error('Error fetching plans:', plansError);
      }

      // Fetch Logs
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('date', { ascending: false });

      if (logsData) {
        const formattedLogs = logsData.map(log => ({
          ...log.data,
          id: log.id,
          date: log.date,
          plan_id: log.plan_id
        }));
        setLogs(formattedLogs);
      } else if (logsError) {
        console.error('Error fetching logs:', logsError);
      }
    };

    fetchData();
  }, [session]);

  // Session State
  const [activeSessionWorkout, setActiveSessionWorkout] = useState(null);

  // UI State
  const [notification, setNotification] = useState(null); // { message, type }
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const createPlan = async () => {
    const newPlan = {
      id: generateUUID(),
      name: 'New Training Plan',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      duration: '',
      weight: '',
      age: '',
      isActive: false,
      workouts: [
        { id: '1', name: 'Workout A', exercises: [] }
      ]
    };

    setPlans(prev => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
    setView('plan-editor');

    if (session) {
      // Explicit mapping to avoid sending 'isActive' which doesn't exist in DB
      const { error } = await supabase.from('plans').insert({
        id: newPlan.id,
        user_id: session.user.id,
        name: newPlan.name,
        description: newPlan.description,
        is_active: newPlan.isActive,
        start_date: newPlan.startDate,
        duration: newPlan.duration,
        weight: newPlan.weight,
        age: newPlan.age,
        workouts: newPlan.workouts
      });

      if (error) {
        showNotification('Error creating plan in cloud', 'error');
        console.error(error);
      }
    }
  };

  const addPlan = async (newPlan) => {
    // Force a new valid UUID for the plan to match Supabase schema, ignoring any legacy/timestamp IDs from CSV
    const securePlan = { ...newPlan, id: generateUUID() };

    setPlans(prev => [...prev, securePlan]);

    if (session) {
      const { error } = await supabase.from('plans').insert({
        id: securePlan.id,
        user_id: session.user.id,
        name: securePlan.name,
        description: securePlan.description,
        is_active: securePlan.isActive,
        start_date: securePlan.startDate,
        duration: securePlan.duration,
        weight: securePlan.weight,
        age: securePlan.age,
        workouts: securePlan.workouts
      });

      if (error) {
        showNotification('Error importing plan', 'error');
        console.error(error);
      }
    }
  };

  const updatePlan = async (updatedPlan) => {
    setPlans(prev => {
      if (updatedPlan.isActive) {
        return prev.map(p => p.id === updatedPlan.id ? updatedPlan : { ...p, isActive: false });
      }
      return prev.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    });

    if (session) {
      if (updatedPlan.isActive) {
        // Deactivate all others first
        await supabase.from('plans').update({ is_active: false }).eq('user_id', session.user.id);
      }

      const { error } = await supabase.from('plans').upsert({
        id: updatedPlan.id,
        user_id: session.user.id,
        name: updatedPlan.name,
        is_active: updatedPlan.isActive, // Mapped correctly
        workouts: updatedPlan.workouts,
        description: updatedPlan.description,
        start_date: updatedPlan.startDate, // Mapped to snake_case
        duration: updatedPlan.duration,
        weight: updatedPlan.weight,
        age: updatedPlan.age
      });

      if (error) {
        console.error('Error updating plan:', error);
      }
    }
  };

  const deletePlan = async (planId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan? This action cannot be undone.',
      onConfirm: async () => {
        setPlans(prev => prev.filter(p => p.id !== planId));
        if (selectedPlanId === planId) {
          setSelectedPlanId(null);
        }
        showNotification('Plan deleted successfully', 'success');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));

        if (session) {
          const { error } = await supabase.from('plans').delete().eq('id', planId);
          if (error) console.error('Error deleting plan:', error);
        }
      }
    });
  };

  const handleStartSession = (workout) => {
    setActiveSessionWorkout(workout);
    setView('workout-session');
  };

  const handleFinishSession = async (sessionLogs, duration) => {
    const activePlan = plans.find(p => p.isActive);

    const newLogId = generateUUID();
    const logDate = new Date().toISOString();

    const newLogData = {
      planName: activePlan ? activePlan.name : 'Unknown Plan',
      workoutName: activeSessionWorkout ? activeSessionWorkout.name : 'Unknown Workout',
      duration: duration,
      data: sessionLogs,
      exercises: activeSessionWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: Array.from({ length: parseInt(ex.sets) || 0 }).map((_, i) => ({
          reps: sessionLogs[ex.id]?.[i]?.reps || 0,
          weight: sessionLogs[ex.id]?.[i]?.weight || 0,
          completed: sessionLogs[ex.id]?.[i]?.completed || false
        }))
      }))
    };

    const newLogForState = {
      id: newLogId,
      date: logDate,
      plan_id: activePlan?.id,
      ...newLogData
    };

    setLogs(prev => [newLogForState, ...prev]);
    showNotification('Workout finished! Great job!', 'success');
    setActiveSessionWorkout(null);
    setView('home');

    if (session) {
      const { error } = await supabase.from('logs').insert({
        id: newLogId,
        user_id: session.user.id,
        plan_id: activePlan?.id,
        date: logDate,
        data: newLogData
      });
      if (error) {
        console.error('Error saving log:', error);
        showNotification('Error saving log to cloud', 'error');
      }
    }
  };

  if (!session) {
    return <LoginScreen />;
  }

  const activePlan = plans.find(p => p.isActive);
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FFFADC] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#B6F500]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-[#A4DD00]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>
      <UserProfile user={session.user} />

      <div className={view === 'home' ? "w-full max-w-[550px] overflow-hidden h-[600px] flex flex-col border border-gray-100" : "w-full max-w-[550px] bg-white rounded-2xl shadow-xl overflow-hidden h-[580px] flex flex-col border border-gray-100"}>

        {view === 'home' && (
          <HomeScreen setView={setView} activePlan={activePlan} />
        )}

        {view === 'plan-list' && (
          <PlanList
            plans={plans}
            setView={setView}
            setSelectedPlanId={setSelectedPlanId}
            createPlan={createPlan}
            addPlan={addPlan}
            deletePlan={deletePlan}
            showNotification={showNotification}
          />
        )}

        {view === 'plan-editor' && selectedPlan && (
          <PlanEditor
            plan={selectedPlan}
            updatePlan={updatePlan}
            onBack={() => setView('plan-list')}
          />
        )}

        {view === 'start-workout' && (
          <div className="flex flex-col h-full bg-white relative">
            <div className="p-6">
              <button onClick={() => setView('home')} className="mb-2 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                <ArrowLeft size={24} /> Back
              </button>
            </div>
            <ActiveWorkoutSelector
              activePlan={activePlan}
              onSelectWorkout={handleStartSession}
            />
          </div>
        )}

        {view === 'workout-session' && activeSessionWorkout && (
          <WorkoutSession
            workout={activeSessionWorkout}
            onFinish={handleFinishSession}
            onBack={() => setView('start-workout')}
          />
        )}

        {view === 'stats' && (
          <StatsView logs={logs} onBack={() => setView('home')} />
        )}

      </div>

      {/* Global UI Components */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <InstallPrompt />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
