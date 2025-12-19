export const dynamic = 'force-dynamic';

export default async function DashboardPage(){
    console.log("Dashboard Page Rendered at REQUEST TIME");

    // Dynamic Fetch (SSR) with explicit cache control
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks`, { cache: "no-store" });
    const { data: tasks } = await res.json();

    return(
        <main>
        <>
            <h1>Dashboard Page</h1>
            <p> Welcome to the Dashboard of SprintLite.</p>

            {tasks.map( task => (
                <div key={task.id} >
                    task.title - task.status
                </div>
            ))}

        </>
        </main>
    );
}