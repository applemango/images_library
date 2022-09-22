import axios from 'axios';
import { getUrl } from "./main"
import { getToken, isLoginAndLogin } from './token';

export async function deleteFolder(folder_id: number) {
    const lRes = await isLoginAndLogin()
    if(!lRes) {
        throw "token not found"
    }
    try {
        const res = await axios.delete(getUrl(`folder/delete/${folder_id}`),{
            headers: {
                "Authorization": "Bearer "+getToken()
            }
        })
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function deleteImage(image_id: number) {
    const lRes = await isLoginAndLogin()
    if(!lRes) {
        throw "token not found"
    }
    try {
        const res = await axios.delete(getUrl(`images/delete/${image_id}`),{
            headers: {
                "Authorization": "Bearer "+getToken()
            }
        })
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}