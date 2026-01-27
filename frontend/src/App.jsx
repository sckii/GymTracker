import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { generateUUID } from './lib/uuid';
import { parseShareLink } from './lib/share';
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
import LoadingScreen from './components/LoadingScreen';
import TestDataGenerator from './components/TestDataGenerator';


import { SUBSCRIPTION_PLANS, DEFAULT_PLAN } from './config/subscriptionPlans';

const BASE_API_URL = 'https://gymtracker-api.sckii.com';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'plan-list', 'plan-editor', 'start-workout', 'workout-session', 'stats'
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]); // Store workout logs
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Subscription State
  const [userPlan, setUserPlan] = useState(DEFAULT_PLAN);
  const [userProfile, setUserProfile] = useState(null);

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

  const [activeSessionWorkout, setActiveSessionWorkout] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // UI State
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: () => { }
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleUpgrade = async (planId) => {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);

    if (!plan) return;

    // If switching between paid plans (e.g. Basic -> Pro), go to portal
    if (userPlan.id !== 'free' && planId !== 'free' && userPlan.id !== planId) {
      handleManageSubscription();
      return;
    }

    if (plan.id === 'free') {
      showNotification('To cancel your subscription, please manage it in the Stripe Portal (Coming Soon).', 'info');
      return;
    }

    if (!plan.priceId) {
      showNotification('Configuration Error: Price ID missing for this plan.', 'error');
      return;
    }

    showNotification('Preparing checkout...', 'info');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        throw new Error('No active session token');
      }

      const response = await fetch(BASE_API_URL + '/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          customerId: userProfile?.stripe_customer_id,
          email: session.user.email,
          userId: session.user.id,
          successUrl: window.location.origin + '?upgrade=success',
          cancelUrl: window.location.origin + '?upgrade=canceled'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Network response was not ok');

      if (data.error) throw data.error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      showNotification('Failed to start checkout. Please try again.', 'error');
    }
  };

  const handleManageSubscription = async () => {
    try {
      showNotification('Redirecting to billing portal...', 'info');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) throw new Error('No active session');

      const response = await fetch(BASE_API_URL + '/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          returnUrl: window.location.origin
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Network response was not ok');

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('Portal error:', err);
      showNotification('Failed to open billing portal', 'error');
    }
  };

  const handleCancelSubscription = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel? If you subscribed less than 7 days ago, you will receive a full refund immediately. Otherwise, you will be redirected to the management portal.',
      confirmText: "Cancel Subscription",
      onConfirm: async () => {
        try {
          showNotification('Processing cancellation...', 'info');
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.access_token) throw new Error('No active session');

          const response = await fetch(BASE_API_URL + '/cancel-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession.access_token}`
            },
            body: JSON.stringify({})
          });

          const data = await response.json();

          if (!response.ok) throw new Error(data.error || 'Network response was not ok');

          if (data?.refunded) {
            showNotification('Subscription cancelled and refunded successfully!', 'success');
            window.location.reload();
          } else if (data?.url) {
            window.location.href = data.url;
          } else {
            showNotification(data?.message || 'Subscription cancelled', 'success');
            window.location.reload();
          }
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error('Cancellation error:', err);
          showNotification(`Cancellation failed: ${err.message}`, 'error');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Handle Share Link Import (Only when Session AND Data are ready)
  useEffect(() => {
    if (!session || !isDataLoaded) return;

    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    const upgradeStatus = params.get('upgrade');

    if (upgradeStatus === 'success') {
      showNotification('Subscription upgraded successfully!', 'success');
      // Clean URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }

    if (shareToken) {
      const importedPlan = parseShareLink(shareToken);
      if (importedPlan && importedPlan.name) {
        setConfirmDialog({
          isOpen: true,
          title: 'Import Plan?',
          message: `Do you want to import the plan "${importedPlan.name}"?`,
          confirmText: 'Import',
          onConfirm: () => {
            addPlan(importedPlan);
            showNotification(`Plan "${importedPlan.name}" imported successfully!`, 'success');
            setView('plan-list');

            // Clean URL
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
          onCancel: () => {
            showNotification('Import cancelled', 'info');
            // Clean URL
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
        });
      } else {
        showNotification('Invalid or corrupted share link.', 'error');
        // Clean URL anyway to avoid loops if persistent
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    }
  }, [session, isDataLoaded]);

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
          isAI: p.is_ai, // Map DB snake_case to app camelCase
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

      // Fetch User Profile (Subscription Tier)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === profileData.subscription_tier);
        if (plan) {
          setUserPlan(plan);
        }
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setIsDataLoaded(true);
    };

    fetchData();
  }, [session]);

  const createPlan = async () => {
    // Check Subscription Limits
    if (plans.length >= userPlan.maxPlans) {
      showNotification(`Plan limit reached (${userPlan.maxPlans}) for ${userPlan.name} tier. Upgrade to create more.`, 'error');
      return;
    }

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
        is_ai: false, // Default manual plans are not AI
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
    // Check Subscription Limits
    if (plans.length >= userPlan.maxPlans) {
      showNotification(`Plan limit reached ${userPlan.maxPlans} for ${userPlan.name} tier. Upgrade to import more.`, 'error');
      return "limit_reached";
    }

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
        is_ai: securePlan.isAI || false,
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
        is_ai: updatedPlan.isAI,
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
    // Check if the plan has logs BEFORE showing the modal
    const planLogs = logs.filter(l => l.plan_id === planId);
    const hasLogs = planLogs.length > 0;

    setConfirmDialog({
      isOpen: true,
      title: hasLogs ? 'Delete Plan & History?' : 'Delete Plan?',
      message: hasLogs
        ? `This plan has ${planLogs.length} workout log(s). Deleting this plan will also remove all its history. Are you sure?`
        : 'Are you sure you want to delete this plan? This action cannot be undone.',
      confirmText: hasLogs ? 'Delete All' : 'Delete',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));

        if (session) {
          // If has logs, delete them first
          if (hasLogs) {
            const { error: logsError } = await supabase.from('logs').delete().eq('plan_id', planId);
            if (logsError) {
              console.error('Logs delete error', logsError);
              showNotification('Failed to delete logs: ' + logsError.message, 'error');
              return;
            }
            // Also update local state
            setLogs(prev => prev.filter(l => l.plan_id !== planId));
          }

          // Delete the plan
          const { error } = await supabase.from('plans').delete().eq('id', planId);

          if (error) {
            console.error('Error deleting plan:', error);
            showNotification(`Failed to delete plan: ${error.message}`, 'error');
          } else {
            setPlans(prev => prev.filter(p => p.id !== planId));
            if (selectedPlanId === planId) setSelectedPlanId(null);
            showNotification(hasLogs ? 'Plan and history deleted successfully' : 'Plan deleted successfully', 'success');
          }
        } else {
          setPlans(prev => prev.filter(p => p.id !== planId));
          if (selectedPlanId === planId) setSelectedPlanId(null);
          showNotification('Plan deleted locally', 'success');
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

    // Check Subscription Limits (Logs)
    let logsToDelete = [];
    if (logs.length >= userPlan.maxLogs) {
      // Logs are ordered by date DESC (newest first). So the oldest are at the end.
      const oldestLog = logs[logs.length - 1];
      logsToDelete.push(oldestLog.id);

      // Remove locally immediately
      setLogs(prev => prev.slice(0, -1));

      showNotification(`Log limit reached (${userPlan.maxLogs}). Oldest log removed.`, 'info');
    }

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
      // Delete old logs if limit reached
      if (logsToDelete.length > 0) {
        await supabase.from('logs').delete().in('id', logsToDelete);
      }

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

  if (!isDataLoaded) {
    return <LoadingScreen />;
  }

  const activePlan = plans.find(p => p.isActive);
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[60px] opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-secondary/40 rounded-full mix-blend-screen filter blur-[60px] opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-brand-primary-dark/20 rounded-full mix-blend-screen filter blur-[60px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <UserProfile
        user={session.user}
        currentPlan={userPlan}
        onUpgrade={handleUpgrade}
        onManage={handleManageSubscription}
        onCancel={handleCancelSubscription}
      />

      <div className={view === 'home'
        ? "w-full max-w-[550px] overflow-hidden h-[600px] flex flex-col transition-all duration-500"
        : view === 'stats'
          ? "w-full max-w-[1000px] bg-brand-gray/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden h-[80vh] flex flex-col transition-all duration-500"
          : "w-full max-w-[550px] bg-brand-gray/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden h-[600px] flex flex-col transition-all duration-500"}>

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
            userPlan={userPlan}
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
          <div className="flex flex-col h-full relative">
            <div className="p-6">
              <button onClick={() => setView('home')} className="mb-2 text-sm text-gray-400 hover:text-white flex items-center gap-1">
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
            previousLog={logs.find(l => l.plan_id === activePlan?.id && l.workoutName === activeSessionWorkout.name)}
            onFinish={handleFinishSession}
            onBack={() => setView('start-workout')}
          />
        )}

        {view === 'stats' && (
          <StatsView
            logs={logs}
            plans={plans}
            activePlanId={activePlan?.id}
            onBack={() => setView('home')}
          />
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
        confirmText={confirmDialog.confirmText || "Delete"}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel || (() => setConfirmDialog(prev => ({ ...prev, isOpen: false })))}
      />

      {/* <TestDataGenerator onComplete={() => window.location.reload()} /> */}
    </div>
  );
}

export default App;
