import { serve } from 'bun';

serve({
    fetch(request){
        const url = new URL(request.url)
        if(url.pathname === '/'){
            return new Response("Hello Server", {status: 200})
        }else if(url.pathname === '/abhi'){
            return new Response("Hello Abhi", {status: 200})
        }else{
            return new Response('404 Not Found', {status: 400})
        }
    },
    port: 3000,
    hostname: '127.0.0.1'
})