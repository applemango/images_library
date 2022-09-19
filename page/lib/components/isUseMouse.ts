export default function isUseMouse():boolean {
    if(process.browser && window.navigator.maxTouchPoints != 0) {
        return true
    }
    return false
}