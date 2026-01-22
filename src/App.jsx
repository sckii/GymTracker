import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import PlanList from './components/PlanList';
import PlanEditor from './components/PlanEditor';
import NotificationToast from './components/NotificationToast';
import ConfirmModal from './components/ConfirmModal';
import ActiveWorkoutSelector from './components/ActiveWorkoutSelector';
import WorkoutSession from './components/WorkoutSession';

function App() {
  const [view, setView] = useState('home'); // 'home', 'plan-list', 'plan-editor', 'start-workout', 'workout-session'
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

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

  const createPlan = () => {
    const newPlan = {
      id: Date.now().toString(),
      name: 'New Training Plan',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      duration: '',
      weight: '',
      age: '',
      isActive: false,
      workouts: [
        { id: '1', name: 'Workout A', exercises: [] }
      ] // Start with one default workout
    };
    setPlans(prev => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
    setView('plan-editor');
  };

  const addPlan = (newPlan) => {
    setPlans(prev => [...prev, newPlan]);
  };

  const updatePlan = (updatedPlan) => {
    setPlans(prev => {
      if (updatedPlan.isActive) {
        return prev.map(p => p.id === updatedPlan.id ? updatedPlan : { ...p, isActive: false });
      }
      return prev.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    });
  };

  const deletePlan = (planId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan? This action cannot be undone.',
      onConfirm: () => {
        setPlans(prev => prev.filter(p => p.id !== planId));
        if (selectedPlanId === planId) {
          setSelectedPlanId(null);
        }
        showNotification('Plan deleted successfully', 'success');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleStartSession = (workout) => {
    setActiveSessionWorkout(workout);
    setView('workout-session');
  };

  const handleFinishSession = (logs, duration) => {
    // console.log('Session Finished', logs, duration);
    showNotification('Workout finished! Great job!', 'success');
    setActiveSessionWorkout(null);
    setView('home');
  };

  const activePlan = plans.find(p => p.isActive);
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 relative">
      <div className="w-full max-w-[800px] bg-white rounded-2xl shadow-xl overflow-hidden h-[800px] flex flex-col border border-gray-100">

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
                <ArrowLeft size={16} /> Back
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

      </div>

      {/* Global UI Components */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

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
