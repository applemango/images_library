import InfiniteScroll from 'react-infinite-scroller'; 
import { useState, useEffect } from "react";
import { getImageList } from '../../lib/get';
import Image from "./image"
import { getUrl } from "../../lib/main"
import Images from "./imagelist"
import useWindowSize from '../../lib/components/useWindowSize';
type Props = {
    tag: string | undefined
    query: string | undefined
}
const InfinityImage = ({ tag, query }:Props) => {
    const [images, setImages] = useState<Array<object>>([])
    const [loadOfTheEnd,setLoadOfTheEnd] = useState<boolean>(false)//loadEnd
    const [start, setStart] = useState<number>(0)
    const [limit, setLimit] = useState<number>(10)
    const [width, height] = useWindowSize()
    const [lines, setLines] = useState(3)
    const loader = (
        <div key={1}></div>
    )
    /*const items = (
        <div>
            { images.map((d:any, i:number) => (
                <div key={i}>
                    <Image src={getUrl(d.url)} />
                </div>
            ))}
        </div>
    )*/
    /*const items = (
        <div>
            <Images data={images} line={lines} />
        </div>
    )*/
    const loadMore = async () => {
        const res = await getImageList(start, start+limit,tag,query)
        const data = res
        if(!data || data.length < limit) {
            setLoadOfTheEnd(true)
        }
        setImages([...images, ...data])
        setStart(start + limit)
    }
    const load = async () => {
        const res = await getImageList(0, 0+limit,tag,query)
        const data = res
        if(!data || data.length < limit) {
            setLoadOfTheEnd(true)
        }
        setImages([...data])
        setStart(0 + limit)
    }
    useEffect(() => {
        setLines(Math.floor(width/450))
    })
    useEffect(() => {
        setStart(0)
        setLimit(10)
        setImages([])
        setLoadOfTheEnd(false)
        load()
    },[tag,query])
    return (
        <div>
            <InfiniteScroll loadMore={loadMore} hasMore={!loadOfTheEnd} loader={loader}>
                <Images query={query} tag={tag} data={images} line={lines} />
            </InfiniteScroll>
        </div>
    )
}
export default InfinityImage