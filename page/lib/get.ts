import axios from 'axios';
import { getUrl } from "./main"
export async function getImageList(start:number = 0, limit:number = 10,tag:string = "", query:string = "") {
    try {
        const res = await axios.get(
            getUrl(`images/get/list?start=${start}&limit=${limit}&tag=${tag}&search=${query}`)
        )
        return res.data.data
    } catch (e) {
        return []
    }
}
export async function getImageData(id:number) {
    try {
        const res = await axios.get(getUrl(`images/get/data/${id}`))
        return res.data.data
    } catch (e) {
        return null
    }
}
export async function getCategoriesData(query:string = "") {
    try {
        const res = await axios.get(getUrl(`images/get/category?search=${query}`))
        return res.data.data
    } catch (e) {
        return null
    }
}