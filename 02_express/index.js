// require('dotenv').config();

import 'dotenv/config'
import express from 'express';
import logger from './logger.js';
import morgan from 'morgan';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


const morganForamt = ':method :url :status :response-time ms';

app.use(morgan(morganForamt, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2],
                responseTome: message.split(' ')[3],
            };
            logger.info(JSON.stringify(logObject));
        }
    }
}));


let data = [];
let nextId = 1;

//add new data
app.post('/data', (req, res) => {  
    logger.info("A post request is made")  
    const { name, price } = req.body
    const newData = { id: nextId++, name, price}
    data.push(newData);
    res.status(201).send(newData);
})

//get all data
app.get("/data", (req, res) => {
    res.status(200).send(data);
})

//get only one entry from data
app.get("/data/:id", (req, res) => {
    const d1 = data.find(t => t.id === parseInt(req.params.id))
    if(!d1){
        return res.status(404).send("Data not found")
    }
    res.status(200).send(d1);
})


//Update
app.put("/data/:id", (req, res) => {
    const d = data.find((t) => t.id === parseInt(req.params.id))

    if(!d){
        return res.status(404).send("Data not found")
    }
    const { name, price } = req.body;
    d.name = name;
    d.price = price;
    res.send(200).send(d);
})


//delete
app.delete("/data/:id", (req, res) => {
    const index = data.findIndex(t => t.id === parseInt(req.params.id))
    if(index === -1){
        return res.status(404).send("Data not found");
    }
    data.slice(index, 1);
    return res.status(200).send("Deleted");
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}...`);
    
})