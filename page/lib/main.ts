export function getUrl (url: string): string {
    if(process.browser) {
        const host = location.host.split(':')[0];
        return `${location.protocol}//${host}:5000/${url}`
    }
    return "http://127.0.0.1:5000/" + url
}
