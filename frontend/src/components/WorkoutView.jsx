import React from 'react';
import ExerciseCard from './ExerciseCard';
import { Plus } from 'lucide-react';

export default function WorkoutView({ workout, setWorkouts, isReadOnly }) {
    const updateExercise = (exerciseId, newData) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return {
                ...w,
                exercises: w.exercises.map(ex => ex.id === exerciseId ? newData : ex)
            };
        }));
    };

    const deleteExercise = (exerciseId) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return {
                ...w,
                exercises: w.exercises.filter(ex => ex.id !== exerciseId)
            };
        }));
    };

    const addExercise = () => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return {
                ...w,
                exercises: [...w.exercises, { id: Date.now().toString(), name: '', sets: '', reps: '', type: 'Normal', restType: 'Normal', rest: '', restAfter: '' }]
            };
        }));
    };

    const updateWorkoutName = (name) => {
        setWorkouts(prev => prev.map(w => {
            if (w.id !== workout.id) return w;
            return { ...w, name };
        }));
    };

    return (
        <div className="flex flex-col h-full bg-brand-gray">
            <div className="px-6 pt-6">
                <input
                    disabled={isReadOnly}
                    className={`text-xl font-bold mb-2 bg-transparent border-none outline-none text-gray-100 placeholder-gray-600 w-full ${isReadOnly ? 'text-gray-500' : ''}`}
                    value={workout.name}
                    onChange={(e) => updateWorkoutName(e.target.value)}
                    placeholder="Workout Name"
                />
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 pb-6">
                {workout.exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        updateExercise={updateExercise}
                        deleteExercise={deleteExercise}
                        isReadOnly={isReadOnly}
                        isLast={index === workout.exercises.length - 1}
                    />
                ))}

                {!isReadOnly && (
                    <button
                        onClick={addExercise}
                        className="w-full py-4 border-2 border-dashed border-brand-border rounded-xl text-gray-500 font-medium hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-2 group"
                    >
                        <div className="bg-brand-light-gray p-1 rounded-full group-hover:bg-brand-lime group-hover:text-black transition-colors">
                            <Plus size={20} />
                        </div>
                        Add Exercise
                    </button>
                )}
            </div>
        </div>
    );
}
