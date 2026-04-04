import { useState } from 'react';
import { ChevronRight, ChevronLeft, Dumbbell, Play } from 'lucide-react';

export default function ActiveWorkoutSelector({ activePlan, onSelectWorkout }) {
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    if (!activePlan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
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

    const handleWorkoutClick = (workout) => {
        const variations = workout.variations?.length > 0
            ? workout.variations
            : [{ id: workout.id + '_v', name: 'Week 1', exercises: workout.exercises || [] }];

        if (variations.length === 1) {
            onSelectWorkout({
                ...workout,
                id: `${workout.id}-${variations[0].id}`,
                name: workout.name,
                exercises: variations[0].exercises || []
            });
            return;
        }

        setSelectedWorkout(workout);
    };

    const handleVariationSelect = (variation) => {
        const variations = selectedWorkout.variations?.length > 0
            ? selectedWorkout.variations
            : [{ id: selectedWorkout.id + '_v', name: 'Week 1', exercises: selectedWorkout.exercises || [] }];

        const isDefault = variation.name === 'Week 1' && variations.length === 1;
        const displayName = isDefault ? selectedWorkout.name : `${selectedWorkout.name} — ${variation.name}`;

        onSelectWorkout({
            ...selectedWorkout,
            id: `${selectedWorkout.id}-${variation.id}`,
            name: displayName,
            exercises: variation.exercises || []
        });
    };

    const variations = selectedWorkout
        ? (selectedWorkout.variations?.length > 0
            ? selectedWorkout.variations
            : [{ id: selectedWorkout.id + '_v', name: 'Week 1', exercises: selectedWorkout.exercises || [] }])
        : [];

    return (
        <div className="overflow-hidden h-full relative">
            <div
                className="flex h-full transition-transform duration-300 ease-in-out"
                style={{ transform: selectedWorkout ? 'translateX(-100%)' : 'translateX(0)' }}
            >
                {/* Panel 1 — Workout list */}
                <div className="w-full shrink-0 overflow-y-auto p-6 flex flex-col gap-2">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-100 mb-1">Ready to train?</h2>
                        <p className="text-gray-400 text-sm">
                            Select a workout from <span className="font-semibold text-brand-primary">{activePlan.name}</span>
                        </p>
                    </div>

                    {activePlan.workouts.map((workout) => {
                        const vars = workout.variations?.length > 0
                            ? workout.variations
                            : [{ id: workout.id + '_v', name: 'Week 1', exercises: workout.exercises || [] }];
                        const totalExercises = vars.reduce((acc, v) => acc + (v.exercises?.length || 0), 0);
                        const hasMultipleVariations = vars.length > 1;

                        return (
                            <button
                                key={workout.id}
                                onClick={() => handleWorkoutClick(workout)}
                                className="group flex items-center justify-between p-4 bg-brand-light-gray rounded-2xl border border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-brand-gray text-brand-primary flex items-center justify-center font-bold text-lg group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                                        {workout.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-100">{workout.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {hasMultipleVariations
                                                ? `${vars.length} variations`
                                                : `${totalExercises} exercise${totalExercises !== 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                </div>
                                {hasMultipleVariations
                                    ? <ChevronRight className="text-gray-600 group-hover:text-brand-primary transition-colors shrink-0" size={20} />
                                    : <Play className="text-gray-600 group-hover:text-brand-primary transition-colors shrink-0" size={18} />
                                }
                            </button>
                        );
                    })}
                </div>

                {/* Panel 2 — Variation list */}
                <div className="w-full shrink-0 overflow-y-auto p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => setSelectedWorkout(null)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-brand-light-gray transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-100">{selectedWorkout?.name}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Select a variation to start</p>
                        </div>
                    </div>

                    {variations.map((variation) => (
                        <button
                            key={variation.id}
                            onClick={() => handleVariationSelect(variation)}
                            className="group flex items-center justify-between p-4 bg-brand-light-gray rounded-2xl border border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-brand-gray text-brand-primary flex items-center justify-center font-bold text-lg group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                                    {variation.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-100">{variation.name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {(variation.exercises || []).length} exercise{(variation.exercises || []).length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <Play className="text-gray-600 group-hover:text-brand-primary transition-colors shrink-0" size={18} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
