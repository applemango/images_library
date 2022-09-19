import InfiniteScroll from 'react-infinite-scroller'; 
import { useState, useEffect } from "react";
import { getImageList } from '../../lib/get';
import Image from "./image"
import { getUrl } from "../../lib/main"
import Images from "./imagelist"
import useWindowSize from '../../lib/components/useWindowSize';
import InfScroll from "./infscroll"
import isUseMouse from "../../lib/components/isUseMouse"
type Props = {
    tag: string | undefined
    query: string | undefined
    like: boolean
    folder: number
    reloadScroll: any
    reload?: any
}
const InfinityImage = ({ tag, query, like, folder, reloadScroll, reload}:Props) => {
    const [images, setImages] = useState<Array<object>>([])
    const [loadOfTheEnd,setLoadOfTheEnd] = useState<boolean>(false)//loadEnd
    const [start, setStart] = useState<number>(0)
    const [limit, setLimit] = useState<number>(10)
    const [width, height] = useWindowSize()
    const [lines, setLines] = useState(3)
    const [useMouse,setUseMouse] = useState(isUseMouse())

    const [first, setFirst] = useState(false)
    const [f, setF] = useState(false)
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
        if(first != f) {
            return
        }
        setF(true)
        const res = await getImageList(start, start+limit,tag,query,like,folder)
        const data = res
        if(!data || data.length < limit) {
            setLoadOfTheEnd(true)
        }
        setImages([...images, ...data])
        setStart(start + limit)
        setFirst(true)
    }
    const load = async () => {
        if(!first) return
        const res = await getImageList(0, 0+limit,tag,query,like,folder)
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
    },[tag,query,like,folder,reload])
    useEffect(() => {
        setUseMouse(isUseMouse())
    },[])
    return (
        <div>
            { useMouse &&
                <InfiniteScroll loadMore={loadMore} hasMore={!loadOfTheEnd} loader={loader}>
                    <Images like={like} folder={folder} query={query} tag={tag} data={images} line={lines} />
                </InfiniteScroll>
            }
            { !useMouse &&
                <InfScroll reload={reloadScroll} loadMore={loadMore} hasMore={!loadOfTheEnd}>
                    <Images like={like} folder={folder} query={query} tag={tag} data={images} line={lines} />
                </InfScroll>
            }
        </div>
    )
}
export default InfinityImage