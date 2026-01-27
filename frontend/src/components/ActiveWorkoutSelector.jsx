import React from 'react';
import { ChevronRight, Dumbbell } from 'lucide-react';

export default function ActiveWorkoutSelector({ activePlan, onSelectWorkout }) {
    if (!activePlan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-brand-gray">
                <div className="bg-brand-light-gray p-6 rounded-2xl shadow-sm border border-brand-border mb-4">
                    <Dumbbell size={48} className="text-gray-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-gray-200 mb-2">No Active Plan</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Please go to "My Plans" and activate a training plan to start a workout.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-100 mb-2">Ready to train?</h2>
                <p className="text-gray-400 text-lg">Select a workout from <span className="font-semibold text-brand-primary">{activePlan.name}</span></p>
            </div>

            <div className="grid gap-4">
                {activePlan.workouts.map((workout) => (
                    <button
                        key={workout.id}
                        onClick={() => onSelectWorkout(workout)}
                        className="group flex items-center justify-between p-6 bg-brand-light-gray rounded-2xl border border-brand-border shadow-sm hover:shadow-md hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-gray text-brand-primary flex items-center justify-center font-bold text-xl group-hover:bg-brand-primary group-hover:text-black transition-colors">
                                {workout.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-100">{workout.name}</h3>
                                <p className="text-sm text-gray-400 font-medium">
                                    {workout.exercises.length} Exercises
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-brand-lime transition-colors" size={24} />
                    </button>
                ))}
            </div>
        </div>
    );
}
