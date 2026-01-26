import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../lib/uuid';

export default function TestDataGenerator({ onComplete }) {
    const [loading, setLoading] = useState(false);

    const generateData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Please login first");
                return;
            }

            const userId = session.user.id;

            // 1. Define the Plan
            const planId = '17691318404400417'; // Keep user's ID or generate new? User provided ID, safe to use or generate new to avoid conflicts? Let's generate new to be safe but keep structure.
            // Actually user said "Utilize esse plano como base", so maybe they want this exact structure.
            // Let's create a fresh ID to avoid primary key collisions if they try multiple times.
            const safePlanId = generateUUID();

            // Remap user's JSON Exercises to have proper IDs
            const exercises = [
                {
                    id: generateUUID(),
                    name: "Pull-ups",
                    sets: "4",
                    reps: ["5", "6", "7", "8"], // This format might be specific to their import, but standard app uses string "5" or just sets count. 
                    // Wait, App uses `sets` as a number usually? No, `sets` in valid plan is just a string number "4".
                    // The sets array in logs needs to match.
                    type: "Custom",
                    rest: "60"
                },
                {
                    id: generateUUID(),
                    name: "Puxada Frontal",
                    sets: "2",
                    reps: "12",
                    type: "Normal",
                    rest: "60"
                },
                {
                    id: generateUUID(),
                    name: "Biceps Reto",
                    sets: "4",
                    reps: "23",
                    type: "Normal",
                    rest: "120"
                }
            ];

            const planData = {
                id: safePlanId,
                user_id: userId,
                name: "Pull Trend Test",
                description: "Generated Test Data for Charts",
                is_active: false,
                start_date: new Date().toISOString(),
                workouts: [
                    {
                        id: generateUUID(),
                        name: "Pull Day",
                        exercises: exercises
                    }
                ]
            };

            // Insert Plan
            const { error: planError } = await supabase.from('plans').insert(planData);
            if (planError) throw planError;

            // 2. Generate Logs (Past 30 days, every 2 days)
            const logsToInsert = [];
            const today = new Date();

            for (let i = 0; i < 15; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (30 - (i * 2))); // -30, -28, ... -0

                // Progressive Overload Logic
                const progressFactor = i / 15; // 0 to 1

                const logData = {};
                exercises.forEach(ex => {
                    const setLogs = [];
                    const numSets = parseInt(ex.sets) || 3;

                    for (let s = 0; s < numSets; s++) {
                        // Linear progression
                        let baseWeight = 10;
                        let baseReps = 8;

                        if (ex.name === "Pull-ups") { baseWeight = 0; baseReps = 5; } // Bodyweight
                        if (ex.name === "Puxada Frontal") { baseWeight = 40; baseReps = 10; }
                        if (ex.name === "Biceps Reto") { baseWeight = 12; baseReps = 10; }

                        // Add "Random" var and Trend
                        const weight = Math.round(baseWeight + (progressFactor * 20) + (Math.random() * 2));
                        const reps = Math.round(baseReps + (progressFactor * 5) + (Math.random()));

                        setLogs.push({
                            weight: weight,
                            reps: reps,
                            completed: true
                        });
                    }
                    logData[ex.id] = setLogs;
                });

                // Construct Log structure matching DB
                logsToInsert.push({
                    id: generateUUID(),
                    user_id: userId,
                    plan_id: safePlanId,
                    date: date.toISOString(),
                    data: {
                        planName: planData.name,
                        workoutName: "Pull Day", // Matches workout name
                        duration: 3600,
                        data: logData,
                        exercises: exercises.map(ex => ({
                            id: ex.id,
                            name: ex.name,
                            sets: logData[ex.id]
                        }))
                    }
                });
            }

            const { error: logsError } = await supabase.from('logs').insert(logsToInsert);
            if (logsError) throw logsError;

            alert("Success! Created 'Pull Trend Test' plan with 15 logs.");
            if (onComplete) onComplete();

        } catch (e) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={generateData}
            disabled={loading}
            className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded shadow-lg text-xs font-bold hover:bg-red-700"
        >
            {loading ? "Generating..." : "⚡ GENERATE TEST DATA"}
        </button>
    );
}
