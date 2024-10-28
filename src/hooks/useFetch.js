import { useEffect } from "react";
import { useState } from "react"



// export const useFetch= (url)=>{
//     const[post, setPost] = useState({});
//     const [loading, setLoading] = useState(true)
 
//     useEffect(()=>{
//         setLoading(true)
//         async function getData(){
            
//             const response = await fetch(url);
//             const data = await response.json();
//             setPost(data)
//             setLoading(false)
//         }
//         getData()
//     },[url])
//     return {post, loading};
// }


export const useFetch= (url, interval)=>{
    const[post, setPost] = useState({});
    const [loading, setLoading] = useState(true)
    async function getData(){
        setLoading(true)
        const response = await fetch(url);
        const data = await response.json();
        setPost(data)
        setLoading(false)
    }
    useEffect(()=>{
        getData()
        const fetchInterval = setInterval(()=>{
            getData()
        },interval)

        return ()=>clearInterval(fetchInterval)
    },[url, interval])
    return {post, loading, interval};
}