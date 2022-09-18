import axios from 'axios';
import { getUrl } from "./main"
export async function getImageList(start:number = 0, limit:number = 10,tag:string = "", query:string = "", like:boolean = false, folder:number=0) {
    try {
        const res = await axios.get(
            getUrl(`images/get/list?start=${start}&limit=${limit}&tag=${tag}&search=${query}&like=${like}&folder=${folder}`)
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
export async function getCategoriesData(query:string = "", tag:string = "", like:boolean = false, folder:number = 0) {
    try {
        const res = await axios.get(getUrl(`images/get/category?search=${query}&tag=${tag}&like=${like}&folder=${folder}`))
        return res.data.data
    } catch (e) {
        return null
    }
}

export async function getFolderList(query:string = "", tag:string = "", like:boolean = false, folder:number = 0) {
    try {
        const res = await axios.get(getUrl(`folder/get/all?search=${query}&tag=${tag}&like=${like}&folder=${folder}`))
        return res.data.data
    } catch (e) {
        return []
    }
}
export async function getFolderListV1() {
    try {
        const res = await axios.get(getUrl("folder/get/all/v1"))
        return res.data.data
    } catch (e) {
        return []
    }
}

export async function getLikeData(query:string = "", tag:string = "", like:boolean = false, folder:number = 0) {
    try {
        const res = await axios.get(getUrl(`like/get/all?search=${query}&tag=${tag}&like=${like}&folder=${folder}`))
        return res.data.data
    } catch (e) {
        return 0
    }
}