const express = require("express")
let bodyParser = require('body-parser')
const { exec } = require('child_process');
const dotenv = require('dotenv').config()
require('./Connections/Database')
var app=express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const aws_router = require("./router/aws_router")
app.use("/api/v1",aws_router)

const azure_router = require("./router/azureRouter")
app.use("/api/v1",azure_router)


const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
        description: 'A sample API for learning Swagger',
      },
      servers: [
        {
          url: 'http://localhost:8000/api/v1',
        },
      ],
    },
    apis: [`./router/aws_router.js`],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(
    "/api/v1",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, { explorer: true })
  );


const port = 8000
//server port 
app.listen(port,()=>{
    // exec('terraform init -upgrade',()=>{
    //     console.log("terraform initialization success");
    // })
    console.log("Server has started successfully")
})


