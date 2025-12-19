// Implement Static regeneration :- HYBRID Rendering (ISR)
export const revalidate = 60;

export default async function taskOverviewPage(){
    console.log("Task Overview Page Rendered at BUILD TIME");

    // ISR Fetch with explicit revalidation
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/summary`, {
        next: { revalidate: 60 }
    });
    const { data: Summary } = await res.json();

    return(
        <main>
            <h1>Task Overview</h1>
            <p>Total task: {Summary.total}</p>
            <p>Pending: {Summary.pending}</p>
            <p>In Progress: {Summary.inProgress}</p>
            <p>Completed: {Summary.completed}</p>
            <p>Completion Rate: {Summary.completionRate}%</p>
        </main>
    );
}