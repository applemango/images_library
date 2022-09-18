import { createRef, useState } from "react"
import {useEffect, useRef} from 'react';
import Image from "./image"
import ImageInfo from "./image_info"
import { getUrl } from "../../lib/main"
type Props = {
    line?: number
    data: Array<Object>
    tag: string | undefined
    query: string | undefined
    like: boolean | undefined
    folder: number | undefined
}
const Images = ({line = 3, data, tag, query}:Props) => {
    const [lines, setLines]  = useState(new Array(line))
    const [length, setLength] = useState(0)
    const [l,setL] = useState(line)
    //const lines = new Array(line)
    const Ref:any = useRef(lines.map(() => createRef()));
    const getMinLine = (array:Array<any>) => {
        let min = Infinity
        let minLine = 0
        for (let i = 0; i < array.length; i++) {
            if(array[i] < min || !array[i]) {
                min = array[i]
                minLine = i
            }
        }
        //array.map((d:any,i:number)=> {
        //    if(d < min) {
        //        min = d
        //        minLine = i
        //    }
        //})
        return minLine
    }
    const size = (width:number, height:number) => {
        //return height * (height / width)
        return height / width
    }
    /*const reset = () => {
        let height = new Array(line)
        let a = new Array(line)
        data.map((d:any, i:number) => {
            const minLine = getMinLine(height)
            if(a[minLine]) {
                a[minLine].push(d)
                height[minLine] += size(d.width,d.height)
            } else {
                a[minLine] = [d]
                height[minLine] = size(d.width,d.height)
            }
        })
        setLines(a)
    }*/
    useEffect(() => {
        //reset()
        if(data.length == length && l == line) return
        let height = new Array(line)
        let a = new Array(line)
        data.map((d:any, i:number) => {
            const minLine = getMinLine(height)
            if(a[minLine]) {
                a[minLine].push(d)
                height[minLine] += size(d.width,d.height)
            } else {
                a[minLine] = [d]
                height[minLine] = size(d.width,d.height)
            }
        })
        setLength(data.length)
        setLines(a)
        setL(line)
        //console.log(height)
    })
    useEffect(() => {
        let height = new Array(line)
        let a = new Array(line)
        data.map((d:any, i:number) => {
            const minLine = getMinLine(height)
            if(a[minLine]) {
                a[minLine].push(d)
                height[minLine] += size(d.width,d.height)
            } else {
                a[minLine] = [d]
                height[minLine] = size(d.width,d.height)
            }
        })
        setLength(data.length)
        setLines(a)
        setL(line)
    },[data,tag,query,tag,query])
    /*useEffect(() => {
        console.log(lines)
        lines.map((data:any, index:number) => {
            data.map((d:any, i:number) => {
                console.log(d)
            })
        })
    })*/
    return (
        <div style={{display:"flex"}}>
            { lines.map((data:any, i:number) => (
                <div key={i} ref={Ref.current[i]} style={{width:`calc(100% / ${line})`}}>
                    { Object.keys(data).map((d:any,j:number) => (
                        <div key={j} style={{width:"calc(100% - 10px)",marginRight:"5px",marginLeft:"5px",marginBottom: "10px"}}>
                            <ImageInfo data={data[j]} src={getUrl(data[j].url)} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
export default Images