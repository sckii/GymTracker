export const MUSCLE_GROUPS = [
    { id: 'chest', name: 'Chest', view: 'front' },
    { id: 'back', name: 'Back', view: 'back' },
    { id: 'arms', name: 'Arms', view: 'front' }, // Will encompass Biceps/Triceps visually if needed, or split
    { id: 'biceps', name: 'Biceps', view: 'front' },
    { id: 'triceps', name: 'Triceps', view: 'back' },
    { id: 'shoulders', name: 'Shoulders', view: 'front' }, // Can be both, let's say front
    { id: 'legs', name: 'Legs', view: 'front' }, // General if we want to combine
    { id: 'quads', name: 'Quadriceps', view: 'front' },
    { id: 'hamstrings', name: 'Hamstrings', view: 'back' },
    { id: 'glutes', name: 'Glutes', view: 'back' },
    { id: 'calves', name: 'Calves', view: 'back' },
    { id: 'abs', name: 'Abs / Core', view: 'front' },
];

export const EXERCISE_DATABASE = {
    'chest': [
        'Dumbbell Incline Bench Press',
        'Dumbbell Incline Chest Flys',
        'Dumbbell Bench Press',
        'Dumbbell Chest Fly',
        'Cable Chest Press',
        'Cable Pec Fly',
        'Cable Incline Press Around',
        'Cable Mid Chest Fly',
        'Machine Dips',
        'Machine Bent Arm Pec Fly',
        'Machine Chest Press',
        'Machine Plate Loaded Low Incline Bench Press',
        'Machine Incline Chest Press'
    ],
    'back': [
        'Cable Lat Prayer',
        'Cable Lat Pulldown',
        'Dumbbell Row',
        'Machine Lat Pulldown',
        'Machine Row',
        'Seated Cable Row',
        'Machine Low Row'
    ],
    'biceps': [
        'Dumbbell Curl',
        'Dumbbell Hammer Curl',
        'Dumbbell Reverse Curl',
        'Dumbbell Incline Hammer Curl',
        'Dumbbell Incline Reverse Curl',
        'Dumbbell Incline Zottman Curl',
        'Cable Biceps Curl',
        'Machine Biceps Curl'
    ],
    'triceps': [
        'Cable Rope Pushdown',
        'Cable Straight Bar Pushdown',
        'Dumbbell Triceps Kickback',
        'Dumbbell Overhead Triceps Extension',
        'Machine Dips'
    ],
    'shoulders': [
        'Dumbbell Seated Overhead Press',
        'Dumbbell Lateral Raise',
        'Dumbbell Front Raise',
        'Cable Lateral Raise',
        'Cable Front Raise',
        'Machine Shoulder Press'
    ],
    'quads': [
        'Dumbbell Goblet Squat',
        'Dumbbell Front Squat',
        'Dumbbell Reverse Lunge',
        'Leg Press',
        'Leg Extension',
        'Machine Hack Squat'
    ],
    'hamstrings': [
        'Dumbbell Romanian Deadlift',
        'Dumbbell Leg Curl',
        'Machine Seated Leg Curl',
        'Machine Lying Leg Curl',
        'Smith Machine Romanian Deadlift'
    ],
    'glutes': [
        'Dumbbell Glute Bridge',
        'Dumbbell Hip Thrust',
        'Machine Glute Kickback',
        'Machine Hip Thrust',
        'Cable Pull Through',
        'Cable Kickback'
    ],
    'calves': [
        'Dumbbell Standing Calf Raise',
        'Dumbbell Seated Calf Raise',
        'Machine Standing Calf Raise',
        'Machine Seated Calf Raise',
        'Machine Leg Press Calf Raise'
    ],
    'abs': [
        'Cable Crunch',
        'Machine Ab Crunch',
        'Dumbbell Russian Twist',
        'Dumbbell Leg Raise',
        'Machine Roll Outs',
        'Cable Woodchopper'
    ]
};

// Also keep a flat list for searching
export const getAllExercises = () => {
    const list = [];
    Object.keys(EXERCISE_DATABASE).forEach(muscle => {
        EXERCISE_DATABASE[muscle].forEach(ex => {
            if (!list.includes(ex)) list.push(ex);
        });
    });
    return list.sort();
};
