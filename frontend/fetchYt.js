const ex = ['Dumbbell Incline Bench Press', 'Dumbbell Incline Chest Flys', 'Dumbbell Bench Press', 'Dumbbell Chest Fly', 'Cable Chest Press', 'Cable Pec Fly', 'Cable Incline Press Around', 'Cable Mid Chest Fly', 'Machine Dips', 'Machine Bent Arm Pec Fly', 'Machine Chest Press', 'Machine Plate Loaded Low Incline Bench Press', 'Machine Incline Chest Press', 'Cable Lat Prayer', 'Cable Lat Pulldown', 'Dumbbell Row', 'Machine Lat Pulldown', 'Machine Row', 'Seated Cable Row', 'Machine Low Row', 'Dumbbell Curl', 'Dumbbell Hammer Curl', 'Dumbbell Reverse Curl', 'Dumbbell Incline Hammer Curl', 'Dumbbell Incline Reverse Curl', 'Dumbbell Incline Zottman Curl', 'Cable Biceps Curl', 'Machine Biceps Curl', 'Cable Rope Pushdown', 'Cable Straight Bar Pushdown', 'Dumbbell Triceps Kickback', 'Dumbbell Overhead Triceps Extension', 'Dumbbell Seated Overhead Press', 'Dumbbell Lateral Raise', 'Dumbbell Front Raise', 'Cable Lateral Raise', 'Cable Front Raise', 'Machine Shoulder Press', 'Dumbbell Goblet Squat', 'Dumbbell Front Squat', 'Dumbbell Reverse Lunge', 'Leg Press', 'Leg Extension', 'Machine Hack Squat', 'Dumbbell Romanian Deadlift', 'Dumbbell Leg Curl', 'Machine Seated Leg Curl', 'Machine Lying Leg Curl', 'Smith Machine Romanian Deadlift', 'Dumbbell Glute Bridge', 'Dumbbell Hip Thrust', 'Machine Glute Kickback', 'Machine Hip Thrust', 'Cable Pull Through', 'Cable Kickback', 'Dumbbell Standing Calf Raise', 'Dumbbell Seated Calf Raise', 'Machine Standing Calf Raise', 'Machine Seated Calf Raise', 'Machine Leg Press Calf Raise', 'Cable Crunch', 'Machine Ab Crunch', 'Dumbbell Russian Twist', 'Dumbbell Leg Raise', 'Machine Roll Outs', 'Cable Woodchopper']; 
const delay = ms => new Promise(r => setTimeout(r, ms)); 
async function run() { 
    let map = {}; 
    for(const e of ex) { 
        try { 
            const r = await fetch('https://www.youtube.com/results?search_query=how+to+do+'+encodeURIComponent(e)+'+exercise'); 
            const t = await r.text(); 
            const match = t.match(/"videoId":"([a-zA-Z0-9_-]{11})/); 
            if(match) { 
                map[e] = match[1]; 
                console.log('Found:', e, match[1]); 
            } else { 
                map[e] = ''; 
                console.log('Not found:', e); 
            } 
        } catch(err) { 
            console.log('Err:', e); 
        } 
        await delay(500); 
    }; 
    const output = `export const YOUTUBE_VIDEOS = ${JSON.stringify(map, null, 4)};`;
    require('fs').writeFileSync('src/lib/youtubeMap.js', output); 
    console.log('Done mapping to src/lib/youtubeMap.js'); 
} 
run();
