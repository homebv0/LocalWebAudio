// Create a reference for the Wake Lock.
export let wakeLock = null;

export async function keepWake() 
{
    try {
        wakeLock = await navigator.wakeLock.request("screen");
        statusElem.textContent = "Wake Lock is active!";
    } catch (err) {
        // The Wake Lock request has failed - usually system related, such as battery.
        statusElem.textContent = `${err.name}, ${err.message}`;
    }
}

export async function letSleep()
{
    wakeLock.release().then(() => { wakeLock = null; });
}