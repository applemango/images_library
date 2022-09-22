import axios from 'axios'

import { getUrl } from "./main"

function parseJwt (token: string):any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

export async function signUp(name: string, pass: string){
    try {
        const res = await axios.post(
            getUrl("register"),{
                headers: { "Content-Type": "application/json;"}
                ,body: JSON.stringify({
                    username: name, password: pass
                })
            }
        )
        const response = await login(name, pass)
        if (response.msg != "success") {
            return {"msg":"login error","code": response.code,"text": response.text,"data":res,"data2":response}
        }
        return {"msg":"success","code": res.status,"text": res.statusText,"data":res,"data2":response}
    } catch (error: any) {
        return {"msg":"error", "code": error.response.status, "text": error.response.data.msg, "data": error}
    }
}
export async function login(name: string, pass: string) {
    try {
        console.log("Login")
        const res = await axios.post(
            getUrl("token"),{
                headers: { "Content-Type": "application/json;"}
                ,body: JSON.stringify({
                    username: name, password: pass
                })
            }
        )
        console.log(res)
        localStorage.setItem("token", res.data.access_token)
        localStorage.setItem("refreshToken", res.data.refresh_token)
        return {"msg":"success","code": res.status,"text": res.statusText,"data":res}
    } catch (error: any) {
        return {"msg":"error", "code": error.response.status, "text": error.response.data.msg, "data": error}
    }
}
export async function refresh() {
    if(!getToken(true)) {
        return false
    }
    try {
        const res = await axios.post(
            getUrl("refresh"),{},{
                headers: {
                    "Content-Type": "application/json"
                    ,'Authorization': 'Bearer '+getToken(true)
                }
            }
        )
        localStorage.setItem("token", res.data.access_token)
        return {"msg":"success","code": res.status,"text": res.statusText,"data":res}
    } catch (error: any) {
        const r = await logout()
        return {"msg":"error", "code": error.response.status, "text": error.response.data.msg, "data": error}
    }
}
export async function logout() {
    try {
        const res = await axios.delete(
            getUrl("logout"), {
                headers: {
                    "Content-Type": "application/json"
                    ,"Authorization": "Bearer "+getToken(true)
                }
            }
        )
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken")
        return {"msg":"success","code": res.status,"text": res.statusText,"data":res}
    } catch (error: any) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken")
        return {"msg":"error(success?)", "code": error.response.status, "text": error.response.data.msg, "data": error}
    }
}
export function getToken(refresh:boolean = false):string | null {
    try {
        let Token;
        if (refresh) {Token = localStorage.getItem("refreshToken");
        } else {Token = localStorage.getItem("token");}
        if (Token && Date.now() >= parseJwt(Token).exp *1000) {
            return null;
        }
        return Token && Token
    } catch (error) {
        return null;
    }
}
export function setToken(token:string, refresh:boolean = false):void {
    if(refresh) {
        localStorage.setItem("refreshToken", token)
    }
    localStorage.setItem("token", token)
}
export function isLogin(refresh:boolean = true):boolean  {
    if(getToken()) {
        return true
    }
    if(refresh && getToken(true)) {
        return true
    }
    return false
}
export async function isLoginAndLogin() {
    if(getToken()) {
        return true
    }
    if(getToken(true)) {
        try {
            const res = await refresh()
            return true
        } catch (error: any) {
            return false
        }
    }
    return false
}
export async function checkIsLogin(){
    try {
        const res = await axios.post(
            getUrl("token/test"), {
                headers: {
                    "Content-Type": "application/json"
                    ,"Authorization": "Bearer "+getToken(true)
                }
            }
        )
        return true
    } catch (error:any) {
        return false
    }
}