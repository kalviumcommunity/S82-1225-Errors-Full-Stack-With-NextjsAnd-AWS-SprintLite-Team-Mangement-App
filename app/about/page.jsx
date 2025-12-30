// used Static Site Rendering SSG  
// Page is rendered once during build
// Served as plain HTML afterwards

export const revalidate = false;

export default function AboutPage(){
    console.log("About Page Rendered at BUILD TIME");

    return(
        <main>
        <>
            <h1>About Page</h1>
            <p> SprintLite is a lightweight task management tool for small teams.</p>
        </>
        </main>
    );
}