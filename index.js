const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l47bs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload())

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("CreativeServices");
  const OrderCollection = client.db(`${process.env.DB_NAME}`).collection("AllOrders");
  const ReviewsCollection = client.db(`${process.env.DB_NAME}`).collection("Reviews");
  const AdminCollection = client.db(`${process.env.DB_NAME}`).collection("Admin");

  //Post services data with Image by Admin
  app.post('/addServices', (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const description = req.body.description;
      // const filePath = `${__dirname}/services/${file.name}`;

      // file.mv(filePath, err =>{
      //   if(err){
      //     console.log(err);
      //    res.status(500).send({msg: 'Failed to upload service image'})
      //   }
        const newImage = file.data;
        const encImage = newImage.toString('base64');
        
        var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImage, 'base64')
        };

        servicesCollection.insertOne({title, description, image})
        .then(result => {
          // fs.remove(filePath, error =>{
          //   if(error){
          //     console.log(error);
          //     result.status(500).send({msg: 'Failed to upload service image'})
              
          //   }
            res.send(result.insertedCount > 0);
          // })
        })
        
     // })
   })


   // Get all services and Show in Home page
   app.get('/services', (req, res) => {
    servicesCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
   })

   //Post Customer's Order Data
   app.post('/addNewOrder', (req, res) => {
     const newOrder = req.body;
     OrderCollection.insertOne(newOrder)
     .then(result => {
       res.send(result.insertedCount > 0)
     })
   })

   //Get Specific Customer order data and data show in serviceList 
   app.get('/specificUserOrder', (req, res) => {
    OrderCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
   })

  //  Get all customer orders data and show in AllServiceList component
   app.get('/allCustomerOrders', (req, res) => {
     OrderCollection.find({})
     .toArray((err, documents) => {
       res.send(documents);
     })
   })


   //Post Customer's Review 
   app.post('/addNewReview', (req, res) => {
     const newReview = req.body;
     ReviewsCollection.insertOne(newReview)
     .then(result => {
        res.send(result.insertedCount > 0);
     })
   })

   //Get Customer's Review and show in Home page Feedback Section
   app.get('/customerReview', (req, res) => {
     ReviewsCollection.find({})
     .toArray((err, documents) => {
       res.send(documents);
     })
   })

   //Create new admin
   app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        AdminCollection.insertOne(newAdmin)
        .then(result => {
          res.send(result.insertedCount > 0)
        })
   })


   //Admin check and show dynamic data admin and customer
   app.post('/adminCheck', (req, res) => {
     const email = req.body.email;
     AdminCollection.find({email: email})
     .toArray((err, admins) => {
       res.send(admins.length > 0);
     })
   })



});


app.get('/', function (req, res) {
    res.send('hello world')
  })



app.listen(process.env.PORT || 8000)