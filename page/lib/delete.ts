import axios from 'axios';
import { getUrl } from "./main"

export async function deleteFolder(folder_id: number) {
    try {
        const res = await axios.delete(getUrl(`folder/delete/${folder_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function deleteImage(image_id: number) {
    try {
        const res = await axios.delete(getUrl(`images/delete/${image_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}