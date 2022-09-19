import { useEffect, useRef } from "react"
const InfScroll = ({ children, loadMore, reload, hasMore }:{children: React.ReactNode, loadMore: Function, reload: any, hasMore: boolean}) => {
    const ref = useRef<any>(null)
    useEffect(() => {
        if(hasMore && process.browser && ref) {
            if(window.innerHeight*2 > ref.current.getBoundingClientRect().bottom) {
                loadMore()
            }
        }
    })
    return (
        <div>
            {children}
            <div ref={ref}></div>
        </div>
    )
}
export default InfScroll